import { Router } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { generateAdminInsights, computeAreaInsights } from '../services/insightsEngine.js';
import { computeSlaDeadline } from '../services/slaEngine.js';
import { calculateRemainingHours, generateId } from '../utils.js';
import { AdminKPIs, ActionQueueItem, Priority, DepartmentId } from '../types.js';

const router = Router();

router.use(requireRole(['ADMIN']));

// KPIs
router.get('/kpis', (req, res) => {
  const complaints = db.getComplaints();
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const slaBreached = complaints.filter(
    (c) => c.slaStatus === 'BREACHED' && c.status !== 'RESOLVED'
  ).length;

  const slaWarning = complaints.filter(
    (c) => c.slaStatus === 'WARNING' && c.status !== 'RESOLVED'
  ).length;

  const criticalPending = complaints.filter(
    (c) => c.priority === 'CRITICAL' && c.status !== 'RESOLVED'
  ).length;

  // Average resolution time
  const resolvedWithTime = complaints.filter((c) => c.resolvedAt);
  let avgHours = 28;
  if (resolvedWithTime.length > 0) {
    const totalHours = resolvedWithTime.reduce((acc, c) => {
      const created = new Date(c.createdAt).getTime();
      const resolved = new Date(c.resolvedAt!).getTime();
      return acc + (resolved - created) / (1000 * 60 * 60);
    }, 0);
    avgHours = Math.round(totalHours / resolvedWithTime.length);
  }

  const kpis: AdminKPIs = {
    totalComplaints: total,
    openComplaints: open,
    inProgressComplaints: inProgress,
    resolvedComplaints: resolved,
    resolutionRatePercentage: resolutionRate,
    avgResolutionTimeHours: avgHours,
    slaBreachedCount: slaBreached,
    slaWarningCount: slaWarning,
    criticalPendingCount: criticalPending,
    activeCitizens: 142,
  };

  res.json({ kpis });
});

// Action Queue
router.get('/action-queue', (req, res) => {
  const complaints = db.getComplaints();
  const active = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS');

  const items: ActionQueueItem[] = [];

  for (const c of active) {
    const remHours = Math.round(calculateRemainingHours(c.slaDeadline));

    let actionRequired: ActionQueueItem['actionRequired'] | null = null;
    let suggestedAction = '';

    if (c.slaStatus === 'BREACHED') {
      actionRequired = 'ESCALATE';
      suggestedAction = `SLA deadline expired by ${Math.abs(remHours)}h. Directly escalate to Chief Municipal Engineer.`;
    } else if (c.slaStatus === 'WARNING') {
      actionRequired = 'ESCALATE';
      suggestedAction = `Only ${remHours}h remaining. Reassign standby ground crew immediately.`;
    } else if (c.priority === 'CRITICAL' && c.status === 'OPEN') {
      actionRequired = 'TRIAGE';
      suggestedAction = 'Critical safety hazard unassigned. Confirm dispatch and approve emergency work order.';
    } else if (c.duplicateCount && c.duplicateCount > 0) {
      actionRequired = 'MERGE_DUPLICATE';
      suggestedAction = `${c.duplicateCount} duplicate grievances linked in ${c.ward}. Batch resolve together.`;
    }

    if (actionRequired) {
      items.push({
        id: `aq-${c.id}`,
        complaintId: c.id,
        title: c.title,
        ward: c.ward,
        department: c.department,
        priority: c.priority,
        slaStatus: c.slaStatus,
        hoursRemaining: remHours,
        actionRequired,
        suggestedAction,
        createdAt: c.createdAt,
      });
    }
  }

  // Sort by urgency: BREACHED first, then WARNING, then CRITICAL
  items.sort((a, b) => a.hoursRemaining - b.hoursRemaining);

  res.json({ queue: items });
});

// AI Insights
router.get('/ai-insights', (req, res) => {
  const complaints = db.getComplaints();
  const insights = generateAdminInsights(complaints);
  res.json({ insights });
});

