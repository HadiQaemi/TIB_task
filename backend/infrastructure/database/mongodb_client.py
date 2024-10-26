import pymongo
import math
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

    def find_all_paginated(self, collection_name, query=None, projection=None, page=1, page_size=10):
        collection = self.db[collection_name]
        
        # Calculate skip value
        skip = (page - 1) * page_size
        
        # Get total count for pagination
        total_elements = collection.count_documents(query if query else {})
        
        # Fetch paginated results
        cursor = collection.find(
            filter=query if query else {},
            projection=projection
        ).skip(skip).limit(page_size)
        
        # Convert cursor to list
        content = list(cursor)
        
        return {
            "content": content,
            "totalElements": total_elements,
            "page": page,
            "pageSize": page_size,
            "totalPages": math.ceil(total_elements / page_size)
        }

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
