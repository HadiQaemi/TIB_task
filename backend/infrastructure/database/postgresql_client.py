from infrastructure.web_scraper import NodeExtractor
import pg8000.native
import math
import json
from application.interfaces.database_interface import DatabaseInterface
from infrastructure.config import Config
from typing import List, Dict, Tuple


class PostgreSQLClient(DatabaseInterface):
    def __init__(self):
        self.conn = pg8000.connect(
            host=Config.PG_HOST,
            user=Config.PG_USER,
            password=Config.PG_PASSWORD,
            database=Config.PG_DATABASE,
        )
        self.conn.autocommit = True
        self.cur = self.conn.cursor()

    def find_all_paginated(
        self, table_name, query=None, projection=None, page=1, page_size=10
    ):
        offset = (page - 1) * page_size

        select_clause = "*" if not projection else ", ".join(projection)
        count_sql = f"SELECT COUNT(*) FROM {table_name}"
        select_sql = f"SELECT {select_clause} FROM {table_name}"

        where_clause = ""
        params = []
        if query:
            where_conditions = [f"{k} = %s" for k in query.keys()]
            where_clause = " WHERE " + " AND ".join(where_conditions)
            params = list(query.values())

        self.cur.execute(count_sql + where_clause, params)
        total_elements = self.cur.fetchone()[0]

        final_sql = f"{select_sql}{where_clause} LIMIT %s OFFSET %s"
        self.cur.execute(final_sql, params + [page_size, offset])
        content = self.cur.fetchall()

        return {
            "content": content,
            "totalElements": total_elements,
            "page": page,
            "pageSize": page_size,
            "totalPages": math.ceil(total_elements / page_size),
        }

    def find_all(self, table_name, query=None, projection=None):
        select_clause = "*" if not projection else ", ".join(projection)
        sql = f"SELECT {select_clause} FROM {table_name}"
        if query:
            where_clause = " AND ".join([f"{k} = %s" for k in query.keys()])
            sql += f" WHERE {where_clause}"
        self.cur.execute(sql)
        rows = self.cur.fetchall()
        return rows

    def find_one(self, table_name, entity_id):
        pass

    def search_concepts(self, search_term):
        pass

    def search_journals(self, search_term):
        pass

    def search_authors(self, search_term):
        pass

    def search_titles(self, search_term):
        pass

    def search_research_fields(self, search_term):
        pass

    def find_one_statement(self, table_name, entity_id):
        pass

    def process_json(self, json_data):
        result = {
            "json_id": None,
            "json_type": None,
            "json_context": None,
            "label": None,
            "mongo_id": None,
            "predicates": {},
        }

        field_mapping = {
            "@id": "json_id",
            "@type": "json_type",
            "@context": "json_context",
            "label": "label",
            "_id": "mongo_id",
        }

        for key, value in json_data.items():
            if key in field_mapping:
                result[field_mapping[key]] = value
            elif key.startswith("P"):
                result["predicates"][key] = value

        return result

    def insert_one(self, table_name, paper_data):
        for key in ["dois", "entity", "contributions", "external", "info", "timeline"]:
            if isinstance(paper_data[key], (dict, list)):
                paper_data[key] = json.dumps(paper_data[key])

        fields = ", ".join(paper_data.keys())
        placeholders = ", ".join(["%s"] * len(paper_data))
        query = f"""
            INSERT INTO {table_name} ({fields})
            VALUES ({placeholders})
            RETURNING id
        """
        self.cur.execute(query, list(paper_data.values()))
        result = self.cur.fetchone()
        inserted_id = result[0] if result else None
        print(f"Paper inserted with ID: {inserted_id}")

        contributions = json.loads(paper_data["contributions"])
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
                json.dumps(process_json["predicates"]),
            )
            self.cur.execute(query, values)
        self.conn.commit()
        return True

    def query_search(
        self,
        start_year: int,
        end_year: int,
        author_ids: List[int],
        journal_names: List[str],
        concept_ids: List[int],
        page: int,
        per_page: int,
        conference_names,
        title,
        research_fields,
    ) -> Tuple[List[Dict], int]:
        conn = self.conn
        cursor = self.cur

        try:
            query = """
                SELECT
                    a.id, a.name, a.publisher, a.journal, a.identifier, a.date_published,
                    json_agg(DISTINCT (
                        SELECT row_to_json(t)
                        FROM (SELECT id, label, identifier) t
                    )) AS authors,
                    json_agg(DISTINCT (
                        SELECT row_to_json(t)
                        FROM (SELECT id, label, identifier) t
                    )) AS concepts,
                    json_agg(DISTINCT (
                        SELECT row_to_json(t)
                        FROM (SELECT id, version, name, content) t
                    )) AS statements,
                    json_agg(DISTINCT (
                        SELECT row_to_json(t)
                        FROM (SELECT id, encoding_format, source, name, type) t
                    )) AS files
                FROM test.articles a
                LEFT JOIN test.article_authors aa ON a.id = aa.article_id
                LEFT JOIN test.authors au ON aa.author_id = au.id
                LEFT JOIN test.statement_concepts sc ON a.id = sc.statement_id
                LEFT JOIN test.concepts c ON sc.concept_id = c.id
                LEFT JOIN test.statements s ON a.id = s.article_id
                LEFT JOIN test.files f ON a.id = f.article_id
                WHERE 1 = 1
            """

            if author_ids:
                query += " AND aa.author_id IN %(author_ids)s"
            if concept_ids:
                query += " AND c.id IN %(concept_ids)s"
            query += """
                GROUP BY a.id
                ORDER BY a.id
                LIMIT %(limit)s OFFSET %(offset)s;
            """

            params = {
                "author_ids": tuple(author_ids) if author_ids else None,
                "concept_ids": tuple(concept_ids) if concept_ids else None,
                "limit": per_page,
                "offset": (page - 1) * per_page,
            }
            cursor.execute(query, params)
            result = cursor.fetchall()

            articles = []
            for row in result:
                article = {
                    "id": row[0],
                    "name": row[1],
                    "publisher": row[2],
                    "journal": row[3],
                    "identifier": row[4],
                    "date_published": row[5],
                    "authors": json.loads(row[6]) if row[6] else [],
                    "concepts": json.loads(row[7]) if row[7] else [],
                    "statements": json.loads(row[8]) if row[8] else [],
                    "files": json.loads(row[9]) if row[9] else [],
                }
                articles.append(article)

            cursor.execute("SELECT COUNT(*) FROM test.articles a WHERE 1 = 1", params)
            total_count = cursor.fetchone()[0]

            return articles, total_count

        except Exception as e:
            raise e
        finally:
            cursor.close()
            conn.close()

    def add_article(self, paper_data, json_files):
        conn = self.conn
        cursor = self.cur
        scraper = NodeExtractor()

        try:
            author_map = {}
            for item in paper_data["@graph"]:
                authors = item.get("author", [])
                for author in authors:
                    if author.get("@id") and author["@id"] not in author_map:
                        cursor.execute(
                            """
                            SELECT id 
                            FROM authors
                            WHERE identifier = %s
                        """,
                            (author["@id"],),
                        )
                        result = cursor.fetchone()
                        if result:
                            author_map[author["@id"]] = result[0]
                        else:
                            cursor.execute(
                                """
                                INSERT INTO authors (label, identifier)
                                VALUES (%s, %s)
                                RETURNING id
                            """,
                                (
                                    f"{author.get('givenName', '')} {author.get('familyName', '')}",
                                    author["@id"],
                                ),
                            )
                            author_map[author["@id"]] = cursor.fetchone()[0]

            concept_map = {}
            for item in paper_data["@graph"]:
                if "Statement" in item.get("@type", []):
                    for concept in item.get("concept", []):
                        if concept.get("label") and concept["label"] not in concept_map:
                            if concept.get("label"):
                                cursor.execute(
                                    """
                                    SELECT id
                                    FROM concepts
                                    WHERE label = %s
                                """,
                                    (concept["label"],),
                                )
                                result = cursor.fetchone()
                                if result:
                                    concept_map[concept["label"]] = result[0]
                                else:
                                    cursor.execute(
                                        """
                                        INSERT INTO concepts (label, identifier)
                                        VALUES (%s, %s)
                                        RETURNING id
                                    """,
                                        (
                                            concept["label"],
                                            json.dumps(concept.get("identifier", [])),
                                        ),
                                    )
                                    concept_map[concept["label"]] = cursor.fetchone()[0]

            article = next(
                item
                for item in paper_data["@graph"]
                if item.get("@type") == "ScholarlyArticle"
            )
            cursor.execute(
                """
                INSERT INTO articles (name, publisher, journal, identifier, date_published)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """,
                (
                    article.get("name", ""),
                    article.get("publisher", ""),
                    article.get("journal", ""),
                    article.get("identifier", ""),
                    article.get("datePublished", ""),
                ),
            )
            article_id = cursor.fetchone()[0]

            for author in article.get("author", []):
                if author.get("@id") and author["@id"] in author_map:
                    cursor.execute(
                        """
                        INSERT INTO article_authors (article_id, author_id)
                        VALUES (%s, %s)
                    """,
                        (article_id, author_map[author["@id"]]),
                    )

            for item in paper_data["@graph"]:
                if "Statement" in item.get("@type", []):
                    content = scraper.load_json_from_url(
                        json_files[item.get("name", "")]
                    )
                    cursor.execute(
                        """
                        INSERT INTO statements (version, name, content, article_id)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """,
                        (
                            item.get("version", ""),
                            item.get("name", ""),
                            json.dumps(content),
                            article_id,
                        ),
                    )
                    statement_id = cursor.fetchone()[0]

                    for author in item.get("author", []):
                        if author.get("@id") and author["@id"] in author_map:
                            cursor.execute(
                                """
                                INSERT INTO statement_authors (statement_id, author_id)
                                VALUES (%s, %s)
                            """,
                                (statement_id, author_map[author["@id"]]),
                            )

                    for concept in item.get("concept", []):
                        if concept.get("label") and concept["label"] in concept_map:
                            cursor.execute(
                                """
                                INSERT INTO statement_concepts (statement_id, concept_id)
                                VALUES (%s, %s)
                            """,
                                (statement_id, concept_map[concept["label"]]),
                            )

            for item in paper_data["@graph"]:
                if "File" in item.get("@type", []):
                    cursor.execute(
                        """
                        INSERT INTO files (encoding_format, source, name, type, article_id)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id
                    """,
                        (
                            item.get("encodingFormat", ""),
                            item.get("source", ""),
                            item.get("name", ""),
                            ",".join(item.get("@type", [])),
                            article_id,
                        ),
                    )
                    file_id = cursor.fetchone()[0]

                    for author in item.get("author", []):
                        if author.get("@id") and author["@id"] in author_map:
                            cursor.execute(
                                """
                                INSERT INTO file_authors (file_id, author_id)
                                VALUES (%s, %s)
                            """,
                                (file_id, author_map[author["@id"]]),
                            )
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            print("It is finally")

    def aggregate(self, query):
        raise NotImplementedError(
            "Aggregate functionality"
        )

    def close(self):
        self.cur.close()
        self.conn.close()
