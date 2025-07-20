"""Company average competency model definition."""
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


class CompanyAverageCompetency(Base):
    """Company average competency score model."""

    __tablename__ = "company_average_competencies"

    id = Column(Integer, primary_key=True, index=True)
    competency_item_id = Column(
        Integer, ForeignKey("competency_items.id"), nullable=False, unique=True
    )
    average_score = Column(Float, nullable=False)
    total_users = Column(Integer, default=0, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    competency_item = relationship("CompetencyItem")