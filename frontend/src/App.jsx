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

const NotFound = () => (
  <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
    <h1 style={{ fontSize: "5rem", color: "#333", margin: "0 0 10px 0" }}>404</h1>
    <h2 style={{ color: "#666", margin: "0 0 20px 0" }}>Page Not Found</h2>
    <p style={{ color: "#888", marginBottom: "30px" }}>The page you are looking for doesn't exist or has been moved.</p>
    <a href="/" style={{ color: "#fff", backgroundColor: "#0056b3", padding: "10px 20px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold", transition: "background-color 0.2s" }}>Return to Home</a>
  </div>
);

const Unauthorized = () => (
  <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
    <h1 style={{ fontSize: "5rem", color: "#d32f2f", margin: "0 0 10px 0" }}>403</h1>
    <h2 style={{ color: "#666", margin: "0 0 20px 0" }}>Unauthorized Access</h2>
    <p style={{ color: "#888", marginBottom: "30px" }}>You do not have permission to view this page.</p>
    <a href="/" style={{ color: "#fff", backgroundColor: "#0056b3", padding: "10px 20px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold", transition: "background-color 0.2s" }}>Return to Dashboard</a>
  </div>
);

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

function App() {
  const { currentUser } = useAuth();

  const getDashboardPath = () => {
    if (!currentUser) return "/";
    switch (currentUser.role) {
      case "admin": return "/admin";
      case "teacher": return "/teacher";
      case "student": return "/student";
      default: return "/dashboard";
    }
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route 
          path="/" 
          element={!currentUser ? <Login /> : <Navigate to={getDashboardPath()} replace />} 
        />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="classes/:id" element={<ClassDetail />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="assignments" element={<AssignmentManagement />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRole="teacher">
            <div style={{minHeight:"100vh"}}><TeacherLayout /></div>
          </ProtectedRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="create-exam" element={<CreateExam />} />
          <Route path="exams/:id" element={<ExamDetail />} />
          <Route path="exams/:id/grade/:subId" element={<GradingView />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student">
            <div style={{minHeight:"100vh"}}><StudentLayout /></div>
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="exams/:id/result/:subId" element={<StudentExamResult />} />
        </Route>

        {/* Dashboard fallback for generic users */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <h1 style={{ color: "#333", marginBottom: "10px" }}>Welcome To Grad-E, {currentUser?.displayName || currentUser?.email}</h1>
              <p style={{ color: "#666", fontSize: "1.2rem", margin: "0" }}>Role: <span style={{ fontWeight: "bold" }}>{currentUser?.role || "Unassigned"}</span></p>
              <p style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef", color: "#555" }}>
                Please contact an administrator to assign you a role before you can access specific dashboards.
              </p>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
