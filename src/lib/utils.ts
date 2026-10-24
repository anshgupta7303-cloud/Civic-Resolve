import { DepartmentId, Priority, SlaStatus, ComplaintStatus } from '../types.js';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getDepartmentLabel(dept: DepartmentId): string {
  const labels: Record<DepartmentId, string> = {
    ROADS: 'Roads & Infrastructure',
    WASTE: 'Waste Management',
    WATER: 'Water & Sewerage',
    ELECTRICITY: 'Street Lighting & Power',
    HEALTH: 'Public Health & Sanitation',
    PARKS: 'Parks & Horticulture',
  };
  return labels[dept] || dept;
}

export function getDepartmentColor(dept: DepartmentId): { bg: string; text: string; border: string } {
  const map: Record<DepartmentId, { bg: string; text: string; border: string }> = {
    ROADS: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    WASTE: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    WATER: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    ELECTRICITY: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    HEALTH: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    PARKS: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  };
  return map[dept] || { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200' };
}

export function getPriorityMeta(priority: Priority): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (priority) {
    case 'CRITICAL':
      return {
        label: 'Critical / Emergency',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500 animate-pulse',
      };
    case 'HIGH':
      return {
        label: 'High Priority',
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
        dotClass: 'bg-orange-500',
      };
    case 'MEDIUM':
      return {
        label: 'Medium Priority',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'LOW':
    default:
      return {
        label: 'Standard / Low',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getStatusMeta(status: ComplaintStatus): {
  label: string;
  badgeClass: string;
  iconName: string;
} {
  switch (status) {
    case 'OPEN':
      return {
        label: 'Registered / Open',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        iconName: 'Clock',
      };
    case 'IN_PROGRESS':
      return {
        label: 'Work in Progress',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        iconName: 'Wrench',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved & Closed',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconName: 'CheckCircle2',
      };
    case 'REJECTED':
      return {
        label: 'Not Actionable',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        iconName: 'XCircle',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        iconName: 'HelpCircle',
      };
  }
}

export function getSlaRemainingHours(deadlineIso: string): number {
  if (!deadlineIso) return 0;
  const deadline = new Date(deadlineIso).getTime();
  const diff = deadline - Date.now();
  return Math.round(diff / (1000 * 60 * 60));
}
