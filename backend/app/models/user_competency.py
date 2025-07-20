"""User competency model definition."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .competency_item import CompetencyItem  # noqa
    from .user import User  # noqa


class UserCompetency(Base):
    """User competency score model."""

    __tablename__ = "user_competencies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    competency_item_id = Column(
        Integer, ForeignKey("competency_items.id"), nullable=False
    )
    score = Column(Float, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="competencies")
    competency_item = relationship("CompetencyItem", back_populates="user_competencies")