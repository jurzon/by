# 🚀 BY Application - Docker Development Environment

This guide will help you set up and run the BY application using Docker for consistent development across different environments.

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Git** for cloning the repository
- **8GB+ RAM** recommended for smooth operation

### 🐳 Docker Desktop Installation
- **Windows/Mac**: Download from [docker.com](https://www.docker.com/products/docker-desktop)
- **Linux**: Follow [official Docker installation guide](https://docs.docker.com/engine/install/)

## 🏃 Quick Start

### 1️⃣ Clone and Navigate
```bash
git clone https://github.com/jurzon/by.git
cd by
```

### 2️⃣ Start Development Environment

**Windows:**
```cmd
Scripts\dev.cmd up
```

**macOS/Linux:**
```bash
chmod +x Scripts/dev.sh
Scripts/dev.sh up
```

### 3️⃣ Access Services
After startup (2-3 minutes), access:
- 🌐 **API**: http://localhost:5185
- ✅ **Health Check**: http://localhost:5185/health
- 🛠️ **pgAdmin**: http://localhost:8080 (admin@by.local / admin123)
- 🐘 **PostgreSQL**: localhost:5432
- 🔴 **Redis**: localhost:6379

## 🔧 Development Commands

### 🪟 Windows Commands
```cmd
Scripts\dev.cmd up        # Start all services
Scripts\dev.cmd down      # Stop all services  
Scripts\dev.cmd logs api  # View API logs
Scripts\dev.cmd status    # Check service status
Scripts\dev.cmd migrate   # Run database migrations
Scripts\dev.cmd test      # Run tests
Scripts\dev.cmd shell     # Open shell in API container
Scripts\dev.cmd clean     # Clean environment (removes data!)
```

### 🐧 Linux/macOS Commands
```bash
Scripts/dev.sh up        # Start all services
Scripts/dev.sh down      # Stop all services
Scripts/dev.sh logs api  # View API logs  
Scripts/dev.sh status    # Check service status
Scripts/dev.sh migrate   # Run database migrations
Scripts/dev.sh test      # Run tests
Scripts/dev.sh shell     # Open shell in API container
Scripts/dev.sh clean     # Clean environment (removes data!)
```

## 📊 Services Overview

| Service | Purpose | URL | Credentials |
|---------|---------|-----|-------------|
| **🚀 api** | BY API Application | http://localhost:5185 | JWT Authentication |
| **🐘 postgres** | PostgreSQL Database | localhost:5432 | by_user / by_password_dev |
| **🔴 redis** | Redis Cache | localhost:6379 | No auth (dev) |
| **🛠️ pgadmin** | Database Management | http://localhost:8080 | admin@by.local / admin123 |

## 💾 Database Management

### 🚀 First Time Setup
The database will be automatically initialized with:
- Required extensions (uuid-ossp, pgcrypto)
- Proper user permissions
- Development configuration

### 🔌 Access Database
```bash
# Via pgAdmin (GUI)
# Go to http://localhost:8080

# Via Command Line
docker-compose exec postgres psql -U by_user -d by_development

# View Entity Framework migrations
Scripts/dev.sh shell
dotnet ef migrations list
```

### 🔄 Reset Database
```bash
# WARNING: This deletes all data!
Scripts/dev.sh reset-db
```

## 🧪 Testing

### 🏃 Run All Tests
```bash
Scripts/dev.sh test
```

### 🎯 Run Specific Test Category
```bash
docker-compose exec api dotnet test --filter Category=Integration
docker-compose exec api dotnet test --filter Category=Unit
```

### 📊 Test with Coverage
```bash
docker-compose exec api dotnet test --collect:"XPlat Code Coverage"
```

## 📈 Monitoring & Debugging

### 📊 View Logs
```bash
# API logs (real-time)
Scripts/dev.sh logs api

# Database logs
Scripts/dev.sh logs postgres

# All services
docker-compose logs -f
```

### ✅ Health Checks
```bash
# Simple health check
curl http://localhost:5185/health

# Detailed health check
curl http://localhost:5185/health/detailed

# Service status
Scripts/dev.sh status
```

### 🔧 Debug API
```bash
# Open shell in API container
Scripts/dev.sh shell

# Run migrations manually
dotnet ef database update

# Check Entity Framework status
dotnet ef migrations list
```

## 🔐 Environment Variables

Development environment variables are configured in `docker-compose.yml`. For production, copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
# Edit .env with your production values
```

Key variables:
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET_KEY`: JWT signing key
- `STRIPE_SECRET_KEY`: Stripe integration key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

## 🛡️ Security Notes

### 💻 Development
- Uses default passwords (secure for local development)
- Database accessible on localhost:5432
- Sensitive data logging enabled

### 🚀 Production
- Change ALL default passwords
- Use environment variables for secrets
- Enable SSL/TLS
- Restrict database access
- Disable sensitive data logging

## ❓ Troubleshooting

### ❓ Common Issues

**🔌 Port Conflicts:**
```bash
# Check what's using port 5185
netstat -tulpn | grep 5185  # Linux/Mac
netstat -ano | findstr 5185  # Windows

# Stop conflicting services or change ports in docker-compose.yml
```

**🐘 Database Connection Issues:**
```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# View database logs
Scripts/dev.sh logs postgres

# Reset database
Scripts/dev.sh reset-db
```

**🚀 API Not Starting:**
```bash
# Check API logs
Scripts/dev.sh logs api

# Verify build completed successfully
docker-compose build api

# Check health endpoint
curl http://localhost:5185/health
```

**💾 Memory Issues:**
```bash
# Check Docker resource limits
docker system df

# Clean unused containers/images
docker system prune

# For more resources, clean everything
Scripts/dev.sh clean
```

### 🆘 Getting Help

1. **Check service status**: `Scripts/dev.sh status`
2. **View logs**: `Scripts/dev.sh logs api`
3. **Reset environment**: `Scripts/dev.sh clean && Scripts/dev.sh up`
4. **Update Docker**: Ensure Docker Desktop is latest version

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core in Docker](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)

## 💻 Development Workflow

### 🔄 Typical Development Session
```bash
# 1. Start environment
Scripts/dev.sh up

# 2. Check everything is healthy
Scripts/dev.sh status

# 3. Run tests to verify setup
Scripts/dev.sh test

# 4. Develop (code changes auto-reload in development)
# Make your changes...

# 5. View logs if needed
Scripts/dev.sh logs api

# 6. Stop when done
Scripts/dev.sh down
```

### 💾 Database Changes
```bash
# 1. Make Entity Framework changes
# 2. Create migration
Scripts/dev.sh shell
dotnet ef migrations add YourMigrationName

# 3. Apply migration
Scripts/dev.sh migrate
```

---

Happy coding! 🎉 The BY application Docker environment is ready for development.