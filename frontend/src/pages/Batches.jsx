import React from "react";

export default function Batches() {
  const batches = [
    { id: 1, name: "Biology 101 - Finals", date: "Oct 24, 2023", papers: 45, status: "Processing", color: "blue" },
    { id: 2, name: "History 202 - Quiz 3", date: "Oct 24, 2023", papers: 28, status: "Review", color: "amber" },
    { id: 3, name: "Math 101 - Midterm", date: "Oct 22, 2023", papers: 120, status: "Done", color: "emerald" },
    { id: 4, name: "Physics 305 - Lab", date: "Oct 20, 2023", papers: 32, status: "Done", color: "emerald" },
    { id: 5, name: "Chemistry 101 - Unit 1", date: "Oct 18, 2023", papers: 55, status: "Done", color: "emerald" },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Exam Batches</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and track your uploaded exam sets.</p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-xl">upload_file</span>
            <span>Upload New Batch</span>
          </button>
        </div>

        {/* Filters (Mock) */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
           {['All', 'Processing', 'Review Needed', 'Completed'].map((filter, i) => (
             <button key={filter} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${i === 0 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
               {filter}
             </button>
           ))}
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div key={batch.id} className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`size-10 rounded-lg flex items-center justify-center bg-${batch.color}-50 dark:bg-${batch.color}-900/20 text-${batch.color}-600`}>
                  <span className="material-symbols-outlined">folder</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              
              <h3 className="font-bold text-lg mb-1 truncate">{batch.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{batch.date} • {batch.papers} papers</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-${batch.color}-100 dark:bg-${batch.color}-500/10 text-${batch.color}-700 dark:text-${batch.color}-400`}>
                  <span className={`size-1.5 rounded-full bg-${batch.color}-500`}></span>
                  {batch.status}
                </span>
                <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}