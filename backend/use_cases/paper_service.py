from infrastructure.web_scraper import NodeExtractor
from domain.entities import Paper, Contribution
from bson.regex import Regex
from urllib.parse import unquote
from pymongo import MongoClient
from infrastructure.repositories.data_repository import DataRepository


class PaperService:
    """Service class for handling paper-related operations.

    This class interacts with the database and web scraper to manage paper data.
    It provides methods for fetching existing papers, retrieving a specific paper,
    and extracting paper information from a given URL.
    """

    def __init__(self):
        self.db_client = DataRepository()
        self.scraper = NodeExtractor()

    def get_all_papers(self):
        """
        Retrieves all papers from the database, excluding the "_id" field.
        Returns:
            list[Paper]: A list of Paper objects containing selected paper data.
        """
        # papers = self.db_client.find_all("papers", projection={
        #     "contributions": 1, "title": 1, "author": 1, "dois": 1,
        #     "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        # })
        papers = self.db_client.get_all_items("papers", projection={
            "contributions": 1, "title": 1, "author": 1, "dois": 1,
            "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        })
        # return [Paper(**paper) for paper in papers]
        return papers

    def get_all_statements(self):
        pipeline = [
            {
                "$unwind": {
                    "path": "$contributions",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "author": 1,
                    "title": 1,
                    "info": 1,
                    "contribution": "$contributions"
                }
            }
        ]
        results = list(self.db_client.aggregate("papers", pipeline))
        if not results:
            return []
        return results

    def get_paper_by_id(self, entity_id):
        """
        Retrieves a single paper by its entity ID from the database, excluding the "_id" field.
        Args:
            entity_id (str): The entity ID of the paper to retrieve.
        Returns:
            Paper: A Paper object if found, otherwise None.
        """
        # paper = self.db_client.find_one("papers", {"entity": entity_id}, projection={
        #     "contributions": 1, "title": 1, "author": 1, "dois": 1,
        #     "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        # })
        paper = self.db_client.find_one("papers", {"title": entity_id}, projection={
            "contributions": 1, "title": 1, "author": 1, "dois": 1,
            "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        })
        # return Paper(**paper) if paper else None
        return paper if paper else None

    def search_by_title(self, search_title):
        """
        Retrieves all single papers by their title from the database, excluding the "title" field.
        Args:
            title (str): The title of the papers to retrieve.
        Returns:
            Paper: A list of Paper objects if found, otherwise None.
        """
        search_title = unquote(search_title)
        query = {
            "$or": [
                {"info.title": Regex(search_title, "i")},
                {"dois": {"$elemMatch": {"$regex": search_title, "$options": "i"}}},
                {"entity_id": Regex(search_title, "i")},
            ]
        }
        papers = self.db_client.find_all("papers", query, projection={
            "contributions": 1, "title": 1, "author": 1, "dois": 1,
            "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        })
        return [Paper(**paper) for paper in papers]

    def extract_paper(self, url):
        """
        Extracts paper information from a given URL using the web scraper and stores it in the database.
        Args:
            url (str): The URL of the paper to extract information from.
        Returns:
            str: The ID of the inserted document in the database.
        """
        self.scraper.set_url(url)
        title = self.scraper.title()
        json_files, metadata = self.scraper.json_files()
        contributions = []
        for json in json_files:
            contributions.append(self.scraper.load_json_from_url(json))
        author = self.scraper.author()
        dois, entity, external = self.scraper.DOI()
        info = ""
        if len(dois) > 0:
            info = self.scraper.info()
        elif len(metadata) > 0:
            info = self.scraper.get_metadata(metadata)

        timeline = self.scraper.timeline()

        data = {
            "title": title,
            "author": author,
            "dois": dois,
            "entity": entity,
            "contributions": contributions,
            "external": external,
            "info": info,
            "timeline": timeline,
        }
        inserted_id = self.db_client.add_item("papers", data)
        return inserted_id
