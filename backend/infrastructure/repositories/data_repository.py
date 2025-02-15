from ..database.database_factory import DatabaseFactory


class DataRepository:
    def __init__(self):
        self.db = DatabaseFactory.get_database()

    def get_all_items(self, table_name, query=None, projection=None):
        return self.db.find_all(table_name, query, projection)

    def get_item(self, collection_name, item_id):
        return self.db.find_one(collection_name, {"id": item_id})

    def add_article(self, paper_data, json_files):
        return self.db.add_article(paper_data, json_files)

    def query_search(
        self,
        start_year,
        end_year,
        author_ids,
        journal_names,
        concept_ids,
        page,
        per_page,
        conference_names,
        title,
        research_fields,
    ):
        return self.db.query_search(
            start_year,
            end_year,
            author_ids,
            journal_names,
            concept_ids,
            page,
            per_page,
            conference_names,
            title,
            research_fields,
        )

    def search_authors(self, search_term):
        return self.db.search_authors(search_term)

    def search_titles(self, search_term):
        return self.db.search_titles(search_term)

    def search_research_fields(self, search_term):
        return self.db.search_research_fields(search_term)

    def search_journals(self, search_term):
        return self.db.search_journals(search_term)

    def search_concepts(self, search_term):
        return self.db.search_concepts(search_term)

    def search_latest_concepts(self):
        return self.db.search_latest_concepts()

    def search_statement(self, id):
        return self.db.search_statement(id)

    def search_paper(self, id):
        return self.db.search_paper(id)

    def search_latest_statements(self, research_fields, search_query, sort_order, page, page_size):
        return self.db.search_latest_statements(
            research_fields, search_query, sort_order, page, page_size
        )

    def search_latest_articles(self, research_fields, search_query, sort_order, page, page_size):
        return self.db.search_latest_articles(research_fields, search_query, sort_order, page, page_size)

    def search_latest_keywords(self, research_fields, search_query, sort_order, page, page_size):
        return self.db.search_latest_keywords(research_fields, search_query, sort_order, page, page_size)

    def search_latest_authors(self, research_fields, search_query, sort_order, page, page_size):
        return self.db.search_latest_authors(research_fields, search_query, sort_order, page, page_size)

    def search_latest_journals(self, research_fields, search_query, sort_order, page, page_size):
        return self.db.search_latest_journals(research_fields, search_query, sort_order, page, page_size)

    def add_item(self, collection_name, item_data):
        return self.db.insert_one(collection_name, item_data)

    def aggregate(self, collection_name, pipeline):
        return self.db.aggregate(collection_name, pipeline)

    def find_one(self, table_name, entity_id):
        return self.db.find_one(table_name, entity_id)

    def find_one_statement(self, table_name, entity_id):
        return self.db.find_one_statement(table_name, entity_id)

    def search_latest_semantics_statements(self, ids, sort_order, page, page_size):
        return self.db.search_latest_semantics_statements(ids, sort_order, page, page_size)

    def search_latest_semantics_articles(self, ids, sort_order, page, page_size):
        return self.db.search_latest_semantics_articles(ids, sort_order, page, page_size)
