# Introduction
This repository details the development of the React-based application for extracting and displaying paper-related data from nested JSON structures.
The data is extracted from  [TIB APIs](https://orkg.org/api/predicates/) to present the scholar data that have inclusion dependencies. This solution tries to address the challenge of presenting nested JSON data by utilizing React/Flask/Nginx/MongoDB technologies.  The Figure below illustrates the big picture and screenshots.
![Screenshot](images/screenshot.jpg)
- [Backend](#backend)
- [Frontend](#frontend)
- [Note](#note)

# Backend
The Backend using Flask is responsible for retrieve nested JSON data containing paper information, and then interacts with the MongoDB database. The related code are placed in the <backend> folder in this repository. Moreover, to have interactive API documentation, "Swagger Interface" is utilized which is available on http://13.40.80.42:5000/.
```
git clone https://github.com/HadiQaemi/TIB_task.git
cd backend/ 
sudo docker build -t python-backend .
sudo docker run -d -p 5000:5000 python-backend
```
# Frontend
Frontend is utilizing React and provides two pages, which the first one shows a list of papers, and the second page presents the paper's nested information in detail.
- [Paper List page](http://13.40.80.42:3000)
- [Requested Paper deatils](http://13.40.80.42:3000/paper/R664252/)
```
git clone https://github.com/HadiQaemi/TIB_task.git
cd frontend/
sudo docker build -t react-front .
sudo docker run -d -p 3000:80 react-front
```
![Screenshot](images/pages.jpg)
# Note
The interface is designed based on  The Open Research Knowledge Graph.(https://orkg.org/).

*Note*: Given the public nature of the data and its lower sensitivity, I prioritized to focus on development and deployment. As a result, the application is currently running over HTTP and has not yet been migrated to HTTPS, and might affect to accessing the application on high restricted networks.