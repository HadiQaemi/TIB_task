from flask import request, jsonify
from flask_restx import Api, Resource, fields
from use_cases.paper_service import PaperService
from http import HTTPStatus
import math

# Create the Flask-RESTX API object with version, title, and description.
api = Api(
    version="1.0", title="TIB API", description="API for TIB data", doc="/api/swagger"
)

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
@api.route("/api/all-paper")
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
@api.route("/api/all-statements")
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
@api.route("/api/search")
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
@api.route("/api/paper")
@api.param("id", "The paper entity ID")
class PaperById(Resource):
    @api.doc("get_paper_by_id")
    def get(self):
        entity_id = request.args.get("id")
        paper = paper_service.get_paper_by_id(entity_id)
        return paper

# Define the endpoint for retrieving a paper by its entity ID.
@api.route("/api/statement")
@api.param("id", "The paper entity ID")
class StatementById(Resource):
    @api.doc("get_statement_by_id")
    def get(self):
        entity_id = request.args.get("id")
        paper = paper_service.get_statement_by_id(entity_id)
        return paper


# Define the endpoint for adding a new paper by its URL.
@api.route("/api/add-paper")
@api.param("url", "The paper entity URL")
class AddPaper(Resource):
    @api.doc("add_paper_by_url")
    def post(self):
        url = request.args.get("url")
        paper = paper_service.extract_paper(url)
        return {"result": True}


# Define the endpoint for adding a new paper by its URL.
@api.route("/api/authors")
@api.param("url", "The author entity name")
class Authors(Resource):
    @api.doc("authors_by_name")
    def get(self):
        search_term = request.args.get("name", "")
        if not search_term:
            return jsonify([])
        regex_pattern = re.compile(f".*{re.escape(search_term)}.*", re.IGNORECASE)
        authors = paper_service.get_authors(regex_pattern)
        results = [
            {"id": str(author["_id"]), "name": author["label"]} for author in authors
        ]
        return jsonify(results)


# Define the endpoint for adding a new paper by its URL.
@api.route("/api/journals")
@api.param("url", "The concept entity title")
class journals(Resource):
    @api.doc("journals_by_name")
    def get(self):
        search_term = request.args.get("name", "")
        if not search_term:
            return jsonify([])
        regex_pattern = re.compile(f".*{re.escape(search_term)}.*", re.IGNORECASE)
        journals = paper_service.get_journals(regex_pattern)
        results = [
            {"id": str(journal["journal"]), "name": journal["journal"]}
            for journal in journals
        ]
        return jsonify(results)


# Define the endpoint for adding a new paper by its URL.
@api.route("/api/concepts")
@api.param("url", "The concept entity title")
class concepts(Resource):
    @api.doc("concepts_by_name")
    def get(self):
        search_term = request.args.get("name", "")
        if not search_term:
            return jsonify([])
        regex_pattern = re.compile(f".*{re.escape(search_term)}.*", re.IGNORECASE)
        concepts = paper_service.get_concepts(regex_pattern)
        results = [
            {"id": str(concept["_id"]), "name": concept["label"]}
            for concept in concepts
        ]
        return jsonify(results)
# Define the endpoint for searching.
@api.route("/api/query-data")
@api.param("url", "The paper entity URL")
class get_data(Resource):
    @api.doc("get_data")
    def get(self):
        author_ids = [int(id) for id in request.args.getlist("author_ids[]", type=int)]
        concept_ids = [
            int(id) for id in request.args.getlist("concept_ids[]", type=int)
        ]
        statement_filters = {
            key.split("_", 1)[1]: value
            for key, value in request.args.items()
            if key.startswith("statement_")
        }
        article_filters = {
            key.split("_", 1)[1]: value
            for key, value in request.args.items()
            if key.startswith("article_")
        }
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        response = paper_service.query_data(
            author_ids, concept_ids, statement_filters, article_filters, page, per_page
        )
        status_code = HTTPStatus.OK if response['success'] else HTTPStatus.FAILED_DEPENDENCY
        response = jsonify(
            {
                "content": response['result'],
                "totalElements": response['total_count'],
                "page": page,
                "per_page": per_page,
                "totalPages": math.ceil(response['total_count'] / per_page),
            }
        )
        response.status_code = status_code
        return response 