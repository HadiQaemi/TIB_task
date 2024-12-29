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

    def to_dict(self):
        return {
            "_id": str(self._id),
        }


class MongoDBClient(DatabaseInterface):
    def __init__(self):
        self.client = pymongo.MongoClient(Config.MONGO_URI)
        self.db = self.client[Config.DATABASE_NAME]

    def find_all_paginated(
        self, collection_name, query=None, projection=None, page=1, page_size=10
    ):
        collection = self.db[collection_name]
        skip = (page - 1) * page_size
        total_elements = collection.count_documents(query if query else {})
        cursor = (
            collection.find(filter=query if query else {}, projection=projection)
            .skip(skip)
            .limit(page_size)
        )
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

    def search_publications(self, journals):
        db = self.db
        journals = db.journals.find({"label": journals}, {"label": 1, "_id": 1}).limit(
            10
        )
        return journals

    def search_journals(self, query_term):
        db = self.db
        pipeline = [
            {
                "$unionWith": {
                    "coll": "conferences",
                    "pipeline": [
                        {"$match": {"label": query_term}},
                        {
                            "$project": {
                                "label": 1,
                                "_id": 1,
                                "type": {"$literal": "conference"},
                            }
                        },
                        {"$limit": 10},
                    ],
                }
            },
            {"$match": {"label": query_term}},
            {"$project": {"label": 1, "_id": 1, "type": {"$literal": "journal"}}},
            {"$limit": 10},
            {"$sort": {"label": 1}},
        ]

        return list(db.journals.aggregate(pipeline))

    def search_titles(self, search_term):
        db = self.db
        authors = db.articles.find({"name": search_term}, {"name": 1, "_id": 1}).limit(
            10
        )
        return authors

    def search_research_fields(self, search_term):
        db = self.db
        fields = db.research_fields.find(
            {"label": search_term}, {"label": 1, "_id": 1}
        ).limit(10)
        return fields

    def search_concepts(self, search_term):
        db = self.db
        authors = db.concepts.find(
            {"label": search_term}, {"label": 1, "_id": 1}
        ).limit(10)
        return authors

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
        db = self.db

        try:
            match = {}
            if title:
                match["$or"] = [
                    {"article.name": {"$regex": title, "$options": "i"}},
                    {"article.identifier": {"$regex": title, "$options": "i"}},
                ]
            if author_ids:
                authors = []
                for key, value in enumerate(author_ids):
                    authors.append(ObjectId(value))
                match["author_ids"] = {"$in": authors}
            if journal_names:
                journals = []
                for key, value in enumerate(journal_names):
                    journals.append(ObjectId(value))
                match["$or"] = [
                    {"journal": {"$in": journals}},
                    {"conference": {"$in": journals}},
                ]
            if concept_ids:
                concepts = []
                for key, value in enumerate(concept_ids):
                    concepts.append(ObjectId(value))
                match["concept_ids"] = {"$in": concepts}
            if research_fields:
                fields = []
                for key, value in enumerate(research_fields):
                    fields.append(ObjectId(value))
                match["research_field"] = {"$in": fields}
            if start_year and end_year:
                match["datePublished"] = {
                    "$gte": datetime(int(start_year), 12, 31),
                    "$lte": datetime(int(end_year), 12, 31),
                }

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
                        "from": "authors",
                        "localField": "author_ids",
                        "foreignField": "_id",
                        "as": "authors",
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
                        "preserveNullAndEmptyArrays": True,
                    }
                },
                {
                    "$lookup": {
                        "from": "authors",
                        "localField": "article.author_ids",
                        "foreignField": "_id",
                        "as": "article_authors",
                    }
                },
                {"$match": match},
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
                        "publisher": 1,
                        "version": 1,
                        "content": 1,
                        "label": "$content.doi:a72ca256dc49e55a1a57#has_notation.doi:44164d31a37c28d8efbf#label",
                        "concepts": {
                            "$map": {
                                "input": "$concepts",
                                "as": "concept",
                                "in": {
                                    "label": "$$concept.label",
                                    "identifier": "$$concept.identifier",
                                    "id": "$$concept._id",
                                },
                            }
                        },
                        "authors": {
                            "$map": {
                                "input": "$authors",
                                "as": "author",
                                "in": {
                                    "label": "$$author.label",
                                    "identifier": "$$author.identifier",
                                    "id": "$$author._id",
                                },
                            }
                        },
                        "article": {
                            "doi": "$article.@id",
                            "type": "$article.@type",
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
                            "authors": {
                                "$map": {
                                    "input": "$article_authors",
                                    "as": "article_author",
                                    "in": {
                                        "label": "$$article_author.label",
                                        "identifier": "$$article_author.identifier",
                                        "id": "$$article_author._id",
                                    },
                                }
                            },
                        },
                    }
                },
                {"$sort": {"_id": 1}},
                {"$skip": (page - 1) * per_page},
                {"$limit": per_page},
            ]
            docs = list(db.statements.aggregate(pipeline))
            converted_data = self.convert_objectid_to_string(docs)

            return converted_data

        except Exception as e:
            raise e

    def add_article(self, data, json_files):
        scraper = NodeExtractor()
        db = self.db
        try:
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

            for item in data["@graph"]:
                if "Statement" not in item.get(
                    "@type", []
                ) or "ScholarlyArticle" not in item.get("@type", []):
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
