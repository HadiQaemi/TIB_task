from flask import request
from flask_restx import Api, Resource, fields
from use_cases.paper_service import PaperService

# Create the Flask-RESTX API object with version, title, and description.
api = Api(version="1.0", title="TIB API", description="API for TIB data")

# Create an instance of the PaperService, which handles the business logic for paper data.
paper_service = PaperService()

# Define the model for a Paper object, which includes fields like contributions, title, author, dois, entity, external information, and timeline.
paper_model = api.model(
    "Paper",
    {
        "contributions": fields.List(
            fields.Raw, description="Contributions of the paper"
        ),
        "title": fields.String(description="Title of the paper"),
        "author": fields.String(description="Author of the paper"),
        "dois": fields.List(
            fields.String, description="dois associated with the paper"
        ),
        "entity": fields.String(description="Entity ID of the paper"),
        "external": fields.Raw(description="External information about the paper"),
        "info": fields.Raw(description="Additional information about the paper"),
        "timeline": fields.Raw(description="Timeline information of the paper"),
    },
)


# Define the endpoint for retrieving all papers.
@api.route("/all-paper")
@api.param("currentPage", "The current page in list")
@api.param("pageSize", "The size of pages ")
class AllPapers(Resource):
    @api.doc("get_all_papers")
    def get(self):
        # page = request.args.get("currentPage")
        # page_size = request.args.get("pageSize")
        # papers = paper_service.get_all_papers(page, page_size)
        papers = paper_service.get_all_papers()
        return {
            # 'content': [vars(paper) for paper in papers],
            "content": papers,
            "totalElements": len(papers),
        }


# Define the endpoint for retrieving all papers.
@api.route("/all-statements")
@api.param("currentPage", "The current page in list")
@api.param("pageSize", "The size of pages ")
class AllStatements(Resource):
    @api.doc("get_all_statements")
    def get(self):
        page = request.args.get("currentPage")
        page_size = request.args.get("pageSize")
        statements = paper_service.get_all_statements(int(page), int(page_size))
        return statements


# Define the endpoint for retrieving all papers.
@api.route("/search")
@api.param("title", "The paper title")
class Search(Resource):
    @api.doc("search_by_title")
    def get(self):
        title = request.args.get("title")
        papers = paper_service.search_by_title(title)
        return {
            "content": [vars(paper) for paper in papers],
            "totalElements": len(papers),
        }


# Define the endpoint for retrieving a paper by its entity ID.
@api.route("/paper")
@api.param("id", "The paper entity ID")
class PaperById(Resource):
    @api.doc("get_paper_by_id")
    def get(self):
        entity_id = request.args.get("id")
        paper = paper_service.get_paper_by_id(entity_id)
        # return vars(paper) if paper else api.abort(404, "Paper not found")
        return paper


# Define the endpoint for adding a new paper by its URL.
@api.route("/add-paper")
@api.param("url", "The paper entity URL")
class PaperById(Resource):
    @api.doc("add_paper_by_url")
    def post(self):
        url = request.args.get("url")
        paper = paper_service.extract_paper(url)
        return {"result": True}
