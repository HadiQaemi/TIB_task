from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Optional
import faiss
import json
import gc
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SemanticSearchEngine:
    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        batch_size: int = 32,
        use_gpu: bool = False,
        articles_index_name: str = "articles_index",
        statements_index_name: str = "statements_index",
        base_path: str = "data",
    ):
        os.environ["CUDA_VISIBLE_DEVICES"] = ""
        self.model = SentenceTransformer(model_name, device="cpu")
        self.batch_size = batch_size
        self.use_gpu = use_gpu
        self.articles_index_name = articles_index_name
        self.statements_index_name = statements_index_name
        self.base_path = base_path

        self.articles_index = None
        self.statements_index = None
        self.articles = []
        self.statements = []

        if self.use_gpu:
            self.res = faiss.StandardGpuResources()

        self._load_indices()

    def _encode_texts(self, texts: List[str]) -> np.ndarray:
        embeddings_list = []
        for i in range(0, len(texts), self.batch_size):
            batch_texts = texts[i : i + self.batch_size]
            batch_embeddings = self.model.encode(
                batch_texts, show_progress_bar=True, device="cpu"
            )
            embeddings_list.append(batch_embeddings)
        return np.vstack(embeddings_list)

    def _load_indices(self):
        try:
            articles_index_path = f"{self.base_path}_{self.articles_index_name}.index"
            articles_data_path = f"{self.base_path}_{self.articles_index_name}.json"
            if os.path.exists(articles_index_path) and os.path.exists(
                articles_data_path
            ):
                self.articles_index = faiss.read_index(articles_index_path)
                with open(articles_data_path, "r") as f:
                    self.articles = json.load(f)
                logger.info(
                    f"Articles index and data loaded from {articles_index_path}"
                )

            statements_index_path = (
                f"{self.base_path}_{self.statements_index_name}.index"
            )
            statements_data_path = f"{self.base_path}_{self.statements_index_name}.json"
            if os.path.exists(statements_index_path) and os.path.exists(
                statements_data_path
            ):
                self.statements_index = faiss.read_index(statements_index_path)
                with open(statements_data_path, "r") as f:
                    self.statements = json.load(f)
                logger.info(
                    f"Statements index and data loaded from {statements_index_path}"
                )
        except Exception as e:
            logger.error(f"Failed to load indices: {e}")

    def _save_indices(self):
        try:
            if self.articles_index is not None:
                articles_index_path = (
                    f"{self.base_path}_{self.articles_index_name}.index"
                )
                articles_data_path = f"{self.base_path}_{self.articles_index_name}.json"
                faiss.write_index(self.articles_index, articles_index_path)
                with open(articles_data_path, "w") as f:
                    json.dump(self.articles, f)
                logger.info(f"Articles index and data saved to {articles_index_path}")

            if self.statements_index is not None:
                statements_index_path = (
                    f"{self.base_path}_{self.statements_index_name}.index"
                )
                statements_data_path = (
                    f"{self.base_path}_{self.statements_index_name}.json"
                )
                faiss.write_index(self.statements_index, statements_index_path)
                with open(statements_data_path, "w") as f:
                    json.dump(self.statements, f)
                logger.info(
                    f"Statements index and data saved to {statements_index_path}"
                )
        except Exception as e:
            logger.error(f"Failed to save indices: {e}")

    def add_articles(self, articles: List[Dict[str, str]]):
        self._load_indices()
        self.articles.extend(articles)
        texts = [f"{article['title']} {article['abstract']}" for article in articles]
        embeddings = self._encode_texts(texts)
        dimension = embeddings.shape[1]

        if self.articles_index is None:
            self.articles_index = faiss.IndexFlatL2(dimension)
            if self.use_gpu:
                self.articles_index = faiss.index_cpu_to_gpu(
                    self.res, 0, self.articles_index
                )

        self.articles_index.add(np.ascontiguousarray(embeddings.astype("float32")))
        del embeddings
        gc.collect()
        self._save_indices()

    def add_statements(self, statements: List[Dict[str, str]]):
        self._load_indices()
        self.statements.extend(statements)
        texts = [
            f"{statement['text']} {statement['abstract']}" for statement in statements
        ]
        embeddings = self._encode_texts(texts)
        dimension = embeddings.shape[1]

        if self.statements_index is None:
            self.statements_index = faiss.IndexFlatL2(dimension)
            if self.use_gpu:
                self.statements_index = faiss.index_cpu_to_gpu(
                    self.res, 0, self.statements_index
                )

        self.statements_index.add(np.ascontiguousarray(embeddings.astype("float32")))
        del embeddings
        gc.collect()
        self._save_indices()

    def search_articles(self, query: str, k: int = 5) -> List[Dict]:
        if self.articles_index is None:
            self._load_indices()
            if self.articles_index is None:
                raise ValueError(
                    "Articles index is not initialized. Call `add_articles` first."
                )
        query_vector = self.model.encode([query], device="cpu")
        distances, indices = self.articles_index.search(
            np.ascontiguousarray(query_vector.astype("float32")), k
        )
        return self._format_results(
            indices[0], distances[0], self.articles, "article_id"
        )

    def search_statements(self, query: str, k: int = 5) -> List[Dict]:
        if self.statements_index is None:
            self._load_indices()
            if self.statements_index is None:
                raise ValueError(
                    "Statements index is not initialized. Call `add_statements` first."
                )
        query_vector = self.model.encode([query], device="cpu")
        distances, indices = self.statements_index.search(
            np.ascontiguousarray(query_vector.astype("float32")), k
        )
        return self._format_results(
            indices[0], distances[0], self.statements, "statement_id"
        )

    def _format_results(
        self,
        indices: np.ndarray,
        distances: np.ndarray,
        data: List[Dict],
        id_field: str,
    ) -> List[Dict]:
        results = []
        for idx, (distance, index) in enumerate(zip(distances, indices)):
            if index >= 0:
                results.append(
                    {
                        "item": data[index],
                        "score": float(1 / (1 + distance)),
                        id_field: data[index].get(id_field, None),
                    }
                )
        return results

    def delete_indices(self):
        articles_index_path = f"{self.base_path}_{self.articles_index_name}.index"
        articles_data_path = f"{self.base_path}_{self.articles_index_name}.json"
        if os.path.exists(articles_index_path) and os.path.exists(articles_data_path):
            os.remove(articles_index_path)
            os.remove(articles_data_path)
            print(f"Deleted {articles_index_path} and {articles_data_path}")
        else:
            print("One or both files do not exist.")
        statements_index_path = f"{self.base_path}_{self.statements_index_name}.index"
        statements_data_path = f"{self.base_path}_{self.statements_index_name}.json"
        if os.path.exists(statements_index_path) and os.path.exists(
            statements_data_path
        ):
            os.remove(statements_index_path)
            os.remove(statements_data_path)
            print(f"Deleted {statements_index_path} and {statements_data_path}")
        else:
            print("One or both files do not exist.")

    def __del__(self):
        if self.articles_index is not None:
            del self.articles_index
        if self.statements_index is not None:
            del self.statements_index
        gc.collect()
