class Paper:
    """
    Class representing a paper document.

    This class defines the attributes of a paper, including:
     - contributions: List of contributors to the paper
     - title: Title of the paper
     - author: Author(s) of the paper
     - dois: List of Digital Object Identifiers (dois) associated with the paper
     - entity: Entity ID of the paper in the data source
     - external: External information about the paper (if available)
     - info: Additional information about the paper (e.g., abstract)
     - timeline: Timeline information related to the paper (e.g., publication date)
    """

    def __init__(self, contributions, title, author, dois, entity, external, info, timeline):
        self.contributions = contributions
        self.title = title
        self.author = author
        self.dois = dois
        self.entity = entity
        self.external = external
        self.info = info
        self.timeline = timeline


class Contribution:
    """
    Class representing a paper document.

    This class defines the attributes of a paper, including:
     - contributions: List of contributors to the paper
     - title: Title of the paper
     - author: Author(s) of the paper
     - dois: List of Digital Object Identifiers (dois) associated with the paper
     - entity: Entity ID of the paper in the data source
     - external: External information about the paper (if available)
     - info: Additional information about the paper (e.g., abstract)
     - timeline: Timeline information related to the paper (e.g., publication date)
    """

    def __init__(self, contributions, title, author, info):
        self.contributions = contributions
        self.author = author
        self.title = title
        self.info = info
