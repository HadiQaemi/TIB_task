from flask import Flask
from flask_cors import CORS
from infrastructure.config import Config

from interfaces.api import api

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)
    api.init_app(app)

    @app.after_request
    def add_header(response):
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)