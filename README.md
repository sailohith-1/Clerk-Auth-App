# React Native Expo App with Clerk Authentication

A React Native mobile application built with Expo that implements real user authentication using Clerk and includes a complete navigation flow.

## Features

- ✅ Real authentication using Clerk (no dummy/hardcoded login)
- ✅ Protected routes - unauthenticated users cannot access protected screens
- ✅ Login and Signup screens with email verification
- ✅ Home Screen with clean, modern UI
- ✅ Profile Screen displaying user details from Clerk
- ✅ Logout functionality that properly ends the session
- ✅ React Navigation for screen transitions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- A Clerk account (free tier available at [clerk.com](https://clerk.com))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk

1. Create a free account at [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Copy your **Publishable Key** from the Clerk dashboard
4. Create a `.env` file in the root directory:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

Replace `pk_test_your_key_here` with your actual Clerk publishable key.

### 3. Configure Clerk Dashboard

In your Clerk dashboard:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email** as a sign-in method
3. Configure email verification settings as needed
4. For development, you can use Clerk's test email service

### 4. Run the App

```bash
# Start the Expo development server
npm start

# Or run on a specific platform
npm run android
npm run ios
npm run web
```

Scan the QR code with the Expo Go app on your device, or press the appropriate key to open in an emulator.

## Project Structure

```
├── App.js                 # Main app component with Clerk provider
├── app.json               # Expo configuration
├── navigation/
│   └── AppNavigator.js    # Navigation setup with protected routes
├── screens/
│   ├── LoginScreen.js     # Login screen
│   ├── SignupScreen.js    # Signup screen
│   ├── VerificationScreen.js # Email verification screen
│   ├── HomeScreen.js      # Protected home screen
│   └── ProfileScreen.js   # Protected profile screen
└── README.md
```

## How It Works

### Authentication Flow

1. **Unauthenticated State**: Users see Login/Signup screens
2. **Sign Up**: Users create an account → receive email verification code → verify email → automatically signed in
3. **Sign In**: Users enter credentials → authenticated → navigate to Home
4. **Protected Routes**: Only authenticated users can access Home and Profile screens
5. **Logout**: Users can logout from Profile screen → returns to Login screen

### Navigation

- Uses React Navigation's Native Stack Navigator
- Automatically switches between auth stack and protected stack based on authentication state
- Protected routes are only accessible when `isSignedIn === true`

## Key Dependencies

- `@clerk/clerk-expo`: Clerk authentication SDK for Expo
- `@react-navigation/native`: React Navigation core
- `@react-navigation/native-stack`: Stack navigator
- `expo-secure-store`: Secure token storage
- `react-native-screens`: Native screen components
- `react-native-safe-area-context`: Safe area handling

## Troubleshooting

### "Clerk publishable key not found"

Make sure you've created a `.env` file with your Clerk publishable key and that it starts with `EXPO_PUBLIC_`.

### Email verification not working

- Check your Clerk dashboard email settings
- For development, use Clerk's test email service
- Make sure your email provider isn't blocking Clerk's emails

### Navigation issues

- Ensure all screens are properly registered in `AppNavigator.js`
- Check that navigation is only called when the navigator is ready

## License

This project is open source and available for educational purposes.

## NOTE

---->>>> IF THERE IS ANY ISSUE IN MOBILE , TRY CHECKING IN WEB.

