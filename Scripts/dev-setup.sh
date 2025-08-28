#!/bin/bash
# Development environment setup script

echo "?? Setting up BY development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "? Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "?? Creating .env file from template..."
    cp .env.example .env
    echo "? .env file created. Please review and update the configuration."
fi

# Build and start the development environment
echo "???  Building and starting services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
echo "? Waiting for services to be ready..."
sleep 30

# Check service health
echo "?? Checking service health..."
docker-compose ps

# Show service URLs
echo "?? Development environment is ready!"
echo ""
echo "?? Services:"
echo "  - API: http://localhost:5000"
echo "  - API Docs: http://localhost:5000/swagger"
echo "  - pgAdmin: http://localhost:8080 (admin@by.local / admin123)"
echo "  - Redis Commander: http://localhost:8081"
echo "  - Database: localhost:5432 (by_user / by_password_dev)"
echo ""
echo "?? Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart API: docker-compose restart api"
echo "  - Database shell: docker-compose exec database psql -U by_user -d by_development"
echo ""