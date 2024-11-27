from pymongo import MongoClient
from faker import Faker
from ..config import Config

fake = Faker()

def connect_to_mongodb():
    client = MongoClient(Config.MONGO_URI)
    db = client[Config.MONGO_DB]
    return db, client

def create_collections_if_not_exist(db):
    if "papers" not in db.list_collection_names():
        db.create_collection("papers")
        print("Collection 'papers' created.")
    
    if "contributions" not in db.list_collection_names():
        db.create_collection("contributions")
        print("Collection 'contributions' created.")

def generate_fake_context_json():
    return {
        "version": f"v{fake.random_int(min=1, max=5)}.{fake.random_int(min=0, max=9)}",
        "domain": fake.domain_name(),
        "category": fake.random_element(
            elements=("research", "methodology", "analysis", "review")
        ),
        "department": fake.company_suffix(),
        "institution": fake.company(),
        "location": fake.city(),
        "country": fake.country(),
        "language": fake.language_name(),
        "license": f"CC-{fake.random_element(elements=('BY', 'BY-SA', 'BY-NC', 'BY-ND'))}-4.0",
        "timestamp": fake.iso8601()
    }

def generate_fake_contribution(paper_id):
    return {
        "paper_id": paper_id,
        "json_id": f"contribution_{fake.uuid4()}",
        "json_type": fake.random_element(
            elements=("Research", "Method", "Data", "Analysis")
        ),
        "json_context": generate_fake_context_json(),
        "label": fake.sentence(),
        "mongo_id": str(fake.uuid4()),
        "predicates": {
            f"P{fake.random_int(min=1, max=999)}": fake.sentence(),
            f"P{fake.random_int(min=1, max=999)}": [fake.word() for _ in range(3)],
            f"P{fake.random_int(min=1, max=999)}": {
                "value": fake.sentence(),
                "confidence": fake.random_number(digits=2) / 100
            },
            f"P{fake.random_int(min=1, max=999)}": {
                "type": fake.random_element(
                    elements=("primary", "secondary", "tertiary")
                ),
                "references": [str(fake.uuid4()) for _ in range(2)]
            },
            f"P{fake.random_int(min=1, max=999)}": {
                "status": fake.random_element(
                    elements=("verified", "pending", "rejected")
                ),
                "reviewer": fake.name(),
                "date": str(fake.date_this_year())
            }
        }
    }

def insert_fake_data(db):
    papers_collection = db.papers
    contributions_collection = db.contributions
    
    paper_ids = []
    for _ in range(10):
        paper = {
            "title": fake.sentence(),
            "author": fake.name(),
            "dois": fake.uuid4(),
            "entity": fake.company(),
            "external": fake.url(),
            "info": {"keywords": fake.words(5)},
            "timeline": {"published": str(fake.date_this_decade())},
            "contributions": {"impact_factor": float(fake.pyfloat(positive=True, max_value=10))}
        }
        result = papers_collection.insert_one(paper)
        paper_ids.append(result.inserted_id)
    
    for paper_id in paper_ids:
        num_contributions = fake.random_int(min=2, max=4)
        for _ in range(num_contributions):
            contribution_data = generate_fake_contribution(paper_id)
            contributions_collection.insert_one(contribution_data)
    
    print(f"{len(paper_ids)} fake papers and their contributions inserted into collections.")

def create_indexes(db):
    db.papers.create_index("dois", unique=True)
    db.contributions.create_index("paper_id")
    db.contributions.create_index("json_id", unique=True)
    print("Indexes created successfully.")

def run_mongo_migration():
    try:
        db, client = connect_to_mongodb()
        create_collections_if_not_exist(db)
        create_indexes(db)
        insert_fake_data(db)
        print("Data migration completed successfully.")
    except Exception as e:
        print(f"Error during migration: {str(e)}")
    finally:
        print("Data migration completed successfully.")

if __name__ == "__main__":
    run_mongo_migration()