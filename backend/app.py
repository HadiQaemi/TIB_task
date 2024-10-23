from flask import Flask
from flask_cors import CORS
from infrastructure.config import Config

# Import API blueprint from the interfaces.api module
from interfaces.api import api

def create_app():
    """Creates and configures a Flask application instance.
    Returns:
        Flask: A configured Flask application.
    """
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)
    api.init_app(app)

    @app.after_request
    def add_header(response):
        """
        Adds a Referrer-Policy header to all responses.
        Args:
            response (flask.wrappers.Response): The response object.
        Returns:
            flask.wrappers.Response: The modified response object.
        """
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)