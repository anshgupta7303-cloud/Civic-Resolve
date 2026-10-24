import React from 'react';
import { AreaInsight, DepartmentId } from '../../types.js';
import { getDepartmentLabel } from '../../lib/utils.js';
import { MapPin, CheckCircle2, AlertTriangle, Building } from 'lucide-react';

interface AdminAreaInsightsProps {
  areaInsights: AreaInsight[];
  onSelectWard?: (ward: string) => void;
}

export const AdminAreaInsights: React.FC<AdminAreaInsightsProps> = ({
  areaInsights,
  onSelectWard,
}) => {
  if (areaInsights.length === 0) {
    return <div className="text-slate-500 text-sm py-4">No ward metrics available.</div>;
  }

  const getHealthBadge = (health: number) => {
    if (health >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (health >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (health >= 40) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Ward & Zonal Performance Index</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic breakdown of grievance density, SLA compliance, and local municipal health.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {areaInsights.map((area) => (
          <div
            key={area.ward}
            onClick={() => onSelectWard?.(area.ward)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Municipal Zone
                </span>
                <h4 className="text-lg font-bold text-slate-900">{area.ward}</h4>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getHealthBadge(
                  area.healthIndex
                )}`}
              >
                Health: {area.healthIndex}/100
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span>Active Grievances:</span>
                <strong className="text-slate-900 font-mono">{area.activeCount} tickets</strong>
              </div>
              <div className="flex justify-between">
                <span>Resolved Complaints:</span>
                <strong className="text-emerald-700 font-mono">{area.resolvedCount} closed</strong>
              </div>
              <div className="flex justify-between">
                <span>SLA Compliance Rate:</span>
                <strong className="text-blue-700 font-mono">{area.slaComplianceRate}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Predominant Grievance:</span>
                <span className="font-semibold text-slate-800">
                  {getDepartmentLabel(area.topDepartment)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-emerald-600 font-medium">
              <span>Filter Ward Dossier</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
