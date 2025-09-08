from pymongo import MongoClient
import json
from bson import ObjectId

MONGO_URL = "mongodb+srv://hadjmed007:K0YuLRHXj0waMmKX@cluster0.fcb3ami.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URL)
db = client["valikoo"]

# تحديث جميع المنتجات القديمة: إزالة buyer_id وتعيين الحالة "available"
result1 = db.products.update_many({}, {"$set": {"status": "available"}, "$unset": {"buyer_id": ""}})
print(f"Modified {result1.modified_count} products (status/buyer_id).")

# تحديث بيانات المسافر في المنتجات القديمة
products = db.products.find({"traveler_id": {"$exists": True, "$ne": None}})
count = 0
not_updated = []
for product in products:
    traveler_id = product.get("traveler_id")
    # جرب كـ ObjectId أو نص
    query = None
    if traveler_id:
        query = {"_id": traveler_id}
        if ObjectId.is_valid(str(traveler_id)):
            query = {"_id": ObjectId(traveler_id)}
        traveler = db.users.find_one(query) if query else None
        location = traveler.get("location", "غير محدد") if traveler else "غير محدد"
        avatar = traveler.get("avatar", "https://ui-avatars.com/api/?name=Traveler") if traveler else "https://ui-avatars.com/api/?name=Traveler"
    else:
        location = "غير محدد"
        avatar = "https://ui-avatars.com/api/?name=Traveler"
    update = {"traveler.location": location, "traveler.avatar": avatar}
    db.products.update_one({"_id": product["_id"]}, {"$set": update})
    count += 1
print(f"Updated traveler location and avatar for {count} products (all products updated).")
