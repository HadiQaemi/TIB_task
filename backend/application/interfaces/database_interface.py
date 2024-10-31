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
    def query_search(
        self,
        author_ids,
        concept_ids,
        statement_filters,
        article_filters,
        page,
        per_page,
    ):
        pass

    @abstractmethod
    def aggregate(self, pipeline):
        pass

    @abstractmethod
    def close(self):
        pass
