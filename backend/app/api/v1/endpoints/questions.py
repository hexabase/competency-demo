"""Questions API endpoints."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models import User

router = APIRouter()


@router.get("/", response_model=List[schemas.Question])
def read_questions(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[schemas.Question]:
    """
    Retrieve all questions with their competency items.
    """
    questions = crud.crud_question.get_all_with_competency(db)
    return questions[skip : skip + limit]


@router.get("/with-answers", response_model=List[schemas.QuestionWithAnswer])
def read_questions_with_answers(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[schemas.QuestionWithAnswer]:
    """
    Retrieve all questions with user's answers if they exist.
    """
    questions = crud.crud_question.get_questions_with_user_answers(
        db, user_id=current_user.id
    )
    # Convert to QuestionWithAnswer schema
    result = []
    for q in questions:
        question_dict = {
            "id": q.id,
            "text": q.text,
            "competency_item_id": q.competency_item_id,
            "order": q.order,
            "max_score": q.max_score,
            "created_at": q.created_at,
            "updated_at": q.updated_at,
            "competency_item": q.competency_item,
            "user_answer": getattr(q, "user_answer", None),
        }
        result.append(schemas.QuestionWithAnswer(**question_dict))
    return result


@router.get("/{question_id}", response_model=schemas.Question)
def read_question(
    *,
    db: Session = Depends(deps.get_db),
    question_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> schemas.Question:
    """
    Get question by ID.
    """
    question = crud.crud_question.get(db=db, id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question