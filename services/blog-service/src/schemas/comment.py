from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: uuid.UUID
    user_id: uuid.UUID
    parent_id: Optional[uuid.UUID] = None

class CommentUpdate(CommentBase):
    content: Optional[str] = None

class CommentInDB(CommentBase):
    id: uuid.UUID
    post_id: uuid.UUID
    user_id: uuid.UUID
    parent_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True