// Area / Ward Insights
router.get('/area-insights', (req, res) => {
  const complaints = db.getComplaints();
  const areaInsights = computeAreaInsights(complaints);
  res.json({ areaInsights });
});

// High-level analytics
router.get('/analytics', (req, res) => {
  const complaints = db.getComplaints();

  // Department counts
  const byDepartment: Record<string, number> = {};
  // Priority counts
  const byPriority: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  // Status counts
  const byStatus: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0 };

  complaints.forEach((c) => {
    byDepartment[c.department] = (byDepartment[c.department] || 0) + 1;
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  });

  res.json({
    byDepartment,
    byPriority,
    byStatus,
    total: complaints.length,
  });
});

// Reassign department / priority
router.post('/complaints/:id/reassign', (req: AuthenticatedRequest, res) => {
  const { department, priority, assignedOfficer, remarks } = req.body;
  const complaint = db.getComplaintById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const updates: Partial<typeof complaint> = {};

  if (department) updates.department = department as DepartmentId;
  if (priority) updates.priority = priority as Priority;
  if (assignedOfficer) updates.assignedOfficer = assignedOfficer;

  // Recalculate SLA if dept or priority changed
  if (department || priority) {
    const newDept = (department || complaint.department) as DepartmentId;
    const newPriority = (priority || complaint.priority) as Priority;
    const { targetHours, deadlineIso } = computeSlaDeadline(newDept, newPriority, complaint.createdAt);
    updates.slaTargetHours = targetHours;
    updates.slaDeadline = deadlineIso;
  }

  const actorName = req.user?.name || 'Administrator';

  updates.timeline = [
    ...complaint.timeline,
    {
      id: generateId('t'),
      timestamp: new Date().toISOString(),
      title: 'Department / Priority Reassigned',
      description:
        remarks ||
        `Reassigned by ${actorName} to ${updates.department || complaint.department} with ${
          updates.priority || complaint.priority
        } priority.`,
      actorName,
      actorRole: 'ADMIN',
      status: complaint.status,
    },
  ];

  const updated = db.updateComplaint(complaint.id, updates);
  res.json({ complaint: updated });
});

// Merge duplicate complaints
router.post('/complaints/:id/merge', (req: AuthenticatedRequest, res) => {
  const { primaryComplaintId, reason } = req.body;
  const duplicate = db.getComplaintById(req.params.id);
  const primary = db.getComplaintById(primaryComplaintId);

  if (!duplicate || !primary) {
    return res.status(404).json({ error: 'One or both complaints not found' });
  }

  const actorName = req.user?.name || 'Administrator';
  const now = new Date().toISOString();

  // Close duplicate
  db.updateComplaint(duplicate.id, {
    status: 'RESOLVED',
    isDuplicateOf: primary.id,
    resolutionRemarks: `Merged into parent ticket ${primary.id}. ${reason || ''}`,
    resolvedAt: now,
    timeline: [
      ...duplicate.timeline,
      {
        id: generateId('t'),
        timestamp: now,
        title: 'Linked as Duplicate',
        description: `Linked to primary ticket ${primary.id} by ${actorName}. Will be resolved concurrently.`,
        actorName,
        actorRole: 'ADMIN',
        status: 'RESOLVED',
      },
    ],
  });

  // Increment primary upvotes and update timeline
  db.updateComplaint(primary.id, {
    upvotes: primary.upvotes + 1,
    duplicateCount: (primary.duplicateCount || 0) + 1,
    timeline: [
      ...primary.timeline,
      {
        id: generateId('t'),
        timestamp: now,
        title: 'Duplicate Ticket Merged',
        description: `Complaint ${duplicate.id} was merged into this issue, consolidating community reports.`,
        actorName,
        actorRole: 'ADMIN',
        status: primary.status,
      },
    ],
  });

  res.json({ success: true, primaryId: primary.id, mergedId: duplicate.id });
});

export default router;
