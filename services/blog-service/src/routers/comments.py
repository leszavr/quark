from fastapi import APIRouter, HTTPException
from src.schemas.comment import CommentCreate, CommentUpdate, CommentInDB

router = APIRouter(tags=["comments"])

@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str):
    """Получить комментарии к посту"""
    # Здесь будет логика получения комментариев
    raise HTTPException(status_code=501, detail="Not implemented")

@router.post("/posts/{post_id}/comments", response_model=CommentInDB)
async def create_comment(post_id: str, comment: CommentCreate):
    """Создать комментарий к посту"""
    # Здесь будет логика создания комментария
    raise HTTPException(status_code=501, detail="Not implemented")

@router.delete("/comments/{id}")
async def delete_comment(id: str):
    """Удалить комментарий"""
    # Здесь будет логика удаления комментария
    raise HTTPException(status_code=501, detail="Not implemented")