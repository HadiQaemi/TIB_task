import hashlib
import requests


def generate_static_id(input_string):
    hash_object = hashlib.sha256(input_string.encode("utf-8"))
    return hash_object.hexdigest()[:32]


def fetch_reborn_DOI(doi):
    url = "https://api.datacite.org/dois"
    query = f'relatedIdentifiers.relatedIdentifier:"{doi.replace("https://doi.org/", "")}" AND relatedIdentifiers.relationType:IsVariantFormOf'
    params = {"query": query}
    response = requests.get(url, params=params)
    response.raise_for_status()
    result = response.json()
    if not result.get("data"):
        return ""
    return f"https://doi.org/{result['data'][0]['id']}"
