from ..database.database_factory import DatabaseFactory


class DataRepository:
    def __init__(self):
        self.db = DatabaseFactory.get_database()

    def get_all_items(
        self, table_name, query=None, projection=None
    ):
        # return self.db.find_all_paginated(
        #     table_name, query, projection, page, page_size
        # )
        return self.db.find_all( table_name, query, projection)

    def get_item(self, collection_name, item_id):
        return self.db.find_one(collection_name, {"id": item_id})

    def add_item(self, collection_name, item_data):
        return self.db.insert_one(collection_name, item_data)

    def aggregate(self, collection_name, pipeline):
        return self.db.aggregate(collection_name, pipeline)

    def find_one(self, collection_name, query, projection):
        return self.db.find_one(collection_name, query, projection)
