"""Competency calculation service."""
from datetime import datetime
from typing import List, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from app import crud
from app.models import (
    Answer,
    CompanyAverageCompetency,
    CompetencyItem,
    Question,
    UserCompetency,
)


class CompetencyCalculator:
    """Service for calculating competency scores."""

    @staticmethod
    def calculate_user_competencies(db: Session, user_id: int) -> List[UserCompetency]:
        """
        Calculate competency scores for a user based on their answers.
        
        Returns list of UserCompetency objects (not saved to DB).
        """
        # Get all competency items with their questions
        competency_items = crud.crud_competency_item.get_all_with_questions(db)
        
        # Get user's answers
        user_answers = crud.crud_answer.get_user_answers(db, user_id=user_id)
        answer_dict = {ans.question_id: ans.score for ans in user_answers}
        
        user_competencies = []
        
        for competency_item in competency_items:
            # Calculate average score for this competency
            scores = []
            for question in competency_item.questions:
                if question.id in answer_dict:
                    scores.append(answer_dict[question.id])
            
            if scores:
                # Calculate average score
                avg_score = sum(scores) / len(scores)
                
                # Check if user competency already exists
                existing = (
                    db.query(UserCompetency)
                    .filter(
                        UserCompetency.user_id == user_id,
                        UserCompetency.competency_item_id == competency_item.id
                    )
                    .first()
                )
                
                if existing:
                    # Update existing
                    existing.score = avg_score
                    existing.calculated_at = datetime.utcnow()
                    user_competencies.append(existing)
                else:
                    # Create new
                    user_competency = UserCompetency(
                        user_id=user_id,
                        competency_item_id=competency_item.id,
                        score=avg_score,
                        calculated_at=datetime.utcnow()
                    )
                    user_competencies.append(user_competency)
        
        return user_competencies

    @staticmethod
    def save_user_competencies(
        db: Session, user_competencies: List[UserCompetency]
    ) -> List[UserCompetency]:
        """Save calculated user competencies to database."""
        for uc in user_competencies:
            if uc.id is None:
                db.add(uc)
            else:
                db.merge(uc)
        
        db.commit()
        
        # Refresh all objects
        for uc in user_competencies:
            db.refresh(uc)
        
        return user_competencies

    @staticmethod
    def calculate_company_averages(db: Session) -> List[CompanyAverageCompetency]:
        """
        Calculate company-wide average competency scores.
        
        Returns list of CompanyAverageCompetency objects (not saved to DB).
        """
        # Get all competency items
        competency_items = db.query(CompetencyItem).all()
        
        company_averages = []
        
        for competency_item in competency_items:
            # Calculate average across all users
            result = (
                db.query(
                    func.avg(UserCompetency.score).label("avg_score"),
                    func.count(UserCompetency.user_id.distinct()).label("user_count")
                )
                .filter(UserCompetency.competency_item_id == competency_item.id)
                .first()
            )
            
            if result.avg_score is not None:
                # Check if company average already exists
                existing = (
                    db.query(CompanyAverageCompetency)
                    .filter(
                        CompanyAverageCompetency.competency_item_id == competency_item.id
                    )
                    .first()
                )
                
                if existing:
                    # Update existing
                    existing.average_score = float(result.avg_score)
                    existing.total_users = result.user_count
                    existing.calculated_at = datetime.utcnow()
                    company_averages.append(existing)
                else:
                    # Create new
                    company_avg = CompanyAverageCompetency(
                        competency_item_id=competency_item.id,
                        average_score=float(result.avg_score),
                        total_users=result.user_count,
                        calculated_at=datetime.utcnow()
                    )
                    company_averages.append(company_avg)
        
        return company_averages

    @staticmethod
    def save_company_averages(
        db: Session, company_averages: List[CompanyAverageCompetency]
    ) -> List[CompanyAverageCompetency]:
        """Save calculated company averages to database."""
        for ca in company_averages:
            if ca.id is None:
                db.add(ca)
            else:
                db.merge(ca)
        
        db.commit()
        
        # Refresh all objects
        for ca in company_averages:
            db.refresh(ca)
        
        return company_averages

    @staticmethod
    def get_competency_results(
        db: Session, user_id: int
    ) -> Tuple[List[UserCompetency], List[CompanyAverageCompetency]]:
        """
        Get user competencies and company averages.
        
        Calculates if not already calculated or if answers have been updated.
        """
        # Calculate and save user competencies
        user_competencies = CompetencyCalculator.calculate_user_competencies(
            db, user_id
        )
        user_competencies = CompetencyCalculator.save_user_competencies(
            db, user_competencies
        )
        
        # Calculate and save company averages
        company_averages = CompetencyCalculator.calculate_company_averages(db)
        company_averages = CompetencyCalculator.save_company_averages(
            db, company_averages
        )
        
        # Load relationships
        for uc in user_competencies:
            db.refresh(uc, ["competency_item"])
        
        for ca in company_averages:
            db.refresh(ca, ["competency_item"])
        
        return user_competencies, company_averages