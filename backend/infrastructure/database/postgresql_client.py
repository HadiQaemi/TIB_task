import pg8000.native
from application.interfaces.database_interface import DatabaseInterface
from infrastructure.config import Config
import json


class PostgreSQLClient(DatabaseInterface):
    """
    A class for interacting with a PostgreSQL database.
    This class provides methods for finding, inserting, and closing the database connection.
    """

    def __init__(self):
        # self.conn = pg8000.native.Connection(
        #     host=Config.PG_HOST,
        #     database=Config.PG_DATABASE,
        #     user=Config.PG_USER,
        #     password=Config.PG_PASSWORD
        # )
        # self.conn.autocommit = True
        # self.cur = self.conn.cursor()
        self.conn = pg8000.connect(
            host=Config.PG_HOST,
            user=Config.PG_USER,
            password=Config.PG_PASSWORD,
            database=Config.PG_DATABASE  # Connect to default database first
        )
        self.conn.autocommit = True
        self.cur = self.conn.cursor()

    def find_all(self, table_name, query=None, projection=None):
        select_clause = "*" if not projection else ", ".join(projection)
        sql = f"SELECT {select_clause} FROM {table_name}"
        if query:
            where_clause = " AND ".join([f"{k} = %s" for k in query.keys()])
            sql += f" WHERE {where_clause}"
        self.cur.execute(sql)
        rows = self.cur.fetchall()
        return rows

    def find_one(self, table_name, query=None, projection=None):
        select_clause = "*" if not projection else ", ".join(projection)
        sql = f"SELECT {select_clause} FROM {table_name}"
        if query:
            where_clause = " AND ".join([f"{k} = %s" for k in query.keys()])
            sql += f" WHERE {where_clause}"
        sql += " LIMIT 1"
        self.cur.execute(sql, list(query.values()) if query else None)
        return self.cur.fetchone()

    def process_json(self, json_data):
        """
        Process JSON data by separating common fields and P-prefixed predicates.

        Args:
            json_data: Input JSON dictionary

        Returns:
            Dictionary with separated common fields and predicates
        """
        # Initialize result dictionary with None values for common fields
        result = {
            'json_id': None,
            'json_type': None,
            'json_context': None,
            'label': None,
            'mongo_id': None,
            'predicates': {}
        }

        # Map JSON keys to database fields
        field_mapping = {
            '@id': 'json_id',
            '@type': 'json_type',
            '@context': 'json_context',
            'label': 'label',
            '_id': 'mongo_id'
        }

        # Process each key-value pair
        for key, value in json_data.items():
            if key in field_mapping:
                # Handle common fields
                result[field_mapping[key]] = value
            elif key.startswith('P'):
                # Store P-prefixed predicates with processed values
                result['predicates'][key] = value

        return result

    def insert_one(self, table_name, paper_data):
        for key in ['dois', 'entity', 'contributions', 'external', 'info', 'timeline']:
            if isinstance(paper_data[key], (dict, list)):
                paper_data[key] = json.dumps(paper_data[key])

        # Create the INSERT query
        fields = ', '.join(paper_data.keys())
        placeholders = ', '.join(['%s'] * len(paper_data))
        query = f"""
            INSERT INTO {table_name} ({fields})
            VALUES ({placeholders})
            RETURNING id
        """
        self.cur.execute(query, list(paper_data.values()))
        result = self.cur.fetchone()
        inserted_id = result[0] if result else None
        print(f"Paper inserted with ID: {inserted_id}")

        contributions = json.loads(paper_data['contributions'])
        for contribution in contributions:
            process_json = self.process_json(contribution)
            query = """
            INSERT INTO public.contributions 
                (paper_id, json_id, json_type, json_context, label, mongo_id, predicates)
            VALUES 
                (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                inserted_id,
                process_json["json_id"],
                process_json["json_type"],
                process_json["json_context"],
                process_json["label"],
                process_json["mongo_id"],
                json.dumps(process_json["predicates"])
            )
            self.cur.execute(query, values)
        self.conn.commit()
        return True

    def aggregate(self, query):
        # PostgreSQL doesn't have a direct equivalent to MongoDB's aggregate.
        # You would need to translate MongoDB aggregation pipeline to SQL.
        # This is a placeholder and would need to be implemented based on specific needs.
        raise NotImplementedError(
            "Aggregate functionality needs to be implemented specifically for your use case")

    def close(self):
        self.cur.close()
        self.conn.close()
