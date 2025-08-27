from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, UUID, Enum
import uuid
from src.database import Base
from datetime import datetime
from enum import Enum as PyEnum

class PostStatus(str, PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    blog_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    content = Column(Text)  # JSONB content blocks
    status = Column(Enum(PostStatus), default=PostStatus.DRAFT)
    published_at = Column(DateTime, nullable=True)
    tags = Column(Text)  # JSON list of tags
    language = Column(String, default="en")
    ai_generated = Column(Boolean, default=False)
    ai_model = Column(String, nullable=True)
    word_count = Column(Integer, default=0)
    read_time = Column(Integer, default=0)