"""AI Feedback model."""
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class AIFeedback(Base):
    """Model for storing AI-generated feedback."""
    
    __tablename__ = "ai_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Feedback content stored as JSON
    feedback_content = Column(JSON, nullable=False)
    career_suggestions = Column(JSON, nullable=True)
    book_recommendations = Column(JSON, nullable=True)
    
    # Metadata
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="ai_feedback")