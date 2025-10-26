# School Management App - Deployment Guide

## Quick Start Commands

### 1. Local Development
```bash
npm start                    # Start Expo dev server
npm run android             # Start on Android
npm run ios                 # Start on iOS
npm run web                 # Start on web
```

### 2. Web Export
```bash
npx expo export --platform web
```

### 3. Build APK for Testing
```bash
# Build APK (for manual installation/testing)
npx eas build --platform android --profile preview

# Or production APK
npx eas build --platform android --profile production
```

### 4. Build AAB for Google Play Store
```bash
# Build Android App Bundle (required for Play Store)
npx eas build --platform android --profile production-aab
```

### 5. Download Build
```bash
# Download the latest build
npx eas build:download --latest

# Or view all builds
npx eas build:list
```

### 6. Submit to Google Play Store (Optional)
```bash
# First time setup (needs Google Play credentials)
npx eas submit --platform android

# This will prompt you to provide:
# - Google Play API key
# - Google Service Account JSON file
# - Track (internal, alpha, beta, production)
```

## Project Configuration

### app.json Settings
- **Package Name**: `com.schoolmanagement.app`
- **Version**: `1.0.0`
- **Version Code**: `1`

### Build Profiles (eas.json)
1. **preview**: APK for testing
2. **production**: APK for production
3. **production-aab**: AAB for Play Store
4. **development**: Development build

## Current Status

✅ **Completed:**
- Installed EAS CLI locally
- Logged into Expo account
- Created eas.json configuration
- Updated app.json with Android settings
- Initiated preview build

⏳ **In Progress:**
- Build #1b160886-88b1-4420-b1e9-5bd04fcfe0c6 is processing on Expo servers

## Monitoring Your Build

View builds at: https://expo.dev/accounts/dadasaheb.gopinath/projects/expo-on-replit/builds

## Next Steps for Google Play Store

### Prerequisites:
1. Google Play Developer Account ($25 one-time fee)
2. Create app in Google Play Console
3. Set up Google Play Service Account

### Commands:
```bash
# Build AAB for Play Store
npx eas build --platform android --profile production-aab

# Submit to Play Store
npx eas submit --platform android
```

## Notes

- **APK**: Can be installed directly on devices (good for testing)
- **AAB**: Required by Google Play Store, optimized for distribution
- Builds are processed on Expo's cloud servers (takes 5-15 minutes)
- You'll receive email notifications when builds complete

