
from fastapi import FastAPI, Depends, HTTPException, Form, Body, Query, WebSocket, WebSocketDisconnect
from typing import Any
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import ssl
import os
import sendgrid
from sendgrid.helpers.mail import Mail
from fastapi import APIRouter, Depends, HTTPException, Body
from bson import ObjectId
# تعريف التطبيق وإعدادات CORS
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# دوال JWT والمستخدم
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def get_current_user(token: str = Depends(oauth2_scheme)):
    print("[GET_CURRENT_USER] Token received:", token)
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        print("[GET_CURRENT_USER] Email from token:", email)
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(email)
    if user is None:
        print("[GET_CURRENT_USER] User not found in DB for email:", email)
        raise credentials_exception
    return user

# قبول أو رفض الطلب
from fastapi import Path
@app.patch("/api/requests/{request_id}/status")
async def update_request_status(request_id: str = Path(...), status: str = Body(..., embed=True), current_user: dict = Depends(get_current_user)):
    """
    تحديث حالة الطلب (accept/decline)
    status: accepted أو declined
    """
    try:
        from bson import ObjectId
        if not status or status not in ["accepted", "declined"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        traveler_id = str(current_user["_id"])
        # جرب كل حالات المعرف
        possible_ids = [request_id]
        if ObjectId.is_valid(request_id):
            possible_ids.append(ObjectId(request_id))
        updated = False
        for pid in possible_ids:
            query = {"_id": pid, "traveler_id": traveler_id}
            print(f"[UPDATE_REQUEST_STATUS] Trying query: {query}")
            result = await db.requests.update_one(query, {"$set": {"status": status}})
            print(f"[UPDATE_REQUEST_STATUS] matched={result.matched_count} modified={result.modified_count}")
            if result.modified_count == 1:
                updated = True
                break
        if updated:
            return {"ok": True, "status": status}
        else:
            raise HTTPException(status_code=404, detail="Request not found or not owned by traveler")
    except Exception as e:
        print(f"[UPDATE_REQUEST_STATUS] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# نقطة نهاية للتحقق من وجود المنتجات
@app.get("/api/products/check")
async def check_products():
    try:
        # اختبار الاتصال بقاعدة البيانات
        products_count = await db.products.count_documents({})
        print(f"[CHECK_PRODUCTS] Found {products_count} products in database")
        
        # جلب أول منتج للتحقق
        first_product = await db.products.find_one({})
        if first_product:
            print(f"[CHECK_PRODUCTS] Sample product ID: {first_product['_id']}")
        
        return {
            "status": "success",
            "count": products_count,
            "sample_id": str(first_product['_id']) if first_product else None
        }
    except Exception as e:
        print(f"[CHECK_PRODUCTS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

        # إنشاء طلب جديد
# إنشاء طلب منتج جديد
@app.post("/api/requests")
async def create_request(request: dict = Body(...), current_user: dict = Depends(get_current_user)):
    try:
        buyer_id = str(current_user["_id"])
        product_id = request.get("product_id")
        traveler_id = request.get("traveler_id")
        quantity = request.get("quantity", 1)
        if not product_id or not traveler_id:
            raise HTTPException(status_code=400, detail="product_id and traveler_id are required")
        doc = {
            "product_id": str(product_id),
            "traveler_id": str(traveler_id),
            "buyer_id": buyer_id,
            "quantity": quantity,
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        res = await db.requests.insert_one(doc)
        doc["_id"] = str(res.inserted_id)
        # إشعار للمسافر (يمكنك إضافة منطق إشعار هنا إذا رغبت)
        return {"ok": True, "request": doc}
    except Exception as e:
        print(f"[CREATE_REQUEST] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import Request
@app.get("/api/requests")
async def get_requests(request: Request, current_user: dict = Depends(get_current_user)):
    traveler_id = str(current_user["_id"])
    product_id = request.query_params.get("product_id")
    query = {"traveler_id": traveler_id, "status": "pending"}
    if product_id:
        query["product_id"] = product_id
    requests = []
    async for req in db.requests.find(query):
        req["_id"] = str(req.get("_id"))
        req["product_id"] = str(req.get("product_id", ""))
        req["buyer_id"] = str(req.get("buyer_id", ""))
        req["traveler_id"] = str(req.get("traveler_id", ""))
        # جلب اسم المشتري من قاعدة بيانات المستخدمين
        buyer = await db.users.find_one({"_id": ObjectId(req["buyer_id"])}) if ObjectId.is_valid(req["buyer_id"]) else None
        req["buyerName"] = buyer["fullName"] if buyer and "fullName" in buyer else req["buyer_id"]
        requests.append(req)
    return requests
async def get_requests(current_user: dict = Depends(get_current_user)):
    traveler_id = str(current_user["_id"])
    requests = []
    async for req in db.requests.find({"traveler_id": traveler_id}):
        req["_id"] = str(req.get("_id"))
        req["product_id"] = str(req.get("product_id", ""))
        req["buyer_id"] = str(req.get("buyer_id", ""))
        req["traveler_id"] = str(req.get("traveler_id", ""))
        # يمكنك إضافة تحويل لأي معرفات أخرى إذا وجدت
        requests.append(req)
    return requests

# تغيير حالة المنتج إلى مكتمل
@app.post("/api/products/mark-fulfilled")
async def mark_product_fulfilled(payload: Any = Body(...), current_user: dict = Depends(get_current_user)):
    # Accept multiple payload shapes: { product_id }, { productId }, { id }, or raw string body
    user_id = str(current_user["_id"])
    product_id = None
    try:
        if isinstance(payload, str):
            product_id = payload
        elif isinstance(payload, dict):
            product_id = payload.get('product_id') or payload.get('productId') or payload.get('id') or payload.get('product')
            # if nested product object passed
            if isinstance(product_id, dict):
                product_id = product_id.get('id') or product_id.get('_id')
    except Exception:
        product_id = None
    if not product_id:
        raise HTTPException(status_code=400, detail='product_id is required in body')
    from bson import ObjectId
    # Try multiple combinations for product._id and user_id shapes (ObjectId vs string)
    tried = []
    success = False
    last_err = None
    possible_ids = []
    try:
        if ObjectId.is_valid(str(product_id)):
            possible_ids.append(ObjectId(product_id))
    except Exception:
        pass
    possible_ids.append(product_id)

    possible_user_ids = [user_id]
    try:
        if ObjectId.is_valid(str(user_id)):
            possible_user_ids.append(ObjectId(str(user_id)))
    except Exception:
        pass

    print(f"[MARK_FULFILLED] product_id received: {product_id}, trying ids: {possible_ids}, user_id: {user_id}")

    for pid in possible_ids:
        for uid in possible_user_ids:
            try:
                tried.append({'product_id': pid, 'user_id': uid})
                result = await db.products.update_one({"_id": pid, "user_id": uid}, {"$set": {"isActive": False, "status": "fulfilled"}})
                print(f"[MARK_FULFILLED] try pid={pid} uid={uid} matched={result.matched_count} modified={result.modified_count}")
                if result.modified_count and result.modified_count > 0:
                    success = True
                    break
            except Exception as e:
                last_err = e
                print(f"[MARK_FULFILLED] error trying pid={pid} uid={uid}: {e}")
        if success:
            break

    if not success:
        # No update performed — return informative error
        detail_msg = f"Product not found or not owned by user. Tried variants: {tried}"
        print(f"[MARK_FULFILLED] FAILED: {detail_msg}; last_err={last_err}")
        raise HTTPException(status_code=404, detail=detail_msg)
    if result.modified_count == 1:
        # Broadcast product fulfillment event to the owner
        try:
            await broadcast_to_user(user_id, {"type": "product_update", "action": "fulfilled", "product": {"id": product_id}})
        except Exception as e:
            print('[BROADCAST_PRODUCT_FULFILLED] failed', e)
        return {"msg": "Product marked as fulfilled."}
    else:
        raise HTTPException(status_code=404, detail="Product not found or not owned by user")
# ...existing code...

# تحديث بيانات الملف الشخصي للمستخدم الحالي
@app.put("/api/profile")
async def update_profile(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["_id"]
    result = await db.users.update_one({"_id": user_id}, {"$set": data})
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Profile not updated")
    return {"message": "Profile updated successfully"}
from bson import ObjectId
@app.get("/api/debug/product/{product_id}")
async def debug_product(product_id: str):
    try:
        from bson import ObjectId
        print(f"[DEBUG] Checking product ID: {product_id}")
        
        # فحص الاتصال بقاعدة البيانات
        if db is None:
            return {"status": "error", "message": "Database not initialized"}
            
        # فحص صحة المعرف
        if not ObjectId.is_valid(product_id):
            return {"status": "error", "message": "Invalid ObjectId format"}
            
        # محاولة العثور على المنتج
        try:
            product = await db.products.find_one({"_id": ObjectId(product_id)})
            return {
                "status": "success",
                "found": product is not None,
                "product_preview": {
                    "id": str(product["_id"]),
                    "title": product.get("title", "No Title"),
                    "created_at": product.get("createdAt", "Unknown")
                } if product else None
            }
        except Exception as db_err:
            return {"status": "error", "message": f"Database error: {str(db_err)}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/products/{product_id}")
async def get_product_by_id(product_id: str):
    try:
        from bson import ObjectId
        print(f"[GET_PRODUCT] API Endpoint Called")
        print(f"[GET_PRODUCT] Received ID: {product_id}")
        
        # التحقق من اتصال قاعدة البيانات
        if db is None:
            print("[GET_PRODUCT] Database connection not initialized")
            raise HTTPException(status_code=500, detail="Database connection error")
        
        # Attempt lookup by ObjectId first, then fall back to string _id
        pid = None
        found_by_objectid = False
        try:
            if ObjectId.is_valid(product_id):
                try:
                    pid_obj = ObjectId(product_id)
                    candidate = await db.products.find_one({"_id": pid_obj})
                    if candidate:
                        pid = pid_obj
                        found_by_objectid = True
                        print(f"[GET_PRODUCT] Found product by ObjectId: {product_id}")
                    else:
                        print(f"[GET_PRODUCT] No product for ObjectId: {product_id}, will try string _id")
                except Exception as e:
                    print(f"[GET_PRODUCT] ObjectId lookup error: {e}")
        except Exception:
            pass

        # fallback to string _id lookup if not found
        if pid is None:
            try:
                candidate = await db.products.find_one({"_id": product_id})
                if candidate:
                    pid = product_id
                    print(f"[GET_PRODUCT] Found product by string _id: {product_id}")
                else:
                    print(f"[GET_PRODUCT] No product found for id (objectid or string): {product_id}")
                    raise HTTPException(status_code=404, detail="المنتج غير موجود")
            except HTTPException:
                raise
            except Exception as e:
                print(f"[GET_PRODUCT] Database error during string lookup: {str(e)}")
                raise HTTPException(status_code=500, detail="خطأ في قاعدة البيانات")

        # اختبار الاتصال بقاعدة البيانات (simple find test)
        try:
            await db.products.find_one({"_id": pid})
            print("[GET_PRODUCT] Database connection test successful")
        except Exception as e:
            print(f"[GET_PRODUCT] Database connection test failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Database connection error")

        # البحث عن المنتج مع تحديد الحقول المطلوبة
        pipeline = [
            {"$match": {"_id": pid}},
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user"
            }},
            {"$project": {
                "_id": 1,
                "title": 1,
                "description": 1,
                "image": 1,
                "category": 1,
                "quantity": 1,
                "currency": 1,
                "departureAirport": 1,
                "arrivalAirport": 1,
                "travelDates": 1,
                "pickupOptions": 1,
                "isActive": 1,
                "traveler": 1,
                "user_id": 1,
                "createdAt": 1,
                "user": {"$arrayElemAt": ["$user", 0]},
                "price": 1,
                "originalPrice": 1,
            }}
        ]
        
        product = await db.products.aggregate(pipeline).to_list(1)
        product = product[0] if product else None
        
        print(f"[GET_PRODUCT] Found product: {product is not None}")
        
        if not product:
            print(f"[GET_PRODUCT] Product not found for ID: {product_id}")
            raise HTTPException(status_code=404, detail="Product not found")
        print(f"[GET_PRODUCT] Raw product data: {product}")
        
        # تحويل ObjectId إلى string
        product_id = str(product["_id"])
        user_id = str(product["user_id"]) if product.get("user_id") else None
        
        # معالجة معلومات المسافر من بيانات المستخدم إذا كانت متوفرة
        user = product.get("user", {})
        traveler = product.get("traveler", {}) or {}
        if user:
            traveler.update({
                "avatar": user.get("avatar") or traveler.get("avatar") or "https://ui-avatars.com/api/?name=Traveler",
                "name": user.get("name") or traveler.get("name") or "Traveler",
                "fullName": user.get("fullName") or traveler.get("fullName") or user.get("name") or "Traveler",
                "rating": float(user.get("rating") or traveler.get("rating") or 4),
                "reviewCount": int(user.get("reviewCount") or traveler.get("reviewCount") or 12)
            })

        # تنسيق التواريخ - دعم عدة أشكال (startDate/endDate أو departure/arrival أو سلاسل نصية)
        travel_dates = product.get("travelDates", {}) or {}
        departure_date = None
        arrival_date = None
        if isinstance(travel_dates, dict):
            # دعم المفاتيح المحتملة
            departure_date = travel_dates.get("startDate") or travel_dates.get("departure") or travel_dates.get("departureDate")
            arrival_date = travel_dates.get("endDate") or travel_dates.get("arrival") or travel_dates.get("arrivalDate")
        elif isinstance(travel_dates, str):
            departure_date = travel_dates
            arrival_date = None

        # إذا كان تاريخ الوصول غير محدد، نضيف أسبوع إلى تاريخ المغادرة
        if departure_date and not arrival_date:
            try:
                dep_date = datetime.fromisoformat(departure_date.replace('Z', '+00:00'))
                arrival_date = (dep_date + timedelta(days=7)).isoformat()
            except Exception:
                arrival_date = None

        # بناء route إذا لم يكن معرّفًا
        route = {
            "from": product.get("departureAirport", "Unknown"),
            "to": product.get("arrivalAirport", "Unknown")
        }

        # إعداد حقول التوافق للواجهة الأمامية
        images_list = product.get("images") if product.get("images") else ([product.get("image")] if product.get("image") else [])
        price_value = product.get("price") if product.get("price") is not None else product.get("originalPrice") or 0
        availability_value = product.get("availability") if product.get("availability") is not None else product.get("quantity", 0)
        pickup_options = product.get("pickupOptions", []) or []
        pickup_location = product.get("pickupLocation") or (pickup_options[0].get("location") if pickup_options and isinstance(pickup_options[0], dict) else None)

        formatted_product = {
            "id": product_id,
            "user_id": user_id,
            "title": product.get("title"),
            "description": product.get("description"),
            "image": product.get("image", "https://placehold.co/400x300?text=No+Image"),
            "images": images_list,
            "price": price_value,
            "originalPrice": product.get("originalPrice", None),
            "category": product.get("category", ""),
            "quantity": int(product.get("quantity", 0)),
            "availability": availability_value,
            "currency": product.get("currency", "DZD"),
            "departureAirport": product.get("departureAirport"),
            "arrivalAirport": product.get("arrivalAirport"),
            "departureDate": departure_date,
            "arrivalDate": arrival_date,
            "travelDates": {
                "startDate": departure_date,
                "endDate": arrival_date
            } if departure_date else None,
            "pickupOptions": pickup_options,
            "pickupLocation": pickup_location,
            "isActive": bool(product.get("isActive", True)),
            "traveler": traveler,
            "createdAt": product.get("createdAt", datetime.utcnow().isoformat()),
            "route": route
        }

        print(f"[GET_PRODUCT] Formatted product: {formatted_product}")
        return formatted_product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fastapi import Request

@app.get("/api/requests")
async def get_requests(request: Request, current_user: dict = Depends(get_current_user)):
    """
    جلب الطلبات حسب المستخدم الحالي أو حسب معرف المنتج إذا تم تمرير product_id
    """
    try:
        from bson import ObjectId
        params = dict(request.query_params)
        product_id = params.get("product_id")
        uid = current_user.get("_id")
        possible_uids = []
        try:
            if ObjectId.is_valid(str(uid)):
                possible_uids.append(ObjectId(str(uid)))
        except Exception:
            pass
        possible_uids.append(uid)

        query = {}
        if product_id:
            # جلب الطلبات الخاصة بمنتج معين لهذا المسافر فقط
            query = {"product_id": str(product_id), "traveler_id": str(uid)}
        else:
            # جلب الطلبات الخاصة بالمستخدم الحالي (buyer أو traveler)
            or_clauses = []
            for pu in possible_uids:
                or_clauses.append({"buyer_id": pu})
                or_clauses.append({"user_id": pu})
                or_clauses.append({"requester_id": pu})
            query = {"$or": or_clauses} if or_clauses else {}

        print(f"[GET_REQUESTS] Final Query: {query}")
        try:
            cursor = db.requests.find(query).sort("createdAt", -1).limit(50)
            docs = await cursor.to_list(length=50)
        except Exception as e:
            print(f"[GET_REQUESTS] DB query failed: {e}")
            docs = []

        items = []
        for d in docs:
            try:
                items.append({
                    "id": str(d.get("_id")) if d.get("_id") is not None else None,
                    "productId": str(d.get("product_id") or d.get("productId") or d.get("product") or "") ,
                    "productName": d.get("product_name") or d.get("productName") or d.get("title") or "",
                    "travelerName": d.get("travelerName") or d.get("traveler_name") or d.get("traveler") or "",
                    "travelerAvatar": d.get("travelerAvatar") or d.get("traveler_avatar") or None,
                    "status": d.get("status") or "pending",
                    "price": d.get("price") or d.get("offer") or d.get("amount") or None,
                    "message": d.get("message") or d.get("note") or "",
                    "requestDate": d.get("createdAt") or d.get("requestDate") or None,
                    "responseDate": d.get("responseDate") or d.get("respondedAt") or None,
                    "travelDate": d.get("travelDate") or d.get("travel_dates") or None,
                    "deliveryMethod": d.get("deliveryMethod") or d.get("delivery_method") or "",
                })
            except Exception:
                continue

        return items
    except Exception as e:
        print(f"[GET_REQUESTS] unexpected error: {e}")
        return []

# Reuse the existing FastAPI `app` and imports above. (Removed duplicate re-declaration.)
# إنشاء طلب منتج جديد
@app.post("/api/requests")
async def create_request(request: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """
    ينشئ طلب منتج جديد في db.requests
    البيانات المطلوبة: product_id, traveler_id, quantity
    """
    try:
        user_id = str(current_user["_id"])
        product_id = request.get("product_id")
        traveler_id = request.get("traveler_id")
        quantity = request.get("quantity", 1)
        if not product_id or not traveler_id:
            raise HTTPException(status_code=400, detail="product_id and traveler_id are required")
        doc = {
            "product_id": str(product_id),
            "traveler_id": str(traveler_id),
            "buyer_id": user_id,
            "quantity": quantity,
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        res = await db.requests.insert_one(doc)
        doc["_id"] = str(res.inserted_id)
        return {"ok": True, "request": doc}
    except Exception as e:
        print(f"[CREATE_REQUEST] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/api/products")
async def get_products(
    q: str = None,
    departureAirport: str = None,
    arrivalAirport: str = None,
    category: str = None,
    minPrice: float = None,
    maxPrice: float = None,
    departureDate: str = None,
    arrivalDate: str = None,
    sortBy: str = None,
    order: str = "desc"
):
    products = []
    query = {}
    or_clauses = []
    # فلترة بالاسم أو العنوان
    if q:
        or_clauses.append({"title": {"$regex": q, "$options": "i"}})
        or_clauses.append({"name": {"$regex": q, "$options": "i"}})
    # فلترة بمطار الانطلاق
    if departureAirport:
        query["departureAirport"] = {"$regex": departureAirport, "$options": "i"}
    # فلترة بمطار الوصول
    if arrivalAirport:
        query["arrivalAirport"] = {"$regex": arrivalAirport, "$options": "i"}
    # فلترة بالتصنيف
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    # فلترة بالسعر
    if minPrice is not None or maxPrice is not None:
        price_filter = {}
        if minPrice is not None:
            price_filter["$gte"] = minPrice
        if maxPrice is not None:
            price_filter["$lte"] = maxPrice
        query["price"] = price_filter
    # فلترة بتاريخ المغادرة (نطاق)
    if departureDate:
        dep_range = {"$gte": departureDate}
        or_dep = [
            {"travelDates.startDate": dep_range},
            {"travelDates.departure": dep_range},
            {"travelDates.departureDate": dep_range}
        ]
        query["$or"] = query.get("$or", []) + or_dep
    # فلترة بتاريخ الوصول (نطاق)
    if arrivalDate:
        arr_range = {"$lte": arrivalDate}
        or_arr = [
            {"travelDates.endDate": arr_range},
            {"travelDates.arrival": arr_range},
            {"travelDates.arrivalDate": arr_range}
        ]
        query["$or"] = query.get("$or", []) + or_arr
    # إذا كان هناك فلترة بالاسم أو العنوان
    if or_clauses:
        query["$or"] = query.get("$or", []) + or_clauses
    print(f"[GET_PRODUCTS] Final Mongo Query: {query}")

    # إضافة فلترة للمنتجات النشطة وغير المكتملة
    query["isActive"] = True
    query["status"] = {"$ne": "fulfilled"}

    # ترتيب النتائج
    allowed_sorts = ["createdAt", "price", "title", "category", "departureAirport", "arrivalAirport"]
    # دعم التوافق مع sortBy أو sort أو sort=relevance
    sort_field = "createdAt"
    if sortBy and sortBy in allowed_sorts:
        sort_field = sortBy
    # دعم بعض الواجهات ترسل sort=relevance أو قيم غير مدعومة
    if (sortBy and sortBy not in allowed_sorts) or (sortBy == "relevance"):
        sort_field = "createdAt"
    sort_order = -1 if order == "desc" else 1
    cursor = db.products.find(query).sort(sort_field, sort_order)
    async for product in cursor:
        product["_id"] = str(product["_id"])
        # traveler info
        traveler = product.get("traveler", {})
        traveler_info = {
            "avatar": traveler.get("avatar", "https://ui-avatars.com/api/?name=Traveler"),
            "name": traveler.get("name", "Traveler"),
            "fullName": traveler.get("fullName", traveler.get("name", "Traveler")),
            "rating": traveler.get("rating", 4),
            "reviewCount": traveler.get("reviewCount", 12)
        }
        # route info
        route = {
            "from": product.get("departureAirport", "Unknown"),
            "to": product.get("arrivalAirport", "Unknown")
        }
        # travel date (support multiple shapes)
        travel_date = ""
        departure_date = None
        arrival_date = None
        travel_dates = product.get("travelDates", {})
        if isinstance(travel_dates, dict):
            departure_date = travel_dates.get("startDate") or travel_dates.get("departure") or travel_dates.get("departureDate")
            arrival_date = travel_dates.get("endDate") or travel_dates.get("arrival") or travel_dates.get("arrivalDate")
            travel_date = departure_date or ""
        elif isinstance(travel_dates, str):
            travel_date = travel_dates
            departure_date = travel_dates
        # بطاقة المنتج
        images_list = product.get("images") if product.get("images") else ([product.get("image")] if product.get("image") else [])
        pickup_options = product.get("pickupOptions", []) or []
        pickup_location = product.get("pickupLocation") or (pickup_options[0].get("location") if pickup_options and isinstance(pickup_options[0], dict) else None)

        card = {
            "id": product["_id"],
            "name": product.get("title") or product.get("name") or "No Title",
            "description": product.get("description", "No Description"),
            "price": product.get("price", 0),
            "originalPrice": product.get("originalPrice", None),
            "image": product.get("image", "https://placehold.co/400x300?text=No+Image"),
            "images": images_list,
            "category": product.get("category", ""),
            "currency": product.get("currency", "USD"),
            "route": route,
            "travelDate": travel_date,
            "departureDate": departure_date,
            "arrivalDate": arrival_date,
            "pickupOptions": pickup_options,
            "pickupLocation": pickup_location,
            "quantity": product.get("quantity", 1),
            "availability": product.get("availability") if product.get("availability") is not None else product.get("quantity", 1),
            "isActive": product.get("isActive", True),
            "isUrgent": product.get("isUrgent", False),
            "traveler": traveler_info,
            "travelerName": traveler_info.get("fullName") or traveler_info.get("name") or "Traveler",
            "travelerAvatar": traveler_info.get("avatar", "https://ui-avatars.com/api/?name=Traveler"),
            "rating": product.get("rating", traveler_info.get("rating", 4)),
            "reviews": traveler_info.get("reviewCount", 12),
            "departure": route.get("from", product.get("departureAirport", "Unknown")),
            "arrival": route.get("to", product.get("arrivalAirport", "Unknown")),
            "isSaved": False
        }
        products.append(card)
    return products

ssl._create_default_https_context = ssl._create_unverified_context

# إعداد المتغيرات العامة وقاعدة البيانات
MONGO_URL = "mongodb+srv://hadjmed007:K0YuLRHXj0waMmKX@cluster0.fcb3ami.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5256000  # 10 سنوات

client = AsyncIOMotorClient(MONGO_URL, tls=True)
db = client["valikoo"]

# In-memory websocket connections map: user_id -> set of WebSocket
ws_connections = {}

async def broadcast_to_user(user_id: str, payload: dict):
    conns = ws_connections.get(str(user_id)) or []
    for ws in list(conns):
        try:
            await ws.send_json(payload)
        except Exception:
            # remove broken connection
            try:
                conns.remove(ws)
            except Exception:
                pass
    ws_connections[str(user_id)] = conns


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = None
    try:
        # expect initial auth message from client: { type: 'auth', token }
        msg = await websocket.receive_text()
        import json
        try:
            data = json.loads(msg)
        except Exception:
            data = {}
        if data.get('type') == 'auth' and data.get('token'):
            token = data.get('token')
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                email = payload.get('sub')
                user = await get_user_by_email(email)
                if user:
                    user_id = str(user.get('_id'))
                    conns = ws_connections.get(user_id) or []
                    conns.append(websocket)
                    ws_connections[user_id] = conns
            except Exception as e:
                # unauthenticated websocket; continue without user binding
                print('[WS] auth failed', e)

        # listen for incoming messages (e.g., read_receipt) and broadcast to other participants
        while True:
            txt = await websocket.receive_text()
            try:
                payload = json.loads(txt)
            except Exception:
                payload = {}
            typ = payload.get('type')
            if typ == 'read_receipt':
                conv_id = payload.get('conversationId')
                # fetch conversation participants and broadcast to them (except sender if known)
                try:
                    from bson import ObjectId
                    conv = None
                    if conv_id and ObjectId.is_valid(conv_id):
                        conv = await db.conversations.find_one({'_id': ObjectId(conv_id)})
                    if conv:
                        participants = conv.get('participants', [])
                        for p in participants:
                            if str(p) == str(user_id):
                                continue
                            await broadcast_to_user(str(p), { 'type': 'read_receipt', 'conversationId': conv_id, 'all': payload.get('all', False), 'userId': user_id })
                except Exception as e:
                    print('[WS] failed processing read_receipt', e)
            # ignore other incoming ws message types for now
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print('[WS] error', e)
    finally:
        # cleanup connection
        try:
            if user_id and websocket:
                conns = ws_connections.get(str(user_id)) or []
                if websocket in conns:
                    conns.remove(websocket)
                ws_connections[str(user_id)] = conns
        except Exception:
            pass

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# نماذج البيانات
class ProductCreate(BaseModel):
    title: str
    description: str = ""
    price: float
    image: str = ""

class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    role: str

class UserOut(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    role: str

# دوال JWT والمستخدم
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def get_current_user(token: str = Depends(oauth2_scheme)):
    print("[GET_CURRENT_USER] Token received:", token)
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        print("[GET_CURRENT_USER] Email from token:", email)
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(email)
    if user is None:
        print("[GET_CURRENT_USER] User not found in DB for email:", email)
        raise credentials_exception
    return user

# نقاط النهاية
@app.post("/api/auth/register")
async def register(user: UserCreate):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_pw
    user_dict["createdAt"] = datetime.utcnow()
    user_dict["isActive"] = True
    user_dict["isVerified"] = True
    await db.users.insert_one(user_dict)
    return {"msg": "User registered successfully"}

@app.post("/api/auth/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    remember_me: bool = Form(False)
):
    print("[LOGIN] --- NEW REQUEST ---")
    print(f"[LOGIN] username: {username!r}")
    print(f"[LOGIN] password: {password!r}")
    print(f"[LOGIN] remember_me: {remember_me}")
    user = await get_user_by_email(username)
    if user:
        print(f"[LOGIN] user found: email={user.get('email')!r} password_hash={user.get('password')!r}")
        valid = pwd_context.verify(password, user["password"])
        print(f"[LOGIN] password valid: {valid}")
    else:
        print("[LOGIN] user not found")
    if not user or not pwd_context.verify(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    expire_minutes = 43200 if remember_me else ACCESS_TOKEN_EXPIRE_MINUTES
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=timedelta(minutes=expire_minutes)
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"], "email": user["email"]}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    user_id = str(current_user["_id"])
    if role == "traveler":
        # عدد العروض النشطة
        active_listings = await db.products.count_documents({"user_id": user_id, "isActive": True})
        # عدد الطلبات المعلقة (مثال: المنتجات التي لها طلبات لم تُنفذ بعد)
        pending_requests = await db.products.count_documents({"user_id": user_id, "requestCount": {"$gt": 0}})
        # عدد الرحلات القادمة (حسب تاريخ المغادرة)
        today = datetime.utcnow().date().isoformat()
        upcoming_trips = await db.products.count_documents({"user_id": user_id, "travelDates.departure": {"$gte": today}})
        # مجموع الأرباح (جمع price لكل منتج تم بيعه)
        total_earnings = 0
        async for product in db.products.find({"user_id": user_id, "isActive": False, "isSold": True}):
            total_earnings += float(product.get("price", 0))
        return {
            "activeListings": active_listings,
            "pendingRequests": pending_requests,
            "upcomingTrips": upcoming_trips,
            "totalEarnings": total_earnings
        }
    elif role == "buyer":
        active_requests = await db.requests.count_documents({"buyer_id": user_id, "status": "pending"})
        saved_products = await db.saved_items.count_documents({"user_id": user_id})
        completed_purchases = await db.products.count_documents({"buyer_id": user_id, "isSold": True})
        total_spent = 0
        async for product in db.products.find({"buyer_id": user_id, "isSold": True}):
            total_spent += float(product.get("price", 0))
        return {
            "activeRequests": active_requests,
            "savedProducts": saved_products,
            "completedPurchases": completed_purchases,
            "totalSpent": total_spent
        }
    elif role == "admin":
        users = await db.users.count_documents({})
        orders = await db.products.count_documents({})
        revenue = 0
        async for product in db.products.find({"isSold": True}):
            revenue += float(product.get("price", 0))
        return {
            "users": users,
            "orders": orders,
            "revenue": revenue
        }
    return {}
@app.get("/api/auth/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    print("[AUTH_ME] Token received:", token)
    return {
        "id": str(current_user["_id"]),
        "fullName": current_user["fullName"],
        "email": current_user["email"],
        "role": current_user["role"]
    }



@app.post("/api/products")
async def create_product(product: dict, current_user: dict = Depends(get_current_user)):
    # استقبل جميع بيانات المنتج كما هي من الواجهة الأمامية
    print("[CREATE_PRODUCT] Received:", product)
    product_dict = dict(product)
    product_dict["user_id"] = str(current_user["_id"])
    product_dict["createdAt"] = datetime.utcnow()
    # حذف أي حقل id مرسل من الواجهة الأمامية لضمان أن MongoDB ينشئ ObjectId تلقائيًا
    product_dict.pop("id", None)
    result = await db.products.insert_one(product_dict)
    product_dict["_id"] = str(result.inserted_id)
    print("[CREATE_PRODUCT] Inserted:", product_dict)
    # Broadcast product creation to the owner (and potentially followers later)
    try:
        owner_id = str(current_user["_id"])
        await broadcast_to_user(owner_id, {"type": "product_update", "action": "created", "product": {"id": product_dict["_id"], "title": product_dict.get("title"), "image": product_dict.get("image")}})
    except Exception as e:
        print('[BROADCAST_PRODUCT_CREATED] failed', e)
    return {"msg": "Product created successfully", "product": product_dict}

# تعديل منتج موجود
from bson import ObjectId
@app.patch("/api/products/{product_id}")
async def update_product(product_id: str, product: dict, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    # إزالة الحقول التي لا يجب تعديلها مباشرة
    product.pop("_id", None)
    product.pop("id", None)
    # بناء update dict
    update_fields = {k: v for k, v in product.items() if v is not None}
    result = await db.products.update_one({"_id": ObjectId(product_id), "user_id": user_id}, {"$set": update_fields})
    if result.modified_count == 1:
        return {"msg": "Product updated successfully", "id": product_id}
    else:
        raise HTTPException(status_code=404, detail="Product not found or not owned by user")

# إشعارات المسافر من قاعدة البيانات
@app.get("/api/dashboard/notifications")
async def get_dashboard_notifications(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    notifications = []
    async for notif in db.notifications.find({"user_id": user_id}):
        notif["_id"] = str(notif["_id"])
        notifications.append(notif)
    return notifications

# العروض النشطة من قاعدة البيانات
@app.get("/api/dashboard/active-listings")
async def get_dashboard_active_listings(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    listings = []
    async for product in db.products.find({"user_id": user_id, "isActive": True}):
        product["_id"] = str(product["_id"])
        card = {
            "id": product["_id"],
            "title": product.get("title", "No Title"),
            "description": product.get("description", "No Description"),
            "price": product.get("price", 0),
            "image": product.get("image", ""),
            "status": "active" if product.get("isActive", True) else "expired",
            "requestCount": product.get("requestCount", 0),
            "destination": product.get("arrivalAirport", "-")
        }
        listings.append(card)
    return listings

# الرحلات القادمة من قاعدة البيانات (حسب تاريخ المغادرة)
@app.get("/api/dashboard/upcoming-trips")
async def get_dashboard_upcoming_trips(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    upcoming = []
    today = datetime.utcnow().date()
    async for product in db.products.find({"user_id": user_id, "travelDates.departure": {"$gte": today.isoformat()}}):
        trip = {
            "id": str(product["_id"]),
            "route": f"{product.get('departureAirport', '')} → {product.get('arrivalAirport', '')}",
            "departureAirport": product.get("departureAirport"),
            "arrivalAirport": product.get("arrivalAirport"),
            "departureDate": product.get("travelDates", {}).get("departure"),
            "returnDate": product.get("travelDates", {}).get("return"),
            "associatedListings": product.get("associatedListings", 0),
            "potentialBuyers": product.get("potentialBuyers", 0)
        }
        upcoming.append(trip)
    return upcoming

# منتجات المستخدم للداشبورد
@app.get("/api/dashboard/orders")
async def get_dashboard_orders(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    products = []
    async for product in db.products.find({"user_id": user_id}):
        product["_id"] = str(product["_id"])
        # تجهيز البيانات للواجهة الأمامية
        card = {
            "id": product["_id"],
            "title": product.get("title", "No Title"),
            "description": product.get("description", "No Description"),
            "price": product.get("price", 0),
            "image": product.get("image", ""),
            "status": "active" if product.get("isActive", True) else "expired",
            "requestCount": product.get("requestCount", 0),
            "destination": product.get("arrivalAirport", "-")
        }
        products.append(card)
    return products


# Internal debug endpoint: return raw product doc by id (tries ObjectId and string)
@app.get("/internal/products/{product_id}")
async def internal_get_product(product_id: str):
    from bson import ObjectId
    try:
        # try as ObjectId
        prod = None
        if ObjectId.is_valid(product_id):
            prod = await db.products.find_one({"_id": ObjectId(product_id)})
        # fallback: try string id stored as _id (if any)
        if not prod:
            prod = await db.products.find_one({"_id": product_id})
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")
        # convert ObjectId to string for JSON
        prod["_id"] = str(prod["_id"])
        return prod
    except HTTPException:
        raise
    except Exception as e:
        print(f"[INTERNAL_GET_PRODUCT] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/internal/users/by-email')
async def internal_get_user_by_email(email: str):
    try:
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": str(user.get("_id")), "fullName": user.get("fullName"), "email": user.get("email")}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[INTERNAL_GET_USER_BY_EMAIL] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Messaging endpoints: conversations + messages ---
@app.post("/api/messages/conversations")
async def create_conversation(recipient_id: str = Body(...), product_id: str = Body(None), current_user: dict = Depends(get_current_user)):
    try:
        user_id = str(current_user["_id"])
        # prevent creating conversation with self
        if recipient_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot create conversation with self")

        # check if conversation already exists between these two users for the product
        existing = await db.conversations.find_one({
            "participants": {"$all": [user_id, recipient_id]},
            "productId": product_id
        })
        if existing:
            existing["_id"] = str(existing["_id"])
            return existing

        conv = {
            "participants": [user_id, recipient_id],
            "productId": product_id,
            "createdAt": datetime.utcnow(),
            "lastMessage": None,
            "lastMessageTime": None
        }
        res = await db.conversations.insert_one(conv)
        conv["_id"] = str(res.inserted_id)
        return conv
    except Exception as e:
        print(f"[CREATE_CONVERSATION] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/messages/conversations")
async def list_conversations(current_user: dict = Depends(get_current_user)):
    try:
        user_id = str(current_user["_id"])
        convs = []
        async for conv in db.conversations.find({"participants": user_id}).sort("lastMessageTime", -1):
            conv_id_str = str(conv["_id"])
            # find other participant
            other_id = [p for p in conv.get("participants", []) if p != user_id]
            other_user = None
            if other_id:
                other_user = await db.users.find_one({"_id": other_id[0]})
            # fetch product info if present
            product = None
            if conv.get("productId"):
                # productId may be stored as ObjectId or string
                try:
                    from bson import ObjectId
                    pid = ObjectId(conv.get("productId")) if ObjectId.is_valid(str(conv.get("productId"))) else conv.get("productId")
                except Exception:
                    pid = conv.get("productId")
                product = await db.products.find_one({"_id": pid}) if pid else None
                if product:
                    product = {"id": str(product.get("_id")), "title": product.get("title"), "image": product.get("image")}

            # fetch last message
            last_msg = await db.messages.find_one({"conversationId": conv_id_str}, sort=[("timestamp", -1)])
            if last_msg:
                last_msg_id = str(last_msg.get("_id"))
                last_message = {
                    "id": last_msg_id,
                    "senderId": last_msg.get("senderId"),
                    "content": last_msg.get("content"),
                    "timestamp": last_msg.get("timestamp"),
                    "type": last_msg.get("type"),
                    "status": last_msg.get("status")
                }
            else:
                last_message = None

            # compute unread count: messages in this conversation not read by current user and sent by others
            try:
                unread_count = await db.messages.count_documents({"conversationId": conv_id_str, "readBy": {"$ne": user_id}, "senderId": {"$ne": user_id}})
            except Exception:
                unread_count = 0

            convs.append({
                "id": conv_id_str,
                "participants": conv.get("participants"),
                "other": {"id": str(other_user.get("_id")) if other_user else (other_id[0] if other_id else None), "fullName": other_user.get("fullName") if other_user else None, "email": other_user.get("email") if other_user else None},
                "product": product,
                "lastMessage": last_message,
                "lastMessageTime": conv.get("lastMessageTime"),
                "unreadCount": int(unread_count)
            })
        return convs
    except Exception as e:
        print(f"[LIST_CONVERSATIONS] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/messages/conversations/{conversation_id}")
async def get_conversation_messages(conversation_id: str, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), current_user: dict = Depends(get_current_user)):
    try:
        from bson import ObjectId
        if not ObjectId.is_valid(conversation_id):
            raise HTTPException(status_code=400, detail="Invalid conversation id")
        conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        user_id = str(current_user["_id"])
        if user_id not in conv.get("participants", []):
            raise HTTPException(status_code=403, detail="Not a participant")

        skip = (page - 1) * page_size

        total = await db.messages.count_documents({"conversationId": conversation_id})
        msgs = []
        cursor = db.messages.find({"conversationId": conversation_id}).sort("timestamp", 1).skip(skip).limit(page_size)
        async for m in cursor:
            m["_id"] = str(m["_id"])
            msgs.append(m)
        return {"conversationId": conversation_id, "messages": msgs, "page": page, "pageSize": page_size, "total": total}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[GET_CONVERSATION_MESSAGES] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/messages/send")
async def send_message(payload: dict = Body(...), current_user: dict = Depends(get_current_user)):
    try:
        user_id = str(current_user["_id"])
        conversation_id = payload.get("conversationId")
        content = payload.get("content")
        mtype = payload.get("type", "text")

        if not content:
            raise HTTPException(status_code=400, detail="Message content required")

        # validate conversation
        from bson import ObjectId
        if not conversation_id or not ObjectId.is_valid(conversation_id):
            raise HTTPException(status_code=400, detail="Valid conversationId required")

        conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if user_id not in conv.get("participants", []):
            raise HTTPException(status_code=403, detail="Not a participant")

        msg = {
            "conversationId": conversation_id,
            "senderId": user_id,
            "content": content,
            "type": mtype,
            "timestamp": datetime.utcnow(),
            "status": "delivered",
            "readBy": []
        }
        res = await db.messages.insert_one(msg)
        msg["_id"] = str(res.inserted_id)

        # update conversation last message/time
        await db.conversations.update_one({"_id": ObjectId(conversation_id)}, {"$set": {"lastMessage": content, "lastMessageTime": msg["timestamp"]}})

        # broadcast new_message to other participants via WS
        try:
            conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
            participants = conv.get('participants', []) if conv else []
            for p in participants:
                # send to all participants including sender; clients will ignore if needed
                await broadcast_to_user(str(p), { 'type': 'new_message', 'conversationId': conversation_id, 'message': { 'id': msg['_id'], 'senderId': msg['senderId'], 'content': msg['content'], 'timestamp': msg['timestamp'].isoformat(), 'type': msg.get('type', 'text'), 'status': msg.get('status', 'delivered') } })
        except Exception as e:
            print('[BROADCAST_NEW_MESSAGE] failed', e)

        return {"message": msg}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SEND_MESSAGE] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/messages/{conversation_id}/read")
async def mark_conversation_read(conversation_id: str, current_user: dict = Depends(get_current_user)):
    try:
        from bson import ObjectId
        if not ObjectId.is_valid(conversation_id):
            raise HTTPException(status_code=400, detail="Invalid conversation id")
        user_id = str(current_user["_id"])
        # mark all messages in conversation as read by this user
        await db.messages.update_many({"conversationId": conversation_id, "senderId": {"$ne": user_id}}, {"$addToSet": {"readBy": user_id}})
        # broadcast read_receipt to other participants so their badges update
        try:
            from bson import ObjectId
            conv = None
            if ObjectId.is_valid(conversation_id):
                conv = await db.conversations.find_one({'_id': ObjectId(conversation_id)})
            if conv:
                participants = conv.get('participants', [])
                for p in participants:
                    if str(p) == user_id:
                        continue
                    await broadcast_to_user(str(p), { 'type': 'read_receipt', 'conversationId': conversation_id, 'all': True, 'userId': user_id })
        except Exception as e:
            print('[BROADCAST_READ_RECEIPT] failed', e)
        return {"ok": True}
    except Exception as e:
        print(f"[MARK_READ] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Saved items / Wishlists ---
@app.post("/api/saved-items")
async def add_saved_item(payload: Any = Body(...), current_user: dict = Depends(get_current_user)):
    """Accepts JSON payloads like { "product_id": "..." } or { "productId": "..." }.
    Normalizes the value and stores product_id as a string to avoid validation 422 errors from clients.
    """
    try:
        user_id = str(current_user["_id"])
        # normalize incoming shapes
        product_id = None
        # if client sent raw string body
        if isinstance(payload, str):
            product_id = payload
        # if client sent JSON object
        if isinstance(payload, dict):
            product_id = payload.get("product_id") or payload.get("productId") or payload.get("id")
            # if client passed a nested product object
            if not product_id and isinstance(payload.get("product"), dict):
                product_id = payload.get("product").get("id") or payload.get("product").get("_id")
        if not product_id:
            raise HTTPException(status_code=400, detail="product_id is required")
        product_id = str(product_id)

        # prevent duplicates
        exists = await db.saved_items.find_one({"user_id": user_id, "product_id": product_id})
        if exists:
            return {"msg": "Already saved"}
        doc = {"user_id": user_id, "product_id": product_id, "createdAt": datetime.utcnow()}
        res = await db.saved_items.insert_one(doc)
        return {"ok": True, "id": str(res.inserted_id)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ADD_SAVED_ITEM] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/saved-items")
async def remove_saved_item(payload: Any = Body(...), current_user: dict = Depends(get_current_user)):
    """Accepts JSON payloads like { "product_id": "..." } for delete requests (axios.delete with data).
    """
    try:
        user_id = str(current_user["_id"])
        product_id = None
        if isinstance(payload, str):
            product_id = payload
        if isinstance(payload, dict):
            product_id = payload.get("product_id") or payload.get("productId") or payload.get("id")
            if not product_id and isinstance(payload.get("product"), dict):
                product_id = payload.get("product").get("id") or payload.get("product").get("_id")
        if not product_id:
            raise HTTPException(status_code=400, detail="product_id is required")
        product_id = str(product_id)

        res = await db.saved_items.delete_many({"user_id": user_id, "product_id": product_id})
        return {"deleted": res.deleted_count}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[REMOVE_SAVED_ITEM] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/saved-items")
async def list_saved_items(current_user: dict = Depends(get_current_user)):
    try:
        from bson import ObjectId
        user_id = str(current_user["_id"])
        items = []
        async for s in db.saved_items.find({"user_id": user_id}).sort("createdAt", -1):
            prod = None
            pid = s.get("product_id")
            # try ObjectId lookup first if possible
            try:
                if pid and ObjectId.is_valid(pid):
                    prod = await db.products.find_one({"_id": ObjectId(pid)})
            except Exception:
                prod = None
            # fallback to string _id lookup
            if not prod:
                try:
                    prod = await db.products.find_one({"_id": pid})
                except Exception:
                    prod = None

            if prod:
                items.append({
                    "id": str(s.get("_id")),
                    "product": {"id": str(prod.get("_id")), "title": prod.get("title"), "image": prod.get("image"), "price": prod.get("price")},
                    "savedAt": s.get("createdAt")
                })
        return items
    except Exception as e:
        print(f"[LIST_SAVED_ITEMS] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Orders / Transactions ---
@app.post("/api/orders")
async def create_order(order: dict = Body(...), current_user: dict = Depends(get_current_user)):
    try:
        user_id = str(current_user["_id"])
        order_dict = dict(order)
        order_dict["buyer_id"] = user_id
        order_dict["createdAt"] = datetime.utcnow()
        order_dict["status"] = order_dict.get("status", "pending")
        res = await db.orders.insert_one(order_dict)
        order_dict["id"] = str(res.inserted_id)
        return {"ok": True, "order": order_dict}
    except Exception as e:
        print(f"[CREATE_ORDER] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    try:
        from bson import ObjectId
        if ObjectId.is_valid(order_id):
            order = await db.orders.find_one({"_id": ObjectId(order_id)})
        else:
            order = await db.orders.find_one({"id": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        # permission: buyer or seller or admin
        user_id = str(current_user["_id"])
        if order.get("buyer_id") != user_id and order.get("seller_id") != user_id and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not allowed")
        # normalize id
        order["id"] = str(order.get("_id")) if order.get("_id") else order.get("id")
        return order
    except HTTPException:
        raise
    except Exception as e:
        print(f"[GET_ORDER] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Notifications ---
@app.get("/api/notifications")
async def list_notifications(current_user: dict = Depends(get_current_user)):
    try:
        user_id = str(current_user["_id"])
        notes = []
        async for n in db.notifications.find({"user_id": user_id}).sort("createdAt", -1):
            n["_id"] = str(n.get("_id"))
            notes.append(n)
        return notes
    except Exception as e:
        print(f"[LIST_NOTIFICATIONS] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    try:
        from bson import ObjectId
        user_id = str(current_user["_id"])
        if ObjectId.is_valid(notification_id):
            res = await db.notifications.update_one({"_id": ObjectId(notification_id), "user_id": user_id}, {"$set": {"read": True}})
        else:
            res = await db.notifications.update_one({"_id": notification_id, "user_id": user_id}, {"$set": {"read": True}})
        return {"modified": res.modified_count}
    except Exception as e:
        print(f"[MARK_NOTIFICATION_READ] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
