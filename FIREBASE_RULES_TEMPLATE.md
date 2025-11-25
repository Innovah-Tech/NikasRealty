# Firestore Security Rules Template

Copy and paste these rules into Firebase Console → Firestore Database → Rules

## Recommended Rules for Nikas Realty:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Properties collection
    match /properties/{propertyId} {
      // Allow anyone to read properties (public listings)
      allow read: if true;
      
      // Allow authenticated users to create, update, and delete
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Blogs collection
    match /blogs/{blogId} {
      // Allow anyone to read published blogs
      allow read: if true;
      
      // Allow authenticated users to create, update, and delete
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Requests collection (contact forms)
    match /requests/{requestId} {
      // Allow anyone to create (submit contact form)
      allow create: if true;
      
      // Only authenticated users can read/update/delete
      allow read: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Team collection
    match /team/{memberId} {
      // Allow anyone to read
      allow read: if true;
      
      // Only authenticated users can write
      allow write: if isAuthenticated();
    }
  }
}
```

## How to Apply:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nikas-db432`
3. Go to **Firestore Database** → **Rules** tab
4. Copy the rules above
5. Click **Publish**
6. Wait a few seconds for rules to propagate

## Testing Rules:

1. In Firebase Console → Firestore → Rules
2. Click **Rules Playground**
3. Test scenarios:
   - **Unauthenticated read:** Should work ✅
   - **Authenticated write:** Should work ✅
   - **Unauthenticated write:** Should fail ❌

## If Rules Are Too Restrictive:

If you get "permission-denied" errors, the rules above should fix it. Make sure:
- Rules are **published** (not just saved)
- You're **logged in** when testing
- Your **domain is authorized** in Firebase Auth settings

