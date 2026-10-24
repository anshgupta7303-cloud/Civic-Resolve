import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../store/authStore.js';
import {
  AdminKPIs as AdminKPIsType,
  ActionQueueItem,
  AIInsight,
  AreaInsight,
  Complaint,
  DepartmentId,
  Priority,
  ComplaintStatus,
} from '../types.js';
import { AdminKPIs } from '../components/admin/AdminKPIs.js';
import { AdminActionQueue } from '../components/admin/AdminActionQueue.js';
import { AdminAIInsights } from '../components/admin/AdminAIInsights.js';
import { AdminAreaInsights } from '../components/admin/AdminAreaInsights.js';
import { AdminAnalytics } from '../components/admin/AdminAnalytics.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import { SlaBadge } from '../components/SlaBadge.js';
import { getDepartmentLabel, formatDate } from '../lib/utils.js';
import {
  ShieldAlert,
  ListFilter,
  Sparkles,
  MapPin,
  BarChart3,
  Search,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Wrench,
  Download,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string, complaintId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<
    'queue' | 'all' | 'insights' | 'wards' | 'analytics'
  >('queue');

  const [kpis, setKpis] = useState<AdminKPIsType | null>(null);
  const [queue, setQueue] = useState<ActionQueueItem[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [areaInsights, setAreaInsights] = useState<AreaInsight[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for the Master Grievances tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterWard, setFilterWard] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Reassign Dialog State
  const [reassignTarget, setReassignTarget] = useState<Complaint | null>(null);
  const [newDept, setNewDept] = useState<DepartmentId>('ROADS');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [reassignRemarks, setReassignRemarks] = useState('');
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, qRes, insRes, areaRes, anaRes, compRes] = await Promise.all([
        api.getAdminKpis(),
        api.getAdminActionQueue(),
        api.getAdminAiInsights(),
        api.getAdminAreaInsights(),
        api.getAdminAnalytics(),
        api.getComplaints(),
      ]);

      setKpis(kpiRes.kpis);
      setQueue(qRes.queue);
      setInsights(insRes.insights);
      setAreaInsights(areaRes.areaInsights);
      setAnalytics(anaRes);
      setComplaints(compRes.complaints);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleQuickAction = async (complaintId: string, action: string) => {
    try {
      await api.updateComplaintStatus(complaintId, {
        status: 'IN_PROGRESS',
        remarks: 'Directly dispatched field inspection unit via Admin Action Queue.',
        assignedOfficer: user?.name || 'Central Municipal Dispatcher',
      });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTarget) return;

    setIsSubmittingReassign(true);
    try {
      await api.reassignComplaint(reassignTarget.id, {
        department: newDept,
        priority: newPriority,
        assignedOfficer: assignedOfficer || undefined,
        remarks: reassignRemarks,
      });
      setReassignTarget(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to reassign complaint');
    } finally {
      setIsSubmittingReassign(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'ALL' || c.department === filterDept;
    const matchesWard = filterWard === 'ALL' || c.ward === filterWard;
    const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;

    return matchesSearch && matchesDept && matchesWard && matchesPriority && matchesStatus;
  });

  const exportToCsv = () => {
    if (complaints.length === 0) return;
    const headers = [
      'Grievance ID',
      'Title',
      'Category',
      'Department',
      'Ward',
      'Street Address',
      'Landmark',
      'Priority',
      'Status',
      'SLA Target (Hours)',
      'SLA Status',
      'Created Timestamp',
      'Resolved Timestamp',
      'Assigned Officer',
      'Community Upvotes',
    ];

    const rows = filteredComplaints.map((c) => [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      `"${c.department}"`,
      `"${c.ward}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      `"${(c.landmark || '').replace(/"/g, '""')}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      c.slaTargetHours,
      `"${c.slaStatus}"`,
      `"${c.createdAt}"`,
      `"${c.resolvedAt || ''}"`,
      `"${(c.assignedOfficer || 'Unassigned').replace(/"/g, '""')}"`,
      c.upvotes || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `CivicResolve_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Municipal Command & Triage Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              Admin Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-department monitoring, automated SLA enforcement, and predictive grievance triage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download CSV database export"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Print or Save PDF Executive Briefing"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <AdminKPIs kpis={kpis} isLoading={isLoading} />

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Triage Action Queue</span>
            {queue.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {queue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>All Grievances ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('insights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'insights'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Pattern Insights</span>
            {insights.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-800 text-[10px] font-bold">
                {insights.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('wards')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'wards'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Ward Performance</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Department Analytics</span>
          </button>
        </nav>
      </div>

      {/* Tab Content 1: Triage Action Queue */}
      {activeSubTab === 'queue' && (
        <AdminActionQueue
          queue={queue}
          onSelectComplaint={(id) => onNavigate('track-complaint', id)}
          onQuickAction={handleQuickAction}
        />
      )}

      {/* Tab Content 2: Master Grievances Table */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          {/* Multi-Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by ID, keywords, address..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white outline-none"
                >
                  <option value="ALL">All Departments</option>
                  <option value="ROADS">Roads</option>
                  <option value="WASTE">Solid Waste</option>
                  <option value="WATER">Water Supply</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="HEALTH">Health</option>
                  <option value="PARKS">Parks</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white outline-none"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grievances Master Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">ID / Reference</th>
                    <th className="px-4 py-3">Grievance Details</th>
                    <th className="px-4 py-3">Ward / Zone</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">SLA Status</th>
                    <th className="px-4 py-3">Lifecycle</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No grievances match the active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {c.id}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{c.address}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                          {c.ward}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-slate-700">
                            {getDepartmentLabel(c.department)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <PriorityBadge priority={c.priority} size="sm" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <SlaBadge
                            slaStatus={c.slaStatus}
                            deadlineIso={c.slaDeadline}
                            isResolved={c.status === 'RESOLVED'}
                            compact
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              c.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                          <button
                            onClick={() => {
                              setReassignTarget(c);
                              setNewDept(c.department);
                              setNewPriority(c.priority);
                              setAssignedOfficer(c.assignedOfficer || '');
                            }}
                            className="px-2 py-1 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
                            title="Reassign or adjust priority"
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => onNavigate('track-complaint', c.id)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: AI Insights */}
      {activeSubTab === 'insights' && <AdminAIInsights insights={insights} />}

      {/* Tab Content 4: Ward Performance */}
      {activeSubTab === 'wards' && (
        <AdminAreaInsights
          areaInsights={areaInsights}
          onSelectWard={(ward) => {
            setFilterWard(ward);
            setActiveSubTab('all');
          }}
        />
      )}

      {/* Tab Content 5: Department Analytics */}
      {activeSubTab === 'analytics' && <AdminAnalytics analytics={analytics} />}

      {/* Reassign / Triage Modal */}
      {reassignTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  Reassign & Triage Grievance
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Ticket {reassignTarget.id} • {reassignTarget.ward}
                </p>
              </div>
              <button
                onClick={() => setReassignTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign Department
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value as DepartmentId)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="ROADS">Roads & Infrastructure</option>
                  <option value="WASTE">Solid Waste Management</option>
                  <option value="WATER">Water Supply & Sewerage</option>
                  <option value="ELECTRICITY">Street Lighting & Power</option>
                  <option value="HEALTH">Public Health & Sanitation</option>
                  <option value="PARKS">Parks & Horticulture</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority Escalation
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="LOW">Low (Standard SLA)</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Emergency (Immediate SLA Escalation)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designated Field Officer
                </label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="e.g. Er. Rajesh Verma (Assistant Executive Engineer)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrative Reason / Note
                </label>
                <textarea
                  rows={2}
                  value={reassignRemarks}
                  onChange={(e) => setReassignRemarks(e.target.value)}
                  placeholder="Reason for reassignment or priority adjustment..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignTarget(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReassign}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReassign ? 'Reassigning...' : 'Save Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
