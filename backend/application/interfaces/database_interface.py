from abc import ABC, abstractmethod


class DatabaseInterface(ABC):
    @abstractmethod
    def find_all_paginated(
        self, collection_name, query=None, projection=None, page=1, page_size=10
    ):
        pass

    @abstractmethod
    def find_all(self, table_name, query=None, projection=None):
        pass

    @abstractmethod
    def find_one(self, table_name, entity_id=None):
        pass

    @abstractmethod
    def insert_one(self, collection_name, data):
        pass

    @abstractmethod
    def add_article(self, paper_data, json_files):
        pass

    @abstractmethod
    def search_authors(self, search_term):
        pass

    @abstractmethod
    def search_titles(self, search_term):
        pass

    @abstractmethod
    def search_research_fields(self, search_term):
        pass

    @abstractmethod
    def search_journals(self, search_term):
        pass

    @abstractmethod
    def search_concepts(self, search_term):
        pass

    @abstractmethod
    def search_latest_concepts(self):
        pass

    @abstractmethod
    def search_statement(self, id):
        pass

    @abstractmethod
    def search_paper(self, id):
        pass

    @abstractmethod
    def search_latest_statements(self, research_fields, search_query, sort_order, page, page_size):
        pass

    @abstractmethod
    def search_latest_articles(self, research_fields, search_query, sort_order, page, page_size):
        pass

    @abstractmethod
    def search_latest_keywords(self, research_fields, search_query, sort_order, page, page_size):
        pass

    @abstractmethod
    def search_latest_authors(self, research_fields, search_query, sort_order, page, page_size):
        pass

    @abstractmethod
    def search_latest_journals(self, research_fields, search_query, sort_order, page, page_size):
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    def aggregate(self, pipeline):
        pass

    @abstractmethod
    def close(self):
        pass
