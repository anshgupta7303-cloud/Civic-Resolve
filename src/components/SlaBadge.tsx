import React from 'react';
import { SlaStatus } from '../types.js';
import { getSlaRemainingHours, cn } from '../lib/utils.js';
import { Clock, AlertOctagon, CheckCircle } from 'lucide-react';

interface SlaBadgeProps {
  slaStatus: SlaStatus;
  deadlineIso?: string;
  isResolved?: boolean;
  className?: string;
  compact?: boolean;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({
  slaStatus,
  deadlineIso,
  isResolved = false,
  className,
  compact = false,
}) => {
  const remainingHours = deadlineIso ? getSlaRemainingHours(deadlineIso) : 0;

  if (isResolved) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200',
          className
        )}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Resolved {slaStatus === 'BREACHED' ? '(Late)' : 'Within SLA'}</span>
      </span>
    );
  }

  if (slaStatus === 'BREACHED') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-300 animate-pulse',
          className
        )}
      >
        <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
        <span>
          {compact
            ? 'SLA Breached'
            : `SLA Overdue (${Math.abs(remainingHours)}h late)`}
        </span>
      </span>
    );
  }

  if (slaStatus === 'WARNING') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-300',
          className
        )}
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
        <span>
          {compact
            ? `${remainingHours}h left`
            : `SLA Warning: ${remainingHours}h remaining`}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200',
        className
      )}
    >
      <Clock className="w-3.5 h-3.5 text-blue-500" />
      <span>
        {compact
          ? `${Math.max(1, remainingHours)}h left`
          : `On Track: ${Math.max(1, remainingHours)}h SLA window`}
      </span>
    </span>
  );
};
