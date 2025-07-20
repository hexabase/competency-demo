"""Question model definition."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .answer import Answer  # noqa
    from .competency_item import CompetencyItem  # noqa


class Question(Base):
    """Question model."""

    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    competency_item_id = Column(
        Integer, ForeignKey("competency_items.id"), nullable=False
    )
    order = Column(Integer, default=0)
    max_score = Column(Integer, default=5, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    competency_item = relationship("CompetencyItem", back_populates="questions")
    answers = relationship("Answer", back_populates="question")