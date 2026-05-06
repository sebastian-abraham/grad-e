import { apiFetch } from "../utils/apiFetch";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ArrowLeft, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { ClassDetailSkeleton } from "../components/SkeletonUI";

export default function ClassDetail() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [unassigned, setUnassigned] = useState([]);
  const [roster, setRoster] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsRes, usersRes, assignRes] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_API_URL}/api/classes/${id}`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/users?role=student`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/assignments`),
      ]);

      const classData = await clsRes.json();
      const allStudents = await usersRes.json();
      const allAssignments = await assignRes.json();

      setCls(classData);
      setRoster(classData.students || []);

      const enrolledIds = new Set((classData.students || []).map((s) => s._id));
      setUnassigned((allStudents || []).filter((s) => !enrolledIds.has(s._id)));
      setAssignments((allAssignments || []).filter((a) => a.classId?._id === id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateRosterOnBackend = async (studentId, target) => {
    try {
      if (target === "roster") {
        await apiFetch(`${import.meta.env.VITE_API_URL}/api/classes/${id}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentIds: [studentId] }),
        });
      } else {
        await apiFetch(`${import.meta.env.VITE_API_URL}/api/classes/${id}/students/${studentId}`, {
          method: "DELETE",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const src = source.droppableId === "unassigned" ? [...unassigned] : [...roster];
    const dst = destination.droppableId === "unassigned" ? [...unassigned] : [...roster];
    const [moved] = src.splice(source.index, 1);
    dst.splice(destination.index, 0, moved);

    if (source.droppableId === "unassigned") {
      setUnassigned(src);
      setRoster(dst);
      updateRosterOnBackend(moved._id, "roster");
    } else {
      setRoster(src);
      setUnassigned(dst);
      updateRosterOnBackend(moved._id, "unassigned");
    }
  };

  const filteredUnassigned = useMemo(
    () =>
      unassigned.filter((s) =>
        `${s.displayName || ""} ${s.email || ""}`.toLowerCase().includes(search.toLowerCase())
      ),
    [unassigned, search]
  );

  if (loading || !cls) return <ClassDetailSkeleton />;

  const assignedTeacher = assignments[0]?.teacherId;

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#778294" }}>
        <Link to="/admin/classes" style={{ color: "#778294", textDecoration: "none" }}>
          Classes
        </Link>
        <span>›</span>
        <span>{cls.name}</span>
      </div>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.06, color: "#232b37" }}>Class: {cls.name}</h1>
          {assignedTeacher ? (
            <p style={{ margin: "8px 0 0", color: "#6a7480", fontSize: 13 }}>
              Assigned Teacher: {assignedTeacher.displayName || assignedTeacher.email}
            </p>
          ) : (
            <p style={{ margin: "8px 0 0", color: "#9b6574", fontSize: 13 }}>
              No teacher assigned yet.
            </p>
          )}
        </div>

        <div style={{ display: "inline-flex", gap: 8 }}>
          <button
            type="button"
            onClick={fetchData}
            style={{ border: "1px solid #d7dde6", background: "#fff", borderRadius: 999, padding: "9px 14px", fontWeight: 700, cursor: "pointer" }}
          >
            Save Configuration
          </button>
          <button
            type="button"
            style={{ border: 0, background: "var(--accent-strong)", color: "#fff", borderRadius: 999, padding: "9px 14px", fontWeight: 700, cursor: "pointer" }}
          >
            Publish Roster
          </button>
        </div>
      </motion.header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            background: "#fff",
            padding: 14,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <DroppableColumn
            droppableId="unassigned"
            title={`Unassigned Pool (${filteredUnassigned.length})`}
            subtitle="Find and drag students"
            search={search}
            onSearch={setSearch}
            withSearch
            students={filteredUnassigned}
            emptyText="No students available in unassigned pool."
            tone="left"
          />

          <DroppableColumn
            droppableId="roster"
            title={`Class Roster (${roster.length} Students)`}
            subtitle="Drag students here to enroll"
            students={roster}
            emptyText="Drop to assign"
            tone="right"
          />
        </div>
      </DragDropContext>
    </section>
  );
}

function DroppableColumn({
  droppableId,
  title,
  subtitle,
  students,
  emptyText,
  tone,
  withSearch,
  search,
  onSearch,
}) {
  const cardBorder = tone === "right" ? "1px dashed #d8deea" : "1px solid #e8edf4";

  return (
    <div style={{ border: cardBorder, borderRadius: 14, background: "#f7fafc", padding: 12, minHeight: 460, display: "grid", alignContent: "start", gap: 10 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: "#293242" }}>{title}</h2>
        </div>
        <p style={{ margin: 0, color: "#7a8491", fontSize: 12 }}>{subtitle}</p>

        {withSearch ? (
          <label style={{ marginTop: 2, height: 34, borderRadius: 999, border: "1px solid #d8dee8", background: "#fff", display: "inline-flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
            <Search size={14} color="#8590a0" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Filter students..."
              style={{ border: 0, outline: "none", width: "100%", fontSize: 12, background: "transparent" }}
            />
          </label>
        ) : null}
      </div>

      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: "grid", gap: 8, minHeight: 300 }}>
            {students.map((student, index) => (
              <Draggable key={student._id} draggableId={student._id} index={index}>
                {(dragProvided, snapshot) => (
                  <motion.div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    whileHover={{ y: -1 }}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      background: snapshot.isDragging ? "#eaf2ff" : "#fff",
                      padding: "9px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      ...dragProvided.draggableProps.style,
                    }}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                        {(student.displayName || student.email || "S")
                          .split(" ")
                          .map((s) => s[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, color: "#2e3744", fontWeight: 700 }}>
                          {student.displayName || "Unknown Student"}
                        </div>
                        <div style={{ fontSize: 10, color: "#7a8491" }}>ID: {String(student._id).slice(-6)}</div>
                      </div>
                    </div>
                    <User size={14} color="#8a95a3" />
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {students.length === 0 ? (
              <div style={{ border: "1px dashed #d6dce7", borderRadius: 12, padding: 18, textAlign: "center", color: "#8a95a3", fontSize: 12 }}>
                {emptyText}
              </div>
            ) : null}
          </div>
        )}
      </Droppable>
    </div>
  );
}
