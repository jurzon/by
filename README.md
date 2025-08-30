# BY - Behavioral Accountability App

## 🚀 Vision
**BY** is a cross-platform accountability app that helps users achieve their self-improvement goals through monetary commitment and community support. Users stake real money on their commitments, creating powerful psychological incentives to follow through on their personal development goals.

## 🌐 Platform Support
- **Web Application** (React Native Web)
- **Android Mobile App** (React Native + Expo)
- **iOS Mobile App** (React Native + Expo)
- **Admin Interface** (React Web - Legacy Frontend)

## 📊 Architecture Overview
- **Backend**: .NET 9.0 Core API
- **Database**: PostgreSQL / SQL Server
- **Mobile & Web**: React Native + Expo (Universal Platform)
- **Legacy Web Frontend**: React + TypeScript + Vite (Admin Panel)
- **Containerization**: Docker

## 🏃 Complete Setup Guide (Step-by-Step)

### Prerequisites
- **Docker Desktop** installed and running
- **Node.js 18+** installed
- **Git** for cloning repository
- **Expo CLI**: `npm install -g @expo/cli`

### 🚀 Option 1: Quick Start with Docker (Recommended)

#### Step 1: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/jurzon/by.git
cd by

# Windows: Complete environment setup
Scripts\dev-setup.bat

# Linux/macOS: Complete environment setup
chmod +x Scripts/dev-setup.sh
./Scripts/dev-setup.sh
```

#### Step 2: Start All Services
```bash
# Windows
Scripts\dev.cmd up

# Linux/macOS  
./Scripts/dev.sh up
```

**⏱️ Wait 2-5 minutes for all services to start**

#### Step 3: Access Applications
After startup, you'll have:
- 🌐 **API**: http://localhost:5186
- 📋 **API Docs**: http://localhost:5186/swagger  
- 💻 **Admin Panel**: http://localhost:3000
- 🛠️ **pgAdmin**: http://localhost:8082 (admin@by.local / admin123)

### 📱 Step 4: Start Mobile App (React Native + Expo)

#### 4.1 Navigate to Mobile App
```bash
cd MobileApp
```

#### 4.2 Install Dependencies (First Time Only)
```bash
npm install --legacy-peer-deps
```

#### 4.3 Start Expo Development Server
```bash
npm start
```

#### 4.4 Launch Mobile App (Choose Platform)
**🌐 Web (Recommended for Development):**
```bash
npm run web
# OR press 'w' in Expo CLI
# Opens automatically at http://localhost:19006
```

**📱 Mobile Devices:**
- **Android**: Press `a` (requires Android emulator or scan QR code with Expo Go)
- **🍎 iOS**: Press `i` (requires iOS simulator - Mac only, or scan QR code)
- **📲 Physical Device**: Download Expo Go app and scan QR code

---

### 🚀 Option 2: Local Development (Backend + Docker Databases)

If you prefer running the backend locally:

#### Step 1: Start Databases Only
```bash
docker compose up postgres redis -d
```

#### Step 2: Start Backend API
```bash
cd Backend/BY.API

# Windows (PowerShell)
$env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5433;Database=by_development;Username=by_user;Password=by_password_dev"
$env:JWT__SecretKey="your-super-secret-jwt-key-for-development-minimum-32-characters-long"
$env:JWT__Issuer="BY_API"
$env:JWT__Audience="BY_Frontend"
dotnet run

# Linux/macOS
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5433;Database=by_development;Username=by_user;Password=by_password_dev"
export JWT__SecretKey="your-super-secret-jwt-key-for-development-minimum-32-characters-long"
export JWT__Issuer="BY_API"
export JWT__Audience="BY_Frontend"
dotnet run
```

**✅ Backend will be available at: http://localhost:5185**

#### Step 3: Start Frontend Applications
```bash
# Mobile App (Primary - new terminal)
cd MobileApp
npm install --legacy-peer-deps
npm run web
# Mobile app opens at: http://localhost:19006

