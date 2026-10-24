import React from 'react';
import { AIInsight } from '../../types.js';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, ArrowRight, ShieldAlert } from 'lucide-react';

interface AdminAIInsightsProps {
  insights: AIInsight[];
}

export const AdminAIInsights: React.FC<AdminAIInsightsProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">No anomaly clusters detected</p>
        <p className="text-xs text-slate-400 mt-1">
          The AI engine is monitoring incoming grievances across all wards in real-time.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>AI Predictive Grievance Intelligence</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated cluster detection, structural root causes, and systemic ward hotspot alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSeverityBadge(
                    insight.severity
                  )}`}
                >
                  {insight.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                  {Math.round(insight.confidenceScore * 100)}% Confidence
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug">
                {insight.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {insight.description}
              </p>

              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-950">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-purple-900">Recommended Intervention:</strong>{' '}
                    {insight.recommendedAction}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Impact: <strong>{insight.affectedComplaintsCount} Linked Complaints</strong></span>
              {insight.ward && <span className="bg-slate-100 px-2 py-0.5 rounded">{insight.ward}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
