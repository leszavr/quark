from sqlalchemy import Column, String, Text, Date, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bio = Column(Text)
    website = Column(String(255))
    location = Column(String(100))
    birth_date = Column(Date)
    avatar_url = Column(Text)
    cover_image_url = Column(Text)
    privacy_level = Column(Enum('public', 'friends', 'private', name='privacy_level_enum'), default='public')
    theme = Column(JSON)
    created_at = Column(Date)
    updated_at = Column(Date)