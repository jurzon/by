# BY - Behavioral Accountability App

BY is a .NET 9.0 Web API backend with React Native + Expo (SDK 50) mobile app and React frontend for behavioral accountability tracking. Users bet on themselves to achieve goals with monetary stakes.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap Environment - NEVER CANCEL: Total time ~45 minutes
Execute these commands in order. Each step includes measured timing and "NEVER CANCEL" warnings:

```bash
# 1. Install .NET 9.0 SDK (if not available) - 2-3 minutes
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --version 9.0.101
export PATH="$HOME/.dotnet:$PATH"

# 2. Install frontend dependencies - 15 seconds. NEVER CANCEL.
cd Frontend && npm install && cd ..

# 3. Install mobile app dependencies - 60 seconds. NEVER CANCEL.
cd MobileApp && npm install --legacy-peer-deps && cd ..

# 4. Start Docker services (PostgreSQL + Redis) - 30 seconds. NEVER CANCEL.
docker compose up postgres redis -d

# 5. Build backend - 25 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
cd Backend && dotnet build && cd ..

# 6. Build frontend (optional validation) - 3 seconds. NEVER CANCEL.
cd Frontend && npm run build && cd ..
```

### Run Development Environment
Always run the bootstrap steps first before starting development.

**Option 1: Docker (Preferred for complete environment)**
```bash
# NEVER CANCEL: Takes 2-5 minutes total. Set timeout to 10+ minutes.
Scripts/dev.sh up

# Services will be available at:
# - API: http://localhost:5186
# - pgAdmin: http://localhost:8082 (admin@by.local / admin123)
# - PostgreSQL: localhost:5433
# - Redis: localhost:6380
```

**Option 2: Local Development (Backend + Docker databases)**
```bash
# 1. Start databases only - 30 seconds. NEVER CANCEL.
docker compose up postgres redis -d

# 2. Run API locally - starts in 5 seconds
cd Backend/BY.API
export PATH="$HOME/.dotnet:$PATH"
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5433;Database=by_development;Username=by_user;Password=by_password_dev"
export JWT__SecretKey="your-super-secret-jwt-key-for-development-minimum-32-characters-long"
export JWT__Issuer="BY_API"
export JWT__Audience="BY_Frontend"
dotnet run --no-build

# 3. Run Frontend (in new terminal)
cd Frontend && npm run dev

# 4. Run Mobile App (in new terminal) - Expo SDK 50
cd MobileApp && npm run web
```

### Mobile App Development (React Native + Expo SDK 50)
```bash
# Primary development method
cd MobileApp
npm run web              # Web version (fastest for development)

# Mobile testing
npm run android          # Android emulator or Expo Go app
npm run ios             # iOS simulator or Expo Go app (Mac only)
npm start               # Start with QR code for device testing

# Dependencies management
npm install --legacy-peer-deps  # Install with legacy peer deps for compatibility
```

### Testing
```bash
# Unit tests - 3 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
cd Backend && dotnet test --no-build

# Integration tests via Docker
Scripts/dev.sh test

# Mobile app type checking
cd MobileApp && npm run type-check
```

## Validation Scenarios

### CRITICAL: Manual Validation Steps
After making changes, ALWAYS test these scenarios:

1. **API Health Check**
   ```bash
   curl http://localhost:5185/swagger/index.html  # Should return Swagger UI HTML
   ```
   Note: API must be running first. If connection fails, ensure API started successfully.

2. **Database Connection**
   - API logs should show successful database initialization
   - Look for "Database seeding completed successfully" or "Database already contains data"

3. **Frontend Loading**
   ```bash
   curl http://localhost:3000/  # Should return React app HTML with "BY - Bet on Yourself" title
   ```
   Note: Frontend dev server must be running first.

4. **Mobile App Loading (Primary)**
   ```bash
   curl http://localhost:19006/  # Should return Expo web app
   ```
   Note: Mobile app dev server must be running first.

5. **User Authentication Flow**
   - Test users are seeded automatically:
   - Admin: admin@byapp.com / Admin123!
   - Test: test@example.com / Test123!

## Build Timing and Critical Warnings

### NEVER CANCEL Commands with Timeouts
Based on validated measurements:
- **Backend build**: 7-25 seconds normally, use 60+ minute timeout
- **Frontend npm install**: 6-15 seconds normally, use 30+ minute timeout
- **Mobile app npm install**: 30-90 seconds normally, use 30+ minute timeout (--legacy-peer-deps required)
- **Docker environment startup**: 30 seconds-5 minutes normally, use 10+ minute timeout
- **Database migrations**: 5-10 seconds normally, use 30+ minute timeout
- **Tests**: 3 seconds normally, use 30+ minute timeout
- **Frontend dev server**: 200-300ms startup, use 30+ second timeout
- **Mobile app dev server**: 5-15 seconds startup, use 60+ second timeout

### Docker Issues and Workarounds
- **SSL Certificate Issues**: If Docker build fails with NuGet SSL errors, use local .NET build instead
- **Port Conflicts**: Uses non-standard ports (5433 for PostgreSQL, 6380 for Redis)
- **Version Warning**: Ignore "version attribute is obsolete" warning in docker-compose.yml

## Key Technologies and Requirements

