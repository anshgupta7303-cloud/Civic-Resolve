import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Complaint, DepartmentMeta } from '../types.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import { SlaBadge } from '../components/SlaBadge.js';
import { getDepartmentLabel, formatDate } from '../lib/utils.js';
import {
  Search,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  Droplets,
  Trash2,
  Hammer,
  Zap,
  Activity,
  Trees,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string, complaintId?: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onSelectCategory }) => {
  const [trackInput, setTrackInput] = useState('');
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<DepartmentMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [compRes, deptRes] = await Promise.all([
          api.getComplaints(),
          api.getDepartments(),
        ]);
        setRecentComplaints(compRes.complaints.slice(0, 4));
        setDepartments(deptRes.departments);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      onNavigate('track-complaint', trackInput.trim().toUpperCase());
    }
  };

  const getDeptIcon = (id: string) => {
    switch (id) {
      case 'WATER':
        return <Droplets className="w-6 h-6 text-blue-600" />;
      case 'WASTE':
        return <Trash2 className="w-6 h-6 text-emerald-600" />;
      case 'ROADS':
        return <Hammer className="w-6 h-6 text-amber-600" />;
      case 'ELECTRICITY':
        return <Zap className="w-6 h-6 text-purple-600" />;
      case 'HEALTH':
        return <Activity className="w-6 h-6 text-rose-600" />;
      case 'PARKS':
      default:
        return <Trees className="w-6 h-6 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Municipal Response & Transparent SLAs</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            City Civic Grievance & Rapid Redressal Portal
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Report infrastructure hazards, pothole craters, water pipeline bursts, or garbage overflows.
            Our smart triage engine automatically routes tickets, enforces service level deadlines, and verifies field resolutions.
          </p>

          {/* Quick Track Input Bar */}
          <div className="pt-2">
            <form
              onSubmit={handleTrackSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner max-w-xl"
            >
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-slate-300" />
                <input
                  id="hero-track-input"
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. CMP-2025-1042)..."
                  className="w-full bg-transparent border-none text-white placeholder-slate-400 text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Track</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-2">
              Try demo tickets:{' '}
              <button
                onClick={() => onNavigate('track-complaint', 'CMP-2025-1042')}
                className="underline hover:text-emerald-300 cursor-pointer font-mono"
              >
                CMP-2025-1042
              </button>
              ,{' '}
              <button
                onClick={() => onNavigate('track-complaint', 'CMP-2025-0951')}
                className="underline hover:text-emerald-300 cursor-pointer font-mono"
              >
                CMP-2025-0951
              </button>
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('new-complaint')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>File a New Grievance</span>
            </button>
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>Open Admin Command Center</span>
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Notice Banner */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-xs sm:text-sm">
            <strong className="font-semibold text-amber-950">Active Monsoon Precaution Alert:</strong>{' '}
            Stormwater drain inspections and emergency de-watering pump teams are active 24/7 across Wards 4 and 7.
          </div>
        </div>
        <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full shrink-0">
          Control Room: 1916
        </span>
      </div>

      {/* Municipal Divisions Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Grievance Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct submission with department-specific Service Level Agreements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => {
                onSelectCategory?.(dept.id);
                onNavigate('new-complaint');
              }}
              className="bg-white rounded-2xl border border-slate-200 p-4 text-center hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center mx-auto mb-3 transition-colors">
                {getDeptIcon(dept.id)}
              </div>
              <h3 className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2">
                {dept.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                SLA: {dept.baseSlaHours.HIGH}h Target
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Operational Grievances Spotlight */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Municipal Grievances</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent live tickets currently undergoing inspection and ground resolution
            </p>
          </div>
          <button
            onClick={() => onNavigate('my-complaints')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentComplaints.map((c) => (
            <div
              key={c.id}
              onClick={() => onNavigate('track-complaint', c.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {c.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{c.ward}</span>
                  </div>
                  <PriorityBadge priority={c.priority} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-emerald-600 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-500">
                    {getDepartmentLabel(c.department)}
                  </span>
                  <SlaBadge slaStatus={c.slaStatus} isResolved={c.status === 'RESOLVED'} compact />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Filed {formatDate(c.createdAt)}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  Track Timeline →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Citizen Rights & Service Charter Pillars */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 mb-4">
          Our Public Service Guarantees
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-semibold text-sm text-slate-800">Automated AI Routing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              No manual delays at reception desks. Tickets are instantly analyzed for public safety and routed directly to the appropriate executive engineer.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-semibold text-sm text-slate-800">Binding SLA Timers</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every complaint is backed by a legal Right to Service SLA. Unresolved tickets automatically escalate to senior municipal commissioners.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-semibold text-sm text-slate-800">Photographic Verification</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Grievances cannot be closed arbitrarily. Ground officers must upload stamped photographic proof of repair before marked resolved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
