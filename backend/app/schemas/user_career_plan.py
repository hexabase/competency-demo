"""User career plan schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserCareerPlanBase(BaseModel):
    """Base user career plan schema."""
    
    career_direction: Optional[str] = None
    target_position: Optional[str] = None
    target_timeframe: Optional[str] = None
    strengths_to_enhance: Optional[str] = None
    weaknesses_to_overcome: Optional[str] = None
    specific_goals: Optional[str] = None
    personality_traits: Optional[str] = None
    preferred_learning_style: Optional[str] = None
    challenges_faced: Optional[str] = None
    motivation_factors: Optional[str] = None


class UserCareerPlanCreate(UserCareerPlanBase):
    """User career plan creation schema."""
    pass


class UserCareerPlanUpdate(UserCareerPlanBase):
    """User career plan update schema."""
    pass


class UserCareerPlan(UserCareerPlanBase):
    """User career plan schema."""
    
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}