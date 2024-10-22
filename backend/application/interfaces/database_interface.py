from abc import ABC, abstractmethod

class DatabaseInterface(ABC):
    @abstractmethod
    def find_all(self, table_name, query=None, projection=None):
        pass

    @abstractmethod
    def find_one(self, collection_name, query=None, projection=None):
        pass

    @abstractmethod
    def insert_one(self, collection_name, data):
        pass

    @abstractmethod
    def aggregate(self, pipeline):
        pass

    @abstractmethod
    def close(self):
        pass