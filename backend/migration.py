# src/main.py
from infrastructure.config import Config
from infrastructure.repositories.data_repository import DataRepository
from infrastructure.database.data_migration_postgre import run_postgre_migration
from infrastructure.database.data_migration_mongo import run_mongo_migration


def main():
    # Run data migration
    if Config.DATABASE_TYPE == 'mongodb':
        return run_mongo_migration()
    elif Config.DATABASE_TYPE == 'postgresql':
        return run_postgre_migration()

    # Use repository to interact with your data
    repo = DataRepository()
    items = repo.get_all_items('papers')
    print(f"Number of papers: {len(items)}")
    print("First paper:", items[0] if items else "No papers found")

if __name__ == "__main__":
    main()