from infrastructure.web_scraper import NodeExtractor
import pymongo
import math
from application.interfaces.database_interface import DatabaseInterface
from infrastructure.config import Config
from typing import List, Dict, Tuple


from dataclasses import dataclass
from bson import ObjectId, json_util
import json
from datetime import datetime


@dataclass
class MongoDocument:
    _id: ObjectId
    # other fields

    def to_dict(self):
        return {
            "_id": str(self._id),
            # convert other fields as needed
        }


class MongoDBClient(DatabaseInterface):
    """
    A class for interacting with a MongoDB database.
    This class provides methods for finding, inserting, and closing the database connection.
    """

    def __init__(self):
        self.client = pymongo.MongoClient(Config.MONGO_URI)
        self.db = self.client[Config.DATABASE_NAME]

    def find_all_paginated(
        self, collection_name, query=None, projection=None, page=1, page_size=10
    ):
        collection = self.db[collection_name]

        # Calculate skip value
        skip = (page - 1) * page_size

        # Get total count for pagination
        total_elements = collection.count_documents(query if query else {})

        # Fetch paginated results
        cursor = (
            collection.find(filter=query if query else {}, projection=projection)
            .skip(skip)
            .limit(page_size)
        )

        # Convert cursor to list
        content = list(cursor)

        return {
            "content": content,
            "totalElements": total_elements,
            "page": page,
            "pageSize": page_size,
            "totalPages": math.ceil(total_elements / page_size),
        }

    def find_all(self, collection_name, query=None, projection=None):
        collection = self.db[collection_name]
        return list(collection.find(query, projection))

    def find_one(self, collection_name, entity_id):
        db = self.db
        article_id = ObjectId(entity_id)
        article = db.articles.find_one(
            {"_id": article_id},
            {
                "author": 1,
                "datePublished": 1,
                "identifier": 1,
                "journal": 1,
                "name": 1,
                "publisher": 1,
            },
        )
        if article:
            statements = list(
                db.statements.find(
                    {"article_id": article_id},
                    {"author": 1, "concept": 1, "content": 1},
                )
            )
            return json.loads(json_util.dumps(article)), json.loads(
                json_util.dumps(statements)
            )
        else:
            return None

    def find_one_statement(self, collection_name, entity_id):
        db = self.db
        statement_id = ObjectId(entity_id)
        statement = db.statements.find_one(
            {"_id": statement_id},
            {"author": 1, "concept": 1, "content": 1},
        )
        if statement:
            return json.loads(json_util.dumps(statement))
        else:
            return None

    def insert_one(self, collection_name, data):
        collection = self.db[collection_name]
        result = collection.insert_one(data)
        return result

    def convert_objectid_to_string(self, data):
        def convert_value(value):
            if isinstance(value, ObjectId):
                return str(value)
            elif isinstance(value, str):
                return value
            elif isinstance(value, dict):
                return {k: convert_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [convert_value(v) for v in value]
            else:
                return value

        return [{k: convert_value(v) for k, v in d.items()} for d in data]

    def search_authors(self, search_term):
        db = self.db
        authors = db.authors.find({"label": search_term}, {"label": 1, "_id": 1}).limit(
            10
        )
        return authors

    def search_journals(self, journals):
        db = self.db
        journals = db.articles.find({"journal": journals}, {"journal": 1}).limit(10)
        return journals

    def search_concepts(self, search_term):
        db = self.db
        authors = db.concepts.find(
            {"label": search_term}, {"label": 1, "_id": 1}
        ).limit(10)
        return authors

    # start_year, end_year, author_ids, journal_names, concept_ids, page, per_page
    def query_search(
        self,
        start_year,
        end_year,
        author_ids,
        journal_names,
        concept_ids,
        page,
        per_page,
    ):
        db = self.db

        try:
            # Build the query
            match = {}
            if author_ids:
                authors = []
                for key, value in enumerate(author_ids):
                    authors.append(ObjectId(value))
                match["author_ids"] = {"$in": authors}
            if concept_ids:
                concepts = []
                for key, value in enumerate(concept_ids):
                    concepts.append(ObjectId(value))
                match["concept_ids"] = {"$in": concepts}
            if start_year and end_year:
                match["datePublished"] = {
                    "$gte": datetime(int(start_year), 12, 31),
                    "$lte": datetime(int(end_year), 12, 31),
                }
            # "article.datePublished": {"$gte": start_date, "$lte": end_date}
            print("match", match)
            # if statement_filters:
            #     for key, value in statement_filters.items():
            #         match[key] = {"$regex": value, "$options": "i"}
            # if article_filters:
            #     for key, value in article_filters.items():
            #         match[key] = {"$regex": value, "$options": "i"}

            pipeline = [
                {
                    "$lookup": {
                        "from": "concepts",
                        "localField": "concept_ids",
                        "foreignField": "_id",
                        "as": "concepts",
                    }
                },
                {
                    "$lookup": {
                        "from": "articles",
                        "localField": "article_id",
                        "foreignField": "_id",
                        "as": "article",
                    }
                },
                {
                    "$unwind": {
                        "path": "$article",
                        "preserveNullAndEmptyArrays": True,  # Keep articles even if they have no concept
                    }
                },
                {"$match": match},
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
                        "publisher": 1,
                        "author": 1,
                        "version": 1,
                        "article_id": 1,
                        "content": 1,
                        "label": "$content.doi:a72ca256dc49e55a1a57#has_notation.doi:44164d31a37c28d8efbf#label",
                        "concepts": {
                            "$map": {
                                "input": "$concepts",
                                "as": "concept",
                                "in": {
                                    "label": "$$concept.label",
                                    "identifier": "$$concept.identifier",
                                },
                            }
                        },
                        "article": {
                            "doi": "$article.@id",
                            "type": "$article.@type",
                            "author": "$article.author",
                            "datePublished": "$article.datePublished",
                            "identifier": "$article.identifier",
                            "journal": "$article.journal",
                            "abstract": "$article.abstract",
                            "conference": "$article.conference",
                            "name": "$article.name",
                            "publisher": "$article.publisher",
                            "research_field": "$article.research_field",
                            "paper_type": "$article.paper_type",
                            "id": "$article._id",
                        },
                        # "articles": {
                        #     "$map": {
                        #         "input": "$articles",
                        #         "as": "article",
                        #         "in": {
                        #             "doi": "$$article.@id",
                        #             "type": "$$article.@type",
                        #             "author": "$$article.author",
                        #             "datePublished": "$$article.datePublished",
                        #             "identifier": "$$article.identifier",
                        #             "journal": "$$article.journal",
                        #             "name": "$$article.name",
                        #             "publisher": "$$article.publisher",
                        #         },
                        #     }
                        # },
                    }
                },
                {"$sort": {"_id": 1}},
                {"$skip": (page - 1) * per_page},
                {"$limit": per_page},
            ]
            print(pipeline)
            docs = list(db.statements.aggregate(pipeline))
            converted_data = self.convert_objectid_to_string(docs)

            return converted_data  # , total_count

        except Exception as e:
            raise e

    def add_article(self, data, json_files):
        scraper = NodeExtractor()
        db = self.db
        try:
            # Insert authors and create mapping
            authors = {}
            for item in data["@graph"]:
                for author in item.get("author", []):
                    result = db.authors.find_one(
                        {
                            "label": f"{author.get('givenName', '')} {author.get('familyName', '')}"
                        }
                    )
                    if result:
                        authors[
                            f"{author.get('givenName', '')} {author.get('familyName', '')}"
                        ] = result["_id"]
                    else:
                        author_result = db.authors.insert_one(
                            {
                                "label": f"{author.get('givenName', '')} {author.get('familyName', '')}",
                                "identifier": author["@id"],
                            }
                        )
                        authors[
                            f"{author.get('givenName', '')} {author.get('familyName', '')}"
                        ] = author_result.inserted_id
            # Insert concepts and create mapping
            concepts = {}
            for item in data["@graph"]:
                if "Statement" in item.get("@type", []):
                    for concept in item.get("concept", []):
                        if concept.get("label"):
                            result = db.concepts.find_one({"label": concept["label"]})
                            if result:
                                concepts[concept["label"]] = result["_id"]
                            else:
                                concept_result = db.concepts.insert_one(
                                    {
                                        "label": concept["label"],
                                        "identifier": concept.get("identifier", []),
                                    }
                                )
                                concepts[concept["label"]] = concept_result.inserted_id

            # Insert article
            article = next(
                item
                for item in data["@graph"]
                if item.get("@type") == "ScholarlyArticle"
            )
            article["author_ids"] = [
                authors[f"{author.get('givenName', '')} {author.get('familyName', '')}"]
                for author in article.get("author", [])
                if f"{author.get('givenName', '')} {author.get('familyName', '')}"
                in authors
            ]

            if "journal" in article:
                paper_type = "journal"
                journal_result = db.journals.insert_one(article["journal"])
                journal_id = journal_result.inserted_id
            else:
                paper_type = "conference"
                conference_result = db.conferences.insert_one(article["conference"])
                conference_id = conference_result.inserted_id

            research_result = db.research_fields.insert_one(article["research_field"])
            research_field = research_result.inserted_id

            article["paper_type"] = paper_type
            article_result = db.articles.insert_one(article)
            article_id = article_result.inserted_id

            # Insert statements
            for item in data["@graph"]:
                if "Statement" in item.get("@type", []):
                    item["article_id"] = article_id
                    item["author_ids"] = [
                        authors[
                            f"{author.get('givenName', '')} {author.get('familyName', '')}"
                        ]
                        for author in item.get("author", [])
                        if f"{author.get('givenName', '')} {author.get('familyName', '')}"
                        in authors
                    ]
                    content = scraper.load_json_from_url(
                        json_files[item.get("name", "")]
                    )
                    item["content"] = content
                    item["datePublished"] = datetime(
                        int(article["datePublished"]), 6, 6
                    )                 
                    if "journal" in article:
                        item["type"] = "journal"
                        item["journal"] = journal_id
                    else:
                        item["type"] = "conference"
                        item["conference"] = conference_id

                    item["research_field"] = research_field
                    item["concept_ids"] = [
                        concepts[concept["label"]]
                        for concept in item.get("concept", [])
                        if concept.get("label") in concepts
                    ]
                    db.statements.insert_one(item)

            # Insert files
            for item in data["@graph"]:
                if ("Statement" not in item.get("@type", []) or "ScholarlyArticle" not in item.get("@type", [])):
                    item["article_id"] = article_id
                    item["author_ids"] = [
                        authors[author["@id"]]
                        for author in item.get("author", [])
                        if author.get("@id") in authors
                    ]
                    db.files.insert_one(item)

            return True
        except Exception as e:
            raise e

    def aggregate(self, collection_name, pipeline):
        collection = self.db[collection_name]
        return collection.aggregate(pipeline)

    def close(self):
        self.client.close()
