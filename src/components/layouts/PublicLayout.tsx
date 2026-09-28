import React from 'react';
import { Link, Outlet } from '../../lib/router.tsx';
import { Layers, Shield, LifeBuoy, BookOpen } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm transition group-hover:bg-blue-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 tracking-tight">ResolveIT</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  Service Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">AI-Powered IT Service Desk</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/documentation"
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Documentation</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
            <Link
              to="/agent/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Agent Portal</span>
            </Link>
            <Link
              to="/customer/login"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Get Support</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main page content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Minimal Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">ResolveIT</span>
            <span>&bull;</span>
            <span>Enterprise Automated Incident Routing &amp; IT Service Management</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link to="/documentation" className="hover:text-slate-900 transition">
              Academic &amp; System Docs
            </Link>
            <span>&bull;</span>
            <Link to="/customer/login" className="hover:text-slate-900 transition">
              Customer Sign In
            </Link>
            <span>&bull;</span>
            <Link to="/agent/login" className="hover:text-slate-900 transition">
              Agent Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
