# MongoDB and User Model Integration

This document outlines the first iteration of connecting the backend Express server to MongoDB and creating the core User model to link via Firebase Authentication.

## Architecture & Integration

Firebase is responsible for authentication, while MongoDB stores the user profiles, roles, and other subsequent application data. 

### 1. Database Configuration
- Main connection logic is housed in `config/db.js` using Mongoose.
- The connection is initialized immediately upon server startup in `server.js`.
- Configured via environment variables (`MONGODB_URI`).

### 2. User Model
Located in `models/User.js`. The schema is designed around role-based access:
- `email`: A required and unique identifier for all accounts.
- `firebaseUid`: A sparse unique key. This remains `null` when an account is pre-created by an admin and is dynamically populated upon the user's first legitimate Google login via Firebase.
- `displayName`: Optional string field for the user's name.
- `role`: Role abstraction (`student`, `teacher`, `admin`), defaulting to `student`. 

### 3. API Routes & Endpoints
Located in `routes/userRoutes.js` and mounted on `/api/users`:
- **`POST /api/users/login`**: Intended to be invoked by the frontend immediately post-Firebase authentication. It accepts `{ firebaseUid, email, displayName }`. 
  - Validates if the email already exists in our MongoDB database. 
  - If the email is present but `firebaseUid` is not linked, it automatically securely links them, finalizing the registration logic.
- **Admin CRUD endpoints**:
  - `POST /api/users`: Create a new pre-seeded user requiring just an email and optionally a role.
  - `GET /api/users`: Fetch a comprehensive list of all users.
  - `PUT /api/users/:id`: Update core user details (roles, names).
  - `DELETE /api/users/:id`: Remove users from the system.

> Note: While the foundation laid here is functional, future tasks will involve wrapping these endpoints in an authentication middleware designed to decode and verify JWTs from incoming requests directly against Firebase.
