"""Answer model definition."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .question import Question  # noqa
    from .user import User  # noqa


class Answer(Base):
    """Answer model."""

    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    score = Column(Integer, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="answers")
    question = relationship("Question", back_populates="answers")