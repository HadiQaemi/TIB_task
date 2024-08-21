class Config:
    """
        Configuration settings for the application.
        Attributes:
            MONGO_URI (str): The MongoDB connection URI.
            DATABASE_NAME (str): The name of the MongoDB database.
            CORS_RESOURCES (dict): Configuration for Cross-Origin Resource Sharing (CORS).
    """
    MONGO_URI = "mongodb://User:Pass@SERVER:PORT"
    DATABASE_NAME = "Tib_task"
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