# Legacy Admin Panel (new terminal)
cd Frontend
npm install
npm run dev
# Admin panel opens at: http://localhost:3000
```

---

## 🔐 Login Instructions (Step-by-Step)

### 📱 Mobile App Login (React Native + Expo)

#### Step 1: Access the Mobile App Web Version
```bash
cd MobileApp
npm run web
# Automatically opens http://localhost:19006 in your browser
```

#### Step 2: Login Screen Experience
You'll see a clean, mobile-optimized login interface with:
- **Pre-filled email**: `test@example.com`
- **Password field**: Enter `Test123!`
- **Mobile-responsive design**: Works perfectly in browser and mobile devices

#### Step 3: Available Test Accounts

**👤 Standard User (Recommended for Testing)**
- **Email**: `test@example.com`
- **Password**: `Test123!`
- **Features**: Pre-configured with sample goals for daily check-ins

**👑 Admin User**
- **Email**: `admin@byapp.com`
- **Password**: `Admin123!`
- **Features**: Full administrative access

#### Step 4: After Successful Login
You'll see the **Daily Check-In** screen featuring:
- ✅ **Multiple active goals** with individual tracking
- ✅ **Simple Yes/No buttons**: "Yes, I did it" (green) / "No, I missed it" (red)
- ✅ **Goal streaks**: Current streak and daily stake tracking
- ✅ **Progress visualization**: Clean, mobile-first interface
- ✅ **Bottom navigation**: Dashboard, Check In, Goals, Profile tabs

### 💻 Legacy Admin Panel Login

#### Step 1: Access Admin Interface
Visit: http://localhost:3000

#### Step 2: Login Process
- Use the same credentials as above
- Access full admin features including:
  - 🎯 Advanced goal management
  - 📊 Detailed analytics with charts
  - 💳 Payment integration (Stripe)
  - 👥 User management and administration
  - 🔧 System configuration

---

## 🛠️ Development Scripts Reference

### Windows Commands
```cmd
Scripts\dev.cmd up        # Start all services (Docker)
Scripts\dev.cmd down      # Stop all services
Scripts\dev.cmd logs api  # View API logs
Scripts\dev.cmd status    # Check service status
Scripts\dev.cmd migrate   # Run database migrations
Scripts\dev.cmd test      # Run backend tests
Scripts\dev.cmd clean     # Clean environment (⚠️ REMOVES DATA)
Scripts\dev.cmd help      # Show all commands
```

### Linux/macOS Commands
```bash
./Scripts/dev.sh up        # Start all services (Docker)
./Scripts/dev.sh down      # Stop all services  
./Scripts/dev.sh logs api  # View API logs
./Scripts/dev.sh status    # Check service status
./Scripts/dev.sh migrate   # Run database migrations
./Scripts/dev.sh test      # Run backend tests
./Scripts/dev.sh clean     # Clean environment (⚠️ REMOVES DATA)
./Scripts/dev.sh help      # Show all commands
```

### Mobile App Commands
```bash
cd MobileApp

# Development (Recommended)
npm run web           # 🌐 Launch in web browser (primary development method)
npm start             # Start Expo dev server with QR code options
npm run android       # 📱 Launch on Android emulator/device
npm run ios           # 🍎 Launch on iOS simulator/device (Mac only)
npm run type-check    # Check TypeScript types

# Production builds (requires EAS setup)
npm run build:web     # Build for web deployment (PWA)
npm run build:android # Build Android APK/AAB
npm run build:ios     # Build iOS IPA (Mac only)
```

---

## 🔧 Service URLs & Configuration

### Docker Environment (Scripts\dev.cmd up)
```
🌐 Backend API:        http://localhost:5186
📋 API Documentation:  http://localhost:5186/swagger
💻 Admin Panel:        http://localhost:3000
📱 Mobile App (Web):   http://localhost:19006
🛠️ pgAdmin:           http://localhost:8082
🗄️ PostgreSQL:        localhost:5433
📦 Redis:              localhost:6380
```

### Local Development Environment
```
🌐 Backend API:        http://localhost:5185
📋 API Documentation:  http://localhost:5185/swagger
💻 Admin Panel:        http://localhost:3000
📱 Mobile App (Web):   http://localhost:19006
🗄️ PostgreSQL:        localhost:5433 (Docker)
📦 Redis:              localhost:6380 (Docker)
```

### Mobile App API Configuration
Edit `MobileApp/src/constants/config.ts`:

```typescript
// For Docker environment
const API_URL = 'http://localhost:5186';

