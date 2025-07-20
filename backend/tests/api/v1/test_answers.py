"""Test answers API endpoints."""
import pytest
from sqlalchemy.orm import Session

from app import crud
from app.core.config import settings
from app.models import Answer, CompetencyItem, Question


def test_submit_answers(
    client, superuser_token_headers, db: Session
) -> None:
    """Test submitting multiple answers."""
    # Create test competency item and questions
    competency_item = CompetencyItem(
        name="Test Competency",
        description="Test Description",
        order=1
    )
    db.add(competency_item)
    db.commit()
    db.refresh(competency_item)
    
    questions = []
    for i in range(3):
        question = Question(
            text=f"Test Question {i+1}",
            competency_item_id=competency_item.id,
            order=i+1,
            max_score=5
        )
        db.add(question)
        questions.append(question)
    db.commit()
    for q in questions:
        db.refresh(q)
    
    # Submit answers
    data = {
        "answers": [
            {"question_id": q.id, "score": i+3}
            for i, q in enumerate(questions)
        ]
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/answers/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 3
    assert all("question_id" in ans for ans in content)
    assert all("score" in ans for ans in content)
    assert all("user_id" in ans for ans in content)


def test_update_existing_answers(
    client, superuser_token_headers, db: Session
) -> None:
    """Test updating existing answers."""
    # Create test competency item and question
    competency_item = CompetencyItem(
        name="Test Competency",
        description="Test Description",
        order=1
    )
    db.add(competency_item)
    db.commit()
    db.refresh(competency_item)
    
    question = Question(
        text="Test Question",
        competency_item_id=competency_item.id,
        order=1,
        max_score=5
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    
    # Submit initial answer
    data = {
        "answers": [{"question_id": question.id, "score": 3}]
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/answers/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    initial_answer = response.json()[0]
    
    # Update the answer
    data = {
        "answers": [{"question_id": question.id, "score": 5}]
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/answers/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    updated_answer = response.json()[0]
    
    # Should be the same answer ID but different score
    assert updated_answer["id"] == initial_answer["id"]
    assert updated_answer["score"] == 5


def test_read_user_answers(
    client, superuser_token_headers, db: Session
) -> None:
    """Test reading user's answers."""
    response = client.get(
        f"{settings.API_V1_STR}/answers/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)