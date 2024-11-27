class Paper:
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
    def __init__(self, contributions, title, author, info):
        self.contributions = contributions
        self.author = author
        self.title = title
        self.info = info
