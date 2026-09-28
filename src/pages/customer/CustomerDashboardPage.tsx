import React, { useState, useEffect } from 'react';
import { Link } from '../../lib/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch, authHeader } from '../../lib/api.ts';
import { Ticket } from '../../types.ts';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../../components/ui/PriorityBadge.tsx';
import {
  PlusCircle,
  Clock,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  LifeBuoy,
  FileText
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets();
  }, [token]);

  const fetchMyTickets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/tickets/my', {
        headers: authHeader(token),
      });
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const openTickets = tickets.filter((t) => t.status === 'Open');
  const inProgressTickets = tickets.filter((t) => t.status === 'In-Progress');
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header Greeting & Submit CTA Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-1">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>IT Self-Service Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.username}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit incident reports, request technical assistance, and track ticket resolutions in real time.
          </p>
        </div>

        <Link
          to="/customer/tickets/new"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Request</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Open */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Open Requests
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 block">
              {openTickets.length}
            </span>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">Awaiting agent assignment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In-Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 block">
              {inProgressTickets.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Active troubleshooting</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Recently Resolved
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 block">
              {resolvedTickets.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Closed successfully</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Recent Service Requests</h2>
            <p className="text-xs text-slate-500">Your latest support tickets and status updates</p>
          </div>
          <Link
            to="/customer/tickets"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="inline-block animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
            <p>Loading your requests...</p>
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-8 h-8 mx-auto opacity-40 text-slate-500" />
            <p className="text-sm font-medium text-slate-600">No support requests submitted yet.</p>
            <Link
              to="/customer/tickets/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit your first request</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 text-xs">
                      #{ticket.ticket_id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{ticket.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{ticket.issue_description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                        {ticket.department_name || ticket.ai_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={ticket.ai_priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to="/customer/tickets"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
