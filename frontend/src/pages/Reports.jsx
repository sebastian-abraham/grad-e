import React from "react";

export default function Reports() {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Analytics Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Performance metrics across all your classes.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <p className="text-xs font-medium text-slate-500 uppercase">Avg. Class Score</p>
             <p className="text-2xl font-bold mt-1">78.4%</p>
             <span className="text-xs text-emerald-500 font-medium">↑ 2.1% vs last term</span>
           </div>
           <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <p className="text-xs font-medium text-slate-500 uppercase">Papers Graded</p>
             <p className="text-2xl font-bold mt-1">1,240</p>
             <span className="text-xs text-slate-400">Total this semester</span>
           </div>
           <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <p className="text-xs font-medium text-slate-500 uppercase">Top Performer</p>
             <p className="text-2xl font-bold mt-1">Biology</p>
             <span className="text-xs text-blue-500 font-medium">Class 101-A</span>
           </div>
           <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <p className="text-xs font-medium text-slate-500 uppercase">Needs Focus</p>
             <p className="text-2xl font-bold mt-1">History</p>
             <span className="text-xs text-amber-500 font-medium">Class 202-B</span>
           </div>
        </div>

        {/* Detailed Report List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold">Recent Assessments</h3>
            <button className="text-sm text-blue-600 font-medium">Download CSV</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                    {item}
                  </div>
                  <div>
                    <p className="font-semibold">Biology 101 Final Exam</p>
                    <p className="text-xs text-slate-500">Oct 24 • 45 Students</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-bold">82%</p>
                   <p className="text-xs text-slate-500">Avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}