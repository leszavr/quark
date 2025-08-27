from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum

class PostStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class PostBase(BaseModel):
    title: str
    content: List[dict]  # JSON blocks
    tags: Optional[List[str]] = []
    language: Optional[str] = "en"

class PostCreate(PostBase):
    blog_id: uuid.UUID
    status: Optional[PostStatus] = PostStatus.DRAFT

class PostUpdate(PostBase):
    title: Optional[str] = None
    content: Optional[List[dict]] = None
    status: Optional[PostStatus] = None
    tags: Optional[List[str]] = None

class PostInDB(PostBase):
    id: uuid.UUID
    blog_id: uuid.UUID
    slug: str
    status: PostStatus
    published_at: Optional[datetime] = None
    ai_generated: bool
    ai_model: Optional[str] = None
    word_count: int
    read_time: int

    class Config:
        from_attributes = True