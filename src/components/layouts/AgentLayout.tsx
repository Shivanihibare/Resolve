import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from '../../lib/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Inbox,
  BarChart3,
  Shield,
  LogOut,
  BookOpen,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export const AgentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/agent/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/agent', icon: LayoutDashboard, end: true },
    { label: 'Tickets', path: '/agent/tickets', icon: Inbox, end: true },
    { label: 'Analytics', path: '/agent/analytics', icon: BarChart3, end: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Enterprise Agent Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Agent Portal Indicator */}
            <div className="flex items-center gap-6">
              <Link to="/agent" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white tracking-tight">ResolveIT</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Agent Console
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-none">Support Operations &amp; Triage</p>
                </div>
              </Link>

              {/* Desktop Nav Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right side: Academic Docs & Agent Account */}
            <div className="flex items-center gap-3">
              <Link
                to="/documentation"
                className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
                title="Academic Documentation & System Architecture"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>System Docs</span>
              </Link>

              {/* Agent Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-none">{user?.username}</p>
                    <span className="text-[10px] text-amber-400 font-medium">Support Agent</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {accountMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-800"
                    onMouseLeave={() => setAccountMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user?.username}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                          Authorized Agent
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/documentation"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>System Documentation</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/documentation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                System Documentation
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResolveIT Agent Console &bull; High-Priority Incident Management &amp; SLA Tracking</span>
          <Link to="/documentation" className="hover:text-slate-800 font-medium">
            System Architecture &amp; DFDs
          </Link>
        </div>
      </footer>
    </div>
  );
};

