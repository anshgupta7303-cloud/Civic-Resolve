import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../store/notificationStore.js';
import { formatTimeAgo, cn } from '../lib/utils.js';
import { Bell, Check, ExternalLink, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface NotificationCenterProps {
  onSelectComplaint?: (complaintId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectComplaint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'SLA_ALERT':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'STATUS_UPDATE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-red-600 rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markRead(notif.id);
                    if (notif.complaintId && onSelectComplaint) {
                      onSelectComplaint(notif.complaintId);
                      setIsOpen(false);
                    }
                  }}
                  className={cn(
                    'p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 text-left',
                    !notif.read ? 'bg-blue-50/40' : 'bg-white'
                  )}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          'text-xs font-medium truncate',
                          !notif.read ? 'text-slate-900 font-semibold' : 'text-slate-700'
                        )}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.complaintId && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                        <ExternalLink className="w-3 h-3" />
                        <span>View Ticket {notif.complaintId}</span>
                      </div>
                    )}
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-[11px] text-slate-400">
              Live updates from Municipal Redressal Command Center
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
