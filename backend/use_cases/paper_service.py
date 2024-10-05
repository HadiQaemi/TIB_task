from infrastructure.database import MongoDBClient
from infrastructure.web_scraper import NodeExtractor
from domain.entities import Paper

class PaperService:
    """Service class for handling paper-related operations.

    This class interacts with the database and web scraper to manage paper data.
    It provides methods for fetching existing papers, retrieving a specific paper,
    and extracting paper information from a given URL.
    """
    def __init__(self):
        self.db_client = MongoDBClient()
        self.scraper = NodeExtractor()

    def get_all_papers(self):
        """
        Retrieves all papers from the database, excluding the "_id" field.
        Returns:
            list[Paper]: A list of Paper objects containing selected paper data.
        """
        papers = self.db_client.find_all("papers", projection={
            "contributions": 1, "title": 1, "author": 1, "DOIs": 1, 
            "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        })
        return [Paper(**paper) for paper in papers]

    def get_paper_by_id(self, entity_id):
        """
        Retrieves a single paper by its entity ID from the database, excluding the "_id" field.
        Args:
            entity_id (str): The entity ID of the paper to retrieve.
        Returns:
            Paper: A Paper object if found, otherwise None.
        """
        # paper = self.db_client.find_one("papers", {"entity": entity_id}, projection={
        #     "contributions": 1, "title": 1, "author": 1, "DOIs": 1, 
        #     "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        # })
        paper = self.db_client.find_one("papers", {"title": entity_id}, projection={
            "contributions": 1, "title": 1, "author": 1, "DOIs": 1, 
            "entity": 1, "external": 1, "info": 1, "timeline": 1, "_id": 0
        })
        return Paper(**paper) if paper else None

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
        json_files = self.scraper.json_files()
        contributions = []
        for json in json_files:
            contributions.append(self.scraper.load_json_from_url(json))
        author = self.scraper.author()
        DOIs, entity, external = self.scraper.DOI()
        info = ""
        if len(DOIs) > 0:
            info = self.scraper.info()
        timeline = self.scraper.timeline()
        
        data = {
            "title": title, 
            "author": author, 
            "DOIs": DOIs,
            "entity": entity,
            "contributions": contributions,
            "external": external,
            "info": info,
            "timeline": timeline,
        }
        inserted_id = self.db_client.insert_one("papers", data)
        return inserted_id