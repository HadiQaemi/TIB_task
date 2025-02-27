from typing import List, Dict
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HybridSearchEngine:
    def __init__(
        self,
        semantic_engine,
        keyword_engine: bool = False,
        weight_semantic: float = 0.7,
        weight_keyword: float = 0.3,
    ):
        self.semantic_engine = semantic_engine
        self.keyword_engine = keyword_engine
        self.weight_semantic = weight_semantic
        self.weight_keyword = weight_keyword

        if not np.isclose(self.weight_semantic + self.weight_keyword, 1.0):
            raise ValueError("Weights for semantic and keyword search must sum to 1.")

    def _normalize_scores(self, scores: List[float]) -> List[float]:
        if not scores:
            return []
        min_score = min(scores)
        max_score = max(scores)
        if min_score == max_score:
            return [0.5] * len(scores)
        return [(score - min_score) / (max_score - min_score) for score in scores]

    def _merge_results(
        self,
        semantic_results: List[Dict],
        keyword_results: List[Dict],
        id_field: str,
        threshold: int,
        name_field: str,
    ) -> List[Dict]:
        results_map = {}

        for result in semantic_results:
            item_id = result["item"].get(id_field)
            if item_id:
                results_map[item_id] = {
                    "item": result["item"],
                    "semantic_score": result["score"],
                    "keyword_score": 0.0,
                }

        for result in keyword_results:
            item_id = result["data"].get(id_field)
            if item_id:
                if item_id in results_map:
                    results_map[item_id]["keyword_score"] = result["score"]
                else:
                    results_map[item_id] = {
                        "item": result["data"],
                        "semantic_score": 0.0,
                        "keyword_score": result["score"],
                    }

        semantic_scores = [result["semantic_score"] for result in results_map.values()]
        keyword_scores = [result["keyword_score"] for result in results_map.values()]
        normalized_semantic_scores = self._normalize_scores(semantic_scores)
        normalized_keyword_scores = self._normalize_scores(keyword_scores)

        final_results = []
        final_id = []
        for i, (item_id, result) in enumerate(results_map.items()):
            final_score = (
                self.weight_semantic * normalized_semantic_scores[i]
                + self.weight_keyword * normalized_keyword_scores[i]
            )
            if final_score > threshold:
                if len(result["item"][name_field]) > 50:
                    final_results.append(
                        {
                            "item": result["item"],
                            "final_score": final_score,
                            "semantic_score": result["semantic_score"],
                            "keyword_score": result["keyword_score"],
                        }
                    )
                    final_id.append(result["item"][id_field])

        final_results.sort(key=lambda x: x["final_score"], reverse=True)
        return final_results, final_id

    def search_articles(self, query: str, k: int = 5) -> List[Dict]:
        semantic_results = self.semantic_engine.search_articles(query, k)
        keyword_results = self.keyword_engine.search_articles(query, k)
        return self._merge_results(
            semantic_results, keyword_results, "article_id", 0.6, "title"
        )[:k]
        # return self._merge_results(
        #     semantic_results, "article_id", 0.3, "title"
        # )[:k]

    def search_statements(self, query: str, k: int = 5) -> List[Dict]:
        semantic_results = self.semantic_engine.search_statements(query, k)
        keyword_results = self.keyword_engine.search_statements(query, k)
        return self._merge_results(
            semantic_results, keyword_results, "statement_id", 0.3, "text"
        )[:k]
        # return self._merge_results(
        #     semantic_results, "statement_id", 0.3, "text"
        # )[:k]
