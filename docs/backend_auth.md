# Backend Authentication & Authorization

This document outlines how the Grad-E backend is protected using Firebase Authentication to reflect the structured access visibility present in the frontend.

## Overview
The platform uses Firebase Authentication to manage user identity. The backend leverages the Firebase Admin SDK to verify Identity Tokens (`IdToken`) sent by the frontend's API calls. Further, we utilize a MongoDB `User` collection to track custom Roles (`student`, `teacher`, `admin`), which dictates access to specific backend routes.

## Architecture

1. **Token Appending (Frontend)**:
   All authorized API requests originating from the frontend must include the Authorization header:
   `Authorization: Bearer <firebase_id_token>`
   This is automatically handled by the `apiFetch.js` utility (`frontend/src/utils/apiFetch.js`), which wraps standard `fetch` methods.

2. **Token Verification (Backend)**:
   The `verifyToken` middleware (`backend/middlewares/authMiddleware.js`) intercepts incoming requests.
   - It extracts the Bearer token.
   - Decodes it using `firebase-admin` utilizing the configured `FIREBASE_PROJECT_ID`.
   - Fetches the active `User` document from the database using the internal `firebaseUid`.
   - Attaches `req.user` making it available downstream.

3. **Role Authorization (Backend)**:
   The `authorizeRoles(...roles)` middleware protects routes depending on user roles.
   For example, an endpoint designed only for Admins is secured like so:
   ```javascript
   router.get("/stats", verifyToken, authorizeRoles("admin"), ...);
   ```

## Routing Configuration Base
The `backend/server.js` applies the middlewares globally across routers depending on their domain:
- **Admin domain (`/api/admin`)**: Protected globally with `verifyToken` & `authorizeRoles("admin")`.
- **Teacher domain (`/api/teacher`)**: Protected globally with `verifyToken` & `authorizeRoles("teacher")`.
- **Student domain (`/api/student`)**: Protected globally with `verifyToken` & `authorizeRoles("student")`.
- **Shared Entities (`/api/classes`, `/api/subjects`, `/api/exams`, `/api/assignments`)**: Initially protected by `verifyToken` and later sub-routed with deeper role authorizations as needed logic dictates.
- **Login endpoint (`/api/users/login`)**: Kept publicly accessible to allow linking between Google Auth and the MongoDB collection.

## Important Note for Developers
- Ensure your local `.env` has the `FIREBASE_PROJECT_ID` variable assigned corresponding to the Firebase Project config to avoid verification faults.
