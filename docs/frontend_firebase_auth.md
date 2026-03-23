# Frontend Firebase Authentication Integration

## Overview
The uncommitted changes introduce a complete frontend authentication flow integrating Firebase for Google Sign-In and a custom backend for user synchronization (MongoDB). This allows users to authenticate via Google, with the frontend application managing the authentication state globally.

## File Structure & Changes

### New Files Created
- **`frontend/src/config/firebase.js`**:
  Initializes the Firebase application and exports the initialized `auth` instance along with the `GoogleAuthProvider`. Depends on VITE environment variables for the Firebase configuration keys.
  
- **`frontend/src/contexts/AuthContext.jsx`**:
  Provides a global React context for authentication state.
  - Manages `currentUser` and `loading` states.
  - Implements `loginWithGoogle` which:
    1. Triggers the Firebase Google popup sign-in.
    2. Takes the Google user object and sends the `firebaseUid`, `email`, and `displayName` to the custom backend endpoint (`POST http://localhost:5000/api/users/login`).
    3. Handles 403 authorization rejections gracefully by signing the user out of Firebase if they don't exist in our DB.
  - Implements `logout` which signs the user out of Firebase.
  
- **`frontend/src/components/Login.jsx`**:
  A styled login component containing a simple "Login with Google" button. It uses the `loginWithGoogle` method from `AuthContext` and manages local loading state/error messages if the sign-in fails.

### Existing Files Modified
- **`frontend/package.json` & `frontend/package-lock.json`**:
  Installed the `firebase` npm package (`^12.11.0`).

- **`frontend/src/main.jsx`**:
  Wrapped the root `<App />` component in the newly created `<AuthProvider>` to ensure authentication context is available globally.

- **`frontend/src/App.jsx`**:
  Updated to act as the primary protected dashboard. 
  - Retrieves `currentUser` and `logout` from `AuthContext`.
  - If no `currentUser` is present, it automatically renders the `<Login />` component.
  - If authenticated, it renders a personalized welcome message along with the user's role from the backend and a logout button.

## How it works
1. **Initial Load**: `<AuthProvider>` defaults `loading` to true and uses Firebase's `onAuthStateChanged` hook to listen to the user session.
2. **Session Restoration**: On page reload, if a Firebase user is active, the frontend automatically pings the backend `POST /api/users/login` to restore the MongoDB user data into the `currentUser` state. If the user does not exist in the database, it signs them out of Firebase. Once resolved, `loading` is set to false.
3. **Unauthenticated State**: `<App />` detects `currentUser` is null and defers rendering to the `<Login />` component.
4. **Triggering Login**: The user clicks 'Login with Google'. Firebase authenticates the user.
5. **Backend Sync**: The `AuthContext` automatically forwards the Google credentials to the backend. If the backend accepts the user, they are stored in state. If rejected (e.g., unauthorized role or unlisted email), they are immediately logged out of Firebase.
6. **Authenticated State**: The `currentUser` populates the context, causing `<App />` to render the dashboard instead of the Login screen.
