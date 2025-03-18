# CodeDIY - Car Repair DIY Assistant

CodeDIY is a mobile application designed to help car owners find repair tutorials for their vehicles. By entering diagnostic trouble codes (DTC) and vehicle information, users can quickly find YouTube videos that explain how to diagnose and fix issues with their cars.

## Features

- User authentication with email and password
- Vehicle management (add, edit, delete)
- Search for repair videos using vehicle info and DTCs
- Rate videos as helpful or not helpful
- Search history tracking
- Share repair videos with others
- Email mechanic feature for when DIY isn't an option

## Technology Stack

- React Native / Expo
- Firebase (Authentication, Firestore)
- YouTube Data API
- Expo Router for navigation

## Installation and Setup

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/codediy.git
   cd codediy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory by copying `.env.example`:
   ```
   cp .env.example .env
   ```

4. Set up your API keys:
   - Get a YouTube Data API key from the [Google Cloud Console](https://console.cloud.google.com)
   - Create a Firebase project and get the configuration values

5. Update the `.env` file with your API keys and Firebase configuration.

6. Start the development server:
   ```
   npx expo start
   ```

7. Launch the app on your preferred platform:
   - Press `i` to open in iOS simulator
   - Press `a` to open in Android emulator
   - Scan the QR code with Expo Go app on your physical device

## Environment Variables

The following environment variables need to be set in the `.env` file:

```
# YouTube API Key
YOUTUBE_API_KEY=your_youtube_api_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

## Project Structure

- `/app` - Expo Router screens and navigation
- `/components` - Reusable UI components
- `/services` - Business logic and API services
- `/api` - External API integrations (YouTube)
- `/firebase` - Firebase configuration and utilities
- `/assets` - Images, fonts, and other static assets

## Usage

1. Create an account or sign in
2. Add your vehicles in the Vehicles tab
3. Start a new search by selecting a vehicle and entering a diagnostic code
4. View videos and find the solution to your car problem
5. Rate videos to help improve future search results
6. If you can't fix it yourself, email your mechanic with the details

## Developer Notes

### Authentication Implementation

- The app uses Firebase Authentication for user management
- For logout functionality, the app directly calls Firebase Auth's signOut method for reliability
- The profile screen demonstrates proper authentication state handling

### Cross-Platform Considerations

- The app is designed to work on both web and mobile platforms
- Some features may require platform-specific implementations (like video playback)
- When viewing multiple vehicles, the list supports scrolling for better user experience

### Troubleshooting

- If logout doesn't work through the auth service, the app uses a direct Firebase auth call instead
- For Android development, ensure Android SDK is properly installed and configured
- The web version provides the most reliable development experience

## License

This project is licensed under the MIT License - see the LICENSE file for details.
