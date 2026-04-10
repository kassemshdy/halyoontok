FROM python:3.11-slim

WORKDIR /app

COPY backend/shared/ /app/shared/
RUN pip install --no-cache-dir /app/shared

COPY backend/front-api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/front-api/app/ /app/app/

EXPOSE 8081
ENV PORT=8081
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
