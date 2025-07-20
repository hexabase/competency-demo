"""User career plan CRUD operations."""
from typing import Optional

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.user_career_plan import UserCareerPlan
from app.schemas.user_career_plan import UserCareerPlanCreate, UserCareerPlanUpdate


class CRUDUserCareerPlan(CRUDBase[UserCareerPlan, UserCareerPlanCreate, UserCareerPlanUpdate]):
    """CRUD operations for user career plans."""
    
    def get_by_user_id(self, db: Session, *, user_id: int) -> Optional[UserCareerPlan]:
        """Get user career plan by user ID."""
        return db.query(UserCareerPlan).filter(UserCareerPlan.user_id == user_id).first()
    
    def create_for_user(self, db: Session, *, obj_in: UserCareerPlanCreate, user_id: int) -> UserCareerPlan:
        """Create career plan for user."""
        db_obj = UserCareerPlan(
            user_id=user_id,
            **obj_in.model_dump()
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_for_user(
        self, db: Session, *, user_id: int, obj_in: UserCareerPlanUpdate
    ) -> Optional[UserCareerPlan]:
        """Update career plan for user."""
        db_obj = self.get_by_user_id(db, user_id=user_id)
        if db_obj:
            return self.update(db, db_obj=db_obj, obj_in=obj_in)
        return None


crud_user_career_plan = CRUDUserCareerPlan(UserCareerPlan)