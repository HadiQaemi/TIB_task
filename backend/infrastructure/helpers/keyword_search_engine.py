from infrastructure.config import Config
from elasticsearch import Elasticsearch, NotFoundError
from typing import List, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class KeywordSearchEngine:
    def __init__(
        self,
        host: str = Config.ELASTIC_URL,
        articles_index_name: str = "articles_index",
        statements_index_name: str = "statements_index",
    ):
        self.client = Elasticsearch(host)
        self.articles_index_name = articles_index_name
        self.statements_index_name = statements_index_name

        if not self.client.ping():
            raise ConnectionError(
                "Could not connect to Elasticsearch. Please ensure it is running."
            )

        logger.info("Connected to Elasticsearch successfully.")

    def _create_index(self, index_name: str):
        if not self.client.indices.exists(index=index_name):
            self.client.indices.create(index=index_name)
            logger.info(f"Created index: {index_name}")
        else:
            logger.info(f"Index already exists: {index_name}")

    def add_articles(self, articles: List[Dict[str, str]]):
        self._create_index(self.articles_index_name)
        for article in articles:
            self.client.index(
                index=self.articles_index_name,
                id=article.get("article_id"),
                body={
                    "title": article.get("title", ""),
                    "abstract": article.get("abstract", ""),
                    "article_id": article.get("article_id", ""),
                },
            )
        logger.info(
            f"Added {len(articles)} articles to index: {self.articles_index_name}"
        )

    def add_statements(self, statements: List[Dict[str, str]]):
        self._create_index(self.statements_index_name)
        for statement in statements:
            self.client.index(
                index=self.statements_index_name,
                id=statement.get("statement_id"),
                body={
                    "text": statement.get("text", ""),
                    "statement_id": statement.get("statement_id", ""),
                },
            )
        logger.info(
            f"Added {len(statements)} statements to index: {self.statements_index_name}"
        )

    def search_articles(self, query: str, k: int = 5) -> List[Dict]:
        try:
            response = self.client.search(
                index=self.articles_index_name,
                body={
                    "query": {
                        "multi_match": {
                            "query": query,
                            "fields": ["title", "abstract"],
                        }
                    },
                    "size": k,
                },
            )
            return self._format_results(response, "article_id")
        except NotFoundError:
            logger.error(f"Index not found: {self.articles_index_name}")
            return []

    def search_statements(self, query: str, k: int = 5) -> List[Dict]:
        try:
            response = self.client.search(
                index=self.statements_index_name,
                body={
                    "query": {
                        "match": {
                            "text": query,
                        }
                    },
                    "size": k,
                },
            )
            return self._format_results(response, "statement_id")
        except NotFoundError:
            logger.error(f"Index not found: {self.statements_index_name}")
            return []

    def _format_results(self, response: Dict, id_field: str) -> List[Dict]:
        results = []
        for hit in response["hits"]["hits"]:
            results.append(
                {
                    "id": hit["_id"],
                    "score": hit["_score"],
                    "data": hit["_source"],
                    id_field: hit["_source"].get(id_field),
                }
            )
        return results

    def delete_indices(self):
        try:
            self.client.indices.delete(index=self.articles_index_name)
            logger.info(f"Deleted index: {self.articles_index_name}")
        except NotFoundError:
            logger.error(f"Index not found: {self.articles_index_name}")

        try:
            self.client.indices.delete(index=self.statements_index_name)
            logger.info(f"Deleted index: {self.statements_index_name}")
        except NotFoundError:
            logger.error(f"Index not found: {self.statements_index_name}")

    def __del__(self):
        if hasattr(self, "client"):
            self.client.close()
            logger.info("Elasticsearch client closed.")
