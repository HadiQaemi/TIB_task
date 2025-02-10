import re
from flask import request, jsonify
from flask_restx import Api, Resource, fields
from use_cases.paper_service import PaperService
from http import HTTPStatus
import math

api = Api(
    version="1.0", title="TIB API", description="API for TIB data", doc="/api/swagger"
)

paper_service = PaperService()
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


@api.route("/api/all_paper")
@api.param("currentPage", "The current page in list")
@api.param("pageSize", "The size of pages ")
class AllPapers(Resource):
    @api.doc("get_all_papers")
    def get(self):
        papers = paper_service.get_all_papers()
        return {
            "content": papers,
            "totalElements": len(papers),
        }


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


@api.route("/api/paper")
@api.param("id", "The paper entity ID")
class PaperById(Resource):
    @api.doc("get_paper_by_id")
    def get(self):
        entity_id = request.args.get("id")
        paper = paper_service.get_paper_by_id(entity_id)
        return paper


@api.route("/api/statement")
@api.param("id", "The paper entity ID")
class StatementById(Resource):
    @api.doc("get_statement_by_id")
    def get(self):
        entity_id = request.args.get("id")
        paper = paper_service.get_statement_by_id(entity_id)
        return paper


@api.route("/api/add-paper")
@api.param("url", "The paper entity URL")
class AddPaper(Resource):
    @api.doc("add_paper_by_url")
    def post(self):
        url = request.args.get("url")
        paper_service.extract_paper(url)
        return {"result": True}


@api.route("/api/get-authors")
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
            {"id": str(author["id"]), "name": author["label"]} for author in authors
        ]
        return jsonify(results)


@api.route("/api/titles")
@api.param("title", "The article title")
class ArticleTitles(Resource):
    @api.doc("article_by_titles")
    def get(self):
        search_term = request.args.get("title", "")
        if not search_term:
            return jsonify([])
        regex_pattern = re.compile(f".*{re.escape(search_term)}.*", re.IGNORECASE)
        articles = paper_service.get_titles(regex_pattern)
        results = [
            {"id": str(article["_id"]), "name": article["name"]} for article in articles
        ]
        return jsonify(results)


@api.route("/api/research_fields")
@api.param("label", "The article title")
class ResearchFields(Resource):
    @api.doc("research_fields")
    def get(self):
        search_term = request.args.get("label", "")
        # if not search_term:
        #     return jsonify([])
        regex_pattern = re.compile(f".*{re.escape(search_term)}.*", re.IGNORECASE)
        research_fields = paper_service.get_research_fields(regex_pattern)
        results = [
            {"id": str(research_field["@id"]), "name": research_field["label"]}
            for research_field in research_fields
        ]
        return jsonify(results)


@api.route("/api/get-journals")
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
            {"id": str(journal["_id"]), "name": journal["label"]}
            for journal in journals
        ]
        return jsonify(results)


@api.route("/api/get-statement")
@api.param("id", "ID")
class getStatement(Resource):
    @api.doc("get_statement")
    def get(self):
        id = request.args.get("id", "")
        response = paper_service.get_statement(id)
        status_code = (
            HTTPStatus.OK if response["success"] else HTTPStatus.FAILED_DEPENDENCY
        )
        response = jsonify(
            {
                "content": response["result"],
            }
        )
        response.status_code = status_code
        return response


@api.route("/api/get-paper")
@api.param("id", "ID")
class getPaper(Resource):
    @api.doc("get_paper")
    def get(self):
        id = request.args.get("id", "")
        response = paper_service.get_paper(id)
        status_code = (
            HTTPStatus.OK if response["success"] else HTTPStatus.FAILED_DEPENDENCY
        )
        response = jsonify(
            {
                "content": response["result"],
            }
        )
        response.status_code = status_code
        return response


@api.route("/api/latest-concepts")
class latestConcepts(Resource):
    @api.doc("latest_concepts")
    def get(self):
        concepts = paper_service.get_latest_concepts()
        results = [
            {
                "id": str(concept["_id"]),
                "name": concept["label"],
                # "identifier": concept["seeAlso"][0]
                # if isinstance(concept["seeAlso"], list)
                # else concept["seeAlso"],
            }
            for concept in concepts
        ]
        return jsonify(results)


@api.route("/api/statements")
class latestStatements(Resource):
    @api.doc("latest_statements")
    def get(self):
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        sort_order = request.args.get("sort", "a-z")
        search_query = request.args.get("search")
        research_fields = request.args.getlist("research_fields[]")

        statements = paper_service.get_latest_statements(
            research_fields=research_fields,
            search_query=search_query,
            sort_order=sort_order,
            page=page,
            page_size=limit,
        )

        results = [
            {
                "id": str(statement["statement_id"]),
                "article": str(statement["article"]["name"]),
                "author": statement["author"][0]["familyName"],
                "name": statement["supports"][0]["notation"]["label"],
                "date": statement["article"]["datePublished"],
                "journal": (
                    statement["article"].get("journal", {}).get("label")
                    or statement["article"].get("conference", {}).get("label")
                ),
            }
            for statement in statements["content"]
        ]
        return jsonify(
            {
                "items": results,
                "total": statements["totalElements"],
            }
        )


