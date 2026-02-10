import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleOpenUpload = () => {
    setUploadError("");
    setSelectedFile(null);
    setIsUploadOpen(true);
  };

  const handleCloseUpload = () => {
    if (isSubmitting) return;
    setIsUploadOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError("");
  };

  const handleSubmitUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a PDF file to upload.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setUploadError("Only PDF files are supported for grading.");
      return;
    }

    setIsSubmitting(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${apiBaseUrl}/api/grade`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to grade the upload.");
      }

      const data = await response.json();
      setIsUploadOpen(false);
      navigate("/results", { state: { result: data } });
    } catch (error) {
      setUploadError(error.message || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 1. Improved Base Layout: Soft background, centered content, proper dark mode handling
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 2. Constrained Wrapper: Prevents content from stretching too wide on 4k screens */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        {/* --- Top Navbar --- */}
        <header className="sticky top-0 z-50 flex items-center justify-between py-4 backdrop-blur-xl bg-slate-50/80 dark:bg-[#0f172a]/80 border-b border-slate-200/50 dark:border-slate-800/50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-8">
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center size-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              EduDash
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative flex items-center justify-center size-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2.5 right-3 size-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0f172a]"></span>
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-none">Prof. Smith</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Head of Biology
                </p>
              </div>
              <div className="size-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px] cursor-pointer ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#0f172a] hover:ring-2 hover:ring-blue-500 transition-all">
                <img
                  alt="Profile"
                  className="rounded-full size-full object-cover border-2 border-white dark:border-[#0f172a]"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                />
              </div>
            </div>
          </div>
        </header>

        {/* --- Welcome Section --- */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Good Morning,{" "}
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              Smith.
            </span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            You have{" "}
            <span className="font-bold text-indigo-500">24 pending items</span>{" "}
            to review today.
          </p>
        </div>

        {/* --- Main Dashboard Grid --- */}
        {/* Switched from flex to grid for perfect alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Stats & Activity) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Stats Cards - Auto responsive grid (1 col mobile, 3 col desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon="school"
                color="blue"
                label="Exams Graded"
                value="1,240"
                trend="+12% this week"
              />
              <StatCard
                icon="analytics"
                color="emerald"
                label="Average Score"
                value="78%"
                trend="+2.4% vs last term"
              />
              <StatCard
                icon="pending_actions"
                color="amber"
                label="Pending Review"
                value="24"
                trend="Requires attention"
                alert
              />
            </div>

            {/* Recent Activity Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    history
                  </span>
                  Recent Activity
                </h3>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline">
                  View full history
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Active Progress Card */}
                <div className="group p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined animate-spin-slow">
                          autorenew
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          Biology 101 - Finals
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          45 sheets • Uploaded 2 mins ago
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      PROCESSING
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full w-[45%] transition-all duration-1000 ease-out group-hover:w-[50%]"></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
                    <span>AI Grading in progress...</span>
                    <span>45%</span>
                  </div>
                </div>

                {/* Review Item */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-l-amber-500 border-y border-r border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="size-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined">
                          rate_review
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          History 202 - Quiz 3
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Oct 24 • 12 flagged items
                        </p>
                      </div>
                    </div>
                    <button className="text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      Review{" "}
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>

                {/* Completed Item */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          Math 101 - Midterm
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Oct 22 • 120 sheets
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Done
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Actions & Sidebar) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all group">
                  <span className="material-symbols-outlined text-3xl group-hover:-translate-y-1 transition-transform">
                    add_circle
                  </span>
                  <span className="text-sm font-bold">New Exam</span>
                </button>
                <button
                  onClick={handleOpenUpload}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 active:scale-95 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl group-hover:-translate-y-1 transition-transform">
                    upload_file
                  </span>
                  <span className="text-sm font-bold">Upload</span>
                </button>
                <button className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors border border-dashed border-slate-300 dark:border-slate-600">
                  <span className="material-symbols-outlined text-lg">
                    settings
                  </span>
                  Manage Classes
                </button>
              </div>
            </div>

            {/* Mini Schedule / Notices */}
            <div className="p-6 rounded-3xl bg-slate-900 dark:bg-black text-white shadow-xl relative overflow-hidden">
              {/* Decorative Gradient Blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>

              <h3 className="font-bold text-lg mb-4 relative z-10">Upcoming</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col items-center bg-slate-800 rounded-lg p-2 min-w-[50px]">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      Oct
                    </span>
                    <span className="text-xl font-bold">28</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Department Meeting</p>
                    <p className="text-xs text-slate-400">
                      10:00 AM • Room 302
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col items-center bg-slate-800 rounded-lg p-2 min-w-[50px]">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      Nov
                    </span>
                    <span className="text-xl font-bold">02</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bio 101 Grades Due</p>
                    <p className="text-xs text-slate-400">5:00 PM • Canvas</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#111a22] border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Upload Answer Sheets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PDF only. We will grade with Gemini 2.5 Flash.
                </p>
              </div>
              <button
                onClick={handleCloseUpload}
                className="flex items-center justify-center size-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 dark:bg-slate-900/40 p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">
                      cloud_upload
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Tap to select a PDF
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Grading starts after you submit.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:shadow"
                  >
                    Browse Files
                  </button>
                  {selectedFile && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 px-4 py-3 text-xs text-rose-600 dark:text-rose-200">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleCloseUpload}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitUpload}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Uploading..." : "Submit for Grading"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for clean code reusability
function StatCard({ icon, color, label, value, trend, alert }) {
  // Color mapping for dynamic classes
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  };

  return (
    <div
      className={`
      relative p-6 rounded-2xl bg-white dark:bg-slate-800 
      border border-slate-200 dark:border-slate-700 
      shadow-sm hover:shadow-md transition-all duration-300 group
      ${alert ? "ring-1 ring-amber-500/50" : ""}
    `}
    >
      {alert && (
        <span className="absolute top-4 right-4 flex size-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full size-2.5 bg-amber-500"></span>
        </span>
      )}

      <div
        className={`size-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]} group-hover:scale-110 transition-transform`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="flex items-end gap-2 mt-1">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
            {value}
          </h3>
        </div>
        <p
          className={`text-xs font-medium mt-2 ${
            alert ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          {trend}
        </p>
      </div>
    </div>
  );
}
