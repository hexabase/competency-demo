"""Answers API endpoints."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models import User

router = APIRouter()


@router.post("/", response_model=List[schemas.Answer])
def submit_answers(
    *,
    db: Session = Depends(deps.get_db),
    answers_in: schemas.AnswerBulkCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[schemas.Answer]:
    """
    Submit multiple answers at once.
    """
    answers = crud.crud_answer.bulk_create_or_update(
        db, user_id=current_user.id, answers=answers_in.answers
    )
    
    # Invalidate cached AI feedback when new answers are submitted
    crud.crud_ai_feedback.invalidate_user_feedback(db, user_id=current_user.id)
    
    return answers


@router.get("/", response_model=List[schemas.Answer])
def read_user_answers(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[schemas.Answer]:
    """
    Get all answers for the current user.
    """
    answers = crud.crud_answer.get_user_answers(db, user_id=current_user.id)
    return answers