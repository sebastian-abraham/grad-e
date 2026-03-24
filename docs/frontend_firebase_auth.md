# Frontend Firebase Authentication Integration

This document breaks down the frontend authentication flow, detailing how Firebase Google Sign-In is orchestrated, state is globally managed, and routing is protected based on roles retrieved from the backend.

## 1. Firebase Initialization (`src/config/firebase.js`)
Configures the Firebase client application using structural environment variables.
- Uses `initializeApp` passing `firebaseConfig`.
- Exports `auth` using `getAuth(app)`.
- Exports `googleProvider` using `new GoogleAuthProvider()`.
- **Environment Context**: Values such as `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc. must be defined in `.env`.

## 2. Global State Management (`src/contexts/AuthContext.jsx`)
The `AuthProvider` wraps the entire application and maintains two primary React states:
1. `currentUser`: Stores the combined user object from our MongoDB Backend (containing `role`, `email`, `displayName`, and Database `_id`).
2. `loading`: A boolean preventing the UI from rendering prematurely before the authentication session is fully resolved or restored.

### Session Restoration Hook (The `useEffect`)
- Subscribes to Firebase's `onAuthStateChanged`.
- If a Firebase session is actively detected on page load:
  1. It seamlessly fires a background `POST` request to `VITE_API_URL/api/users/login` using the `user.uid` and `user.email`.
  2. If the backend accepts the request (User exists in MongoDB), `setCurrentUser` is populated with the database object.
  3. If rejected (e.g. 403 Forbidden because they were removed from the database), it aggressively calls `signOut(auth)` logging them out of Firebase to prevent ghost sessions.
- Sets `loading(false)` once the roundtrip completes, allowing `<App />` to render.

### The `loginWithGoogle` Function
- Invoked manually by user click in the `Login` screen.
- **Step 1**: Tries `signInWithPopup(auth, googleProvider)`.
- **Step 2**: If Firebase succeeds, takes the OAuth `user.uid`, `email`, and `displayName` and sends them as a `POST` payload to `/api/users/login`.
- **Step 3**: Awaits the MongoDB sync response.
  - If the backend returns `403` (email not whitelisted), it throws an Error and forces a Firebase `signOut(auth)`, ensuring unauthorized users never pass the Login wall.
  - If successful, updates the `currentUser` context and completes.

## 3. UI and Protected Routing (`src/App.jsx`)
`react-router-dom` is used to orchestrate access based precisely on the `currentUser` state.

### The Root Route (`/`)
- Checks `!currentUser`. If true, forces the `<Login />` component.
- If `currentUser` exists, it triggers `<Navigate>` automatically routing them based on their Mongo DB `role`:
  - `admin` -> `/admin`
  - *others* -> `/dashboard`

### Role-Protected Container Routing
- **Admin Endpoints (`/admin/*`)**: Conditionally rendered globally by checking `currentUser && currentUser.role === "admin"`. Wrapped securely inside `<AdminLayout />`.
- **Teacher Endpoints (`/teacher/*`)**: Conditionally rendered globally by checking `currentUser && currentUser.role === "teacher"`. Wrapped strictly inside `<TeacherLayout />`.

## 4. The Login Component (`src/components/Login.jsx`)
- Simple functional component binding the UI to the `AuthContext`.
- Manages an internal `loading` boolean exclusively for changing the login button visually to "Logging in..." to prevent spam clicks.
- Renders textual `<p>` errors caught explicitly from the context's `try/catch` block (e.g. "Account not authorized").
