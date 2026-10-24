import React from 'react';
import { AdminKPIs as AdminKPIsType } from '../../types.js';
import {
  FileText,
  CheckCircle2,
  AlertOctagon,
  Clock,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface AdminKPIsProps {
  kpis: AdminKPIsType | null;
  isLoading?: boolean;
}

export const AdminKPIs: React.FC<AdminKPIsProps> = ({ kpis, isLoading }) => {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Grievances',
      value: kpis.totalComplaints,
      subtitle: `${kpis.openComplaints} Open • ${kpis.inProgressComplaints} In Progress`,
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'All Wards',
    },
    {
      title: 'Resolution Rate',
      value: `${kpis.resolutionRatePercentage}%`,
      subtitle: `${kpis.resolvedComplaints} tickets successfully resolved`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badge: `${kpis.avgResolutionTimeHours}h avg turnaround`,
    },
    {
      title: 'SLA Escalations',
      value: kpis.slaBreachedCount,
      subtitle: `${kpis.slaWarningCount} tickets in critical warning (<6h)`,
      icon: AlertOctagon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: kpis.slaBreachedCount > 0 ? 'Action Required' : 'Optimal',
      badgeDanger: kpis.slaBreachedCount > 0,
    },
    {
      title: 'Emergency Triage',
      value: kpis.criticalPendingCount,
      subtitle: 'Critical safety & water burst tickets',
      icon: Zap,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: 'Priority Team Dispatched',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor} shrink-0`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 truncate mr-2">{card.subtitle}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  card.badgeDanger
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
