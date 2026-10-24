import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../store/authStore.js';
import { Complaint, ComplaintStatus } from '../types.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import { SlaBadge } from '../components/SlaBadge.js';
import { getDepartmentLabel, formatDate } from '../lib/utils.js';
import {
  FileText,
  Search,
  PlusCircle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface MyComplaintsProps {
  onNavigate: (tab: string, complaintId?: string) => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      // If user is a citizen, filter by citizenId
      const params: Record<string, string> = {};
      if (user?.role === 'CITIZEN' && user.id) {
        params.citizenId = user.id;
      }
      const res = await api.getComplaints(params);
      setComplaints(res.complaints);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {user?.role === 'CITIZEN' ? 'My Grievances' : 'Municipal Grievance Register'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.role === 'CITIZEN'
              ? 'Track your lodged complaints, view updates, and verify ground resolution photos.'
              : 'Master list of registered grievances filed by citizens across city wards.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-complaint')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Grievance</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {status === 'ALL'
                ? 'All Statuses'
                : status === 'OPEN'
                ? 'Registered (Open)'
                : status === 'IN_PROGRESS'
                ? 'In Progress'
                : 'Resolved'}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, keyword, address..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Complaints Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 p-5" />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Grievances Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'ALL'
              ? 'No grievances matched your active filters. Try adjusting your search query.'
              : 'You have not filed any civic grievances yet. Click below to submit your first report.'}
          </p>
          <button
            onClick={() => onNavigate('new-complaint')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs hover:bg-emerald-700 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit a Grievance</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              onClick={() => onNavigate('track-complaint', c.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {c.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {c.ward}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={c.priority} size="sm" />
                    <SlaBadge slaStatus={c.slaStatus} isResolved={c.status === 'RESOLVED'} compact />
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-emerald-600 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                  <span>Category: <strong>{getDepartmentLabel(c.department)}</strong></span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Filed {formatDate(c.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target: {c.slaTargetHours}h SLA</span>
                </span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  Track Live Timeline →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
