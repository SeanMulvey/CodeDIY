import 'dotenv/config';

// Log environment variable loading for debugging
console.log('Environment variables loaded:');
console.log('- YOUTUBE_API_KEY exists:', Boolean(process.env.YOUTUBE_API_KEY));
console.log('- FIREBASE_API_KEY exists:', Boolean(process.env.FIREBASE_API_KEY));

export default {
  name: 'CodeDIY',
  slug: 'code-diy',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.codediy',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.yourcompany.codediy',
  },
  web: {
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    [
      'expo-router',
      {
        asyncRoutes: {
          web: true,
          default: 'development',
        },
      },
    ],
  ],
  extra: {
    // YouTube API Key
    youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
    
    // Firebase Configuration
    firebaseApiKey: process.env.FIREBASE_API_KEY || '',
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    firebaseAppId: process.env.FIREBASE_APP_ID || '',
    
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '',
    },
  },
}; 