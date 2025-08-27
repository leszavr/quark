from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class BlogBase(BaseModel):
    title: str
    description: Optional[str] = None
    subdomain: str
    custom_domain: Optional[str] = None
    theme: Optional[dict] = None

class BlogCreate(BlogBase):
    user_id: uuid.UUID

class BlogUpdate(BlogBase):
    title: Optional[str] = None
    subdomain: Optional[str] = None
    is_active: Optional[bool] = None

class BlogInDB(BlogBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True