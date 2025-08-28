@echo off
setlocal enabledelayedexpansion

REM BY Application Docker Development Scripts for Windows

set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

goto :main

:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_header
echo.
echo %BLUE%================================%NC%
echo %BLUE%  %~1%NC%
echo %BLUE%================================%NC%
echo.
goto :eof

:dev_up
call :print_header "Starting BY Development Environment"

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker Desktop."
    exit /b 1
)

call :print_status "Building and starting services..."
docker-compose up --build -d

call :print_status "Waiting for services to be ready..."
timeout /t 30 /nobreak >nul

call :print_status "Running database migrations..."
docker-compose exec api dotnet ef database update --no-build
if errorlevel 1 (
    call :print_warning "Migration failed - database may need manual setup"
)

call :print_status "Development environment is ready!"
echo.
echo ?? Services running at:
echo    • API: http://localhost:5186
echo    • API Health: http://localhost:5186/health
echo    • pgAdmin: http://localhost:8082 (admin@by.local / admin123)
echo    • PostgreSQL: localhost:5433
echo    • Redis: localhost:6380
echo.
echo ?? To view logs: dev.cmd logs api
echo ?? To stop: dev.cmd down
goto :eof

:dev_down
call :print_header "Stopping BY Development Environment"
docker-compose down
call :print_status "Development environment stopped."
goto :eof

:dev_clean
call :print_header "Cleaning BY Development Environment"
call :print_warning "This will remove all containers, volumes, and data!"

set /p confirm="Are you sure? (y/N) "
if /i "!confirm!"=="y" (
    docker-compose down -v --remove-orphans
    docker system prune -f
    call :print_status "Environment cleaned successfully."
) else (
    call :print_status "Clean operation cancelled."
)
goto :eof

:dev_logs
set "service=%~1"
if "%service%"=="" set "service=api"
call :print_status "Showing logs for service: !service!"
docker-compose logs -f "!service!"
goto :eof

:dev_migrate
call :print_header "Running Database Migrations"
docker-compose exec api dotnet ef database update --no-build
call :print_status "Migrations completed."
goto :eof

:dev_reset_db
call :print_header "Resetting Database"
call :print_warning "This will delete all data!"

set /p confirm="Are you sure? (y/N) "
if /i "!confirm!"=="y" (
    docker-compose stop postgres
    docker-compose rm -f postgres
    docker volume rm by_postgres_data 2>nul
    docker-compose up -d postgres
    timeout /t 20 /nobreak >nul
    call :dev_migrate
    call :print_status "Database reset completed."
) else (
    call :print_status "Database reset cancelled."
)
goto :eof

:dev_test
call :print_header "Running Tests"
docker-compose exec api dotnet test --no-build --verbosity normal
goto :eof

:dev_status
call :print_header "BY Development Environment Status"
docker-compose ps
echo.
call :print_status "Service health checks:"
curl -s -o nul -w "API: %%{http_code}" http://localhost:5186/health 2>nul || echo API: DOWN
curl -s -o nul -w "pgAdmin: %%{http_code}" http://localhost:8082 2>nul || echo pgAdmin: DOWN
goto :eof

:dev_shell
call :print_status "Opening shell in API container..."
docker-compose exec api /bin/bash
goto :eof

:show_help
call :print_header "BY Application Development Commands"
echo Usage: %0 ^<command^>
echo.
echo Commands:
echo   up        - Start development environment
echo   down      - Stop development environment
echo   clean     - Clean environment (removes volumes)
echo   logs      - Show logs (optionally specify service)
echo   migrate   - Run database migrations
echo   reset-db  - Reset database (WARNING: deletes data)
echo   test      - Run tests
echo   status    - Show environment status
echo   shell     - Open shell in API container
echo   help      - Show this help
echo.
echo Examples:
echo   %0 up
echo   %0 logs api
echo   %0 logs postgres
goto :eof

:main
set "command=%~1"
if "%command%"=="" set "command=help"

if "%command%"=="up" (
    call :dev_up
) else if "%command%"=="down" (
    call :dev_down
) else if "%command%"=="clean" (
    call :dev_clean
) else if "%command%"=="logs" (
    call :dev_logs "%~2"
) else if "%command%"=="migrate" (
    call :dev_migrate
) else if "%command%"=="reset-db" (
    call :dev_reset_db
) else if "%command%"=="test" (
    call :dev_test
) else if "%command%"=="status" (
    call :dev_status
) else if "%command%"=="shell" (
    call :dev_shell
) else (
    call :show_help
)

endlocal