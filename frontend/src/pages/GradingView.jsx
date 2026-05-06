import { apiFetch } from "../utils/apiFetch";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Award } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { GradingViewSkeleton } from "../components/SkeletonUI";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function GradingView() {
  const { id, subId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editable feedback state
  const [feedback, setFeedback] = useState([]);
  const [score, setScore] = useState(0);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id, subId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exRes, subRes, allRes] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}/submissions/${subId}`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}/submissions`)
      ]);
      
      const exData = await exRes.json();
      const subData = await subRes.json();
      const allData = await allRes.json();

      const mergeFeedback = (rawFeedback, criteria) => {
        if (!rawFeedback || !criteria) return rawFeedback;
        
        const mergedMap = {};
        const unmapped = [];
        
        rawFeedback.forEach(item => {
          let baseNumberMatch = item.questionNumber.match(/\d+/);
          if (!baseNumberMatch) {
            unmapped.push(item);
            return;
          }
          let baseNumber = baseNumberMatch[0];
          
          let criteriaMatch = criteria.find(c => {
            let critBase = c.questionNumber.match(/\d+/);
            return critBase && critBase[0] === baseNumber;
          });
          
          if (!criteriaMatch) {
            unmapped.push(item);
            return;
          }

          if (!mergedMap[baseNumber]) {
            mergedMap[baseNumber] = {
              ...item,
              questionNumber: criteriaMatch.questionNumber,
              prompt: criteriaMatch.prompt,
              maxPoints: criteriaMatch.marks,
              pointsAwarded: 0,
              teacherFeedback: "",
              status: "",
              flags: []
            };
          }
          
          let current = mergedMap[baseNumber];
          current.pointsAwarded += (item.pointsAwarded || 0);
          if (item.flags && item.flags.length > 0) {
            current.flags = [...new Set([...(current.flags || []), ...item.flags])];
          }
          
          if (item.teacherFeedback) {
            if (current.teacherFeedback) current.teacherFeedback += "\n\n";
            if (item.questionNumber !== criteriaMatch.questionNumber) {
               current.teacherFeedback += `[Part ${item.questionNumber}]: ${item.teacherFeedback}`;
            } else {
               current.teacherFeedback += item.teacherFeedback;
            }
          }
        });

        Object.values(mergedMap).forEach(item => {
          if (item.pointsAwarded >= item.maxPoints) item.status = "correct";
          else if (item.pointsAwarded === 0) item.status = "incorrect";
          else item.status = "partial";
        });

        const mergedList = [...Object.values(mergedMap), ...unmapped];
        
        mergedList.sort((a, b) => {
          const idxA = criteria.findIndex(c => c.questionNumber === a.questionNumber);
          const idxB = criteria.findIndex(c => c.questionNumber === b.questionNumber);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return 0;
        });

        return mergedList;
      };

      const finalFeedback = mergeFeedback(subData.feedback || [], exData.criteria);

      setExam(exData);
      setSubmission(subData);
      setFeedback(finalFeedback);
      
      const newScore = finalFeedback.reduce((sum, item) => sum + (item.pointsAwarded || 0), 0);
      setScore(Math.min(newScore, exData.totalMarks));
      setAllSubmissions(allData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = allSubmissions.findIndex(s => s._id === subId);
  const prevSub = currentIndex > 0 ? allSubmissions[currentIndex - 1] : null;
  const nextSub = currentIndex < allSubmissions.length - 1 ? allSubmissions[currentIndex + 1] : null;

  const navigateTo = (newSubId) => {
    if (newSubId) navigate(`/teacher/exams/${id}/grade/${newSubId}`);
  };

  const handleScoreChange = (idx, newPoints) => {
    const updated = [...feedback];
    let validPoints = newPoints;
    
    if (updated[idx].maxPoints > 0 && validPoints > updated[idx].maxPoints) {
      validPoints = updated[idx].maxPoints;
      toast.error(`Marks cannot exceed ${updated[idx].maxPoints} for this question.`);
    }
    if (validPoints < 0) validPoints = 0;

    updated[idx].pointsAwarded = validPoints;
    if (validPoints === updated[idx].maxPoints) updated[idx].status = "correct";
    else if (validPoints === 0) updated[idx].status = "incorrect";
    else updated[idx].status = "partial";
    setFeedback(updated);
    
    // update total score
    const newTotal = updated.reduce((sum, item) => sum + item.pointsAwarded, 0);
    if (newTotal > exam.totalMarks) {
      setScore(exam.totalMarks);
    } else {
      setScore(newTotal);
    }
  };

  const handleFeedbackChange = (idx, newText) => {
    const updated = [...feedback];
    updated[idx].teacherFeedback = newText;
    setFeedback(updated);
  };

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea.auto-resize");
    textareas.forEach(t => {
      t.style.height = "auto";
      t.style.height = t.scrollHeight + "px";
    });
  }, [feedback]);

  const confirmGrade = async () => {
    try {
      const response = await apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}/submissions/${subId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, feedback })
      });
      if (response.ok) {
        toast.success("Grade updated successfully!");
        fetchData(); // Refresh UI with updated score
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update grade.");
      }
    } catch(e) {
      console.error(e);
      toast.error("An error occurred while updating grade.");
    }
  };

  // Convert base64 PDF data to a data URL for react-pdf
  const pdfFile = useMemo(() => {
    if (submission?.pdfData) {
      return `data:application/pdf;base64,${submission.pdfData}`;
    }
    return null;
  }, [submission?.pdfData]);

  if (loading || !submission || !exam) return <GradingViewSkeleton />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link to={`/teacher/exams/${id}`} style={{ display: "flex", alignItems: "center", color: "#64748b", textDecoration: "none" }}>
            <ArrowLeft size={20} /> <span style={{ marginLeft: "4px", fontWeight: "500" }}>Back to Exam</span>
          </Link>
          <div style={{ width: "1px", height: "24px", backgroundColor: "#cbd5e1" }}></div>
          <div>
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>STUDENT</div>
            <div style={{ fontSize: "18px", color: "#0f172a", fontWeight: "bold" }}>{submission.studentId?.displayName || submission.studentId?.email || "Unassigned"}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden" }}>
            <button onClick={() => navigateTo(prevSub?._id)} disabled={!prevSub} style={{ padding: "8px 12px", border: "none", backgroundColor: prevSub ? "#fff" : "#f1f5f9", cursor: prevSub ? "pointer" : "not-allowed", borderRight: "1px solid #cbd5e1" }}>
              <ChevronLeft size={20} color={prevSub ? "#3b82f6" : "#cbd5e1"} />
            </button>
            <div style={{ padding: "8px 16px", backgroundColor: "#fff", fontWeight: "500", fontSize: "14px", color: "#475569" }}>
              {currentIndex + 1} of {allSubmissions.length}
            </div>
            <button onClick={() => navigateTo(nextSub?._id)} disabled={!nextSub} style={{ padding: "8px 12px", border: "none", backgroundColor: nextSub ? "#fff" : "#f1f5f9", cursor: nextSub ? "pointer" : "not-allowed", borderLeft: "1px solid #cbd5e1" }}>
              <ChevronRight size={20} color={nextSub ? "#3b82f6" : "#cbd5e1"} />
            </button>
          </div>
          
          <button onClick={confirmGrade} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
            <CheckCircle2 size={18} /> Confirm Grade
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left: PDF Viewer */}
        <div style={{ flex: 1, borderRight: "1px solid #cbd5e1", backgroundColor: "#4a5568", display: "flex", flexDirection: "column", overflow: "hidden" }}>
           {pdfFile ? (
             <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
               <Document
                 file={pdfFile}
                 onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                 onLoadError={(err) => console.error("PDF load error:", err)}
                 loading={<div style={{ color: "#cbd5e1", padding: "40px" }}>Loading PDF...</div>}
               >
                 {numPages && Array.from({ length: numPages }, (_, i) => (
                   <div key={i} style={{ marginBottom: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                     <Page
                       pageNumber={i + 1}
                       width={Math.min(700, window.innerWidth * 0.45)}
                       renderTextLayer={true}
                       renderAnnotationLayer={true}
                     />
                     <div style={{ position: "absolute", bottom: "8px", right: "12px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "500" }}>
                       {i + 1} / {numPages}
                     </div>
                   </div>
                 ))}
               </Document>
             </div>
           ) : (
             <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
               No PDF Data available.
             </div>
           )}
        </div>

        {/* Right: Feedback Panel */}
        <div style={{ width: "450px", backgroundColor: "#fff", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>TOTAL SCORE</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#0f172a" }}>{score} <span style={{ fontSize: "20px", color: "#94a3b8" }}>/{exam.totalMarks}</span></div>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {feedback.length === 0 ? (
              <div style={{ color: "#64748b", textAlign: "center" }}>No AI feedback generated for this submission yet.</div>
            ) : (
              feedback.map((fb, idx) => (
                <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", backgroundColor: fb.status === "correct" ? "#ecfdf5" : fb.status === "incorrect" ? "#fef2f2" : "#fffbeb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ fontWeight: "bold", color: "#1e293b", fontSize: "16px" }}>Question {fb.questionNumber}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input 
                        type="number" 
                        min="0" 
                        value={fb.pointsAwarded === null ? "" : fb.pointsAwarded}
                        onChange={(e) => {
                          const val = e.target.value;
                          const raw = val === "" ? 0 : parseFloat(val);
                          handleScoreChange(idx, raw);
                        }}
                        style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: "bold", fontSize: "16px", color: "#0f172a" }}
                      />
                      <span style={{ color: "#64748b", fontWeight: "600", margin: "0 4px" }}>/</span>
                      <input 
                        type="number" 
                        min="0" 
                        value={fb.maxPoints === null ? "" : fb.maxPoints}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newMax = val === "" ? 0 : parseFloat(val);
                          const updated = [...feedback];
                          updated[idx].maxPoints = newMax;
                          setFeedback(updated);
                          handleScoreChange(idx, updated[idx].pointsAwarded);
                        }}
                        style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px dashed #cbd5e1", textAlign: "center", fontWeight: "600", fontSize: "14px", color: "#64748b", backgroundColor: "transparent" }}
                        title="Edit Max Points"
                      />
                    </div>
                  </div>

                  {fb.flags && fb.flags.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d97706", backgroundColor: "#fef3c7", padding: "8px", borderRadius: "6px", fontSize: "14px", marginBottom: "12px" }}>
                      <AlertCircle size={16} /> <strong>Flagged:</strong> {fb.flags.join(", ")}
                    </div>
                  )}

                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>AI FEEDBACK & OVERRIDE</div>
                    <textarea 
                      className="auto-resize"
                      value={fb.teacherFeedback}
                      onChange={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                        handleFeedbackChange(idx, e.target.value);
                      }}
                      onFocus={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      style={{ 
                        width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", 
                        minHeight: "80px", resize: "none", overflow: "hidden", fontSize: "14px", 
                        lineHeight: "1.5", color: "#334155", boxSizing: "border-box" 
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
