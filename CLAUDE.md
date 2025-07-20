# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a competency evaluation system for employees that visualizes abilities through radar charts and provides AI-powered feedback. The system is built with:

- **Backend**: Python with FastAPI
- **Database**: MySQL 8.0
- **Infrastructure**: Docker/Docker Compose for development, Kubernetes planned for production
- **Frontend**: Next.js with TypeScript (planned but not yet implemented)

## Key Commands

### Development Environment

```bash
# Start all services (backend + database)
make up

# Stop all services  
make down

# Rebuild containers
make build

# Check running containers
make ps

# View logs
make logs
```

### Direct Docker Commands

```bash
# If make is not available
docker-compose up -d      # Start services
docker-compose down       # Stop services
docker-compose build      # Rebuild
docker-compose ps         # Check status
docker-compose logs -f    # View logs
```

### Backend Development

The backend runs on port 8002 (mapped from container's 8000). To access:
- API root: http://localhost:8002/
- API docs: http://localhost:8002/docs

### Database Access

MySQL runs on port 3309 (mapped from container's 3306):
- Host: localhost
- Port: 3309
- Database: competency_db
- User: user
- Password: password

## Architecture Overview

### Current Implementation Status

The project is in early development stage with:
- Basic FastAPI setup with a simple "Hello World" endpoint
- Docker environment configured for backend and MySQL
- Database schema planned but not yet implemented
- Frontend not yet started

### Planned Architecture

According to the implementation plan (実装計画.md):

1. **Backend API Structure** (to be implemented):
   - `/api/v1/users`: User registration
   - `/api/v1/login`: Authentication
   - `/api/v1/questions`: Retrieve competency questions
   - `/api/v1/answers`: Submit answers
   - `/api/v1/results/{user_id}`: Get evaluation results with AI feedback
   - `/api/v1/career_plans`: Career plan management

2. **Database Schema** (to be implemented):
   - users: Employee information
   - questions: 30 competency questions
   - competency_items: 10 evaluation categories
   - answers: User responses
   - user_competencies: Individual competency scores
   - company_average_competencies: Company-wide averages
   - user_career_plans: Career goals and development plans

3. **AI Integration**: 
   - Plans to use OpenAI API (GPT-4) for generating personalized feedback
   - AI will consider user's career plans when providing recommendations

## Key Features

The application will:
1. Present 30 questions to evaluate 10 competency areas
2. Display results as radar charts comparing individual vs company average
3. Provide AI-generated feedback including:
   - Evaluation comments for each competency area
   - Improvement advice
   - Recommended training programs
   - Book recommendations
4. Allow users to input career goals and development preferences
5. Tailor AI feedback based on individual career plans

## Development Workflow

When implementing new features:
1. Ensure Docker environment is running (`make up`)
2. Backend code is auto-reloaded due to volume mounting and uvicorn's `--reload` flag
3. Database changes will require schema migrations (not yet set up)
4. Test API endpoints using the FastAPI auto-generated docs at http://localhost:8002/docs

## Important Notes

- The project uses Docker Compose for development with hot-reloading enabled
- MySQL is configured with platform: linux/amd64 for compatibility
- Backend dependencies include FastAPI, SQLAlchemy, PyMySQL, and authentication libraries (passlib, python-jose)
- The frontend will use Next.js with TypeScript but hasn't been initialized yet

## ⚠️ CRITICAL DEVELOPMENT REQUIREMENTS

### Code Quality Standards

#### Python (Backend)
- **Style**: Follow PEP 8 conventions
- **Naming**: Use snake_case for functions/variables, PascalCase for classes
- **Testing**: Use pytest with minimum 80% coverage
- **Linting**: Run `black`, `flake8`, and `mypy` before commits
- **Type hints**: Always use type annotations

#### TypeScript (Frontend)
- **Style**: Follow Next.js conventions
- **Testing**: Use Jest and React Testing Library
- **Linting**: ESLint with Next.js configuration
- **Components**: Functional components with TypeScript interfaces

### Development Practices

- **Test-Driven Development**: Write tests before implementation
- **Clean Code**: Self-documenting code with minimal comments
- **No debugging artifacts**: Remove all console.log, print statements
- **Environment variables**: Never commit secrets, use .env files
- **Docker-first**: All backend testing must run in containers