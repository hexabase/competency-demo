"""CRUD operations for AI feedback."""
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.ai_feedback import AIFeedback
from app.schemas.ai_feedback import AIFeedbackCreate, AIFeedbackUpdate


class CRUDAIFeedback(CRUDBase[AIFeedback, AIFeedbackCreate, AIFeedbackUpdate]):
    """CRUD operations for AI feedback."""

    def get_by_user_id(
        self, db: Session, *, user_id: int, hours_valid: int = 24
    ) -> Optional[AIFeedback]:
        """
        Get AI feedback for a user if it exists and is recent.
        
        Args:
            db: Database session
            user_id: User ID
            hours_valid: Number of hours the feedback is considered valid (default: 24)
            
        Returns:
            AIFeedback object if exists and is recent, None otherwise
        """
        feedback = (
            db.query(self.model)
            .filter(self.model.user_id == user_id)
            .order_by(self.model.generated_at.desc())
            .first()
        )
        
        if feedback:
            # Check if feedback is still valid (not older than hours_valid)
            time_limit = datetime.utcnow() - timedelta(hours=hours_valid)
            if feedback.generated_at >= time_limit:
                return feedback
        
        return None

    def create_or_update(
        self, db: Session, *, user_id: int, obj_in: AIFeedbackCreate
    ) -> AIFeedback:
        """
        Create new AI feedback or update existing one for a user.
        
        Args:
            db: Database session
            user_id: User ID
            obj_in: AI feedback data
            
        Returns:
            Created or updated AIFeedback object
        """
        # Check if feedback already exists for this user
        existing = db.query(self.model).filter(self.model.user_id == user_id).first()
        
        if existing:
            # Update existing feedback
            update_data = obj_in.dict()
            update_data["updated_at"] = datetime.utcnow()
            for field, value in update_data.items():
                setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new feedback
            db_obj = self.model(user_id=user_id, **obj_in.dict())
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

    def invalidate_user_feedback(self, db: Session, *, user_id: int) -> None:
        """
        Invalidate all AI feedback for a user by deleting it.
        This should be called when user submits new evaluation.
        
        Args:
            db: Database session
            user_id: User ID
        """
        db.query(self.model).filter(self.model.user_id == user_id).delete()
        db.commit()


crud_ai_feedback = CRUDAIFeedback(AIFeedback)