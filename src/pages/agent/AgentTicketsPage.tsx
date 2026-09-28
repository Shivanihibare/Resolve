import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch, authHeader } from '../../lib/api.ts';
import { Ticket, Department, AILog, SentEmail } from '../../types.ts';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { PriorityBadge } from '../../components/ui/PriorityBadge.tsx';
import {
  Inbox,
  Search,
  RefreshCw,
  ChevronRight,
  Edit3,
  Mail,
  Sparkles,
  Terminal,
  CheckCircle2,
  AlertOctagon,
  Bot,
  X
} from 'lucide-react';

export const AgentTicketsPage: React.FC = () => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'queue' | 'ai_logs' | 'emails'>('queue');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedRawResponse, setSelectedRawResponse] = useState<string | null>(null);
  const [overrideModalTicket, setOverrideModalTicket] = useState<Ticket | null>(null);
  const [newDepartmentId, setNewDepartmentId] = useState<number>(1);
  const [newPriority, setNewPriority] = useState<string>('Medium');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    const headers = authHeader(token);

    try {
      const [resTickets, resDepts, resLogs, resEmails] = await Promise.all([
        apiFetch('/api/v1/agent/tickets', { headers }).then((r) => r.json()),
        apiFetch('/api/v1/departments').then((r) => r.json()),
        apiFetch('/api/v1/agent/ai-logs', { headers }).then((r) => r.json()),
        apiFetch('/api/v1/agent/emails', { headers }).then((r) => r.json()),
      ]);

      if (resTickets.tickets) setTickets(resTickets.tickets);
      if (resDepts.departments) setDepartments(resDepts.departments);
      if (resLogs.logs) setAiLogs(resLogs.logs);
      if (resEmails.emails) setEmails(resEmails.emails);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

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
      fetchData();
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
      fetchData();
      setOverrideModalTicket(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save classification override');
    } finally {
      setIsUpdating(false);
    }
  };

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
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Service Desk Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prioritized tickets, automated triage logs, and dispatch audit history
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Ticket Queue ({filteredTickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_logs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai_logs' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Triage Logs ({aiLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'emails' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Outbox ({emails.length})</span>
          </button>
        </div>
      </div>

      {/* 1. Ticket Queue Tab */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket / user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2">
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

              <button
                onClick={fetchData}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                title="Refresh queue"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-center">Status Action</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-slate-50/70 transition">
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
                      <span className="font-semibold text-slate-800">{ticket.customer_username}</span>
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
                            ticket.status === 'Open' ? 'bg-white shadow-2xs font-bold text-blue-600' : 'text-slate-500'
                          }`}
                        >
                          Open
                        </button>
                        <button
                          disabled={isUpdating || ticket.status === 'In-Progress'}
                          onClick={() => handleStatusChange(ticket.ticket_id, 'In-Progress')}
                          className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                            ticket.status === 'In-Progress' ? 'bg-white shadow-2xs font-bold text-amber-600' : 'text-slate-500'
                          }`}
                        >
                          Progress
                        </button>
                        <button
                          disabled={isUpdating || ticket.status === 'Resolved'}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                            ticket.status === 'Resolved' ? 'bg-white shadow-2xs font-bold text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. AI Logs Tab (Preserved for Audit / Evaluation) */}
      {activeTab === 'ai_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <strong>Automated AI Triage Audit:</strong> Each ticket generates an immutable 1:1 log capturing model latency, token utilization, and raw structured JSON responses.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Ticket</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Tokens</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">JSON Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {aiLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{log.log_id}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">Ticket #{log.ticket_id}</td>
                    <td className="py-2.5 px-3">{log.model_name}</td>
                    <td className="py-2.5 px-3">{log.tokens_used} tokens</td>
                    <td className="py-2.5 px-3">{log.latency_ms} ms</td>
                    <td className="py-2.5 px-3">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                          <AlertOctagon className="w-3 h-3" /> FALLBACK
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedRawResponse(log.raw_response)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Terminal className="w-3 h-3 text-slate-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Customer Email Dispatch Outbox Tab */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <strong>Customer Notification Outbox:</strong> Automated notification emails dispatched when incidents transition to <em>Resolved</em>.
          </div>

          {emails.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No resolution notification emails triggered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div key={email.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{email.subject}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        To: {email.recipient_name} ({email.recipient_email}) &bull; Sent: {new Date(email.sent_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {email.delivery_status}
                    </span>
                  </div>
                  <div
                    className="bg-white p-3 rounded-lg border border-slate-200"
                    dangerouslySetInnerHTML={{ __html: email.html_content }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Modal */}
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

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px] mb-1">
                Customer Issue Description
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.issue_description}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500 text-[11px]">
                Reported by {selectedTicket.customer_username} ({selectedTicket.customer_email}) on{' '}
                {new Date(selectedTicket.created_at).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>AI Model Recommendation</span>
              </div>
              <p className="text-slate-700 italic leading-relaxed">
                "{selectedTicket.suggested_solution || 'Perform initial standard troubleshooting.'}"
              </p>
            </div>

            {selectedTicket.status !== 'Resolved' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <label className="block font-bold text-emerald-900">
                  Resolution Notes &amp; Root Cause Analysis:
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter diagnostic details, fix applied, or closure remarks..."
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Triggers automated closure dispatch
                  </span>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.ticket_id, 'Resolved')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            )}

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

      {/* Raw JSON Modal for Audit */}
      {selectedRawResponse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 max-w-xl w-full p-5 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Raw AI Response Payload</span>
              </span>
              <button
                onClick={() => setSelectedRawResponse(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto mt-3 p-3 bg-black/60 rounded-xl font-mono text-xs whitespace-pre-wrap text-emerald-300">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(selectedRawResponse), null, 2);
                } catch {
                  return selectedRawResponse;
                }
              })()}
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRawResponse(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Classification Override Modal */}
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
