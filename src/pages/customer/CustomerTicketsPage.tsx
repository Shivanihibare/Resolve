import React, { useState, useEffect } from 'react';
import { Link } from '../../lib/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch, authHeader } from '../../lib/api.ts';
import { Ticket } from '../../types.ts';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../../components/ui/PriorityBadge.tsx';
import {
  Search,
  PlusCircle,
  FileText,
  X,
  Bot,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export const CustomerTicketsPage: React.FC = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
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

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issue_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ai_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticket_id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Support Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track status, AI triage diagnosis, and technician resolution notes
          </p>
        </div>

        <Link
          to="/customer/tickets/new"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket ID, subject, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs self-start md:self-auto">
          {['ALL', 'Open', 'In-Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-white shadow-2xs text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="inline-block animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
            <p>Loading your tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto opacity-40 text-slate-500" />
            <p className="text-sm font-medium text-slate-600">No support tickets found matching your query.</p>
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
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.map((ticket) => (
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
                      {new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Ticket #{selectedTicket.ticket_id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedTicket.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedTicket.status} />
                </div>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Priority</span>
                <div className="mt-1">
                  <PriorityBadge priority={selectedTicket.ai_priority} />
                </div>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800 mt-1 block">
                  {selectedTicket.department_name || selectedTicket.ai_category}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Assigned Agent</span>
                <span className="font-semibold text-slate-800 mt-1 block">
                  {selectedTicket.resolved_by_username || 'Triage Specialist'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Issue Description</h4>
              <p className="p-3.5 bg-slate-50 rounded-xl text-slate-800 whitespace-pre-wrap border border-slate-200 leading-relaxed">
                {selectedTicket.issue_description}
              </p>
            </div>

            {/* AI Suggested Resolution */}
            {selectedTicket.suggested_solution && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Recommended Diagnostics &amp; Agent Resolution Notes</span>
                </h4>
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-slate-800 leading-relaxed italic">
                  "{selectedTicket.suggested_solution}"
                </div>
              </div>
            )}

            {/* Resolved notice */}
            {selectedTicket.resolved_at && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Resolved on {new Date(selectedTicket.resolved_at).toLocaleString()}. Automated closure confirmation sent to your email.
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
