"""CRUD operations for competency-related models."""
from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app.crud.base import CRUDBase
from app.models import Answer, CompetencyItem, Question
from app.schemas.competency import AnswerCreate, QuestionCreate, QuestionUpdate


class CRUDCompetencyItem(CRUDBase[CompetencyItem, QuestionCreate, QuestionUpdate]):
    """CRUD operations for CompetencyItem model."""

    def get_all_with_questions(self, db: Session) -> List[CompetencyItem]:
        """Get all competency items with their questions."""
        return (
            db.query(CompetencyItem)
            .options(joinedload(CompetencyItem.questions))
            .order_by(CompetencyItem.order)
            .all()
        )


class CRUDQuestion(CRUDBase[Question, QuestionCreate, QuestionUpdate]):
    """CRUD operations for Question model."""

    def get_all_with_competency(self, db: Session) -> List[Question]:
        """Get all questions with their competency items."""
        return (
            db.query(Question)
            .options(joinedload(Question.competency_item))
            .order_by(Question.order)
            .all()
        )

    def get_questions_with_user_answers(
        self, db: Session, user_id: int
    ) -> List[Question]:
        """Get all questions with user's answers if they exist."""
        questions = self.get_all_with_competency(db)
        
        # Get user's answers
        user_answers = (
            db.query(Answer)
            .filter(Answer.user_id == user_id)
            .all()
        )
        answer_dict = {ans.question_id: ans.score for ans in user_answers}
        
        # Add user answers to questions
        for question in questions:
            question.user_answer = answer_dict.get(question.id)
        
        return questions


class CRUDAnswer(CRUDBase[Answer, AnswerCreate, None]):
    """CRUD operations for Answer model."""

    def get_user_answer(
        self, db: Session, *, user_id: int, question_id: int
    ) -> Optional[Answer]:
        """Get a specific answer by user and question."""
        return (
            db.query(Answer)
            .filter(Answer.user_id == user_id, Answer.question_id == question_id)
            .first()
        )

    def create_or_update(
        self, db: Session, *, user_id: int, obj_in: AnswerCreate
    ) -> Answer:
        """Create or update an answer."""
        # Check if answer exists
        existing = self.get_user_answer(
            db, user_id=user_id, question_id=obj_in.question_id
        )
        
        if existing:
            # Update existing answer
            existing.score = obj_in.score
            db.add(existing)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new answer
            db_obj = Answer(
                user_id=user_id,
                question_id=obj_in.question_id,
                score=obj_in.score
            )
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

    def bulk_create_or_update(
        self, db: Session, *, user_id: int, answers: List[AnswerCreate]
    ) -> List[Answer]:
        """Bulk create or update answers."""
        created_answers = []
        for answer_in in answers:
            answer = self.create_or_update(db, user_id=user_id, obj_in=answer_in)
            created_answers.append(answer)
        return created_answers

    def get_user_answers(self, db: Session, *, user_id: int) -> List[Answer]:
        """Get all answers for a user."""
        return db.query(Answer).filter(Answer.user_id == user_id).all()


crud_competency_item = CRUDCompetencyItem(CompetencyItem)
crud_question = CRUDQuestion(Question)
crud_answer = CRUDAnswer(Answer)