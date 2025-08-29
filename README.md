# BY - Behavioral Accountability App

## ?? Vision
**BY** is a cross-platform accountability app that helps users achieve their self-improvement goals through monetary commitment and community support. Users stake real money on their commitments, creating powerful psychological incentives to follow through on their personal development goals.

## ?? Platform Support
- **Web Application** (Admin & User Interface)
- **Android Mobile App**
- **iOS Mobile App** (Future)

## ??? Architecture Overview
- **Backend**: .NET Core API
- **Database**: SQL Server / PostgreSQL
- **Containerization**: Docker
- **Mobile**: React Native / Flutter (TBD)
- **Web Frontend**: React/Angular (Admin Panel)

## ?? Documentation Structure
- [?? App Concept & Features](Docs/app-concept.md)
- [?? User Experience Design](Docs/user-experience.md)
- [?? Technical Architecture](Docs/technical-architecture.md)
- [?? Development Roadmap](Docs/development-roadmap.md)
- [?? Monetization Strategy](Docs/monetization.md)
- [?? API Documentation](Docs/api-documentation.md)

## ?? Docker Development Environment

**Recommended approach for consistent, automated development workflow**

### Why Use Docker Development Scripts?

- **?? Consistency**: Same environment across Windows, macOS, and Linux
- **? Automation**: One command handles building, starting, migrations, and health checks
- **?? Developer Tools**: Built-in database management, logging, testing, and debugging
- **?? Easy Cleanup**: Simple environment reset and cleanup commands
- **?? Monitoring**: Health checks and status monitoring built-in

### Quick Start with Development Scripts

**1. Clone and Setup:**
```bash
git clone https://github.com/jurzon/by.git
cd by
```

**2. Start Development Environment:**

**Windows:**
```cmd
Scripts\dev.cmd up
```

**Linux/macOS:**
```bash
chmod +x Scripts/dev.sh
Scripts/dev.sh up
```

**3. Access Your Application:**
- ?? **API**: http://localhost:5185
- ?? **Health Check**: http://localhost:5185/health  
- ??? **pgAdmin**: http://localhost:8080 (admin@by.local / admin123)

### Essential Development Commands

| Command | Windows | Linux/macOS | Purpose |
|---------|---------|-------------|---------|
| **Start** | `Scripts\dev.cmd up` | `Scripts/dev.sh up` | Start all services with auto-setup |
| **Stop** | `Scripts\dev.cmd down` | `Scripts/dev.sh down` | Stop all services |
| **Logs** | `Scripts\dev.cmd logs api` | `Scripts/dev.sh logs api` | View real-time logs |
| **Status** | `Scripts\dev.cmd status` | `Scripts/dev.sh status` | Check service health |
| **Tests** | `Scripts\dev.cmd test` | `Scripts/dev.sh test` | Run test suite |
| **Shell** | `Scripts\dev.cmd shell` | `Scripts/dev.sh shell` | Open API container shell |
| **Clean** | `Scripts\dev.cmd clean` | `Scripts/dev.sh clean` | Reset environment |

### ?? Detailed Documentation

For complete setup, troubleshooting, and advanced usage, see [Docker-README.md](Docker-README.md).

## ?? Alternative Quick Start (Manual)
```bash
# Clone the repository
git clone https://github.com/jurzon/by.git
cd by

# Run with Docker (manual)
docker-compose up -d

# Or run backend locally
cd Backend
dotnet run
```

## ?? Contributing
This project is in early development. Please refer to our development roadmap for current priorities.

## ?? License
[License information to be added]