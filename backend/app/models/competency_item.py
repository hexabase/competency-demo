"""Competency item model definition."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .question import Question  # noqa
    from .user_competency import UserCompetency  # noqa


class CompetencyItem(Base):
    """Competency evaluation item model."""

    __tablename__ = "competency_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    questions = relationship("Question", back_populates="competency_item")
    user_competencies = relationship("UserCompetency", back_populates="competency_item")