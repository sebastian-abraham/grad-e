import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Admin Dashboard Skeletons
export const AdminDashboardSkeleton = () => (
  <div style={{ display: "grid", gap: 16 }}>
    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
      <Skeleton width={200} height={32} />
      <Skeleton width={120} height={40} borderRadius={8} />
    </div>

    {/* Stat Cards */}
    <div style={{ padding: "0 24px" }}>
      <Skeleton width={200} height={24} style={{ marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <Skeleton width={80} height={20} style={{ marginBottom: "12px" }} />
            <Skeleton width={100} height={32} style={{ marginBottom: "8px" }} />
            <Skeleton width={120} height={16} />
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div style={{ padding: "0 24px" }}>
      <Skeleton width={200} height={24} style={{ marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <Skeleton width={80} height={20} style={{ marginBottom: "12px" }} />
            <Skeleton width={100} height={16} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Dashboard Exam Cards Skeleton
export const DashboardExamCardsSkeleton = ({ count = 8 }) => (
  <div style={{ display: "grid", gap: 24, padding: "0 24px" }}>
    {/* Subject Header */}
    <div>
      <Skeleton width={150} height={24} style={{ marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <Skeleton width={80} height={20} style={{ marginBottom: "12px" }} />
            <Skeleton width="100%" height={24} style={{ marginBottom: "12px" }} />
            <Skeleton width={150} height={16} style={{ marginBottom: "8px" }} />
            <Skeleton width="100%" height={16} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Assignment Management Skeleton
export const AssignmentManagementSkeleton = () => (
  <div style={{ display: "grid", gap: 16 }}>
    {/* Header */}
    <Skeleton width={300} height={40} />

    {/* Form */}
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, backgroundColor: "#fff" }}>
      <Skeleton width={200} height={24} style={{ marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton width={80} height={16} style={{ marginBottom: "8px" }} />
            <Skeleton width="100%" height={40} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>

    {/* Table */}
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", backgroundColor: "#fff" }}>
      <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 150px", gap: 12 }}>
          {["Class", "Subject", "Teacher", "Actions"].map((h, i) => (
            <Skeleton key={i} width={100} height={16} />
          ))}
        </div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 150px", gap: 12 }}>
          <Skeleton width="90%" height={16} />
          <Skeleton width="80%" height={16} />
          <Skeleton width="85%" height={16} />
          <Skeleton width={60} height={16} />
        </div>
      ))}
    </div>
  </div>
);

// User Management Skeleton
export const UserManagementSkeleton = () => (
  <div style={{ display: "grid", gap: 16 }}>
    {/* Tabs and Search */}
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width={100} height={40} borderRadius={8} />
        ))}
      </div>
      <Skeleton width={200} height={40} borderRadius={8} />
    </div>

    {/* Table */}
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", backgroundColor: "#fff" }}>
      <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", gap: 12 }}>
        {["Name", "Email", "Role", "Actions"].map((h, i) => (
          <Skeleton key={i} width={80} height={16} />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", gap: 12 }}>
          <Skeleton width="95%" height={16} />
          <Skeleton width="90%" height={16} />
          <Skeleton width={80} height={16} />
          <Skeleton width={60} height={16} />
        </div>
      ))}
    </div>
  </div>
);

// Class Management Skeleton
export const ClassManagementSkeleton = () => (
  <div style={{ display: "grid", gap: 16 }}>
    {/* Header and Form */}
    <div>
      <Skeleton width={300} height={40} />
      <Skeleton width={200} height={16} style={{ marginTop: "8px" }} />
    </div>

    <div style={{ display: "flex", gap: 8 }}>
      <Skeleton width={250} height={40} borderRadius={999} />
      <Skeleton width={100} height={40} borderRadius={999} />
    </div>

    {/* Class List */}
    <div style={{ display: "grid", gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height={20} style={{ marginBottom: "8px" }} />
            <Skeleton width="40%" height={16} />
          </div>
          <Skeleton width={80} height={16} />
        </div>
      ))}
    </div>
  </div>
);

// Subject Management Skeleton
export const SubjectManagementSkeleton = () => (
  <div>
    <Skeleton width={300} height={32} style={{ marginBottom: "24px" }} />

    {/* Form */}
    <div style={{ display: "flex", gap: 12, marginBottom: "24px" }}>
      <Skeleton width={300} height={40} borderRadius={8} />
      <Skeleton width={150} height={40} borderRadius={8} />
    </div>

    {/* Table */}
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", backgroundColor: "#fff", maxWidth: "600px" }}>
      <div style={{ padding: "12px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
        <Skeleton width={100} height={16} />
        <Skeleton width={80} height={16} />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
          <Skeleton width="50%" height={16} />
          <Skeleton width={60} height={16} />
        </div>
      ))}
    </div>
  </div>
);

