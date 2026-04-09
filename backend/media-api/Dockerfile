FROM python:3.11-slim

WORKDIR /app

COPY media-api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY media-api/ /app/

RUN mkdir -p /storage/videos /storage/thumbnails /storage/images

EXPOSE 8083
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8083"]
