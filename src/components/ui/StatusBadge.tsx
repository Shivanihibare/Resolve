import React from 'react';
import { Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Open' | 'In-Progress' | 'Resolved' | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  switch (status) {
    case 'Open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}
        >
          {showIcon && <Clock className="w-3 h-3 text-blue-600" />}
          Open
        </span>
      );
    case 'In-Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}
        >
          {showIcon && <RefreshCw className="w-3 h-3 text-amber-600" />}
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          Resolved
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 ${className}`}>
          {status}
        </span>
      );
  }
};
