import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch, authHeader } from '../../lib/api.ts';
import { Ticket, Department, OverviewMetrics } from '../../types.ts';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../../components/ui/PriorityBadge.tsx';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronRight,
  Edit3,
  Mail,
  X,
  Bot
} from 'lucide-react';

export const AgentDashboardPage: React.FC = () => {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [overrideModalTicket, setOverrideModalTicket] = useState<Ticket | null>(null);
  const [newDepartmentId, setNewDepartmentId] = useState<number>(1);
  const [newPriority, setNewPriority] = useState<string>('Medium');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    const headers = authHeader(token);

    try {
      const [resTickets, resDepts, resOverview] = await Promise.all([
        apiFetch('/api/v1/agent/tickets', { headers }).then((r) => r.json()),
        apiFetch('/api/v1/departments').then((r) => r.json()),
        apiFetch('/api/v1/analytics/overview', { headers }).then((r) => r.json()),
      ]);

      if (resTickets.tickets) setTickets(resTickets.tickets);
      if (resDepts.departments) setDepartments(resDepts.departments);
      if (resOverview.metrics) setOverview(resOverview.metrics);
    } catch (err) {
      console.error('Failed to load agent dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // Status transition: Open -> In-Progress -> Resolved
  const handleStatusChange = async (ticketId: number, status: 'Open' | 'In-Progress' | 'Resolved') => {
    setIsUpdating(true);
    try {
      const res = await apiFetch(`/api/v1/agent/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify({
          status,
          resolution_notes: status === 'Resolved' ? resolutionNotes : undefined,
        }),
      });

      if (!res.ok) throw new Error('Status transition failed');
      const data = await res.json();

      fetchDashboardData();
      if (selectedTicket && selectedTicket.ticket_id === ticketId) {
        setSelectedTicket(data.ticket);
      }
      setResolutionNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Manual AI Override
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalTicket) return;
    setIsUpdating(true);

    try {
      const res = await apiFetch(`/api/v1/agent/tickets/${overrideModalTicket.ticket_id}/override`, {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify({
          department_id: newDepartmentId,
          ai_priority: newPriority,
        }),
      });

      if (!res.ok) throw new Error('Classification override failed');
      fetchDashboardData();
      setOverrideModalTicket(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save classification override');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || (t.department_name || t.ai_category) === deptFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issue_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticket_id.toString().includes(searchTerm);
    return matchesStatus && matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header Overview & Stats Cards */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Support Operations Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time incident queues, automated urgency triage, and resolution workflows
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open tickets */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Open Tickets
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 block">
              {overview?.open_tickets ?? tickets.filter((t) => t.status === 'Open').length}
            </span>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">Pending triage &amp; action</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Critical tickets */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
              Critical Incidents
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
              {tickets.filter((t) => t.ai_priority === 'Critical' && t.status !== 'Resolved').length}
            </span>
            <span className="text-[11px] text-rose-500 font-medium mt-0.5 block">Immediate attention required</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* High priority */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">
              High Priority
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1 block">
              {tickets.filter((t) => t.ai_priority === 'High' && t.status !== 'Resolved').length}
            </span>
            <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">Elevated impact tickets</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Average Resolution Time (MTTR) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Avg Resolution Time
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {overview?.mttr_hours ?? 0}
              </span>
              <span className="text-xs font-semibold text-slate-400">hours</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Mean Time to Resolution</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Main Section: Priority Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <span>Priority Incident Queue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked dynamically by severity: Critical &rarr; High &rarr; Medium &rarr; Low
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket / user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 w-44"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl text-slate-700 bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_name}>
                  {d.department_name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl text-slate-700 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchDashboardData}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Priority Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4">Subject &amp; Issue</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Status Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTickets.map((ticket) => {
                const isCritical = ticket.ai_priority === 'Critical';
                return (
                  <tr
                    key={ticket.ticket_id}
                    className={`transition hover:bg-slate-50/80 ${
                      isCritical && ticket.status !== 'Resolved' ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                      #{ticket.ticket_id}
                    </td>
                    <td className="py-3.5 px-3">
                      <PriorityBadge priority={ticket.ai_priority} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{ticket.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{ticket.issue_description}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{ticket.customer_username}</div>
                      <div className="text-slate-400 text-[11px]">{ticket.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 font-medium text-slate-700">
                        {ticket.department_name || ticket.ai_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
                        <button
                          disabled={isUpdating || ticket.status === 'Open'}
                          onClick={() => handleStatusChange(ticket.ticket_id, 'Open')}
                          className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                            ticket.status === 'Open'
                              ? 'bg-white shadow-2xs font-bold text-blue-600'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Open
                        </button>
                        <button
                          disabled={isUpdating || ticket.status === 'In-Progress'}
                          onClick={() => handleStatusChange(ticket.ticket_id, 'In-Progress')}
                          className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                            ticket.status === 'In-Progress'
                              ? 'bg-white shadow-2xs font-bold text-amber-600'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Progress
                        </button>
                        <button
                          disabled={isUpdating || ticket.status === 'Resolved'}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                            ticket.status === 'Resolved'
                              ? 'bg-white shadow-2xs font-bold text-emerald-600'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setOverrideModalTicket(ticket);
                            const currentDept = departments.find(
                              (d) => d.department_name === (ticket.department_name || ticket.ai_category)
                            );
                            setNewDepartmentId(currentDept ? currentDept.department_id : 1);
                            setNewPriority(ticket.ai_priority);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Override AI Classification"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Ticket Review & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    Ticket #{selectedTicket.ticket_id}
                  </span>
                  <PriorityBadge priority={selectedTicket.ai_priority} />
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                    {selectedTicket.department_name || selectedTicket.ai_category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedTicket.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Information Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Submitting Customer Information
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">User:</span>
                  <span className="font-semibold">{selectedTicket.customer_username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email:</span>
                  <span className="font-semibold">{selectedTicket.customer_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Submitted:</span>
                  <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Agent:</span>
                  <span className="font-semibold text-indigo-600">
                    {selectedTicket.resolved_by_username || user?.username || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px] mb-1">
                Customer Issue Description
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.issue_description}
              </p>
            </div>

            {/* AI Analysis & Recommended Solution */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>AI Triage Analysis &amp; Suggested Resolution</span>
              </div>
              <p className="text-slate-700 italic leading-relaxed">
                "{selectedTicket.suggested_solution || 'Perform initial standard diagnostic triage.'}"
              </p>
            </div>

            {/* Resolution Form (if not yet resolved) */}
            {selectedTicket.status !== 'Resolved' ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <label className="block font-bold text-emerald-900">
                  Resolution Notes &amp; Root Cause Analysis:
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document the resolution steps, repairs performed, or advice to close this incident..."
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Automatically sends email notification to {selectedTicket.customer_email}
                  </span>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.ticket_id, 'Resolved')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve &amp; Notify</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ticket closed on {new Date(selectedTicket.resolved_at || '').toLocaleString()}.</span>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setOverrideModalTicket(selectedTicket);
                  const currentDept = departments.find(
                    (d) => d.department_name === (selectedTicket.department_name || selectedTicket.ai_category)
                  );
                  setNewDepartmentId(currentDept ? currentDept.department_id : 1);
                  setNewPriority(selectedTicket.ai_priority);
                  setSelectedTicket(null);
                }}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Override Classification</span>
              </button>

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Manual AI Override Modal */}
      {overrideModalTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Manual Override for Ticket #{overrideModalTicket.ticket_id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Adjust assigned department category or urgency priority tier
              </p>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Target Department</label>
                <select
                  value={newDepartmentId}
                  onChange={(e) => setNewDepartmentId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Priority Urgency</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="Critical">Critical &bull; Major operational outage</option>
                  <option value="High">High &bull; Severely degraded service</option>
                  <option value="Medium">Medium &bull; Workaround available</option>
                  <option value="Low">Low &bull; Non-urgent / Cosmetic inquiry</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalTicket(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
