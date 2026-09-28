import React, { useState } from 'react';
import { Link } from '../../lib/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch, authHeader } from '../../lib/api.ts';
import { PriorityBadge } from '../../components/ui/PriorityBadge.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  Bot
} from 'lucide-react';

export const NewTicketPage: React.FC = () => {
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    ticket: any;
    ai_triage: any;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (issueDescription.trim().length < 10) {
      setError('Please provide at least 10 characters describing the issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/v1/tickets', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          title: title.trim(),
          issue_description: issueDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit service request.');
      }

      setSubmittedData({
        ticket: data.ticket,
        ai_triage: data.ai_triage,
      });

      setTitle('');
      setIssueDescription('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          What can we help you with?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide a summary of the incident or service needed. Our intelligent triage will classify and route your ticket immediately.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Submission Success & AI Analysis Presentation */}
      {submittedData && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm sm:text-base border-b border-emerald-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Request Submitted Successfully &bull; Ticket #{submittedData.ticket.ticket_id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Ticket ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm">#{submittedData.ticket.ticket_id}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Category</span>
              <span className="font-bold text-slate-800 text-sm">{submittedData.ai_triage.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Assigned Urgency</span>
              <div className="mt-0.5">
                <PriorityBadge priority={submittedData.ai_triage.priority} />
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status</span>
              <div className="mt-0.5">
                <StatusBadge status="Open" />
              </div>
            </div>
          </div>

          {/* AI Recommended Diagnostic / Action */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Recommended Resolution / Diagnostic Advice</span>
            </div>
            <p className="text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/80">
              "{submittedData.ai_triage.suggested_solution}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSubmittedData(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit another request</span>
            </button>

            <Link
              to="/customer/tickets"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <span>View in My Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Request Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Issue Title / Summary
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unable to connect to Finance ERP portal"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-xs sm:text-sm text-slate-900 transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">Provide a concise headline describing the technical issue.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Detailed Description
            </label>
            <textarea
              required
              rows={5}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the technical symptom, error codes, affected devices, operational impact, and any troubleshooting steps already attempted..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-xs sm:text-sm text-slate-900 transition"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
              <span>Minimum 10 characters required for automated classification</span>
              <span>{issueDescription.length} characters</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              to="/customer"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || issueDescription.trim().length < 10}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition disabled:opacity-50 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Classifying &amp; Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Ticket</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
