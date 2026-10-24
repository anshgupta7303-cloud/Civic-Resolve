import React from 'react';
import { ActionQueueItem } from '../../types.js';
import { PriorityBadge } from '../PriorityBadge.js';
import { SlaBadge } from '../SlaBadge.js';
import {
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Wrench,
  CheckCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface AdminActionQueueProps {
  queue: ActionQueueItem[];
  onSelectComplaint: (complaintId: string) => void;
  onQuickAction: (complaintId: string, action: string) => void;
}

export const AdminActionQueue: React.FC<AdminActionQueueProps> = ({
  queue,
  onSelectComplaint,
  onQuickAction,
}) => {
  if (queue.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800">Action Queue Clear</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          All high-priority complaints and SLA alerts have been assigned or triaged.
        </p>
      </div>
    );
  }

  const getActionIcon = (action: ActionQueueItem['actionRequired']) => {
    switch (action) {
      case 'ESCALATE':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'TRIAGE':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'MERGE_DUPLICATE':
        return <Copy className="w-4 h-4 text-blue-600" />;
      default:
        return <Wrench className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>Critical Action & Triage Queue</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
              {queue.length} Pending
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operational interventions prioritized by SLA risk and public safety impact.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {queue.map((item) => (
          <div
            key={item.id}
            className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {item.complaintId}
                </span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {item.ward}
                </span>
                <PriorityBadge priority={item.priority} size="sm" />
                <SlaBadge slaStatus={item.slaStatus} compact />
              </div>

              <h4
                onClick={() => onSelectComplaint(item.complaintId)}
                className="font-semibold text-slate-900 text-sm hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {item.title}
              </h4>

              <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900">
                <div className="mt-0.5 shrink-0">{getActionIcon(item.actionRequired)}</div>
                <div>
                  <strong>Recommended Action:</strong> {item.suggestedAction}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectComplaint(item.complaintId)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onQuickAction(item.complaintId, 'DISPATCH')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Dispatch / Progress</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
