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
from typing import Dict, List, Union, Any


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

    def search_publications(self, publications):
        db = self.db
        journals = db.journals.find(
            {"label": publications}, {"label": 1, "_id": 1}
        ).limit(10)
        return journals

    def search_journals(self, query_term):
        db = self.db
        db = self.db
        journals = db.journals_conferences.find(
            {"label": query_term}, {"label": 1, "_id": 1}
        ).limit(10)
        return journals

    def search_titles(self, search_term):
        db = self.db
        articles = db.articles.find({"name": search_term}, {"name": 1, "_id": 1}).limit(
            10
        )
        return articles

    def search_research_fields(self, search_term):
        db = self.db
        fields = db.research_fields.find(
            {"label": search_term}, {"label": 1, "_id": 1}
        ).limit(10)
        return fields

    def search_concepts(self, search_term):
        db = self.db
        concepts = db.concepts.find(
            {"label": search_term}, {"label": 1, "_id": 1}
        ).limit(10)
        return concepts

    def search_latest_concepts(self):
        db = self.db
        concepts = db.concepts.find().limit(8)
        return concepts

    def search_statement(self, id):
        db = self.db
        statement_id = ObjectId(ObjectId(id))
        statement = db.statements.find_one(
            {"_id": statement_id},
            {"author": 1, "concept": 1, "article_id": 1},
        )

        try:
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
                {"$match": {"article_id": ObjectId(statement["article_id"])}},
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
                        "author": 1,
                        "components": 1,
                        "supports": 1,
                        "content": 1,
                        "label": "$content.doi:a72ca256dc49e55a1a57#has_notation.doi:44164d31a37c28d8efbf#label",
                        # "concepts": {
                        #     "$map": {
                        #         "input": "$concepts",
                        #         "as": "concept",
                        #         "in": {
                        #             "label": "$$concept.label",
                        #             "identifier": "$$concept.identifier",
                        #             "id": "$$concept._id",
                        #         },
                        #     }
                        # },
                        # "authors": {
                        #     "$map": {
                        #         "input": "$authors",
                        #         "as": "author",
                        #         "in": {
                        #             "label": "$$author.label",
                        #             "identifier": "$$author.identifier",
                        #             "id": "$$author._id",
                        #         },
                        #     }
                        # },
                        "article": {
                            "doi": "$article.@id",
                            "type": "$article.@type",
                            "datePublished": "$article.datePublished",
                            "identifier": "$article.identifier",
                            "journal": "$article.journal",
                            "abstract": "$article.abstract",
                            "conference": "$article.conference",
                            "researchField": "$article.researchField",
                            "research_field": "$article.research_field",
                            "name": "$article.name",
                            "publisher": "$article.publisher",
                            "paper_type": "$article.paper_type",
                            "authors": "$article.author",
                            "id": "$article._id",
                            # "authors": {
                            #     "$map": {
                            #         "input": "$article_authors",
                            #         "as": "article_author",
                            #         "in": {
                            #             "label": "$$article_author.label",
                            #             "identifier": "$$article_author.identifier",
                            #             "id": "$$article_author._id",
                            #         },
                            #     }
                            # },
                        },
                    }
                },
                {"$sort": {"_id": 1}},
                {"$skip": 0},
                # {"$limit": 10},
            ]
        except Exception as e:
            raise e
        docs = list(db.statements.aggregate(pipeline))
        converted_data = self.convert_objectid_to_string(docs)
        return converted_data

    def search_paper(self, id):
        db = self.db
        try:
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
                {"$match": {"article._id": ObjectId(id)}},
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
                        "author": 1,
                        "components": 1,
                        "supports": 1,
                        "content": 1,
                        "label": "$content.doi:a72ca256dc49e55a1a57#has_notation.doi:44164d31a37c28d8efbf#label",
                        # "concepts": {
                        #     "$map": {
                        #         "input": "$concepts",
                        #         "as": "concept",
                        #         "in": {
                        #             "label": "$$concept.label",
                        #             "identifier": "$$concept.identifier",
                        #             "id": "$$concept._id",
                        #         },
                        #     }
                        # },
                        # "authors": {
                        #     "$map": {
                        #         "input": "$authors",
                        #         "as": "author",
                        #         "in": {
                        #             "label": "$$author.label",
                        #             "identifier": "$$author.identifier",
                        #             "id": "$$author._id",
                        #         },
                        #     }
                        # },
                        "article": {
                            "doi": "$article.@id",
                            "type": "$article.@type",
                            "datePublished": "$article.datePublished",
                            "identifier": "$article.identifier",
                            "journal": "$article.journal",
                            "abstract": "$article.abstract",
                            "conference": "$article.conference",
                            "researchField": "$article.researchField",
                            "research_field": "$article.research_field",
                            "name": "$article.name",
                            "publisher": "$article.publisher",
                            "paper_type": "$article.paper_type",
                            "authors": "$article.author",
                            "id": "$article._id",
                            # "authors": {
                            #     "$map": {
                            #         "input": "$article_authors",
                            #         "as": "article_author",
                            #         "in": {
                            #             "label": "$$article_author.label",
                            #             "identifier": "$$article_author.identifier",
                            #             "id": "$$article_author._id",
                            #         },
                            #     }
                            # },
                        },
                    }
                },
                {"$sort": {"_id": 1}},
                {"$skip": 0},
                {"$limit": 10},
            ]
        except Exception as e:
            raise e
        docs = list(db.statements.aggregate(pipeline))
        converted_data = self.convert_objectid_to_string(docs)
        return converted_data

    def search_latest_statements(self):
        db = self.db
        statements = db.statements.find().limit(5)
        return statements

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
                    # {"article.name": {"$regex": title, "$options": "i"}},
                    {"supports.notation.label": {"$regex": title, "$options": "i"}},
                    {"article.identifier": {"$regex": title, "$options": "i"}},
                ]
            if author_ids:
                authors = []
                for key, value in enumerate(author_ids):
                    authors.append(ObjectId(value))
                match["authors_id"] = {"$in": authors}

            if journal_names:
                journals = []
                for key, value in enumerate(journal_names):
                    journals.append(ObjectId(value))
                match["journals_conferences_id"] = {"$in": journals}

            if concept_ids:
                concepts = []
                for key, value in enumerate(concept_ids):
                    concepts.append(ObjectId(value))
                match["supports.notation.concept._id"] = {"$in": concepts}
            if start_year and end_year:
                match["datePublished"] = {
                    "$gte": datetime(int(start_year), 12, 31),
                    "$lte": datetime(int(end_year), 12, 31),
                }
            if research_fields:
                fields = []
                for key, value in enumerate(research_fields):
                    fields.append(ObjectId(value))
                match["research_fields_id"] = {"$in": fields}
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
                        "author": 1,
                        "components": 1,
                        "supports": 1,
                        "content": 1,
                        "label": "$content.doi:a72ca256dc49e55a1a57#has_notation.doi:44164d31a37c28d8efbf#label",
                        # "concepts": {
                        #     "$map": {
                        #         "input": "$concepts",
                        #         "as": "concept",
                        #         "in": {
                        #             "label": "$$concept.label",
                        #             "identifier": "$$concept.identifier",
                        #             "id": "$$concept._id",
                        #         },
                        #     }
                        # },
                        # "authors": {
                        #     "$map": {
                        #         "input": "$authors",
                        #         "as": "author",
                        #         "in": {
                        #             "label": "$$author.label",
                        #             "identifier": "$$author.identifier",
                        #             "id": "$$author._id",
                        #         },
                        #     }
                        # },
                        "article": {
                            "doi": "$article.@id",
                            "type": "$article.@type",
                            "datePublished": "$article.datePublished",
                            "identifier": "$article.identifier",
                            "journal": "$article.journal",
                            "abstract": "$article.abstract",
                            "conference": "$article.conference",
                            "researchField": "$article.researchField",
                            "research_field": "$article.research_field",
                            "name": "$article.name",
                            "publisher": "$article.publisher",
                            "paper_type": "$article.paper_type",
                            "authors": "$article.author",
                            "id": "$article._id",
                            # "authors": {
                            #     "$map": {
                            #         "input": "$article_authors",
                            #         "as": "article_author",
                            #         "in": {
                            #             "label": "$$article_author.label",
                            #             "identifier": "$$article_author.identifier",
                            #             "id": "$$article_author._id",
                            #         },
                            #     }
                            # },
                        },
                    }
                },
                {"$sort": {"_id": 1}},
                {"$skip": (page - 1) * per_page},
                # {"$limit": per_page},
            ]
            docs = list(db.statements.aggregate(pipeline))
            converted_data = self.convert_objectid_to_string(docs)
            return converted_data

        except Exception as e:
            raise e

    def replace_with_full_data(self, item, data_dict):
        field_mapping = {
            "author": "author",
            "journal": "journal",
            "publisher": "publisher",
            "researchField": "researchField",
            "research_field": "researchField",
            "concept": "concept",
            "objectOfInterest": "objectOfInterest",
            "property": "property",
            "constraint": "constraint",
            "operation": "operation",
            "unit": "unit",
            "components": "component",
            "variable": "variable",
            "measure": "measure",
            "identifier": "identifier",
            "notation": "notation",
            "supports": "supports",
            "file": "file",
            "conference": "conference",
        }

        def find_by_id(id_value, type_list):
            return next(
                (item for item in type_list if item.get("@id") == id_value), None
            )

        def process_field(field_value, dict_key):
            if isinstance(field_value, list):
                return [
                    find_by_id(f.get("@id"), data_dict[dict_key]) or f
                    for f in field_value
                    if isinstance(f, dict) and "@id" in f
                ]
            elif isinstance(field_value, dict) and "@id" in field_value:
                return (
                    find_by_id(field_value["@id"], data_dict[dict_key]) or field_value
                )
            return field_value

        result = item.copy()

        for field_name, dict_key in field_mapping.items():
            if field_name in result:
                result[field_name] = process_field(result[field_name], dict_key)

        return result

    def add_article(self, data, json_files):
        scraper = NodeExtractor()
        db = self.db
        graph_data = data.get("@graph", [])
        data = {}

        data["author"] = [item for item in graph_data if item.get("@type") == "Person"]
        authors = []
        for author in data["author"]:
            temp = author
            temp["label"] = (
                f"{author.get('givenName', '')} {author.get('familyName', '')}"
            )
            temp = db.authors.insert_one(temp)
            authors.append(temp.inserted_id)

        data["journal"] = [
            item for item in graph_data if "Journal" in item.get("@type", [])
        ]
        journals_conferences = []
        for journal in data["journal"]:
            temp = db.journals_conferences.insert_one(journal)
            journals_conferences.append(temp.inserted_id)

        data["conference"] = [
            item for item in graph_data if "Conference" in item.get("@type", [])
        ]
        for journal in data["conference"]:
            temp = db.journals_conferences.insert_one(journal)
            journals_conferences.append(temp.inserted_id)

        data["publisher"] = [
            item for item in graph_data if "Publisher" in item.get("@type", [])
        ]

        data["researchField"] = [
            item for item in graph_data if "ResearchField" in item.get("@type", [])
        ]
        research_fields = []
        for research_field in data["researchField"]:
            temp = db.research_fields.insert_one(research_field)
            research_fields.append(temp.inserted_id)

        data["concept"] = [
            item for item in graph_data if "Concept" in item.get("@type", [])
        ]
        concepts = []
        for concept in data["concept"]:
            temp = db.concepts.insert_one(concept)
            concepts.append(temp.inserted_id)

        data["objectOfInterest"] = [
            item for item in graph_data if "ObjectOfInterest" in item.get("@type", [])
        ]
        if len(data["objectOfInterest"]):
            db.object_of_interests.insert_many(data["objectOfInterest"])

        data["property"] = [
            item for item in graph_data if "Property" in item.get("@type", [])
        ]
        if len(data["property"]):
            db.properties.insert_many(data["property"])

        data["constraint"] = [
            item for item in graph_data if "Constraint" in item.get("@type", [])
        ]
        if len(data["constraint"]):
            db.constraints.insert_many(data["constraint"])

        data["operation"] = [
            item for item in graph_data if "Operation" in item.get("@type", [])
        ]
        if len(data["operation"]):
            db.operations.insert_many(data["operation"])

        data["unit"] = [item for item in graph_data if "Unit" in item.get("@type", [])]
        if len(data["unit"]):
            db.units.insert_many(data["unit"])

        data["component"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "Component" in item.get("@type", [])
        ]
        if len(data["component"]):
            db.components.insert_many(data["component"])

        data["variable"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "Variable" in item.get("@type", [])
        ]
        if len(data["variable"]):
            db.variables.insert_many(data["variable"])

        data["measure"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "Measure" in item.get("@type", [])
        ]
        if len(data["measure"]):
            db.measures.insert_many(data["measure"])

        data["identifier"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "ScholarlyArticle" in item.get("@type", [])
        ]
        if len(data["identifier"]):
            db.identifiers.insert_many(data["identifier"])

        data["notation"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "LinguisticStatement" in item.get("@type", [])
        ]
        if len(data["notation"]):
            db.notations.insert_many(data["notation"])

        data["supports"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "Statement" in item.get("@type", [])
        ]
        if len(data["supports"]):
            db.supports.insert_many(data["supports"])

        data["file"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "File" in item.get("@type", [])
        ]
        if len(data["file"]):
            db.files.insert_many(data["file"])

        ScholarlyArticle = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if "ScholarlyArticle" in item.get("@type", [])
        ]
        article = db.articles.insert_one(ScholarlyArticle[0])
        inserted_id = article.inserted_id
        data["statements"] = [
            self.replace_with_full_data(item, data)
            for item in graph_data
            if item.get("encodingFormat", "") == "application/ld+json"
            and "File" in item.get("@type", [])
        ]

        for statement in data["statements"]:
            temp = statement
            temp["content"] = scraper.load_json_from_url(
                json_files[statement.get("name", "")]
            )
            temp["article_id"] = inserted_id
            temp["concepts_id"] = concepts
            temp["research_fields_id"] = research_fields
            temp["journals_conferences_id"] = journals_conferences
            temp["authors_id"] = authors
            temp["datePublished"] = datetime(
                int(ScholarlyArticle[0]["datePublished"]), 6, 6
            )

            article = db.statements.insert_one(temp)
        return True

    def aggregate(self, collection_name, pipeline):
        collection = self.db[collection_name]
        return collection.aggregate(pipeline)

    def close(self):
        self.client.close()
