# src/main.py
from infrastructure.repositories.data_repository import DataRepository
from infrastructure.database.data_migration import run_migration

def main():
    # Run data migration
    run_migration()

    # Use repository to interact with your data
    repo = DataRepository()
    items = repo.get_all_items('papers')
    print(f"Number of papers: {len(items)}")
    print("First paper:", items[0] if items else "No papers found")

if __name__ == "__main__":
    main()