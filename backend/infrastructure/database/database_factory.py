from .postgresql_client import PostgreSQLClient
from .mongodb_client import MongoDBClient
from ..config import Config

class DatabaseFactory:
    @staticmethod
    def get_database():
        if Config.DATABASE_TYPE == 'mongodb':
            return MongoDBClient()
        elif Config.DATABASE_TYPE == 'postgresql':
            return PostgreSQLClient()
        else:
            raise ValueError(f"Unsupported database type: {Config.DATABASE_TYPE}")