/**
 * Firebase Setup Guide
 * 
 * For the CodeDIY application to work correctly, you need to set up the
 * proper Firestore security rules in your Firebase console.
 * 
 * Follow these steps:
 * 
 * 1. Go to https://console.firebase.google.com/
 * 2. Select your project (code-diyers)
 * 3. In the left sidebar, click on "Firestore Database"
 * 4. Click on the "Rules" tab
 * 5. Replace the current rules with the rules below:
 */

/*
// Copy these rules to your Firebase console

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users for testing
    // IMPORTANT: Change these rules before deploying to production
    match /{document=**} {
      allow read, write: if true;
    }
    
    // For production, you should use rules like these:
    // match /users/{userId} {
    //   allow read, write: if request.auth != null && request.auth.uid == userId;
    // }
    // match /vehicles/{vehicleId} {
    //   allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    // }
    // match /searches/{searchId} {
    //   allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    // }
  }
}
*/ 