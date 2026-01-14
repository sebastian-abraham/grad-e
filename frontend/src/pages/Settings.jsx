import React from "react";

export default function Settings() {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Section: Profile */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Profile Information</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="text-sm font-semibold text-blue-600 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                Change Photo
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Prof. Smith"
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="smith@university.edu"
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: App Preferences */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">App Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-slate-500">
                    Sync with system theme
                  </p>
                </div>
                <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute top-1 right-1 size-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <hr className="border-slate-100 dark:border-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-500">
                    Receive weekly summaries
                  </p>
                </div>
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-fullQl relative cursor-pointer">
                  <div className="absolute top-1 left-1 size-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pb-8">
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
