import pymongo
from application.interfaces.database_interface import DatabaseInterface
from infrastructure.config import Config


class MongoDBClient(DatabaseInterface):
    """
    A class for interacting with a MongoDB database.
    This class provides methods for finding, inserting, and closing the database connection.
    """

    def __init__(self):
        self.client = pymongo.MongoClient(Config.MONGO_URI)
        self.db = self.client[Config.DATABASE_NAME]

    def find_all(self, collection_name, query=None, projection=None):
        collection = self.db[collection_name]
        return list(collection.find(query, projection))

    def find_one(self, collection_name, query=None, projection=None):
        collection = self.db[collection_name]
        return collection.find_one(query, projection)

    def insert_one(self, collection_name, data):
        collection = self.db[collection_name]
        result = collection.insert_one(data)
        return result

    def aggregate(self, collection_name, pipeline):
        collection = self.db[collection_name]
        return collection.aggregate(pipeline)

    def close(self):
        self.client.close()
