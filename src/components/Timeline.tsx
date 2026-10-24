import React from 'react';
import { TimelineEvent } from '../types.js';
import { formatDate, cn } from '../lib/utils.js';
import { Bot, User, HardHat, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  const getActorIcon = (role: string) => {
    switch (role) {
      case 'SYSTEM':
        return <Bot className="w-4 h-4 text-purple-600" />;
      case 'OFFICER':
        return <HardHat className="w-4 h-4 text-amber-600" />;
      case 'ADMIN':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'CITIZEN':
      default:
        return <User className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getActorBg = (role: string) => {
    switch (role) {
      case 'SYSTEM':
        return 'bg-purple-100 border-purple-300';
      case 'OFFICER':
        return 'bg-amber-100 border-amber-300';
      case 'ADMIN':
        return 'bg-blue-100 border-blue-300';
      case 'CITIZEN':
      default:
        return 'bg-emerald-100 border-emerald-300';
    }
  };

  return (
    <div className={cn('relative space-y-6', className)}>
      {/* Vertical connecting bar */}
      <div className="absolute top-3 left-4 bottom-4 w-0.5 bg-slate-200" />

      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id || idx} className="relative flex items-start gap-4">
            {/* Circle Node */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border shadow-xs shrink-0',
                getActorBg(event.actorRole)
              )}
            >
              {getActorIcon(event.actorRole)}
            </div>

            {/* Event Card */}
            <div
              className={cn(
                'flex-1 rounded-xl p-4 border transition-all',
                isLast
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200'
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 text-sm">{event.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-200 text-slate-700">
                    {event.actorRole}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {formatDate(event.timestamp)}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{event.description}</p>

              {/* Verified Proof Image if available */}
              {event.proofImageUrl && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-emerald-700 flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Attached Field Proof Photo</span>
                  </div>
                  <img
                    src={event.proofImageUrl}
                    alt="Resolution Field Proof"
                    className="w-full max-w-xs h-40 object-cover rounded-lg border border-emerald-200 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <span>Recorded by:</span>
                <span className="font-medium text-slate-700">{event.actorName}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
