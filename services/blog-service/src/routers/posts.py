import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException
from schemas.post import PostCreate, PostUpdate, PostInDB

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/{slug}", response_model=PostInDB)
async def get_post(slug: str):
    """Получить пост (публичный)"""
    # Здесь будет логика получения поста
    raise HTTPException(status_code=501, detail="Not implemented")

@router.get("/")
async def get_posts():
    """Получить список постов (с фильтрами: tag, author, date)"""
    # Здесь будет логика получения списка постов
    raise HTTPException(status_code=501, detail="Not implemented")

@router.post("/", response_model=PostInDB)
async def create_post(post: PostCreate):
    """Создание поста (черновик или публикация)"""
    # Здесь будет логика создания поста
    raise HTTPException(status_code=501, detail="Not implemented")

@router.put("/{id}", response_model=PostInDB)
async def update_post(id: str, post: PostUpdate):
    """Редактирование поста"""
    # Здесь будет логика обновления поста
    raise HTTPException(status_code=501, detail="Not implemented")

@router.delete("/{id}")
async def delete_post(id: str):
    """Удаление поста"""
    # Здесь будет логика удаления поста
    raise HTTPException(status_code=501, detail="Not implemented")

@router.get("/{slug}/html")
async def get_post_html(slug: str):
    """SSR-рендеринг поста (для SEO)"""
    # Здесь будет логика рендеринга HTML
    raise HTTPException(status_code=501, detail="Not implemented")