#!/bin/bash

# BY Application Docker Development Scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to start development environment
dev_up() {
    print_header "Starting BY Development Environment"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose up --build -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec api dotnet ef database update --no-build || print_warning "Migration failed - database may need manual setup"
    
    print_status "Development environment is ready!"
    echo ""
    echo "?? Services running at:"
    echo "   • API: http://localhost:5185"
    echo "   • API Health: http://localhost:5185/health"
    echo "   • pgAdmin: http://localhost:8080 (admin@by.local / admin123)"
    echo "   • PostgreSQL: localhost:5432"
    echo "   • Redis: localhost:6379"
    echo ""
    echo "?? To view logs: docker-compose logs -f api"
    echo "?? To stop: ./dev.sh down"
}

# Function to stop development environment
dev_down() {
    print_header "Stopping BY Development Environment"
    docker-compose down
    print_status "Development environment stopped."
}

# Function to clean development environment
dev_clean() {
    print_header "Cleaning BY Development Environment"
    print_warning "This will remove all containers, volumes, and data!"
    
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_status "Environment cleaned successfully."
    else
        print_status "Clean operation cancelled."
    fi
}

# Function to show logs
dev_logs() {
    local service=${1:-api}
    print_status "Showing logs for service: $service"
    docker-compose logs -f "$service"
}

# Function to run database migrations
dev_migrate() {
    print_header "Running Database Migrations"
    docker-compose exec api dotnet ef database update --no-build
    print_status "Migrations completed."
}

# Function to reset database
dev_reset_db() {
    print_header "Resetting Database"
    print_warning "This will delete all data!"
    
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose stop postgres
        docker-compose rm -f postgres
        docker volume rm by_postgres_data || true
        docker-compose up -d postgres
        sleep 20
        dev_migrate
        print_status "Database reset completed."
    else
        print_status "Database reset cancelled."
    fi
}

# Function to run tests
dev_test() {
    print_header "Running Tests"
    docker-compose exec api dotnet test --no-build --verbosity normal
}

# Function to show status
dev_status() {
    print_header "BY Development Environment Status"
    docker-compose ps
    echo ""
    print_status "Service health checks:"
    echo "API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5185/health || echo "DOWN")"
    echo "pgAdmin: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "DOWN")"
}

# Function to open shell in API container
dev_shell() {
    print_status "Opening shell in API container..."
    docker-compose exec api /bin/bash
}

# Main command dispatcher
case "${1:-help}" in
    up)
        dev_up
        ;;
    down)
        dev_down
        ;;
    clean)
        dev_clean
        ;;
    logs)
        dev_logs "${2:-api}"
        ;;
    migrate)
        dev_migrate
        ;;
    reset-db)
        dev_reset_db
        ;;
    test)
        dev_test
        ;;
    status)
        dev_status
        ;;
    shell)
        dev_shell
        ;;
    help|*)
        print_header "BY Application Development Commands"
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  up        - Start development environment"
        echo "  down      - Stop development environment"
        echo "  clean     - Clean environment (removes volumes)"
        echo "  logs      - Show logs (optionally specify service)"
        echo "  migrate   - Run database migrations"
        echo "  reset-db  - Reset database (WARNING: deletes data)"
        echo "  test      - Run tests"
        echo "  status    - Show environment status"
        echo "  shell     - Open shell in API container"
        echo "  help      - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 up"
        echo "  $0 logs api"
        echo "  $0 logs postgres"
        ;;
esac