// For local development  
const API_URL = 'http://localhost:5185';

// For mobile device testing (replace with your IP)
const API_URL = 'http://192.168.1.XXX:5185';
```

---

## 🧪 Testing Your Setup

### Verify Everything is Working

#### 1. Check API Health
```bash
# Local development
curl http://localhost:5185/health

# Docker environment  
curl http://localhost:5186/health
```

#### 2. Test Database Connection
- API logs should show: "Database seeding completed successfully"
- Or visit pgAdmin at http://localhost:8082

#### 3. Test Mobile App Login (Primary Method)
```bash
cd MobileApp
npm run web
# Browser opens automatically to http://localhost:19006
```

**Expected Experience:**
1. Login screen appears with `test@example.com` pre-filled
2. Enter password: `Test123!`
3. Click "Sign In"
4. Redirected to **Daily Check-In** screen with:
   - ✅ Multiple goal tracking cards
   - ✅ "Yes, I did it" (green) / "No, I missed it" (red) buttons
   - ✅ Goal streaks and progress tracking
   - ✅ Clean mobile-first UI design

#### 4. Test Admin Panel Login  
1. Access admin panel: http://localhost:3000
2. Use same credentials: `test@example.com` / `Test123!`
3. Access advanced features and analytics

---

## 📱 Mobile App Features

### Cross-Platform Support
- ✅ **Web**: Runs perfectly in any modern browser (primary development platform)
- ✅ **Android**: Via Expo Go app or standalone build
- ✅ **iOS**: Via Expo Go app or App Store build (Mac required for development)

### Key Features (Visible in Screenshot)
- ✅ **Daily Check-In System**: Simple Yes/No tracking for accountability goals
- ✅ **Multiple Goal Support**: Track several goals simultaneously 
- ✅ **Streak Tracking**: Current streak display with daily stake amounts
- ✅ **Goal Progress**: Visual cards showing current status and streaks
- ✅ **Mobile-First UI**: Clean, touch-friendly interface
- ✅ **Real-time Updates**: Instant feedback on check-in actions

### Technical Features
- ✅ **Secure Authentication**: JWT tokens with automatic refresh
- ✅ **Goal Management**: Create, track, and manage accountability goals
- ✅ **Financial Tracking**: Stake management and payment history
- ✅ **Progress Analytics**: Success rates, streaks, and statistics
- ✅ **Cross-platform Storage**: SecureStore (native) / AsyncStorage (web)
- ✅ **Offline-Ready**: Graceful handling of network issues

### Enhanced Mobile Services
The mobile app includes enterprise-grade services:
- 🔐 **AuthService**: Login, registration, token management
- 🎯 **GoalService**: Goal CRUD operations and statistics
- ✅ **CheckInService**: Daily check-ins with 3-button system
- 👤 **UserService**: Profile management and user analytics
- 💰 **PaymentService**: Financial tracking and stake processing

---

## 🔐 Test User Accounts

The system automatically seeds test users on first startup:

### 👤 **Standard User Account**
- **Email**: `test@example.com`
- **Password**: `Test123!`
- **Pre-configured with**: Multiple sample goals including "Do homework each day", "uhuaf", "dhsf", "fly", "run 3k"
- **Use for**: Testing user features, daily check-ins, goal tracking with financial stakes

### 👑 **Administrator Account**  
- **Email**: `admin@byapp.com`
- **Password**: `Admin123!`
- **Full Access**: System administration, user management
- **Use for**: Admin panel testing, advanced features

---

## 🚨 Troubleshooting Common Issues

### Mobile App Won't Start
```bash
# Clear cache and reinstall
cd MobileApp
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run web  # Use web version for fastest development
```

### API Connection Refused
- ✅ **Check if backend is running**: Visit http://localhost:5185 or http://localhost:5186
- ✅ **Verify databases**: `docker ps` should show postgres and redis containers
- ✅ **Check ports**: Ensure no conflicts on ports 5185/5186

### Login Network Error
1. **Start with web version**: `npm run web` for easiest testing
2. **Verify API URL** in mobile app config
3. **For mobile devices**: Use your computer's IP address instead of localhost
4. **Check browser console** for specific error details

### Docker Issues
```bash
# Reset entire environment
Scripts\dev.cmd clean  # ⚠️ This removes all data
Scripts\dev.cmd up     # Fresh start
```

### Missing Dependencies
```bash
# Install/update all dependencies
cd Frontend && npm install
cd ../MobileApp && npm install --legacy-peer-deps
cd ../Backend && dotnet restore
```

---

## 💡 Development Workflow

### Daily Development Routine
1. **Start Environment**: `Scripts\dev.cmd up` (wait 2-5 minutes)
2. **Start Mobile App**: `cd MobileApp && npm run web` (fastest for development)
3. **Test Login**: Use `test@example.com` / `Test123!`
4. **Development**: Make changes and test in browser, then mobile devices
5. **Stop Environment**: `Scripts\dev.cmd down` when done

### Testing Across Platforms
1. **🌐 Web Development**: `npm run web` (fastest, best for development)
2. **📱 Android Testing**: `npm run android` or scan QR code with Expo Go
3. **🍎 iOS Testing**: `npm run ios` (Mac only) or scan QR code with Expo Go
4. **💻 Admin Features**: Visit http://localhost:3000

---

## 📚 Documentation Structure
- [📚 App Concept & Features](Docs/app-concept.md)
- [📚 User Experience Design](Docs/user-experience.md)
- [📚 Technical Architecture](Docs/technical-architecture.md)
- [📚 Development Roadmap](Docs/development-roadmap.md)
- [📚 Monetization Strategy](Docs/monetization.md)
- [📚 API Documentation](Docs/api-documentation.md)

## 🚀 Deployment Options

### Mobile App Deployment
```bash
# Web deployment (PWA)
cd MobileApp && npm run build:web

