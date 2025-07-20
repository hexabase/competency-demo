"""Script to create initial superuser."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.core.database import SessionLocal
from app.crud.crud_user import crud_user
from app.schemas.user import UserCreate


def create_superuser():
    """Create initial superuser."""
    db = SessionLocal()
    
    # Check if superuser already exists
    user = crud_user.get_by_email(db, email="admin@example.com")
    if user:
        print("Superuser already exists!")
        return
    
    # Create superuser
    user_in = UserCreate(
        email="admin@example.com",
        name="Admin User",
        password="admin123",
        is_superuser=True,
        is_active=True
    )
    
    user = crud_user.create(db, obj_in=user_in)
    print(f"Superuser created: {user.email}")
    
    db.close()


if __name__ == "__main__":
    create_superuser()