@api.route("/api/articles")
class latestArticles(Resource):
    @api.doc("latest_articles")
    def get(self):
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        sort_order = request.args.get("sort", "a-z")
        search_query = request.args.get("search")
        research_fields = request.args.getlist("research_fields[]")
        articles = paper_service.get_latest_articles(
            research_fields=research_fields,
            search_query=search_query,
            sort_order=sort_order,
            page=page,
            page_size=limit,
        )
        results = [
            {
                "id": str(article["article_id"]),
                "name": article["name"],
                "author": article["author"][0]["familyName"],
                "journal": article.get("journal", {}).get("label")
                or article.get("conference", {}).get("label"),
                "publisher": article["publisher"]["label"],
                "date": article["datePublished"],
            }
            for article in articles["content"]
        ]
        return jsonify(
            {
                "items": results,
                "total": articles["totalElements"],
            }
        )


@api.route("/api/keywords")
class latestKeywords(Resource):
    @api.doc("latest_keywords")
    def get(self):
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        sort_order = request.args.get("sort", "a-z")
        search_query = request.args.get("search")
        research_fields = request.args.getlist("research_fields[]")
        keywords = paper_service.get_latest_keywords(
            research_fields=research_fields,
            search_query=search_query,
            sort_order=sort_order,
            page=page,
            page_size=limit,
        )
        results = [
            {
                "id": str(keyword["_id"]),
                "name": keyword["label"],
            }
            for keyword in keywords["content"]
        ]
        return jsonify(
            {
                "items": results,
                "total": keywords["totalElements"],
            }
        )


@api.route("/api/authors")
class latestAuthors(Resource):
    @api.doc("latest_authors")
    def get(self):
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        sort_order = request.args.get("sort", "a-z")
        search_query = request.args.get("search")
        research_fields = request.args.getlist("research_fields[]")
        authors = paper_service.get_latest_authors(
            research_fields=research_fields,
            search_query=search_query,
            sort_order=sort_order,
            page=page,
            page_size=limit,
        )
        results = [
            {
                "id": str(author["id"]),
                "doi": author["@id"],
                "name": author["label"],
            }
            for author in authors["content"]
        ]
        return jsonify(
            {
                "items": results,
                "total": authors["totalElements"],
            }
        )


@api.route("/api/journals")
class latestJournals(Resource):
    @api.doc("latest_journals")
    def get(self):
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        sort_order = request.args.get("sort", "a-z")
        search_query = request.args.get("search")
        research_fields = request.args.getlist("research_fields[]")
        journals = paper_service.get_latest_journals(
            research_fields=research_fields,
            search_query=search_query,
            sort_order=sort_order,
            page=page,
            page_size=limit,
        )
        results = [
            {
                "id": str(journal["_id"]),
                "name": journal["label"],
                "publisher": journal["publisher"][0]["label"],
            }
            for journal in journals["content"]
        ]
        return jsonify(
            {
                "items": results,
                "total": journals["totalElements"],
            }
        )


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


@api.route("/api/filter-statement")
@api.param("url", "The paper entity URL")
class filter_statement(Resource):
    @api.doc("filter_statement")
    def post(self):
        data = request.get_json()
        time_range = data.get("timeRange", {})
        start_year = time_range.get("start")
        end_year = time_range.get("end")

        title = data.get("title")
        research_fields = data.get("research_fields", [])
        author_ids = data.get("authors", [])
        journal_names = data.get("journals", [])
        conference_names = data.get("conferences", [])
        concept_ids = data.get("concepts", [])
        per_page = data.get("per_page", [])
        page = data.get("page", [])
        response = paper_service.query_data(
            author_ids,
            concept_ids,
            page,
            per_page,
            start_year,
            end_year,
            journal_names,
            conference_names,
            title,
            research_fields,
        )
        status_code = (
            HTTPStatus.OK if response["success"] else HTTPStatus.FAILED_DEPENDENCY
        )
        response = jsonify(
            {
                "content": response["result"],
                "totalElements": response["total_count"],
                "page": page,
                "per_page": per_page,
                "totalPages": math.ceil(response["total_count"] / per_page),
            }
        )
        response.status_code = status_code
        return response


@api.route("/api/query-data")
@api.param("url", "The paper entity URL")
class get_data(Resource):
    @api.doc("get_data")
    def get(self):
        author_ids = [int(id) for id in request.args.getlist("author_ids[]", type=int)]
        concept_ids = [
            int(id) for id in request.args.getlist("concept_ids[]", type=int)
        ]
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        response = paper_service.query_data(author_ids, concept_ids, page, per_page)
        status_code = (
            HTTPStatus.OK if response["success"] else HTTPStatus.FAILED_DEPENDENCY
        )
        response = jsonify(
            {
                "content": response["result"],
                "totalElements": response["total_count"],
                "page": page,
                "per_page": per_page,
                "totalPages": math.ceil(response["total_count"] / per_page),
            }
        )
        response.status_code = status_code
        return response
