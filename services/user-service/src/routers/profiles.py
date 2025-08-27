from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import httpx

from database import get_db
from models.user_profile import UserProfile
from schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter()

# Заглушка для получения текущего пользователя
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # В реальной реализации здесь будет проверка JWT токена
    # Пока возвращаем тестовые данные
    return {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "testuser",
        "display_name": "Test User"
    }

@router.get("/{username}", response_model=ProfileResponse)
async def get_public_profile(username: str, db: AsyncSession = Depends(get_db)):
    """
    Получить публичный профиль пользователя
    """
    # В реальной реализации здесь будет запрос к базе данных
    # или вызов auth-service для получения данных пользователя
    return {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": username,
        "display_name": f"{username.capitalize()} User",
        "bio": "This is a sample bio",
        "website": "https://example.com",
        "location": "Sample City",
        "birth_date": "1990-01-01",
        "avatar_url": "https://example.com/avatar.jpg",
        "cover_image_url": "https://example.com/cover.jpg",
        "privacy_level": "public",
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    }

@router.get("/me", response_model=ProfileResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Получить профиль текущего пользователя
    """
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "display_name": current_user["display_name"],
        "bio": "This is my bio",
        "website": "https://mywebsite.com",
        "location": "My City",
        "birth_date": "1990-01-01",
        "avatar_url": "https://mywebsite.com/avatar.jpg",
        "cover_image_url": "https://mywebsite.com/cover.jpg",
        "privacy_level": "public",
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    }

@router.put("/me", response_model=ProfileResponse)
async def update_current_user_profile(
    profile_update: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Обновить профиль текущего пользователя
    """
    # В реальной реализации здесь будет обновление в базе данных
    updated_profile = {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "display_name": current_user["display_name"],
        "bio": profile_update.bio or "This is my bio",
        "website": profile_update.website or "https://mywebsite.com",
        "location": profile_update.location or "My City",
        "birth_date": profile_update.birth_date or "1990-01-01",
        "avatar_url": "https://mywebsite.com/avatar.jpg",
        "cover_image_url": "https://mywebsite.com/cover.jpg",
        "privacy_level": profile_update.privacy_level or "public",
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    }
    return updated_profile

@router.get("/{username}/blogs")
async def get_user_blogs(username: str):
    """
    Получить список блогов пользователя
    """
    # В реальной реализации здесь будет вызов blog-service
    return [
        {
            "id": 1,
            "title": "Sample Blog Post",
            "content": "This is a sample blog post",
            "created_at": "2023-01-01T00:00:00"
        }
    ]