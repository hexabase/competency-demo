"""User model definition."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .answer import Answer  # noqa
    from .user_career_plan import UserCareerPlan  # noqa
    from .user_competency import UserCompetency  # noqa


class User(Base):
    """User model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    answers = relationship("Answer", back_populates="user", cascade="all, delete-orphan")
    competencies = relationship(
        "UserCompetency", back_populates="user", cascade="all, delete-orphan"
    )
    career_plan = relationship(
        "UserCareerPlan", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    ai_feedback = relationship(
        "AIFeedback", back_populates="user", cascade="all, delete-orphan"
    )