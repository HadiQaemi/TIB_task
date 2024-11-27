import pymongo
import pg8000.native
from infrastructure.config import Config


class PostgreSQLClient____:
    def __init__(self):
        self.conn = pg8000.native.Connection(
            host=Config.PG_HOST,
            database=Config.PG_DATABASE,
            user=Config.PG_USER,
            password=Config.PG_PASSWORD
        )

    def find_all(self, table_name, query=None, projection=None):
        select_clause = "*" if not projection else ", ".join(projection)
        sql = f"SELECT {select_clause} FROM {table_name}"
        if query:
            where_clause = " AND ".join([f"{k} = %s" for k in query.keys()])
            sql += f" WHERE {where_clause}"
        self.cur.execute(sql, list(query.values()) if query else None)
        return self.cur.fetchall()

    def find_one(self, table_name, query=None, projection=None):
        select_clause = "*" if not projection else ", ".join(projection)
        sql = f"SELECT {select_clause} FROM {table_name}"
        if query:
            where_clause = " AND ".join([f"{k} = %s" for k in query.keys()])
            sql += f" WHERE {where_clause}"
        sql += " LIMIT 1"
        self.cur.execute(sql, list(query.values()) if query else None)
        return self.cur.fetchone()

    def insert_one(self, table_name, data):
        columns = ", ".join(data.keys())
        values = ", ".join(["%s"] * len(data))
        sql = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) RETURNING id"
        self.cur.execute(sql, list(data.values()))
        self.conn.commit()
        return self.cur.fetchone()['id']

    def aggregate(self, query):
        raise NotImplementedError("Aggregate")

    def close(self):
        self.cur.close()
        self.conn.close()


class MongoDBClient____:
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

    def aggregate(self, pipeline):
        collection = self.db['papers']
        return collection.aggregate(pipeline)

    def close(self):
        self.client.close()
