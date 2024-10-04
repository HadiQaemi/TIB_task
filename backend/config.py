import os
from urllib.parse import quote_plus

class Config:
    # MongoDB Configuration
    MONGO_USERNAME = os.getenv('MONGODB_USERNAME', 'admin')
    MONGO_PASSWORD = os.getenv('MONGODB_PASSWORD', 'your_secure_password')
    MONGO_HOST = os.getenv('MONGODB_HOST', 'localhost')
    MONGO_PORT = os.getenv('MONGODB_PORT', '27017')
    MONGO_DB = os.getenv('MONGODB_DATABASE', 'Tib_task')
    
    # Encode username and password for special characters
    encoded_username = quote_plus(MONGO_USERNAME)
    encoded_password = quote_plus(MONGO_PASSWORD)
    
    # Construct MongoDB URI
    MONGO_URI = f"mongodb://{encoded_username}:{encoded_password}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"
    MONGO_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"
    # print(MONGO_URI)

    # Other Flask configurations
    DEBUG = os.getenv('DEBUG', False)
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # MONGO_URI = "mongodb://admin:your_secure_password@SERVER:PORT"
    # DATABASE_NAME = "Tib_task"
    DATABASE_NAME = MONGO_DB
    CORS_RESOURCES = {
        r"/*": {
            "origins": ["http://localhost", "http://127.0.0.1"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "max_age": 600,
            "send_wildcard": False,
            "resources": r"/*"
        }
    }