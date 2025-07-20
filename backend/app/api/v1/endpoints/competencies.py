"""Competencies API endpoints."""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models import User
from app.services.competency_calculator import CompetencyCalculator
from app.services.ai_feedback_service import ai_feedback_service

router = APIRouter()


@router.get("/items", response_model=List[schemas.CompetencyItem])
def read_competency_items(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[schemas.CompetencyItem]:
    """
    Retrieve all competency items with their questions.
    """
    items = crud.crud_competency_item.get_all_with_questions(db)
    return items[skip : skip + limit]


@router.get("/results", response_model=schemas.CompetencyResult)
def get_competency_results(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> schemas.CompetencyResult:
    """
    Get user's competency evaluation results with company averages.
    """
    user_competencies, company_averages = CompetencyCalculator.get_competency_results(
        db, user_id=current_user.id
    )
    
    return schemas.CompetencyResult(
        user_competencies=user_competencies,
        company_averages=company_averages
    )


@router.get("/feedback")
def get_ai_feedback(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    force_regenerate: bool = False,
):
    """
    Get AI-generated feedback for user's competency evaluation.
    
    Args:
        force_regenerate: If True, regenerate feedback even if cached version exists
    """
    # Check for cached feedback first (valid for 7 days)
    if not force_regenerate:
        cached_feedback = crud.crud_ai_feedback.get_by_user_id(
            db, user_id=current_user.id, hours_valid=7 * 24
        )
        if cached_feedback:
            return {
                "feedback": cached_feedback.feedback_content,
                "career_suggestions": cached_feedback.career_suggestions or [],
                "book_recommendations": cached_feedback.book_recommendations or [],
                "generated_at": cached_feedback.generated_at.isoformat() + "Z",
                "from_cache": True
            }
        else:
            # No cached feedback and not forced to regenerate - return empty response
            return {
                "feedback": None,
                "career_suggestions": [],
                "book_recommendations": [],
                "generated_at": None,
                "from_cache": False,
                "message": "キャッシュされたフィードバックがありません。AIへ評価を依頼してください。"
            }
    
    # Generate new feedback
    user_competencies, company_averages = CompetencyCalculator.get_competency_results(
        db, user_id=current_user.id
    )
    
    if not user_competencies:
        return {"error": "評価結果がありません。まず評価を完了してください。"}
    
    # Get user's career plan if available
    career_plan = crud.crud_user_career_plan.get_by_user_id(db, user_id=current_user.id)
    
    # Generate enhanced AI feedback with career plan consideration
    feedback = ai_feedback_service.generate_enhanced_competency_feedback(
        user_competencies, company_averages, career_plan, current_user.name
    )
    
    # Generate career suggestions
    suggestions = ai_feedback_service.generate_career_suggestions(
        user_competencies, 
        getattr(current_user, 'department', None), 
        getattr(current_user, 'position', None)
    )
    
    # Generate book recommendations
    competency_data = [
        {
            "name": uc.competency_item.name,
            "score": uc.score,
            "company_avg": next(
                (ca.average_score for ca in company_averages if ca.competency_item_id == uc.competency_item_id),
                None
            )
        }
        for uc in user_competencies
    ]
    book_recommendations = ai_feedback_service.generate_book_recommendations(competency_data, career_plan)
    
    # Save to database
    feedback_data = schemas.AIFeedbackCreate(
        feedback_content=feedback,
        career_suggestions=suggestions,
        book_recommendations=book_recommendations
    )
    crud.crud_ai_feedback.create_or_update(
        db, user_id=current_user.id, obj_in=feedback_data
    )
    
    return {
        "feedback": feedback,
        "career_suggestions": suggestions,
        "book_recommendations": book_recommendations,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "from_cache": False
    }