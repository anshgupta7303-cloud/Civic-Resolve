import React from 'react';
import { Priority } from '../types.js';
import { getPriorityMeta, cn } from '../lib/utils.js';
import { AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const meta = getPriorityMeta(priority);

  const getIcon = () => {
    switch (priority) {
      case 'CRITICAL':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />;
      case 'HIGH':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />;
      case 'MEDIUM':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'LOW':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border whitespace-nowrap transition-colors',
        meta.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon ? (
        getIcon()
      ) : (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', meta.dotClass)} />
      )}
      <span>{meta.label}</span>
    </span>
  );
};
