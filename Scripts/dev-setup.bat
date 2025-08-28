@echo off
REM Development environment setup script for Windows

echo ?? Setting up BY development environment...

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ? Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo ?? Creating .env file from template...
    copy .env.example .env
    echo ? .env file created. Please review and update the configuration.
)

REM Build and start the development environment
echo ???  Building and starting services...
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

REM Wait for services to be healthy
echo ? Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service health
echo ?? Checking service health...
docker-compose ps

REM Show service URLs
echo ?? Development environment is ready!
echo.
echo ?? Services:
echo   - API: http://localhost:5000
echo   - API Docs: http://localhost:5000/swagger
echo   - pgAdmin: http://localhost:8080 (admin@by.local / admin123)
echo   - Redis Commander: http://localhost:8081
echo   - Database: localhost:5432 (by_user / by_password_dev)
echo.
echo ?? Useful commands:
echo   - View logs: docker-compose logs -f
echo   - Stop services: docker-compose down
echo   - Restart API: docker-compose restart api
echo   - Database shell: docker-compose exec database psql -U by_user -d by_development
echo.