// Create Exam Skeleton
export const CreateExamSkeleton = () => (
  <div style={{ display: "grid", gap: 24, padding: "24px" }}>
    {/* Progress Bar */}
    <Skeleton width="100%" height={4} borderRadius={2} />

    {/* Step Content */}
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, backgroundColor: "#fff" }}>
      <Skeleton width={200} height={28} style={{ marginBottom: "24px" }} />

      {/* Form Fields */}
      <div style={{ display: "grid", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton width={100} height={16} style={{ marginBottom: "8px" }} />
            <Skeleton width="100%" height={40} borderRadius={8} />
          </div>
        ))}
      </div>

      {/* Button */}
      <Skeleton width={120} height={40} borderRadius={8} style={{ marginTop: "24px" }} />
    </div>
  </div>
);

// Exam Detail Skeleton
export const ExamDetailSkeleton = () => (
  <div style={{ display: "grid", gap: 16, minHeight: "100%" }}>
    {/* Header */}
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, backgroundColor: "#fff" }}>
      <Skeleton width={150} height={28} style={{ marginBottom: "12px" }} />
      <Skeleton width="100%" height={40} />
      <Skeleton width="60%" height={16} style={{ marginTop: "12px" }} />
    </div>

    {/* Tabs */}
    <div style={{ display: "flex", gap: 8, padding: "0 24px" }}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} width={120} height={40} borderRadius={8} />
      ))}
    </div>

    {/* Content */}
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, backgroundColor: "#fff" }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ marginBottom: "16px" }}>
          <Skeleton width="100%" height={16} />
        </div>
      ))}
    </div>
  </div>
);

// Grading View Skeleton
export const GradingViewSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f8fafc" }}>
    {/* Header */}
    <div style={{ padding: "16px 24px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Skeleton width={200} height={24} />
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton width={100} height={40} borderRadius={8} />
        <Skeleton width={140} height={40} borderRadius={8} />
      </div>
    </div>

    {/* Main Content */}
    <div style={{ display: "flex", flex: 1 }}>
      {/* PDF Area */}
      <div style={{ flex: 1, borderRight: "1px solid #e2e8f0", backgroundColor: "#4a5568", padding: 16 }}>
        <Skeleton width="100%" height="100%" borderRadius={4} />
      </div>

      {/* Feedback Panel */}
      <div style={{ width: "450px", backgroundColor: "#fff", padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Skeleton width={100} height={16} style={{ margin: "0 auto 8px" }} />
          <Skeleton width={150} height={32} style={{ margin: "0 auto" }} />
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <Skeleton width={120} height={18} style={{ marginBottom: "12px" }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: "8px" }} />
            <Skeleton width="80%" height={16} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Student Exam Result Skeleton
export const StudentExamResultSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f8fafc" }}>
    {/* Header */}
    <div style={{ padding: "16px 24px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      <Skeleton width={200} height={24} />
      <Skeleton width="100%" height={20} style={{ marginTop: "12px" }} />
    </div>

    {/* Main Content */}
    <div style={{ display: "flex", flex: 1 }}>
      {/* PDF Area */}
      <div style={{ flex: 1, borderRight: "1px solid #e2e8f0", backgroundColor: "#e6e8eb", padding: 16 }}>
        <Skeleton width="100%" height="100%" borderRadius={4} />
      </div>

      {/* Results Panel */}
      <div style={{ width: "450px", backgroundColor: "#fff", padding: 32 }}>
        <Skeleton width={100} height={24} style={{ margin: "0 auto 12px" }} />
        <Skeleton width={150} height={40} style={{ margin: "0 auto 24px" }} />

        {[1, 2, 3].map((i) => (
          <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <Skeleton width={120} height={18} style={{ marginBottom: "12px" }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: "8px" }} />
            <Skeleton width="80%" height={16} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Class Detail Skeleton
export const ClassDetailSkeleton = () => (
  <div style={{ display: "grid", gap: 16 }}>
    {/* Header */}
    <div style={{ padding: "12px 0", fontSize: 12, color: "#778294" }}>
      <Skeleton width={150} height={16} />
    </div>

    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, backgroundColor: "#fff" }}>
      <Skeleton width={200} height={28} style={{ marginBottom: "12px" }} />
      <Skeleton width="100%" height={16} />
    </div>

    {/* Drag Drop Area */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {[1, 2].map((i) => (
        <div key={i} style={{ border: "1px dashed #e2e8f0", borderRadius: 12, padding: 16, minHeight: "300px" }}>
          <Skeleton width={120} height={20} style={{ marginBottom: "12px" }} />
          <div style={{ display: "grid", gap: 8 }}>
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} width="100%" height={40} borderRadius={8} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
