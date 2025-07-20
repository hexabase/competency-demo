"""API v1 router configuration."""
from fastapi import APIRouter

from app.api.v1.endpoints import answers, auth, career_plans, competencies, questions, users

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(answers.router, prefix="/answers", tags=["answers"])
api_router.include_router(
    competencies.router, prefix="/competencies", tags=["competencies"]
)
api_router.include_router(
    career_plans.router, prefix="/career-plans", tags=["career-plans"]
)