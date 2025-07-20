"""User endpoints."""
from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Retrieve users."""
    users = crud.crud_user.get_multi(db, skip=skip, limit=limit)
    return users


@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """Create new user."""
    user = crud.crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.crud_user.create(db, obj_in=user_in)
    return user


@router.get("/me", response_model=schemas.User)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get current user."""
    return current_user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    name: str = Body(None),
    email: str = Body(None),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Update own user."""
    current_user_data = schemas.UserUpdate(**current_user.__dict__)
    if password is not None:
        current_user_data.password = password
    if name is not None:
        current_user_data.name = name
    if email is not None:
        current_user_data.email = email
    user = crud.crud_user.update(db, db_obj=current_user, obj_in=current_user_data)
    return user


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """Get a specific user by id."""
    user = crud.crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    return user


@router.delete("/by-email/{email}", status_code=204)
def delete_user_for_testing(
    *,
    db: Session = Depends(deps.get_db),
    email: str,
    # This is a simple protection mechanism for a testing-only endpoint.
    # In a real-world scenario, you'd want something more robust.
    x_test_secret: str | None = Header(None, alias="X-TEST-SECRET"),
) -> None:
    """
    Delete a user by email. This is for testing purposes only.
    """
    if x_test_secret != "your-secret-testing-key":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = crud.crud_user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    crud.crud_user.remove(db, id=user.id)
    return None