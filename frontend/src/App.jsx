import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import SubjectManagement from "./pages/SubjectManagement";
import ClassManagement from "./pages/ClassManagement";
import ClassDetail from "./pages/ClassDetail";
import AssignmentManagement from "./pages/AssignmentManagement";

// Teacher imports
import TeacherLayout from "./components/TeacherLayout";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateExam from "./pages/CreateExam";
import ExamDetail from "./pages/ExamDetail";
import GradingView from "./pages/GradingView";

// Student imports
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import StudentExamResult from "./pages/StudentExamResult";

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route 
          path="/" 
          element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} />} 
        />
        
        {/* Admin Routes */}
        {currentUser && currentUser.role === "admin" && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="classes/:id" element={<ClassDetail />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="assignments" element={<AssignmentManagement />} />
          </Route>
        )}

        {/* Teacher Routes */}
        {currentUser && currentUser.role === "teacher" && (
          <Route path="/teacher" element={
            <div style={{minHeight:"100vh"}}><TeacherLayout /></div>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="create-exam" element={<CreateExam />} />
            <Route path="exams/:id" element={<ExamDetail />} />
            <Route path="exams/:id/grade/:subId" element={<GradingView />} />
          </Route>
        )}

        {/* Student Routes */}
        {currentUser && currentUser.role === "student" && (
          <Route path="/student" element={
            <div style={{minHeight:"100vh"}}><StudentLayout /></div>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="exams/:id/result/:subId" element={<StudentExamResult />} />
          </Route>
        )}

        {/* Dashboard fallback for generic users */}
        <Route path="/dashboard" element={
          <div style={{ padding: "20px" }}>
            <h1>Welcome To Grad-E, {currentUser?.displayName || currentUser?.email}</h1>
            <p>Role: {currentUser?.role}</p>
          </div>
        } />

        {/* Catch-all or Unauthorized */}
        <Route path="*" element={<div style={{ padding: "20px" }}>404 - Not Found or Unauthorized</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
