from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
from uuid import UUID

router = APIRouter()

# Заглушка для получения текущего пользователя
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # В реальной реализации здесь будет проверка JWT токена
    return {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "testuser"
    }

@router.post("/{target_user_id}")
async def subscribe_to_user(
    target_user_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Подписаться на пользователя
    """
    # В реальной реализации здесь будет создание записи в базе данных
    return {
        "message": f"Subscribed to user {target_user_id}",
        "subscriber_id": current_user["user_id"],
        "target_user_id": str(target_user_id)
    }

@router.delete("/{target_user_id}")
async def unsubscribe_from_user(
    target_user_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Отписаться от пользователя
    """
    # В реальной реализации здесь будет удаление записи из базы данных
    return {
        "message": f"Unsubscribed from user {target_user_id}",
        "subscriber_id": current_user["user_id"],
        "target_user_id": str(target_user_id)
    }

@router.get("/following")
async def get_following(current_user: dict = Depends(get_current_user)):
    """
    Получить список пользователей, на которых подписан текущий пользователь
    """
    # В реальной реализации здесь будет запрос к базе данных
    return [
        {
            "user_id": "123e4567-e89b-12d3-a456-426614174001",
            "username": "user1",
            "display_name": "User One"
        },
        {
            "user_id": "123e4567-e89b-12d3-a456-426614174002",
            "username": "user2",
            "display_name": "User Two"
        }
    ]

@router.get("/followers")
async def get_followers(current_user: dict = Depends(get_current_user)):
    """
    Получить список пользователей, подписанных на текущего пользователя
    """
    # В реальной реализации здесь будет запрос к базе данных
    return [
        {
            "user_id": "123e4567-e89b-12d3-a456-426614174003",
            "username": "user3",
            "display_name": "User Three"
        },
        {
            "user_id": "123e4567-e89b-12d3-a456-426614174004",
            "username": "user4",
            "display_name": "User Four"
        }
    ]