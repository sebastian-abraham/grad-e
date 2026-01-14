import React from "react";

export default function Home() {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl">
      {/* TopAppBar */}
      <div className="flex items-center justify-between p-4 sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#101922]"></span>
          </button>
          <div className="size-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[2px] cursor-pointer">
            <img
              alt="Professor profile"
              className="rounded-full size-full object-cover border-2 border-background-light dark:border-background-dark"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0dPHn6eDV-0afaSD60c7h8jGkh4nP-g7klMngiUyqfKwyk4RPZQC4HM_oqgjbqDWlYaj6gD7LPNSxN8aXVLDiTWS5IMSeK8vkgV869QQ1LJfShrJ7bEntEwsJ-b4jHxVoVhcBjhYpUwiQGw8pjQ5kxrQCIujX7-kVxKFdjOBjYzvi1UHNY7_iaULTqHwXcKKvWskBZhDFSJu7qg54b7joo1nJjyvubtU7D9w0faX2ynCgGgx_k5JHI3FjB-aUDKlYugslh03Q5pI"
            />
          </div>
        </div>
      </div>

      {/* HeadlineText */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          Good Morning,
          <br />
          <span className="text-slate-500 dark:text-slate-400 text-2xl font-medium">
            Prof. Smith.
          </span>
        </h1>
      </div>

      {/* Summary Stats */}
      <div className="w-full overflow-x-auto no-scrollbar pl-5 pb-2">
        <div className="flex gap-4 pr-5 min-w-max">
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 w-[160px] h-[140px] group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                <span className="material-symbols-outlined">school</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Exams Graded
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                1,240
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 w-[160px] h-[140px] group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                <span className="material-symbols-outlined">analytics</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Avg. Score
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                78%
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-amber-100 dark:border-amber-900/30 w-[160px] h-[140px] group hover:border-amber-500/50 transition-colors relative overflow-hidden">
            <div className="absolute -right-4 -top-4 size-16 bg-amber-500/10 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500">
                <span className="material-symbols-outlined">
                  pending_actions
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                24
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 pt-6">
        <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
            <span className="material-symbols-outlined !text-[28px]">
              add_circle
            </span>
            <span className="text-sm font-bold">New Exam</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-transform hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined !text-[28px]">
              upload_file
            </span>
            <span className="text-sm font-bold">Upload Sheets</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="px-5 pt-8 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Recent Activity
          </h3>
          <a
            className="text-sm font-medium text-primary hover:text-blue-400"
            href="#"
          >
            View all
          </a>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined animate-spin text-xl">
                    autorenew
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Biology 101 - Finals
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Uploaded 2 mins ago • 45 sheets
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                Processing
              </span>
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500">Grading in progress...</span>
                <span className="text-primary font-medium">45%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-card-dark border-l-4 border-l-amber-500 border-y border-r border-y-slate-100 border-r-slate-100 dark:border-y-slate-800 dark:border-r-slate-800 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="size-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shrink-0">
                  <span className="material-symbols-outlined text-xl">
                    rate_review
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    History 202 - Quiz 3
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Oct 24 • 12 flagged items
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                Review
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="size-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 shrink-0">
                  <span className="material-symbols-outlined text-xl">
                    check_circle
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Math 101 - Midterm
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Oct 22 • 120 sheets
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                Done
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
