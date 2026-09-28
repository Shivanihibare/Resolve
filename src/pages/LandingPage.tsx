import React from 'react';
import { Link } from '../lib/router.tsx';
import {
  Sparkles,
  ArrowRight,
  Shield,
  LifeBuoy,
  Cpu,
  Clock,
  CheckCircle2,
  Building2,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Intelligent IT Service Desk</span>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            ResolveIT
          </h1>
          <p className="text-lg sm:text-xl font-medium text-blue-600">
            AI-powered IT Service Desk
          </p>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Submit an IT issue. Let AI classify it, prioritize it, and recommend a resolution.
          </p>
        </div>

        {/* Primary and Secondary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/customer/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Get IT Support</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/agent/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-2xs transition flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-slate-600" />
            <span>Agent Portal</span>
          </Link>
        </div>

        {/* 2. Visual Workflow (Submit -> AI Triage -> Agent -> Resolution) */}
        <div className="pt-12 max-w-4xl mx-auto">
          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">
              Automated Incident Lifecycle
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">1. Submit</span>
                <p className="text-[11px] text-slate-500 mt-1">User reports issue via web portal</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">2. AI Triage</span>
                <p className="text-[11px] text-slate-500 mt-1">Categorizes &amp; scores urgency</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">3. Agent Queue</span>
                <p className="text-[11px] text-slate-500 mt-1">Prioritized routing to technician</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">4. Resolution</span>
                <p className="text-[11px] text-slate-500 mt-1">Closed with automated notification</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works / Key Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Engineered for high-throughput enterprise IT service desks to minimize resolution times and eliminate manual triage bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI-Powered Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyzes raw incident descriptions instantly using state-of-the-art LLMs to map issues into standard ITIL categories.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Priority Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects outage severity and blast radius dynamically, ensuring Critical and High tickets always bypass routine backlogs.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Agent Workflow</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides tier-1/tier-2 specialists with pre-populated diagnostic suggestions, manual overrides, and single-click state transitions.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Ticket Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time customer status visibility, automated dispatch notifications, and comprehensive MTTR performance reporting.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Realistic Enterprise Scenario: Nexora Technologies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-md">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between mb-8 pb-8 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 text-indigo-300 text-xs font-semibold mb-3 border border-slate-700">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enterprise Case Study</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Nexora Technologies
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Internal IT Service Desk Operations &bull; 1,400+ Headcount Deployment
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Incident Impact</span>
                <span className="text-xs font-bold text-rose-400">Finance ERP Outage</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Triage Speed</span>
                <span className="text-xs font-bold text-emerald-400">&lt; 850 ms</span>
              </div>
            </div>
          </div>

          {/* Scenario Stepper Walkthrough */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Step 1 &bull; Submission</span>
              <h3 className="text-sm font-semibold text-white">Employee Report</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                An employee reports that the Finance ERP system is throwing 504 gateway timeouts for all payroll officers during month-end closing.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Step 2 &bull; Classification</span>
              <h3 className="text-sm font-semibold text-white">AI Classification</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                ResolveIT engine extracts context, categorizes the incident under <span className="text-white font-semibold">Software</span>, and links technical diagnostic guidance.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Step 3 &bull; Prioritization</span>
              <h3 className="text-sm font-semibold text-white">Priority Assignment</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Classified as <span className="text-rose-400 font-bold">Critical</span> due to multi-user disruption; instantly routed to top of the agent priority queue.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Step 4 &bull; Resolution</span>
              <h3 className="text-sm font-semibold text-white">Agent Resolution</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Agent restarts connection pool daemon, marks ticket Resolved with root cause notes, and dispatches automated confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-50 border border-blue-100 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Ready to experience intelligent IT service desk triage?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Log in to the customer portal to raise an incident or access the agent console to triage existing requests.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/customer/login"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              Sign In as Customer
            </Link>
            <Link
              to="/agent/login"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 shadow-2xs transition"
            >
              Access Agent Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
