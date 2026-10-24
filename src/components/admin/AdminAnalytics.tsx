import React from 'react';
import { getDepartmentLabel, getDepartmentColor } from '../../lib/utils.js';
import { DepartmentId } from '../../types.js';
import { BarChart3, PieChart, Activity, ShieldCheck } from 'lucide-react';

interface AdminAnalyticsProps {
  analytics: {
    byDepartment: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    total: number;
  } | null;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ analytics }) => {
  if (!analytics || analytics.total === 0) {
    return <div className="text-slate-500 text-sm py-4">No analytics data available.</div>;
  }

  const { byDepartment, byPriority, byStatus, total } = analytics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Col 1: Department Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>Grievances by Department</span>
        </h4>
        <p className="text-xs text-slate-500 mb-4">Volume distribution across municipal divisions</p>

        <div className="space-y-3">
          {Object.entries(byDepartment).map(([dept, count]) => {
            const countNum = Number(count);
            const pct = total > 0 ? Math.round((countNum / total) * 100) : 0;
            return (
              <div key={dept} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{getDepartmentLabel(dept as DepartmentId)}</span>
                  <span className="text-slate-900 font-mono">
                    {countNum} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Col 2: Priority Spectrum */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-600" />
          <span>Priority Tiers</span>
        </h4>
        <p className="text-xs text-slate-500 mb-4">Urgency classification breakdown</p>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <span className="text-xs font-semibold text-red-900">Critical / Emergency</span>
            </div>
            <span className="text-sm font-bold text-red-900 font-mono">
              {byPriority.CRITICAL || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs font-semibold text-orange-900">High Priority</span>
            </div>
            <span className="text-sm font-bold text-orange-900 font-mono">
              {byPriority.HIGH || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-900">Medium Priority</span>
            </div>
            <span className="text-sm font-bold text-amber-900 font-mono">
              {byPriority.MEDIUM || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-xs font-semibold text-slate-800">Standard / Low</span>
            </div>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {byPriority.LOW || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Col 3: Resolution Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Operational Lifecycle</span>
        </h4>
        <p className="text-xs text-slate-500 mb-4">Current stage in municipal resolution workflow</p>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-700">Resolved & Verified</span>
              <span className="text-slate-800 font-mono">{byStatus.RESOLVED || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${Math.round(((byStatus.RESOLVED || 0) / total) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-700">Work in Progress</span>
              <span className="text-slate-800 font-mono">{byStatus.IN_PROGRESS || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${Math.round(((byStatus.IN_PROGRESS || 0) / total) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-700">Registered & Open</span>
              <span className="text-slate-800 font-mono">{byStatus.OPEN || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.round(((byStatus.OPEN || 0) / total) * 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
            Total registered complaints under monitoring: <strong>{total}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
