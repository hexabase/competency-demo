"""Competency related schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class CompetencyItemBase(BaseModel):
    """Base competency item schema."""

    name: str
    description: Optional[str] = None
    order: int = 0


class CompetencyItemCreate(CompetencyItemBase):
    """Schema for creating competency item."""

    pass


class CompetencyItemUpdate(CompetencyItemBase):
    """Schema for updating competency item."""

    name: Optional[str] = None
    order: Optional[int] = None


class CompetencyItem(CompetencyItemBase):
    """Schema for competency item response."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class QuestionBase(BaseModel):
    """Base question schema."""

    text: str
    competency_item_id: int
    order: int = 0
    max_score: int = 5


class QuestionCreate(QuestionBase):
    """Schema for creating question."""

    pass


class QuestionUpdate(QuestionBase):
    """Schema for updating question."""

    text: Optional[str] = None
    order: Optional[int] = None
    max_score: Optional[int] = None


class Question(QuestionBase):
    """Schema for question response."""

    id: int
    created_at: datetime
    updated_at: datetime
    competency_item: Optional[CompetencyItem] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class QuestionWithAnswer(Question):
    """Question with user's answer if exists."""

    user_answer: Optional[int] = None


class AnswerBase(BaseModel):
    """Base answer schema."""

    question_id: int
    score: int


class AnswerCreate(AnswerBase):
    """Schema for creating answer."""

    pass


class AnswerBulkCreate(BaseModel):
    """Schema for bulk answer submission."""

    answers: List[AnswerCreate]


class Answer(AnswerBase):
    """Schema for answer response."""

    id: int
    user_id: int
    submitted_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserCompetencyBase(BaseModel):
    """Base user competency schema."""

    competency_item_id: int
    score: float


class UserCompetency(UserCompetencyBase):
    """Schema for user competency response."""

    id: int
    user_id: int
    calculated_at: datetime
    competency_item: Optional[CompetencyItem] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class CompanyAverageCompetency(BaseModel):
    """Schema for company average competency."""

    id: int
    competency_item_id: int
    average_score: float
    total_users: int
    calculated_at: datetime
    competency_item: Optional[CompetencyItem] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class CompetencyResult(BaseModel):
    """Schema for competency evaluation result."""

    user_competencies: List[UserCompetency]
    company_averages: List[CompanyAverageCompetency]