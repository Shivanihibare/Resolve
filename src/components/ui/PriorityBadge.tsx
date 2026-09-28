import React from 'react';
import { Flame, AlertTriangle, ArrowUpRight, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  className?: string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '', showIcon = true }) => {
  switch (priority) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        >
          {showIcon && <Flame className="w-3 h-3 text-rose-600" />}
          Critical
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-amber-600" />}
          High
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80 ${className}`}
        >
          {showIcon && <ArrowUpRight className="w-3 h-3 text-sky-600" />}
          Medium
        </span>
      );
    case 'Low':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        >
          {showIcon && <ArrowDown className="w-3 h-3 text-emerald-600" />}
          Low
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 ${className}`}>
          {priority}
        </span>
      );
  }
};
