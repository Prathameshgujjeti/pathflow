# HealthPath - Multi-Step Wellness Flow

HealthPath is a React Native mobile application built with Expo that guides users through a multi-step wellness onboarding flow. It features dynamic routing, offline-first state management, and Firebase integration.

## 🚀 Features

- **Multi-Step Flow**: 5 interactive steps (Age, Goals, Preferences, Notifications, Summary).
- **Conditional Routing**: Step 4 (Notifications) only appears if time-sensitive goals (e.g., Daily Exercise) are selected in Step 2.
- **Offline Resilience**: Progress is saved to `AsyncStorage` on every step. Users can resume exactly where they left off even after closing the app.
- **Firebase Integration**: Automatic background sync to Firestore for remote progress tracking.
- **Premium UI**: Dark-themed, modern design using HSL tailored colors and smooth transitions with `react-native-reanimated`.
- **Zero Vulnerabilities**: Secured using NPM overrides to patch nested dependency issues.

## 🛠️ Tech Stack

- **Framework**: Expo (SDK 55)
- **Language**: TypeScript
- **State Management**: React Context API + `useReducer`
- **Navigation**: React Navigation (Stack)
- **Backend**: Firebase Firestore
- **Persistence**: AsyncStorage
- **Animations**: React Native Reanimated

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd health-path
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start -c
   ```

## 📝 Important Notes

### Firebase Configuration
The project is pre-configured with a placeholder Firebase setup in `src/firebase/config.ts`. 
- **Offline Mode**: If no valid Firebase config is provided, the app will function perfectly in **offline mode**, relying on `AsyncStorage` for persistence.
- **Sync Mode**: To enable remote sync, replace the placeholder values in `src/firebase/config.ts` with your actual Firebase project credentials.

### NPM Overrides
This project uses the `overrides` field in `package.json` to resolve moderate-severity vulnerabilities in deep dependencies (like `uuid` and `postcss`) that are used by legacy native build tools. This ensures a clean `npm install` with **0 vulnerabilities**.

## 📱 Build for Android (APK)

To generate a testable APK for Android:
```bash
eas build --platform android --profile preview
```
