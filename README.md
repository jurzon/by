# BY - Behavioral Accountability App

## 🚀 Vision
**BY** is a cross-platform accountability app that helps users achieve their self-improvement goals through monetary commitment and community support. Users stake real money on their commitments, creating powerful psychological incentives to follow through on their personal development goals.

## 🌐 Platform Support
- **Web Application** (Admin & User Interface)
- **Android Mobile App**
- **iOS Mobile App** (Future)

## 📊 Architecture Overview
- **Backend**: .NET Core API
- **Database**: SQL Server / PostgreSQL
- **Containerization**: Docker
- **Mobile**: React Native / Flutter (TBD)
- **Web Frontend**: React/Angular (Admin Panel)

## 📚 Documentation Structure
- [📚 App Concept & Features](Docs/app-concept.md)
- [📚 User Experience Design](Docs/user-experience.md)
- [📚 Technical Architecture](Docs/technical-architecture.md)
- [📚 Development Roadmap](Docs/development-roadmap.md)
- [📚 Monetization Strategy](Docs/monetization.md)
- [📚 API Documentation](Docs/api-documentation.md)

## 🏃 Quick Start
```bash
# Clone the repository
git clone https://github.com/jurzon/by.git
cd by

# Run with Docker
docker-compose up -d

# Or run backend locally
cd Backend
dotnet run
```

## 🛠️ Development Scripts Guide

The `Scripts` folder contains helper scripts for managing the development environment:

### Windows
Use `Scripts\dev.cmd` for common development tasks:
```cmd
Scripts\dev.cmd up        # Start development environment (Docker)
Scripts\dev.cmd down      # Stop development environment
Scripts\dev.cmd clean     # Remove containers, volumes, and data (DANGEROUS)
Scripts\dev.cmd logs api  # View logs for API service
Scripts\dev.cmd migrate   # Run database migrations
Scripts\dev.cmd reset-db  # Reset the database (WARNING: deletes all data)
Scripts\dev.cmd test      # Run backend tests
Scripts\dev.cmd status    # Show environment status
Scripts\dev.cmd shell     # Open shell in API container
```

You can also use `Scripts\dev-setup.bat` to initialize the environment and create the `.env` file from template.

### Linux/macOS
Use `Scripts/dev.sh` for the same tasks:
```bash
./Scripts/dev.sh up        # Start development environment (Docker)
./Scripts/dev.sh down      # Stop development environment
./Scripts/dev.sh clean     # Remove containers, volumes, and data (DANGEROUS)
./Scripts/dev.sh logs api  # View logs for API service
./Scripts/dev.sh migrate   # Run database migrations
./Scripts/dev.sh reset-db  # Reset the database (WARNING: deletes all data)
./Scripts/dev.sh test      # Run backend tests
./Scripts/dev.sh status    # Show environment status
./Scripts/dev.sh shell     # Open shell in API container
```

You can also use `Scripts/dev-setup.sh` to initialize the environment and create the `.env` file from template.

### Database Initialization
- `Scripts/init-db.sql`: SQL script for initial database setup (used internally by migrations).

## 💻 Starting the Frontend

To start the frontend React application:
```bash
cd Frontend
npm install
npm run dev
```
This will launch the frontend at [http://localhost:3000](http://localhost:3000).

## 🔐 Test Login Credentials

The system automatically seeds test users when the database is first initialized. Use these credentials for testing:

### 👤 **Test User Account**
- **Email**: `test@example.com`
- **Password**: `Test123!`
- **Features**: Standard user with pre-configured sample goal ("Daily Exercise")

### 👑 **Admin Account**
- **Email**: `admin@byapp.com`
- **Password**: `Admin123!`
- **Features**: Administrator access with full system privileges

### 🧪 **What You Can Test**
After logging in, you can explore:
- ✅ **3-Button Check-in System** (Yes/No/Remind Later)
- 📊 **Dashboard with goal tracking**
- 💳 **Payment integration (Stripe)**
- 🎯 **Goal management and creation**
- 📈 **Progress visualization and streaks**

## 💻 Contributing
This project is in early development. Please refer to our development roadmap for current priorities.

## 📚 License
[License information to be added]