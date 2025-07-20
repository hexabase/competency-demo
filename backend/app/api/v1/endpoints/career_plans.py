"""Career plans API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models import User

router = APIRouter()


@router.get("/", response_model=schemas.UserCareerPlan)
def get_career_plan(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> schemas.UserCareerPlan:
    """
    Get current user's career plan.
    """
    career_plan = crud.crud_user_career_plan.get_by_user_id(db, user_id=current_user.id)
    if not career_plan:
        raise HTTPException(status_code=404, detail="Career plan not found")
    return career_plan


@router.post("/", response_model=schemas.UserCareerPlan)
def create_career_plan(
    *,
    db: Session = Depends(deps.get_db),
    career_plan_in: schemas.UserCareerPlanCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> schemas.UserCareerPlan:
    """
    Create career plan for current user.
    """
    existing_plan = crud.crud_user_career_plan.get_by_user_id(db, user_id=current_user.id)
    if existing_plan:
        raise HTTPException(
            status_code=400, 
            detail="Career plan already exists. Use PUT to update."
        )
    
    career_plan = crud.crud_user_career_plan.create_for_user(
        db, obj_in=career_plan_in, user_id=current_user.id
    )
    return career_plan


@router.put("/", response_model=schemas.UserCareerPlan)
def update_career_plan(
    *,
    db: Session = Depends(deps.get_db),
    career_plan_in: schemas.UserCareerPlanUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> schemas.UserCareerPlan:
    """
    Update career plan for current user.
    """
    career_plan = crud.crud_user_career_plan.update_for_user(
        db, user_id=current_user.id, obj_in=career_plan_in
    )
    if not career_plan:
        # If no existing plan, create a new one
        career_plan = crud.crud_user_career_plan.create_for_user(
            db, obj_in=schemas.UserCareerPlanCreate(**career_plan_in.model_dump()), user_id=current_user.id
        )
    return career_plan


@router.delete("/")
def delete_career_plan(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> dict:
    """
    Delete career plan for current user.
    """
    career_plan = crud.crud_user_career_plan.get_by_user_id(db, user_id=current_user.id)
    if not career_plan:
        raise HTTPException(status_code=404, detail="Career plan not found")
    
    crud.crud_user_career_plan.remove(db, id=career_plan.id)
    return {"message": "Career plan deleted successfully"}