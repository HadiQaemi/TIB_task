from ..database.database_factory import DatabaseFactory


class DataRepository:
    def __init__(self):
        self.db = DatabaseFactory.get_database()

    def get_all_items(self, table_name, query=None, projection=None):
        # return self.db.find_all_paginated(
        #     table_name, query, projection, page, page_size
        # )
        return self.db.find_all(table_name, query, projection)

    def get_item(self, collection_name, item_id):
        return self.db.find_one(collection_name, {"id": item_id})

    def add_article(self, paper_data, json_files):
        return self.db.add_article(paper_data, json_files)

    def query_search(
        self,
        author_ids,
        concept_ids,
        statement_filters,
        article_filters,
        page,
        per_page,
    ):
        return self.db.query_search(
            author_ids, concept_ids, statement_filters, article_filters, page, per_page
        )

    def add_item(self, collection_name, item_data):
        return self.db.insert_one(collection_name, item_data)

    def aggregate(self, collection_name, pipeline):
        return self.db.aggregate(collection_name, pipeline)

    def find_one(self, table_name, entity_id):
        return self.db.find_one(table_name, entity_id)

    def find_one_statement(self, table_name, entity_id):
        return self.db.find_one_statement(table_name, entity_id)