### Backend (.NET 9.0)
- **Required SDK**: .NET 9.0.101 or later
- **Database**: PostgreSQL 16
- **Architecture**: Clean Architecture (BY.API, BY.Core, BY.Infrastructure, BY.Tests)
- **Testing**: xUnit with FluentAssertions
- **Authentication**: JWT Bearer tokens

### Mobile App (React Native + Expo SDK 50)
- **Runtime**: Node.js 18+
- **Framework**: React Native 0.73.6 with Expo SDK 50
- **TypeScript**: Full TypeScript support
- **Navigation**: React Navigation 6.x
- **State Management**: Zustand
- **Storage**: Expo SecureStore (native) / AsyncStorage (web)
- **Dependencies**: Install with --legacy-peer-deps flag

### Legacy Frontend (React + TypeScript)
- **Runtime**: Node.js 20+
- **Build Tool**: Vite 4.x
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand

### Database Configuration
- **Development DB**: PostgreSQL on localhost:5433
- **Username**: by_user
- **Password**: by_password_dev  
- **Database**: by_development
- **Redis Cache**: localhost:6380

## Project Structure

```
Backend/
├── BY.API/           # Web API controllers and configuration
├── BY.Core/          # Domain models and interfaces  
├── BY.Infrastructure/ # Data access and external services
├── BY.Tests/         # Unit and integration tests
└── BY.sln           # Solution file

MobileApp/            # React Native + Expo SDK 50 (Primary User App)
├── src/
│   ├── screens/      # Mobile screens (Login, Dashboard, CheckIn)
│   ├── services/     # API integration services
│   ├── store/        # State management (Zustand)
│   ├── components/   # UI components
│   ├── constants/    # Configuration & theming
│   └── types/        # TypeScript definitions
├── package.json      # Expo SDK 50 dependencies
└── app.json         # Expo configuration

Frontend/             # Legacy React Web (Admin Panel)
├── src/             # React application source
├── package.json     # Node.js dependencies
├── vite.config.ts   # Vite build configuration
└── tsconfig.json    # TypeScript configuration

Scripts/
├── dev.sh          # Linux/macOS development commands
└── dev.cmd         # Windows development commands
```

## Development Scripts

### Linux/macOS Commands (Scripts/dev.sh)
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

## Common Issues and Solutions

### Build Failures
- **"Cannot target .NET 9.0"**: Install .NET 9.0 SDK using the bootstrap commands above
- **NuGet SSL errors in Docker**: Use local .NET build instead of Docker build
- **Missing frontend config files**: Files created automatically during setup (tsconfig.json, vite.config.ts, etc.)
- **Frontend TypeScript errors**: Build may fail with 7 TypeScript errors related to unused imports and missing types. This is expected in the current codebase state and does not prevent the development server from running with `npm run dev`
- **Mobile app peer dependency errors**: Always use `npm install --legacy-peer-deps` for MobileApp

### Mobile App Issues
- **Expo Go compatibility**: Currently using SDK 50, upgrade to SDK 53 recommended for latest Expo Go
- **Peer dependency conflicts**: Use --legacy-peer-deps flag for React Native ecosystem
- **Platform-specific issues**: Test on web first (npm run web), then mobile devices
- **Asset loading**: Ensure all required assets are in assets/ folder
- **Emoji display**: Use UTF-8 encoding and avoid complex unicode characters

### Database Issues
- **Connection failures**: Ensure Docker PostgreSQL is running on port 5433
- **Migration errors**: Run `Scripts/dev.sh migrate` or restart environment

### Port Conflicts
- API: Default 5185 (local) or 5186 (Docker)
- Legacy Frontend: 3000
- Mobile App (Web): 19006
- PostgreSQL: 5433 (not standard 5432)
- Redis: 6380 (not standard 6379)
- pgAdmin: 8082 (not standard 8080)

## Frequently Referenced Information

### Test User Credentials
```
Admin User: admin@byapp.com / Admin123!
Test User:  test@example.com / Test123!
```

### Service URLs (Docker environment)
```
API:         http://localhost:5186
API Docs:    http://localhost:5186/swagger
Frontend:    http://localhost:3000
Mobile App:  http://localhost:19006
pgAdmin:     http://localhost:8082
PostgreSQL:  localhost:5433
Redis:       localhost:6380
```

### Key Environment Variables
```bash
ConnectionStrings__DefaultConnection="Host=localhost;Port=5433;Database=by_development;Username=by_user;Password=by_password_dev"
JWT__SecretKey="your-super-secret-jwt-key-for-development-minimum-32-characters-long"  
JWT__Issuer="BY_API"
JWT__Audience="BY_Frontend"
```

## Quality Checks

Always run before committing changes:
1. Backend build: `cd Backend && dotnet build`
2. Backend tests: `cd Backend && dotnet test --no-build` 
3. Frontend build: `cd Frontend && npm run build`
4. Frontend linting: `cd Frontend && npm run lint`
5. Mobile app type check: `cd MobileApp && npm run type-check`
6. Manual validation scenarios (see above)

The application focuses on behavioral accountability where users create goals with monetary stakes. Core features include goal tracking, check-ins, payment processing via Stripe, and community features for accountability partnerships. The mobile-first approach uses React Native + Expo SDK 50 for cross-platform compatibility.