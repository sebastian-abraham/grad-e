# MongoDB and User Model Integration

This document provides a deep, code-level overview of the backend's integration with MongoDB and the core User authentication flow mapping Firebase to our database.

## Architecture

### 1. Database Configuration (`backend/config/db.js`)
The application uses Mongoose to connect to MongoDB.
- **Connection Logic**: 
  ```javascript
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  ```
- **Error Handling**: Uses a `try-catch` block. If connection fails, it logs `MongoDB connection error: ${error.message}` and calls `process.exit(1)` to crash the server to prevent running in a disconnected state.
- **Initialization**: Triggered immediately at the top of `backend/server.js` using `connectDB()`.

### 2. Global Server Setup (`backend/server.js`)
- Initializes Express and listens on `process.env.PORT || 5000`.
- **Middleware Pipeline**:
  - `cors()` to allow cross-origin requests.
  - `express.json()` to parse JSON payloads.
- **Mounting Routes**:
  - `/api/users` -> `userRoutes.js`
  - `/api/classes` -> `classRoutes.js`
  - `/api/subjects` -> `subjectRoutes.js`
  - `/api/assignments` -> `assignmentRoutes.js`
  - `/api/admin` -> `adminRoutes.js`
  - `/api/exams` -> `examRoutes.js`
  - `/api/teacher` -> `teacherRoutes.js`
- **File Uploads (Multer)**: Configures memory storage with a 25MB file size limit and strict `application/pdf` MIME type validation used explicitly for the `/api/grade` endpoint.
- **Gemini Integration**: Mounts `POST /api/grade` utilizing `multer` passing base64 converted PDF buffers directly to the `gemini-2.5-flash` endpoint via REST standard `fetch`.

## Data Models

### User Schema (`backend/models/User.js`)
The schema enforces role-based access control and links our Mongo documents to Firebase identity.
- **`firebaseUid`** (`String`): Must be `unique`. Marked as `sparse: true` to allow admin-created accounts to have an `undefined` value until the user initiates their first Google OAuth login.
- **`email`** (`String`): `required: true`, `unique: true`, forced to `lowercase`, and auto-trimmed.
- **`displayName`** (`String`): Optional, defaults to an empty string `""`.
- **`role`** (`String`): Restricted by an `enum: ["student", "teacher", "admin"]`. Defaults immediately to `"student"`.
- Uses `{ timestamps: true }` to automatically inject `createdAt` and `updatedAt` records.

## API Endpoints (`backend/routes/userRoutes.js`)

### Firebase Login Synchronization
**`POST /api/users/login`**
Invoked automatically by the React frontend immediately succeeding a successful Firebase OAuth popup.

1. **Payload**: Expects `{ firebaseUid, email, displayName }`. Returns `400` if `firebaseUid` or `email` are missing.
2. **Lookup**: Scans the MongoDB for `email.toLowerCase()`.
3. **Validation**: If no user exists, it strictly rejects the login returning `403 Access denied. Account not found.` (Users must be pre-whitelisted by an admin).
4. **Linking**: 
   - If `user.firebaseUid` is empty, it assigns `user.firebaseUid = firebaseUid`.
5. **Update**: Persists the `displayName` if provided in the payload and saves the document.

### Admin CRUD Endpoints (No Auth Middleware Yet)

**`POST /api/users`** (Create)
- **Payload**: `{ email, role }`
- **Logic**: Converts email to lowercase. Throws `409` if the email is already registered. Otherwise, invokes `User.create()`.

**`GET /api/users`** (Read & Filter)
- **Query Params**: `?role=` and `?search=`
- **Logic**: 
  - Filters by exact `role` if provided and not equal to `"all"`.
  - Performs case-insensitive (`$options: "i"`) Regex `$or` searches on both `email` and `displayName` simultaneously if `search` is provided.
  - Sorts documents newest first using `({ createdAt: -1 })`.

**`PUT /api/users/:id`** (Update)
- **Payload**: Optionally `{ role, displayName }`.
- **Logic**: Uses `findByIdAndUpdate` utilizing `{ returnDocument: 'after', runValidators: true }` to ensure Mongoose returns the newly updated entity adhering to schema validation. Yields `404` if the ID doesn't exist.

**`DELETE /api/users/:id`** (Delete)
- **Logic**: `findByIdAndDelete`. Yields `404` if the target `id` doesn't exist. Yields `{ message: "User deleted." }` on success.

## Future Hooks
- Integration with Firebase Admin SDK middleware to intercept API requests and decode the incoming JWT Token strictly validating against Firebase before executing logic.
