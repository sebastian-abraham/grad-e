# Admin Flow Implementation

This document details the architecture, file structure, and implementation of the Admin Flow feature, allowing administrators to manage Users, Classes, Subjects, and Teaching Assignments.

## Data Models

### 1. `Class` (`models/Class.js`)
- **Fields**: `name` (String, required, unique), `students` (Array of ObjectIds referencing the `User` collection).
- Tracks a specific grouping of students.

### 2. `Subject` (`models/Subject.js`)
- **Fields**: `name` (String, required, unique).
- Global dictionary of available subjects (e.g. "Physics", "Computer Science").

### 3. `Assignment` (`models/Assignment.js`)
- **Fields**: `classId`, `subjectId`, `teacherId` (all required ObjectIds).
- **Indexing**: Enforces a compound unique index exactly on `{ classId: 1, subjectId: 1, teacherId: 1 }` to prevent database-level duplicates of identical assignments.
- Acts as the junction mapping a Teacher to a Subject strictly for a specific Class.

## Backend APIs

### Class Management (`routes/classRoutes.js`)
- **`GET /` & `GET /:id`**: Fetches classes and `.populate("students", "displayName email role")`.
- **`POST /` & `PUT /:id` & `DELETE /:id`**: Standard CRUD handling class `name`.
- **Roster Management (Drag & Drop Endpoints)**:
  - **`POST /:id/students`**: Expects `{ studentIds: [id1, id2] }` array. Uses `$addToSet` and `$each` natively in Mongoose to insert students preventing array duplicates.
  - **`DELETE /:id/students/:studentId`**: Uses the `$pull` operator to remove a student explicitly from the `students` array.

### Subject Management (`routes/subjectRoutes.js`)
- Exclusively provides basic CRUD. Does not permit orphaned links—deleted subjects will naturally break populated assignments downstream, so deletion logic is strictly administrative.

### Assignment Management (`routes/assignmentRoutes.js`)
- **`POST /`**: Requires `classId`, `subjectId`, `teacherId`. Catches MongoDB error `code === 11000` to gracefully return a `409` conflict indicating "This exact assignment already exists."
- **`GET /`**: Aggregates all junction strings heavily utilizing `.populate()` on all three relational fields to feed the frontend table views in one query.

### Admin High-Level Stats (`routes/adminRoutes.js`)
- **`GET /api/admin/stats`**: Leverages `Promise.all()` to concurrently execute 5 separate `countDocuments()` queries against `User` (filtered by 3 distinct roles), `Class`, and `Subject` resolving the dashboard statistics instantly.

## Frontend Architecture

### 1. Roster Drag and Drop (`src/pages/ClassDetail.jsx`)
- Built completely using `@hello-pangea/dnd` (`DragDropContext`, `Droppable`, `Draggable`).
- **Data Hydration**: Uses `Promise.all` fetching the total Student population (`/api/users?role=student`), the current Class `roster`, and `assignments`. It maps the arrays subtracting the `roster` IDs from the global pool to deduce the list of `unassigned` students dynamically.
- **`onDragEnd` Logic**:
  - Handles UI list slicing via array `.splice()`. Target `destination.droppableId` dictates list flow. 
  - Triggers asynchronous `updateRosterOnBackend` seamlessly POSTing to `/students` or DELETEing to `/students/:studentId` respectively behind the scenes based on drop zone.

### 2. Assignments Combiner (`src/pages/AssignmentManagement.jsx`)
- Simultaneously fetches `/classes`, `/subjects`, and `/users?role=teacher`.
- Drives a unified 3-slot dropdown form, pushing the unified IDs representing the junction. Re-hydrates state completely `fetchData()` on success.
