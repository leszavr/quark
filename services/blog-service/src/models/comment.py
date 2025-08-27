from sqlalchemy import Column, String, Text, DateTime, UUID
import uuid
from src.database import Base
from datetime import datetime

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(UUID(as_uuid=True), nullable=True)  # For nested comments
    created_at = Column(DateTime, default=datetime.utcnow)