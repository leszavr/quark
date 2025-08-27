from sqlalchemy import Column, String, Boolean, DateTime, Text, UUID
import uuid
from src.database import Base
from datetime import datetime

class Blog(Base):
    __tablename__ = "blogs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    subdomain = Column(String, unique=True, nullable=False)
    custom_domain = Column(String, nullable=True)
    theme = Column(Text)  # JSON theme configuration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)