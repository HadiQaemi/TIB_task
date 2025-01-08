import requests
from bs4 import BeautifulSoup
import time
import uuid
from collections import defaultdict


class NodeExtractor:
    def __init__(self):
        self.url = ""
        self.metadata = ""
        self.soup = None
        self.doi = ""

    def set_url(self, url):
        self.url = url
        self.soup = None
        self.doi = ""
        self.metadata = ""

    def fetch_html(self):
        response = requests.get(self.url)
        if response.status_code == 200:
            self.soup = BeautifulSoup(response.content, "html.parser")
        else:
            raise Exception(f"Failed to fetch HTML: {response.status_code}")

    def all_json_files(self):
        if not self.soup:
            self.fetch_html()
        heading = self.soup.find("section", id="dataset-resources").find_all(
            "a", class_="heading"
        )
        json_links = defaultdict(str)
        for item in heading:
            span = item.find("span", class_="format-label")
            if span["data-format"] == "json":
                url = (
                    "https://service.tib.eu/"
                    + item["href"]
                    + "/download/"
                    + item["title"]
                )
                json_links[item["title"]] = url
        return json_links

    def load_json_from_url(self, url):
        response = requests.get(url)
        if response.status_code == 200:
            json = response.json()
            json["_id"] = self.generate_timestamp_based_id()
            return json
        else:
            print(f"Error downloading file: {response.status_code}")
            return None

    def generate_timestamp_based_id(self):
        timestamp = int(time.time() * 1000)
        random_part = str(uuid.uuid4())[:8]
        unique_id = f"{timestamp}_{random_part}"
        return unique_id
