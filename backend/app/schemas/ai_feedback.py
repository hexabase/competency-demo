"""AI Feedback schemas."""
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class AIFeedbackBase(BaseModel):
    """Base schema for AI feedback."""
    
    feedback_content: Dict[str, str]
    career_suggestions: Optional[List[str]] = None
    book_recommendations: Optional[List[Dict[str, str]]] = None


class AIFeedbackCreate(AIFeedbackBase):
    """Schema for creating AI feedback."""
    
    pass


class AIFeedbackUpdate(AIFeedbackBase):
    """Schema for updating AI feedback."""
    
    feedback_content: Optional[Dict[str, str]] = None


class AIFeedbackInDBBase(AIFeedbackBase):
    """Base schema for AI feedback in database."""
    
    id: int
    user_id: int
    generated_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AIFeedback(AIFeedbackInDBBase):
    """Schema for AI feedback."""
    
    pass


class AIFeedbackInDB(AIFeedbackInDBBase):
    """Schema for AI feedback in database with all fields."""
    
    pass