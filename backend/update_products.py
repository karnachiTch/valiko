from pymongo import MongoClient

MONGO_URL = "mongodb+srv://hadjmed007:K0YuLRHXj0waMmKX@cluster0.fcb3ami.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URL)
db = client["valikoo"]

# تحديث جميع المنتجات القديمة: إزالة buyer_id وتعيين الحالة "available"
result = db.products.update_many({}, {"$set": {"status": "available"}, "$unset": {"buyer_id": ""}})
print(f"Modified {result.modified_count} products.")
