from fastapi import APIRouter, HTTPException
from src.schemas.blog import BlogCreate, BlogUpdate, BlogInDB
import uuid

router = APIRouter(prefix="/blogs", tags=["blogs"])

@router.get("/{username}", response_model=BlogInDB)
async def get_blog(username: str):
    """Получить информацию о блоге"""
    # Здесь будет логика получения блога
    raise HTTPException(status_code=501, detail="Not implemented")

@router.get("/{username}/posts")
async def get_blog_posts(username: str):
    """Получить список постов блога"""
    # Здесь будет логика получения постов
    raise HTTPException(status_code=501, detail="Not implemented")

@router.put("/me", response_model=BlogInDB)
async def update_blog(blog: BlogUpdate):
    """Обновление блога (требует JWT)"""
    # Здесь будет логика обновления блога
    raise HTTPException(status_code=501, detail="Not implemented")