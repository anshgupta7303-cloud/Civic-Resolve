import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../store/authStore.js';
import { Complaint, DuplicatePreview, ComplaintStatus, Priority, DepartmentId } from '../types.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import { SlaBadge } from '../components/SlaBadge.js';
import { Timeline } from '../components/Timeline.js';
import { getDepartmentLabel, getStatusMeta, formatDate } from '../lib/utils.js';
import {
  Search,
  MapPin,
  Clock,
  ThumbsUp,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Share2,
  Camera,
  Wrench,
  ExternalLink,
  Bot,
  User,
  AlertCircle,
  Copy,
  ChevronRight,
  Building2,
} from 'lucide-react';

interface TrackComplaintProps {
  complaintId?: string;
  onNavigate: (tab: string, complaintId?: string) => void;
}

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  complaintId: initialId,
  onNavigate,
}) => {
  const { user } = useAuth();

  const [searchId, setSearchId] = useState(initialId || 'CMP-2025-1042');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicatePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  // Officer / Admin quick resolution form states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch complaint
  const fetchComplaint = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getComplaintById(id);
      setComplaint(res.complaint);
      setDuplicates(res.potentialDuplicates || []);
      setUpvoteCount(res.complaint.upvotes);
      if (user && res.complaint.upvotedBy.includes(user.id)) {
        setHasUpvoted(true);
      } else {
        setHasUpvoted(false);
      }
    } catch (err: any) {
      setError(err.message || 'Complaint not found. Please verify the Reference ID.');
      setComplaint(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      fetchComplaint(initialId);
    } else {
      fetchComplaint('CMP-2025-1042');
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchComplaint(searchId.trim().toUpperCase());
    }
  };

  const handleUpvote = async () => {
    if (!complaint) return;
    try {
      const res = await api.upvoteComplaint(complaint.id);
      setHasUpvoted(res.hasUpvoted);
      setUpvoteCount(res.complaint.upvotes);
    } catch {
      // Ignore
    }
  };

  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setIsUpdating(true);
    try {
      const res = await api.updateComplaintStatus(complaint.id, {
        status: updateStatus,
        remarks: updateRemarks,
        proofImageUrl: proofImage || undefined,
        assignedOfficer: user?.name,
      });
      setComplaint(res.complaint);
      setShowStatusModal(false);
      setUpdateRemarks('');
      setProofImage('');
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Stepper progress indicator calculation
  const getStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'OPEN':
        return 0;
      case 'IN_PROGRESS':
        return 1;
      case 'RESOLVED':
        return 2;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              id="track-search-input"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Track by Complaint ID (e.g. CMP-2025-1042)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase text-slate-900 focus:border-emerald-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Quick sample:</span>
          <button
            onClick={() => {
              setSearchId('CMP-2025-1042');
              fetchComplaint('CMP-2025-1042');
            }}
            className="text-emerald-700 font-mono font-bold hover:underline cursor-pointer"
          >
            CMP-2025-1042
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setSearchId('CMP-2025-0814');
              fetchComplaint('CMP-2025-0814');
            }}
            className="text-emerald-700 font-mono font-bold hover:underline cursor-pointer"
          >
            CMP-2025-0814
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-bold text-red-900 text-sm">{error}</h3>
          <p className="text-xs text-red-700">
            Check the ticket format (e.g. CMP-YYYY-XXXX) or explore recent grievances on the home tab.
          </p>
        </div>
      )}

      {complaint && (
        <div className="space-y-6">
          {/* Main Ticket Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-[280px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-extrabold bg-slate-900 text-white px-3 py-1 rounded-lg">
                    {complaint.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    {complaint.ward}
                  </span>
                  <PriorityBadge priority={complaint.priority} />
                  <SlaBadge
                    slaStatus={complaint.slaStatus}
                    deadlineIso={complaint.slaDeadline}
                    isResolved={complaint.status === 'RESOLVED'}
                  />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">
                  {complaint.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Department: <strong>{getDepartmentLabel(complaint.department)}</strong></span>
                  <span>•</span>
                  <span>Reported {formatDate(complaint.createdAt)}</span>
                  {complaint.assignedOfficer && (
                    <>
                      <span>•</span>
                      <span>Officer in Charge: <strong>{complaint.assignedOfficer}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons: Upvote & Officer action */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="upvote-complaint-btn"
                  onClick={handleUpvote}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    hasUpvoted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                      : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-emerald-600' : ''}`} />
                  <span>{hasUpvoted ? 'Supported' : 'I Have This Issue'}</span>
                  <span className="font-mono font-bold ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                    {upvoteCount}
                  </span>
                </button>

                {/* Officer / Admin Action Button */}
                {(user?.role === 'OFFICER' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>Update Ticket Status</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stepper Workflow Progress */}
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-center">
                {['Registered & Triaged', 'Field Crew Dispatched', 'Verified & Resolved'].map(
                  (stepLabel, idx) => {
                    const currentIdx = getStepIndex(complaint.status);
                    const isCompleted = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    return (
                      <div key={idx} className="space-y-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                        <div className="flex items-center justify-center gap-1">
                          {isCompleted && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              isCurrent
                                ? 'text-emerald-700 font-bold'
                                : isCompleted
                                ? 'text-slate-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {stepLabel}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Description & Address Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Grievance Description
                  </h3>
                  <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                    {complaint.description}
                  </p>
                </div>

                {/* AI Intelligence Card */}
                {complaint.aiAnalysis && (
                  <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>AI Diagnostic & Triage Reasoning</span>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {Math.round(complaint.aiAnalysis.confidence * 100)}% Match Confidence
                      </span>
                    </div>

                    <p className="text-xs text-purple-950 leading-relaxed">
                      {complaint.aiAnalysis.reasoning}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-purple-800 font-semibold">Keywords:</span>
                      {complaint.aiAnalysis.detectedKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Photos */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Attached Evidence Photos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {complaint.imageUrl && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-slate-500">Citizen Report Photo</span>
                        <img
                          src={complaint.imageUrl}
                          alt="Grievance Reported Evidence"
                          className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    {complaint.resolutionImageUrl && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Field Verification Proof
                        </span>
                        <img
                          src={complaint.resolutionImageUrl}
                          alt="Resolution Stamped Proof"
                          className="w-full h-48 object-cover rounded-2xl border border-emerald-300 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Location & Complainant Details */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    Geographic Coordinates
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Address:</strong>
                        <p className="text-slate-600">{complaint.address}</p>
                      </div>
                    </div>

                    {complaint.landmark && (
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Landmark:</strong>
                          <p className="text-slate-600">{complaint.landmark}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Target SLA Window:</strong>
                        <p className="text-slate-600">{complaint.slaTargetHours} Hours from filing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    Filer Contact (Protected)
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p><strong>Name:</strong> {complaint.citizenName}</p>
                    <p><strong>Contact:</strong> {complaint.citizenPhone}</p>
                    <p><strong>Email:</strong> {complaint.citizenEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Resolution Audit Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>Full Resolution Audit Timeline</span>
            </h3>
            <p className="text-xs text-slate-500">
              Official tamper-evident log of status updates, ground inspections, and engineer remarks.
            </p>

            <div className="pt-2">
              <Timeline events={complaint.timeline} />
            </div>
          </div>
        </div>
      )}

      {/* Officer / Admin Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">
                Update Ticket Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select New Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 outline-none"
                >
                  <option value="IN_PROGRESS">IN_PROGRESS (Work Crew Dispatched)</option>
                  <option value="RESOLVED">RESOLVED (Repairs Completed & Verified)</option>
                  <option value="REJECTED">REJECTED (Not Actionable / Out of Jurisdiction)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Field Remarks / Action Taken
                </label>
                <textarea
                  rows={3}
                  required
                  value={updateRemarks}
                  onChange={(e) => setUpdateRemarks(e.target.value)}
                  placeholder="e.g. Dispatched asphalt crew. 40mm pothole filled with cold mix. Surface leveled."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Field Proof Photo URL (Optional)
                </label>
                <input
                  type="text"
                  value={proofImage}
                  onChange={(e) => setProofImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setProofImage(
                        'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                  >
                    Use Sample Repaired Road Photo
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Commit Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
