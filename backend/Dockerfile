# Use Python 3.9 slim image as the base
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .

# Install Python dependencies   
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files from the host machine
COPY . .
EXPOSE 5000
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run Flask application in development mode on startup
CMD ["flask", "run"]