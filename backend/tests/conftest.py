"""Test configuration."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.database import Base
from app.main import app


# Create test database
SQLALCHEMY_TEST_DATABASE_URL = f"mysql+pymysql://root:rootpassword@db:3306/competency_test"

engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Get test database session with clean state."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        # Clean up all data after each test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    """Get test client."""
    from app.api import deps
    
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[deps.get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def superuser_token_headers(client, db):
    """Get superuser token headers."""
    from app import crud
    from app.schemas.user import UserCreate
    from app.core.security import get_password_hash
    
    # Create test superuser
    email = "test@example.com"
    password = "testpassword"
    
    user = crud.crud_user.get_by_email(db, email=email)
    if not user:
        user_in = UserCreate(
            email=email,
            password=password,
            name="Test User",
            is_superuser=True
        )
        user = crud.crud_user.create(db, obj_in=user_in)
    
    # Get token
    login_data = {
        "username": email,
        "password": password,
    }
    r = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    response = r.json()
    auth_token = response["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers