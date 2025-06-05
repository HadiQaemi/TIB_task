from infrastructure.web_scraper import NodeExtractor
from domain.entities import Paper, Contribution
from bson.regex import Regex
from urllib.parse import unquote
from infrastructure.helpers.semantic_search_engine import SemanticSearchEngine
# from infrastructure.helpers.keyword_search_engine import KeywordSearchEngine
from infrastructure.helpers.hybrid_search_engine import HybridSearchEngine
from infrastructure.repositories.data_repository import DataRepository
import math
from collections import defaultdict
import numpy as np
from sentence_transformers import CrossEncoder


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

    def semantic_search_statement(self, query, sort_order, page, page_size, type):
        try:
            # if type == "semantic":
            #     semantic_engine = SemanticSearchEngine()
            #     keyword_engine = False
            #     hybrid_engine = HybridSearchEngine(semantic_engine, keyword_engine)
            #     statement_results, final_ids = hybrid_engine.search_statements(query)
            #     semantics_statements = (
            #         self.db_client.search_latest_semantics_statements(
            #             final_ids, sort_order, page, page_size
            #         )
            #     )
            #     return semantics_statements
            # elif type == "hybrid":
            #     semantic_engine = SemanticSearchEngine()
            #     keyword_engine = KeywordSearchEngine()
            #     hybrid_engine = HybridSearchEngine(semantic_engine, keyword_engine)
            #     # hybrid_engine = HybridSearchEngine(semantic_engine)
            #     statement_results, final_ids = hybrid_engine.search_statements(query)
            #     semantics_statements = (
            #         self.db_client.search_latest_semantics_statements(
            #             final_ids, sort_order, page, page_size
            #         )
            #     )

            #     reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            #     temp = semantics_statements["content"]
            #     pairs = [
            #         [query, abstract["supports"][0]["notation"]["label"]]
            #         for abstract in temp
            #     ]
            #     scores = reranker.predict(pairs)

            #     ranked_indices = np.argsort(scores)[::-1]
            #     semantics_statements["content"] = [temp[i] for i in ranked_indices]
            #     return semantics_statements
            semantic_engine = SemanticSearchEngine()
            # keyword_engine = KeywordSearchEngine()
            # hybrid_engine = HybridSearchEngine(semantic_engine, keyword_engine)
            hybrid_engine = HybridSearchEngine(semantic_engine)
            statement_results, final_ids = hybrid_engine.search_statements(query)
            semantics_statements = self.db_client.search_latest_semantics_statements(
                final_ids, sort_order, page, page_size
            )

            reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            temp = semantics_statements["content"]
            pairs = [
                [query, abstract["supports"][0]["notation"]["label"]]
                for abstract in temp
            ]
            scores = reranker.predict(pairs)

            ranked_indices = np.argsort(scores)[::-1]
            semantics_statements["content"] = [temp[i] for i in ranked_indices]
            return semantics_statements
        except Exception as e:
            return {"success": False, "result": str(e), "totalElements": 0}

    def semantic_search_article(self, query, sort_order, page, page_size, type):
        try:
            # if type == "semantic":
            #     semantic_engine = SemanticSearchEngine()
            #     keyword_engine = False
            #     hybrid_engine = HybridSearchEngine(semantic_engine, keyword_engine)
            #     article_results, final_ids = hybrid_engine.search_articles(query)
            #     semantics_articles = self.db_client.search_latest_semantics_articles(
            #         final_ids, sort_order, page, page_size
            #     )
            #     return semantics_articles
            # elif type == "hybrid":
            #     semantic_engine = SemanticSearchEngine()
            #     keyword_engine = KeywordSearchEngine()
            #     hybrid_engine = HybridSearchEngine(semantic_engine, keyword_engine)
            #     # hybrid_engine = HybridSearchEngine(semantic_engine)
            #     article_results, final_ids = hybrid_engine.search_articles(query)

            #     semantics_articles = self.db_client.search_latest_semantics_articles(
            #         final_ids, sort_order, page, page_size
            #     )

            #     reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            #     temp = semantics_articles["content"]
            #     pairs = [[query, abstract["abstract"]] for abstract in temp]
            #     scores = reranker.predict(pairs)

            #     ranked_indices = np.argsort(scores)[::-1]
            #     semantics_articles["content"] = [temp[i] for i in ranked_indices]
            #     return semantics_articles
            semantic_engine = SemanticSearchEngine()
            # keyword_engine = KeywordSearchEngine()
            # hybrid_engine = HybridSearchEngine(semantic_engine, keyword_engine)
            hybrid_engine = HybridSearchEngine(semantic_engine)
            article_results, final_ids = hybrid_engine.search_articles(query)

            semantics_articles = self.db_client.search_latest_semantics_articles(
                final_ids, sort_order, page, page_size
            )

            reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            temp = semantics_articles["content"]
            pairs = [[query, abstract["abstract"]] for abstract in temp]
            scores = reranker.predict(pairs)

            ranked_indices = np.argsort(scores)[::-1]
            semantics_articles["content"] = [temp[i] for i in ranked_indices]
            return semantics_articles
        except Exception as e:
            return {"success": False, "result": str(e), "totalElements": 0}

    def delete_indices(self):
        try:
            semantic_engine = SemanticSearchEngine()
            # keyword_engine = KeywordSearchEngine()
            # keyword_engine.delete_indices()
            semantic_engine.__del__()
            semantic_engine.delete_indices()
            return {"success": True, "total_count": 0}
        except Exception as e:
            return {"success": False, "result": str(e), "total_count": 0}

    def group_articles(self, data):
        grouped = defaultdict(list)

        for item in data:
            article_id = item["article"]["id"]
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
        conference_names=[],
        title="",
        research_fields=[],
    ):
        data = self.db_client.query_search(
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
        )
        data = self.group_articles(data)
        return {"success": True, "result": data, "total_count": len(data)}

    def get_authors(self, search_term):
        authors = self.db_client.search_authors(search_term)
        return authors

    def get_titles(self, search_term):
        titles = self.db_client.search_titles(search_term)
        return titles

    def get_research_fields(self, search_term):
        research_fields = self.db_client.search_research_fields(search_term)
        return research_fields

    def get_journals(self, search_term):
        journals = self.db_client.search_journals(search_term)
        return journals

    def get_concepts(self, search_term):
        concepts = self.db_client.search_concepts(search_term)
        return concepts

    def get_latest_concepts(self):
        concepts = self.db_client.search_latest_concepts()
        return concepts

    def get_statement(self, id):
        statement = self.db_client.search_statement(id)
        data = self.group_articles(statement)
        return {"success": True, "result": data, "total_count": len(data)}

    def get_paper(self, id):
        paper = self.db_client.search_paper(id)
        data = self.group_articles(paper)
        return {"success": True, "result": data, "total_count": len(data)}

    def get_latest_statements(
        self, research_fields, search_query, sort_order, page, page_size
    ):
        statements = self.db_client.search_latest_statements(
            research_fields, search_query, sort_order, page, page_size
        )
        return statements

    def get_latest_articles(
        self, research_fields, search_query, sort_order, page, page_size
    ):
        articles = self.db_client.search_latest_articles(
            research_fields, search_query, sort_order, page, page_size
        )
        return articles

    def get_latest_keywords(
        self, research_fields, search_query, sort_order, page, page_size
    ):
        keywords = self.db_client.search_latest_keywords(
            research_fields, search_query, sort_order, page, page_size
        )
        return keywords

    def get_latest_authors(
        self, research_fields, search_query, sort_order, page, page_size
    ):
        authors = self.db_client.search_latest_authors(
            research_fields, search_query, sort_order, page, page_size
        )
        return authors

    def get_latest_journals(
        self, research_fields, search_query, sort_order, page, page_size
    ):
        authors = self.db_client.search_latest_journals(
            research_fields, search_query, sort_order, page, page_size
        )
        return authors

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
        json_files = self.scraper.all_json_files()
        ro_crate = self.scraper.load_json_from_url(json_files["ro-crate-metadata.json"])
        self.db_client.add_article(ro_crate, json_files)
        return True
