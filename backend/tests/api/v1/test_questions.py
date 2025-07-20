"""Test questions API endpoints."""
import pytest
from sqlalchemy.orm import Session

from app import crud
from app.core.config import settings
from app.models import CompetencyItem, Question
from tests.utils.utils import random_email, random_lower_string


def test_read_questions(
    client, superuser_token_headers, db: Session
) -> None:
    """Test reading all questions."""
    # Create test competency item
    competency_item = CompetencyItem(
        name="Test Competency",
        description="Test Description",
        order=1
    )
    db.add(competency_item)
    db.commit()
    db.refresh(competency_item)
    
    # Create test questions
    for i in range(3):
        question = Question(
            text=f"Test Question {i+1}",
            competency_item_id=competency_item.id,
            order=i+1,
            max_score=5
        )
        db.add(question)
    db.commit()
    
    response = client.get(
        f"{settings.API_V1_STR}/questions/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 3
    assert all("text" in q for q in content)
    assert all("competency_item_id" in q for q in content)


def test_read_questions_with_answers(
    client, superuser_token_headers, db: Session
) -> None:
    """Test reading questions with user answers."""
    response = client.get(
        f"{settings.API_V1_STR}/questions/with-answers",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
    # Each question should have user_answer field (can be None)
    if content:
        assert "user_answer" in content[0]


def test_read_question_by_id(
    client, superuser_token_headers, db: Session
) -> None:
    """Test reading a specific question by ID."""
    # Create test competency item
    competency_item = CompetencyItem(
        name="Test Competency",
        description="Test Description",
        order=1
    )
    db.add(competency_item)
    db.commit()
    db.refresh(competency_item)
    
    # Create test question
    question = Question(
        text="Specific Test Question",
        competency_item_id=competency_item.id,
        order=1,
        max_score=5
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    
    response = client.get(
        f"{settings.API_V1_STR}/questions/{question.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == question.id
    assert content["text"] == question.text


def test_read_question_not_found(
    client, superuser_token_headers
) -> None:
    """Test reading non-existent question."""
    response = client.get(
        f"{settings.API_V1_STR}/questions/99999",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404