FROM python:3.11-slim

WORKDIR /app

# Copy requirements from root of backend
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else from backend into container
COPY . .

EXPOSE 8000

# Run uvicorn pointing to main.py inside src/app
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]