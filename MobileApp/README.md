# BY Mobile App - React Native with Expo

This is the React Native + Expo version of the BY (Bet on Yourself) accountability app that can target web, iOS, and Android platforms from a single codebase.

## Project Structure

```
MobileApp/
??? App.tsx                 # Main app component with navigation
??? app.json               # Expo configuration
??? babel.config.js        # Babel configuration
??? package.json           # Dependencies and scripts
??? tsconfig.json          # TypeScript configuration
??? assets/                # Static assets (icons, images)
??? src/
    ??? components/        # Reusable UI components
    ?   ??? Button.tsx     # Custom button component
    ??? constants/         # App constants and configuration
    ?   ??? config.ts      # App configuration
    ?   ??? theme.ts       # Design system (colors, spacing, etc.)
    ??? screens/           # Screen components
    ?   ??? auth/
    ?   ?   ??? LoginScreen.tsx
    ?   ??? DashboardScreen.tsx
    ?   ??? CheckInScreen.tsx
    ??? services/          # API services
    ?   ??? apiClient.ts   # HTTP client with auth
    ?   ??? authService.ts # Authentication service
    ?   ??? goalService.ts # Goal management service
    ??? store/             # State management (Zustand)
    ?   ??? authStore.ts   # Authentication state
    ?   ??? goalStore.ts   # Goal management state
    ??? types/             # TypeScript type definitions
    ?   ??? index.ts       # All app types
    ??? utils/             # Utility functions
        ??? storage.ts     # Cross-platform storage
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. Install dependencies:
```bash
cd MobileApp
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platforms:
```bash
# Web
npm run web

# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android
```

### Configuration

Update the API URL in `src/constants/config.ts`:

```typescript
// For development - replace with your computer's IP address
const API_URL = 'http://192.168.1.100:5185'; // Your backend IP

// For production
const API_URL = 'https://your-api-domain.com';
```

## Features Implemented

### Authentication
- ? Login screen with form validation
- ? Secure token storage (SecureStore for native, AsyncStorage for web)
- ? Automatic token refresh
- ? Auth state management with Zustand

### Goals Management
- ? Dashboard with active goals
- ? Goal creation, update, delete operations
- ? Goal statistics and progress tracking
- ? Pause/resume functionality

### Check-ins
- ? Daily check-in screen
- ? 3-button system (Yes/No/Remind Later) - simplified to Yes/No for now
- ? Check-in history tracking
- ? Streak counting

### Cross-Platform Support
- ? Web support via React Native Web
- ? iOS support via Expo
- ? Android support via Expo
- ? Responsive design system
- ? Platform-specific storage (SecureStore/AsyncStorage)

## Architecture

### State Management
Uses Zustand for lightweight, TypeScript-friendly state management:
- `authStore`: User authentication and profile
- `goalStore`: Goal management and check-ins

### API Integration
- Axios-based HTTP client with interceptors
- Automatic token attachment
- Error handling and retry logic
- Response transformation

### Navigation
React Navigation v6 with:
- Stack Navigator for auth flow
- Tab Navigator for main app
- Type-safe navigation with TypeScript

### Styling
Custom design system with:
- Consistent color palette
- Typography scale
- Spacing system
- Shadow utilities
- Component variants

## Backend Integration

The app connects to the existing .NET 9.0 Web API backend:

### Endpoints Used
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/goals` - Fetch user goals
- `GET /api/v1/goals/active` - Fetch active goals
- `POST /api/v1/goals` - Create new goal
- `PUT /api/v1/goals/{id}` - Update goal
- `DELETE /api/v1/goals/{id}` - Delete goal
- `POST /api/v1/goals/{id}/checkin` - Record check-in
- `GET /api/v1/goals/{id}/checkins` - Get check-in history

### Data Models
All TypeScript interfaces match the backend DTOs exactly:
- `Goal`, `CreateGoalRequest`, `UpdateGoalRequest`
- `CheckInRequest`, `CheckInResponse`
- `User`, `AuthResponse`
- Enums: `GoalStatus`, `GoalCategory`, `UserRole`

## Next Steps

### Immediate Priorities
1. **Registration Screen** - Complete user registration flow
2. **Goal Creation** - Full goal creation form
3. **Goal Details** - Individual goal view with actions
4. **Profile Screen** - User profile and settings
5. **Notifications** - Push notifications for reminders

### Enhancements
1. **Offline Support** - Cache data for offline usage
2. **Biometric Auth** - Fingerprint/Face ID authentication
3. **Dark Mode** - Theme switching support
4. **Animations** - Smooth transitions and micro-interactions
5. **Social Features** - Goal sharing and accountability partners

### Platform-Specific Features
1. **iOS**: 
   - Widget support for goal tracking
   - Siri Shortcuts for quick check-ins
   - iOS-specific notifications

2. **Android**:
   - Android widgets
   - Deep linking support
   - Android-specific notifications

3. **Web**:
   - PWA capabilities
   - Desktop-optimized layouts
   - Keyboard shortcuts

## Building for Production

### Web
```bash
npm run build:web
```

### Mobile (using EAS)
```bash
# Setup EAS (one time)
npm install -g eas-cli
eas login

# Build for stores
npm run build:ios
npm run build:android
```

## Testing

The project structure is ready for testing with:
- Jest for unit tests
- React Native Testing Library for component tests
- Detox for E2E tests (future)

This mobile app provides a complete cross-platform solution that leverages your existing .NET backend while delivering native mobile experiences on iOS and Android, plus web support.