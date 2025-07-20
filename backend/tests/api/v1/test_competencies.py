"""Test competencies API endpoints."""
import pytest
from sqlalchemy.orm import Session

from app import crud
from app.core.config import settings
from app.models import Answer, CompetencyItem, Question, UserCompetency


def test_read_competency_items(
    client, superuser_token_headers, db: Session
) -> None:
    """Test reading competency items."""
    # Create test competency items
    for i in range(2):
        competency_item = CompetencyItem(
            name=f"Test Competency {i+1}",
            description=f"Test Description {i+1}",
            order=i+1
        )
        db.add(competency_item)
    db.commit()
    
    response = client.get(
        f"{settings.API_V1_STR}/competencies/items",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 2
    assert all("name" in item for item in content)
    assert all("description" in item for item in content)


def test_get_competency_results(
    client, superuser_token_headers, db: Session
) -> None:
    """Test getting competency results."""
    # Create test data
    competency_item = CompetencyItem(
        name="Test Competency",
        description="Test Description",
        order=1
    )
    db.add(competency_item)
    db.commit()
    db.refresh(competency_item)
    
    # Create questions
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
    
    # Submit answers first
    data = {
        "answers": [
            {"question_id": q.id, "score": 4}
            for q in questions
        ]
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/answers/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    
    # Get competency results
    response = client.get(
        f"{settings.API_V1_STR}/competencies/results",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    
    assert "user_competencies" in content
    assert "company_averages" in content
    assert isinstance(content["user_competencies"], list)
    assert isinstance(content["company_averages"], list)
    
    # Check user competencies
    if content["user_competencies"]:
        user_comp = content["user_competencies"][0]
        assert "score" in user_comp
        assert "competency_item_id" in user_comp
        assert user_comp["score"] == 4.0  # Average of three 4s
    
    # Check company averages
    if content["company_averages"]:
        company_avg = content["company_averages"][0]
        assert "average_score" in company_avg
        assert "total_users" in company_avg
        assert "competency_item_id" in company_avg