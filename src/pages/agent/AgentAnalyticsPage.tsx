import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch, authHeader } from '../../lib/api.ts';
import { OverviewMetrics, AgentPerformanceMetric } from '../../types.ts';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Award,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const AgentAnalyticsPage: React.FC = () => {
  const { token } = useAuth();

  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const PRIORITY_COLORS: Record<string, string> = {
    Critical: '#dc2626',
    High: '#f59e0b',
    Medium: '#2563eb',
    Low: '#10b981',
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    const headers = authHeader(token);

    try {
      const [resOverview, resVolume, resDept, resPriority, resAgents] = await Promise.all([
        apiFetch('/api/v1/analytics/overview', { headers }).then((r) => r.json()),
        apiFetch('/api/v1/analytics/volume-trend', { headers }).then((r) => r.json()),
        apiFetch('/api/v1/analytics/department-load', { headers }).then((r) => r.json()),
        apiFetch('/api/v1/analytics/priority-distribution', { headers }).then((r) => r.json()),
        apiFetch('/api/v1/analytics/agent-performance', { headers }).then((r) => r.json()),
      ]);

      if (resOverview.metrics) setOverview(resOverview.metrics);
      if (resVolume.volume_trend) setVolumeData(resVolume.volume_trend);
      if (resDept.department_load) setDeptData(resDept.department_load);
      if (resPriority.priority_distribution) setPriorityData(resPriority.priority_distribution);
      if (resAgents.agent_performance) setAgentPerformance(resAgents.agent_performance);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 shadow-xs">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-3" />
        <p className="text-xs sm:text-sm font-semibold text-slate-700">Aggregating incident metrics &amp; SLA compliance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Service Desk Analytics &amp; Reporting
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Mean Time to Resolution (MTTR), SLA compliance monitoring, and incident velocity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MTTR */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Mean Time to Resolution
            </span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white">{overview?.mttr_hours ?? 0}</span>
            <span className="text-xs font-semibold text-indigo-200">Hours</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">End-to-end incident turnaround</p>
        </div>

        {/* Total Tickets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Ingested
            </span>
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{overview?.total_tickets ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-2">All logged support requests</p>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resolved Tickets
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-600">{overview?.resolved_tickets ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            {overview && overview.total_tickets > 0
              ? `${((overview.resolved_tickets / overview.total_tickets) * 100).toFixed(0)}% resolution rate`
              : '0% rate'}
          </p>
        </div>

        {/* Critical Incidents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Critical Incidents
            </span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-rose-600">{overview?.critical_tickets ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-2">Severe multi-user disruptions</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Priority Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Priority Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of incidents segmented by severity tier
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry) => (
                    <Cell key={`cell-${entry.priority}`} fill={PRIORITY_COLORS[entry.priority] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Load (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Department Workload</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Incident volume distributed across technical routing units
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Chronological Ticket Volume Trend (Line Graph) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Incident Velocity Trend</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological ticket submission trend showing operational peak windows
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  name="Ingested Tickets"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agent Performance & SLA Compliance Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Specialist Performance &amp; SLA Compliance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Resolution throughput, individual MTTR, and SLA adherence rate
            </p>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            SLA Targets: Critical &le; 4h &bull; High &le; 8h &bull; Medium &le; 24h &bull; Low &le; 48h
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Agent ID</th>
                <th className="py-2.5 px-3">Technician Handle</th>
                <th className="py-2.5 px-3">Corporate Email</th>
                <th className="py-2.5 px-3">Resolved Count</th>
                <th className="py-2.5 px-3">Average MTTR</th>
                <th className="py-2.5 px-3">SLA Compliance</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {agentPerformance.map((agent) => (
                <tr key={agent.agent_id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">#{agent.agent_id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{agent.username}</td>
                  <td className="py-3 px-3 text-slate-500">{agent.email}</td>
                  <td className="py-3 px-3 font-bold text-indigo-600">
                    {agent.total_resolved_tickets} tickets
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    {agent.average_mttr_hours > 0 ? `${agent.average_mttr_hours} hrs` : 'N/A'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${agent.sla_compliance_rate}%` }}
                        />
                      </div>
                      <span className="font-bold text-emerald-700">{agent.sla_compliance_rate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      SLA Compliant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
