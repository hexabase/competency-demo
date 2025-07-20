"""User career plan model definition."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .user import User  # noqa


class UserCareerPlan(Base):
    """User career plan model."""

    __tablename__ = "user_career_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    career_direction = Column(Text, nullable=True)
    target_position = Column(Text, nullable=True)
    target_timeframe = Column(Text, nullable=True)
    strengths_to_enhance = Column(Text, nullable=True)
    weaknesses_to_overcome = Column(Text, nullable=True)
    specific_goals = Column(Text, nullable=True)
    personality_traits = Column(Text, nullable=True)
    preferred_learning_style = Column(Text, nullable=True)
    challenges_faced = Column(Text, nullable=True)
    motivation_factors = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="career_plan")