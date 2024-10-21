# src/infrastructure/database/data_migration.py
import pg8000
from faker import Faker
from ..config import Config
import json

fake = Faker()


def create_database_if_not_exists():
    conn = pg8000.connect(
        host=Config.PG_HOST,
        user=Config.PG_USER,
        password=Config.PG_PASSWORD,
        database='postgres'  # Connect to default database first
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Check if database exists
    cur.execute(
        f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{Config.PG_DATABASE}'")
    exists = cur.fetchone()

    if not exists:
        # Need to use format here as pg8000 doesn't support parameterized DDL
        cur.execute(f"CREATE DATABASE {Config.PG_DATABASE}")
        print(f"Database '{Config.PG_DATABASE}' created.")

    cur.close()
    conn.close()


def create_table_if_not_exists():
    conn = pg8000.connect(
        host=Config.PG_HOST,
        database=Config.PG_DATABASE,
        user=Config.PG_USER,
        password=Config.PG_PASSWORD
    )
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS "public"."papers" (
        "id" SERIAL PRIMARY KEY,
        "title" text,
        "author" varchar(255),
        "dois" varchar(255),
        "entity" varchar(255),
        "external" varchar(255),
        "info" json,
        "timeline" json,
        "contributions" json
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS "public"."contributions" (
        "id" SERIAL PRIMARY KEY,
        "paper_id" INTEGER REFERENCES "public"."papers"(id) ON DELETE CASCADE,
        "json_id" TEXT,
        "json_type" TEXT,
        "json_context" json,
        "label" TEXT,
        "mongo_id" TEXT,
        "predicates" JSONB,
        CONSTRAINT fk_paper
            FOREIGN KEY(paper_id)
            REFERENCES papers(id)
    )
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("Table 'papers' created or already exists.")


def generate_fake_context_json():
    """Generate fake JSON context with 10 string fields."""
    return {
        "version": f"v{fake.random_int(min=1, max=5)}.{fake.random_int(min=0, max=9)}",
        "domain": fake.domain_name(),
        "category": fake.random_element(elements=("research", "methodology", "analysis", "review")),
        "department": fake.company_suffix(),
        "institution": fake.company(),
        "location": fake.city(),
        "country": fake.country(),
        "language": fake.language_name(),
        "license": f"CC-{fake.random_element(elements=('BY', 'BY-SA', 'BY-NC', 'BY-ND'))}-4.0",
        "timestamp": fake.iso8601()
    }


def generate_fake_contribution(paper_id):
    """Generate fake data for a contribution."""
    return {
        "paper_id": paper_id,
        "json_id": f"contribution_{fake.uuid4()}",
        "json_type": fake.random_element(elements=("Research", "Method", "Data", "Analysis")),
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
                "type": fake.random_element(elements=("primary", "secondary", "tertiary")),
                "references": [str(fake.uuid4()) for _ in range(2)]
            },
            f"P{fake.random_int(min=1, max=999)}": {
                "status": fake.random_element(elements=("verified", "pending", "rejected")),
                "reviewer": fake.name(),
                "date": str(fake.date_this_year())
            }
        }
    }


def insert_fake_data():
    conn = pg8000.connect(
        host=Config.PG_HOST,
        database=Config.PG_DATABASE,
        user=Config.PG_USER,
        password=Config.PG_PASSWORD
    )
    cur = conn.cursor()
    paper_ids = []
    for _ in range(10):
        query = f"INSERT INTO public.papers (title, author, dois, entity, external, info, timeline, contributions) VALUES ('{fake.sentence()}', '{fake.name()}', '{fake.uuid4()}', '{fake.company()}', '{fake.url()}', '{json.dumps({"keywords": fake.words(5)})}', '{json.dumps({"published": str(fake.date_this_decade())})}', '{json.dumps({"impact_factor": fake.pyfloat(positive=True, max_value=10)})}') RETURNING id"
        cur.execute(query)
        paper_id = cur.fetchone()[0]
        paper_ids.append(paper_id)

    # Insert fake contributions (2-4 contributions per paper)
    for paper_id in paper_ids:
        num_contributions = fake.random_int(min=2, max=4)
        for _ in range(num_contributions):
            contribution_data = generate_fake_contribution(paper_id)
            query = """
            INSERT INTO public.contributions 
                (paper_id, json_id, json_type, json_context, label, mongo_id, predicates)
            VALUES 
                (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                contribution_data["paper_id"],
                contribution_data["json_id"],
                contribution_data["json_type"],
                contribution_data["json_context"],
                contribution_data["label"],
                contribution_data["mongo_id"],
                json.dumps(contribution_data["predicates"])
            )
            cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()
    print("10 fake papers and their contributions inserted into tables.")


def run_migration():
    create_database_if_not_exists()
    create_table_if_not_exists()
    insert_fake_data()
    print("Data migration completed successfully.")


if __name__ == "__main__":
    run_migration()
