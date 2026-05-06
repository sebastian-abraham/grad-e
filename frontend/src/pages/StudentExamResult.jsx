import { apiFetch } from "../utils/apiFetch";
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, Award } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { StudentExamResultSkeleton } from "../components/SkeletonUI";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StudentExamResult() {
  const { id, subId } = useParams();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id, subId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exRes, subRes] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}/submissions/${subId}`)
      ]);
      
      const exData = await exRes.json();
      const subData = await subRes.json();

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

      if (subData && subData.feedback) {
        subData.feedback = mergeFeedback(subData.feedback, exData.criteria);
        subData.score = subData.feedback.reduce((sum, item) => sum + (item.pointsAwarded || 0), 0);
        subData.score = Math.min(subData.score, exData.totalMarks);
      }

      setExam(exData);
      setSubmission(subData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [numPages, setNumPages] = useState(null);
  const pdfFile = useMemo(() => {
    if (submission?.pdfData) {
      return `data:application/pdf;base64,${submission.pdfData}`;
    }
    return null;
  }, [submission?.pdfData]);

  if (loading || !submission || !exam) return <StudentExamResultSkeleton />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link to={`/student`} style={{ display: "flex", alignItems: "center", color: "#64748b", textDecoration: "none" }}>
            <ArrowLeft size={20} /> <span style={{ marginLeft: "4px", fontWeight: "500" }}>Back to Dashboard</span>
          </Link>
          <div style={{ width: "1px", height: "24px", backgroundColor: "#cbd5e1" }}></div>
          <div>
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>EXAM RESULT</div>
            <div style={{ fontSize: "18px", color: "#1e1b4b", fontWeight: "bold" }}>{exam.name} - {exam.subjectId?.name}</div>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left: PDF Viewer */}
        <div style={{ flex: 1, borderRight: "1px solid #cbd5e1", backgroundColor: "#e2e8f0", display: "flex", flexDirection: "column", overflow: "auto" }}>
          {pdfFile ? (
            <Document
              file={pdfFile}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div style={{ textAlign: "center", marginTop: 40 }}>Loading PDF...</div>}
              error={<div style={{ color: "#e53e3e", textAlign: "center", marginTop: 40 }}>Failed to load PDF.</div>}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} width={600} />
              ))}
            </Document>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
              No PDF Data available.
            </div>
          )}
        </div>

        {/* Right: Read-Only Feedback Panel */}
        <div style={{ width: "450px", backgroundColor: "#fff", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "32px 24px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Award size={40} color="#4f46e5" style={{ marginBottom: "12px" }} />
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", marginBottom: "4px", letterSpacing: "1px" }}>FINAL SCORE</div>
            <div style={{ fontSize: "56px", fontWeight: "bold", color: "#1e1b4b", lineHeight: "1" }}>{submission.score} <span style={{ fontSize: "24px", color: "#94a3b8" }}>/{exam.totalMarks}</span></div>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", backgroundColor: "#f1f5f9", flex: 1 }}>
            {(!submission.feedback || submission.feedback.length === 0) ? (
              <div style={{ color: "#64748b", textAlign: "center" }}>No detailed feedback generated for this submission.</div>
            ) : (
              submission.feedback.map((fb, idx) => (
                <div key={idx} style={{ 
                  borderRadius: "12px", padding: "20px",
                  border: fb.status === "correct" ? "1px solid #34d399" : fb.status === "incorrect" ? "1px solid #f87171" : "1px solid #fbbf24",
                  backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#334155", fontSize: "18px" }}>
                      {fb.status === "correct" ? <CheckCircle2 size={20} color="#10b981" /> : fb.status === "incorrect" ? <AlertCircle size={20} color="#ef4444" /> : <Award size={20} color="#f59e0b" />}
                      Question {fb.questionNumber}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "24px", fontWeight: "bold", color: fb.status === "correct" ? "#10b981" : fb.status === "incorrect" ? "#ef4444" : "#f59e0b" }}>{fb.pointsAwarded}</span>
                      <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "14px" }}>/ {fb.maxPoints} pts</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", marginBottom: "4px", textTransform: "uppercase" }}>Question Prompt</div>
                    <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      {fb.prompt || "No prompt available"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "600", marginBottom: "4px", textTransform: "uppercase" }}>Instructor Feedback</div>
                    <div style={{ fontSize: "15px", color: "#1e293b", lineHeight: "1.6", padding: "16px", backgroundColor: "#eef2ff", borderRadius: "8px", border: "1px solid #c7d2fe" }}>
                      {fb.teacherFeedback || "No additional feedback provided."}
                    </div>
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
