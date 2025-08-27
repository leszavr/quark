from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class ProfileCreate(BaseModel):
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    birth_date: Optional[date] = None
    privacy_level: Optional[str] = "public"

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    birth_date: Optional[date] = None
    privacy_level: Optional[str] = None

class ProfileResponse(BaseModel):
    user_id: UUID
    username: str
    display_name: str
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    birth_date: Optional[date] = None
    avatar_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    privacy_level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True