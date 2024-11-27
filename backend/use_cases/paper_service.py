from infrastructure.web_scraper import NodeExtractor
from domain.entities import Paper, Contribution
from bson.regex import Regex
from urllib.parse import unquote

from infrastructure.repositories.data_repository import DataRepository
import math
from collections import defaultdict


class PaperService:
    def __init__(self):
        self.db_client = DataRepository()
        self.scraper = NodeExtractor()

    def get_all_papers(self):
        papers = self.db_client.get_all_items(
            "papers",
            projection={
                "contributions": 1,
                "title": 1,
                "author": 1,
                "dois": 1,
                "entity": 1,
                "external": 1,
                "info": 1,
                "timeline": 1,
                "_id": 0,
            },
        )
        return papers

    def get_all_statements(self, page, page_size):
        pipeline = [
            {"$unwind": {"path": "$contributions", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "_id": 0,
                    "author": 1,
                    "title": 1,
                    "info": 1,
                    "contribution": "$contributions",
                }
            },
            {"$skip": (page - 1) * page_size},
            {"$limit": page_size},
        ]

        count_pipeline = [
            {"$unwind": {"path": "$contributions", "preserveNullAndEmptyArrays": True}},
            {"$count": "total"},
        ]

        results = list(self.db_client.aggregate("papers", pipeline))

        total_count = list(self.db_client.aggregate("papers", count_pipeline))
        total_elements = total_count[0]["total"] if total_count else 0

        return {
            "content": results,
            "totalElements": total_elements,
            "page": page,
            "size": page_size,
            "totalPages": math.ceil(total_elements / page_size),
        }

    def get_paper_by_id(self, entity_id):
        try:
            article, statements = self.db_client.find_one("papers", entity_id)
            return {
                "success": True,
                "result": {"article": article, "statements": statements},
                "total_count": len(statements),
            }

        except Exception as e:
            return {"success": False, "result": str(e), "total_count": 0}

    def group_articles(self, data):
        grouped = defaultdict(list)

        for item in data:
            article_id = item["article_id"]
            grouped[article_id].append(item)
        return dict(grouped)

    def get_statement_by_id(self, entity_id):
        try:
            statement = self.db_client.find_one_statement("statements", entity_id)
            return {
                "success": True,
                "result": {"statement": statement},
                "total_count": len(statement),
            }

        except Exception as e:
            return {"success": False, "result": str(e), "total_count": 0}

    def query_data(
        self,
        author_ids,
        concept_ids,
        page,
        per_page,
        start_year="2000",
        end_year="2025",
        journal_names=[],
    ):
        data = self.db_client.query_search(
            start_year,
            end_year,
            author_ids,
            journal_names,
            concept_ids,
            page,
            per_page,
        )
        data = self.group_articles(data)
        return {"success": True, "result": data, "total_count": len(data)}
        try:
            data = self.db_client.query_search(
                start_year,
                end_year,
                author_ids,
                journal_names,
                concept_ids,
                page,
                per_page,
            )
            data = self.group_articles(data)
            return {"success": True, "result": data, "total_count": len(data)}

        except Exception as e:
            return {"success": False, "result": str(e), "total_count": 0}

    def get_authors(self, search_term):
        authors = self.db_client.search_authors(search_term)
        return authors

    def get_journals(self, search_term):
        authors = self.db_client.search_journals(search_term)
        return authors

    def get_concepts(self, search_term):
        concepts = self.db_client.search_concepts(search_term)
        return concepts

    def search_by_title(self, search_title):
        search_title = unquote(search_title)
        query = {
            "$or": [
                {"info.title": Regex(search_title, "i")},
                {"dois": {"$elemMatch": {"$regex": search_title, "$options": "i"}}},
                {"entity_id": Regex(search_title, "i")},
            ]
        }
        papers = self.db_client.get_all_items(
            "papers",
            query,
            projection={
                "contributions": 1,
                "title": 1,
                "author": 1,
                "dois": 1,
                "entity": 1,
                "external": 1,
                "info": 1,
                "timeline": 1,
                "_id": 0,
            },
        )
        return [Paper(**paper) for paper in papers]

    def extract_paper(self, url):
        self.scraper.set_url(url)
        title = self.scraper.title()
        json_files = self.scraper.all_json_files()
        print(json_files["ro-crate-metadata.json"])

        ro_crate = self.scraper.load_json_from_url(json_files["ro-crate-metadata.json"])
        info = self.db_client.add_article(ro_crate, json_files)
        print(info)
        return True