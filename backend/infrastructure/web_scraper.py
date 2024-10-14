# The NodeExtractor class is responsible for extracting various data points from a given URL, including:
# - The title of the page
# - The URLs of any JSON files associated with the page
# - The DOI (Digital Object Identifier) of the paper
# - Additional information about the paper, such as the abstract, authors, journal, etc.
# - The timeline of the paper, including the creation and last update dates
# - Generating a unique ID based on a timestamp and random string

import requests
from bs4 import BeautifulSoup
import time
import uuid
import urllib.parse
import re


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
            self.soup = BeautifulSoup(response.content, 'html.parser')
        else:
            raise Exception(f"Failed to fetch HTML: {response.status_code}")

    def title(self):
        if not self.soup:
            self.fetch_html()
        element = self.soup.find('h1', class_='heading')
        return element.text if element else None

    def json_files(self):
        if not self.soup:
            self.fetch_html()
        heading = self.soup.find(
            'section', id='dataset-resources').find_all('a', class_='heading')
        URLs = []
        metadata = []
        for item in heading:
            span = item.find('span', class_='format-label')
            if span["data-format"] == 'json':
                url = "https://service.tib.eu/" + \
                    item["href"] + "/download/" + item["title"]
                index = url.find('ro-crate-metadata.json')
                if index < 0:
                    URLs.append(url)
                else:
                    metadata.append(url)
        return URLs, metadata

    def extract_last_part(self, url):
        parsed_url = urllib.parse.urlparse(url)
        return parsed_url.path.rsplit('/', 1)[-1]

    def is_doi(self, url):
        return url.find("https://doi.org/")

    def get_metadata(self, metadata):
        title = ""
        authors = []
        for json in metadata:
            meta = self.load_json_from_url(json)
            for graph in meta["@graph"]:
                if graph["@type"] == 'ScholarlyArticle':
                    for author in graph["author"]:
                        authors.append(
                            author["givenName"] + " " + author["familyName"])
                    title = graph["name"]
        return {
            "author": authors,
            "abstract": "",
            "title": title,
            "journal": "",
        }

    def DOI(self):
        if not self.soup:
            self.fetch_html()
        heading = self.soup.find(
            'div', class_='embedded-content').find_all('a')
        DOIs = []
        entity = ""
        external = ""
        for item in heading:
            url = item["href"]
            is_doi = self.is_doi(url)
            if is_doi == -1:
                continue
            DOIs.append(url)
            index = url.find("/R")
            if index:
                entity = self.extract_last_part(url)
            if index == -1:
                external = url
                self.doi = url
        if self.doi == "":
            self.doi = entity
        return DOIs, entity, external

    def info(self):
        try:
            print(self.doi)
            is_doi = self.is_doi(self.doi)
            print(is_doi)
            if is_doi == 0:
                url = "https://api.crossref.org/works/" + \
                    self.doi.replace(":", "%3A").replace("/", "%2F")
                print(url)
                response = requests.get(url)
                response.raise_for_status()
                info = response.json()
                abstract = info["message"]["abstract"]
                title = info["message"]["title"][0]
                journal = info["message"]["short-container-title"][0]
                author = []
                for item in info["message"]["author"]:
                    author.append(item['given'] + " " + item['family'])
                clean = re.compile('<.*?>')
                return {
                    "author": author,
                    "abstract": re.sub(clean, '', abstract),
                    "title": title,
                    "journal": journal,
                }
            else:
                return ""
        except ValueError:
            print("Error.", ValueError)
            return ""

    def author(self):
        if not self.soup:
            self.fetch_html()
        tr = self.soup.find('table', class_='table-condensed').find_all('tr')
        author = ""
        for item in tr:
            th = item.find('th').text
            td = item.find('td')
            if th == "Author":
                author = td.text
        return author

    def timeline(self):
        if not self.soup:
            self.fetch_html()
        tr = self.soup.find('table', class_='table-condensed').find_all('tr')
        timeline = []
        temp = ""
        for item in tr:
            th = item.find('th').text
            td = item.find('td')
            if th == "Created":
                timeline.append({"Created": td.text})
            if th == "Last update":
                timeline.append({"Last update": td.text})
        return timeline

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
