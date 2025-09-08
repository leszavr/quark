"""
Пример реализации blog-service на FastAPI
"""
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import jwt
import requests
import logging

app = FastAPI()

# Модель поста
class PostCreate(BaseModel):
    title: str
    content: str

# JWT валидация
def validate_jwt(token: str):
    try:
        payload = jwt.decode(token, "your-256-bit-secret", algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Пример вызова media-service
@app.post("/posts")
def create_post(post: PostCreate, token: str = Depends(lambda x: x.headers.get("Authorization")):
    user_id = validate_jwt(token)
    
    # Загрузка изображения (пример)
    media_response = requests.post(
        "http://media-service:3003/media/upload",
        files={"file": b"fake_image_data"},
        headers={"Authorization": token}
    )
    
    if media_response.status_code != 201:
        logging.error("Failed to upload image")
    
    # Логика создания поста
    post_id = "post-123"
    
    # Генерация события (условно)
    print(f"Event: post.published → {post_id}")
    
    return {"id": post_id, "status": "published"}