# App Store deployment (requires EAS setup)
cd MobileApp && npm run build:ios

# Google Play deployment (requires EAS setup)
cd MobileApp && npm run build:android
```

### Backend & Admin Deployment
```bash
# Admin panel deployment
cd Frontend && npm run build

# API deployment (Docker)
docker build -t by-api ./Backend
```

---

## 💻 Contributing
This project is in early development with a mobile-first approach using React Native + Expo for cross-platform compatibility.

### Development Stack
- **Backend**: .NET 9.0 Core API with Clean Architecture
- **Mobile**: React Native + Expo (Web, iOS, Android)
- **Admin**: React + TypeScript + Vite  
- **Database**: PostgreSQL with Redis caching
- **State Management**: Zustand (both mobile and web)
- **Authentication**: JWT Bearer tokens with refresh

### Key Features Implemented
- ✅ **Cross-platform Authentication**
- ✅ **Goal Management with Financial Stakes**
- ✅ **Daily Check-in System (Yes/No buttons for accountability)**
- ✅ **Payment Processing (Stripe Integration)**
- ✅ **Progress Tracking and Analytics**
- ✅ **Admin Dashboard and User Management**

## 📚 License
[License information to be added]

---

## 🆘 Need Help?

### Quick Commands Reference
```bash
# Check if everything is running
Scripts\dev.cmd status

# View API logs
Scripts\dev.cmd logs api

# Reset database (⚠️ removes all data)
Scripts\dev.cmd reset-db

# Run backend tests
Scripts\dev.cmd test

# Emergency cleanup (⚠️ removes all data and containers)
Scripts\dev.cmd clean
```

### Common Success Indicators
- ✅ **API Health**: http://localhost:5186/health returns "Healthy"
- ✅ **Mobile App Login**: Login screen appears with test credentials
- ✅ **Daily Check-In Screen**: Shows multiple goals with Yes/No buttons
- ✅ **Database**: pgAdmin shows `by_development` database with tables
- ✅ **Seeded Data**: Login with `test@example.com` / `Test123!` works
- ✅ **Goal Tracking**: Daily check-in interface with streak counting

**🎯 Your accountability journey starts here - bet on yourself and achieve your goals!** 💪💰