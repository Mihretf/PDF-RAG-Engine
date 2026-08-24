# Use an official lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends build-essential

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Run the application with uvicorn
CMD ["uvicorn", "main.py:app", "--host", "0.0.0.0", "--port", "8000"]