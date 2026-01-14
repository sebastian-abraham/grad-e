import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        
        <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-6">
           <span className="material-symbols-outlined text-5xl text-slate-400">sentiment_dissatisfied</span>
        </div>

        <h1 className="text-6xl font-bold text-slate-900 dark:text-white">404</h1>
        <h2 className="text-xl font-medium text-slate-500">Page not found</h2>
        
        <p className="text-slate-400">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-1"
        >
          <span className="material-symbols-outlined">home</span>
          Go Back Home
        </Link>
      </div>
    </div>
  );
}