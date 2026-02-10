import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const fallbackResult = {
  examTitle: "Midterm: Physics 101",
  studentName: "Alex Johnson",
  score: 92,
  total: 100,
  gradeLetter: "A",
  points: "46/50",
  aiTimeSeconds: 0.4,
  confidence: 98,
  questions: [
    {
      id: "Q1",
      points: 10,
      status: "correct",
      prompt:
        "Define Newton's Second Law of Motion in terms of force, mass, and acceleration.",
      studentAnswer: "Force is equal to mass times acceleration (F=ma).",
      correctAnswer: "Force is equal to mass times acceleration (F=ma).",
      feedback: "Perfect match with key concepts. Full points awarded.",
    },
    {
      id: "Q2",
      points: 10,
      status: "partial",
      prompt: "Explain the concept of inertia.",
      studentAnswer: "Inertia is when an object stops moving.",
      correctAnswer:
        "Inertia is the tendency of an object to resist changes in its state of motion.",
      feedback:
        "Student partially understands resistance but incorrectly relates it only to stopping. -4 pts for incompleteness.",
    },
    {
      id: "Q3",
      points: 10,
      status: "incorrect",
      prompt:
        "Calculate the velocity of an object falling for 3 seconds (g=9.8m/s²).",
      studentAnswer: "12.5 m/s",
      correctAnswer: "29.4 m/s (v = g * t)",
      feedback:
        "Calculation error. Student did not apply v = gt correctly. No points awarded.",
    },
  ],
};

const statusConfig = {
  correct: {
    label: "Correct",
    chip: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
    accent: "from-green-500/10",
    border: "border-green-500/50",
  },
  partial: {
    label: "Partial Credit",
    chip: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
    accent: "from-yellow-500/10",
    border: "border-yellow-500/50",
  },
  incorrect: {
    label: "Incorrect",
    chip: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
    accent: "from-red-500/10",
    border: "border-red-500/50",
  },
};

export default function GradeDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result || fallbackResult;

  const scoreValue = Number(result.score || 0);
  const totalValue = Number(result.total || 100);
  const progress = Math.min(100, Math.max(0, (scoreValue / totalValue) * 100));
  const circumference = 440;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased min-h-screen flex justify-center">
      <div className="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        <header className="pt-12 pb-4 px-6 flex items-center justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="text-center">
            <h1 className="text-sm font-light text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {result.examTitle}
            </h1>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {result.studentName}
            </h2>
          </div>
          <button className="p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-32 px-4 space-y-6">
          <section className="mt-6 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-slate-200 dark:text-slate-800"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                ></circle>
                <circle
                  className="text-primary"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="70"
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  {scoreValue}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  / {totalValue}
                </span>
              </div>
            </div>
            <div className="mt-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="text-xs font-bold text-green-600 dark:text-green-400 tracking-wide">
                GRADE {result.gradeLetter}
              </span>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-card-dark rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm">
              <span className="material-symbols-outlined text-primary mb-1 text-xl">
                emoji_events
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Points
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {result.points}
              </span>
            </div>
            <div className="bg-white dark:bg-card-dark rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm">
              <span className="material-symbols-outlined text-primary mb-1 text-xl">
                bolt
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                AI Time
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {result.aiTimeSeconds}s
              </span>
            </div>
            <div className="bg-white dark:bg-card-dark rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 h-1 bg-primary"
                style={{ width: `${result.confidence || 0}%` }}
              ></div>
              <span className="material-symbols-outlined text-primary mb-1 text-xl">
                verified
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Confidence
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {result.confidence}%
              </span>
            </div>
          </section>

          <div className="flex items-center justify-between pt-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Review Answers
            </h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {result.questions?.length || 0} Questions
            </span>
          </div>

          {result.questions?.map((question, index) => {
            const status =
              statusConfig[question.status] || statusConfig.correct;
            return (
              <div
                key={`${question.id}-${index}`}
                className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${status.accent} to-transparent rounded-bl-3xl`}
                ></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {question.id} • {question.points}pts
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.chip}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        question.status === "correct"
                          ? "bg-green-500"
                          : question.status === "partial"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    ></span>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-4 leading-relaxed">
                  {question.prompt || question.question || ""}
                </p>
                <div className="space-y-3">
                  <div
                    className={`bg-slate-50 dark:bg-card-lighter rounded-lg p-3 border-l-2 ${status.border}`}
                  >
                    <p className="text-xs text-slate-400 mb-1">
                      Student Answer
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-300">
                      {question.studentAnswer}
                    </p>
                  </div>
                  {question.correctAnswer && question.status !== "correct" && (
                    <div className="bg-slate-50 dark:bg-card-lighter rounded-lg p-3 border-l-2 border-green-500/30 opacity-75">
                      <p className="text-xs text-slate-400 mb-1">
                        Correct Answer
                      </p>
                      <p className="text-sm text-slate-800 dark:text-slate-300">
                        {question.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-start space-x-3 bg-primary/5 dark:bg-primary/10 rounded-lg p-3 border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                    auto_awesome
                  </span>
                  <div>
                    <p className="text-xs font-bold text-primary mb-0.5">
                      AI Insight
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      {question.feedback}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="h-8"></div>
        </main>

        <div className="absolute bottom-0 w-full bg-white dark:bg-card-dark border-t border-slate-200 dark:border-slate-800 p-4 px-6 z-30">
          <div className="flex items-center space-x-3">
            <button className="flex flex-col items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-xl">edit</span>
              <span className="text-[10px] mt-1 font-medium">Edit</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-xl">email</span>
              <span className="text-[10px] mt-1 font-medium">Email</span>
            </button>
            <button className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl py-3 px-4 font-semibold text-sm shadow-lg shadow-primary/30 flex items-center justify-center transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined text-sm mr-2">
                check_circle
              </span>
              Confirm Grade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
