import { Router } from 'express';
import { db, DEPARTMENTS } from '../db.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { classifyDepartment } from '../services/departmentEngine.js';
import { analyzePriority } from '../services/priorityEngine.js';
import { computeSlaDeadline } from '../services/slaEngine.js';
import { findPotentialDuplicates, DuplicateMatch } from '../services/duplicateEngine.js';
import { addNotification } from '../notifications.js';
import { generateComplaintId, generateId } from '../utils.js';
import { Complaint, ComplaintStatus, DepartmentId, DuplicatePreview, User } from '../types.js';

const router = Router();

function sanitizeComplaint(complaint: Complaint, reqUser?: User): Complaint {
  const safeComplaint = { ...complaint };
  const canViewPII = reqUser && (reqUser.role === 'ADMIN' || reqUser.role === 'OFFICER' || reqUser.id === complaint.citizenId);

  if (!canViewPII) {
    (safeComplaint as any).citizenId = undefined;
    (safeComplaint as any).citizenPhone = undefined;
    (safeComplaint as any).citizenEmail = undefined;
    
    if (safeComplaint.citizenName) {
      const parts = safeComplaint.citizenName.trim().split(' ');
      if (parts.length > 1) {
        safeComplaint.citizenName = `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
      } else {
        safeComplaint.citizenName = `${safeComplaint.citizenName.charAt(0)}***`;
      }
    }
  }
  return safeComplaint;
}

function mapDuplicateMatchToPreview(match: DuplicateMatch): DuplicatePreview {
  return {
    id: match.existingComplaint.id,
    title: match.existingComplaint.title,
    status: match.existingComplaint.status,
    address: match.existingComplaint.address,
    similarityScore: match.similarityScore,
    reason: match.reason,
    createdAt: match.existingComplaint.createdAt,
  };
}

// Get list of departments
router.get('/departments', (req, res) => {
  res.json({ departments: DEPARTMENTS });
});

// Check duplicates pre-submission
router.post('/check-duplicate', (req, res) => {
  const { title, description, ward, department, address, landmark } = req.body;

  if (!title || !ward) {
    return res.json({ duplicates: [] });
  }

  const dept = department || classifyDepartment(title, description || '').department;
  const matches = findPotentialDuplicates(
    {
      title,
      description: description || '',
      ward,
      department: dept,
      address: address || '',
      landmark: landmark || '',
    },
    db.getComplaints()
  );

  return res.json({
    duplicates: matches.slice(0, 3).map(mapDuplicateMatchToPreview),
  });
});

// List complaints with filtering
router.get('/', (req: AuthenticatedRequest, res) => {
  let list = db.getComplaints();

  const { status, department, ward, priority, search, citizenId } = req.query;

  let filterCitizenId = citizenId as string | undefined;
  if (filterCitizenId) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to filter by citizen' });
    }
    if (req.user.role === 'CITIZEN') {
      filterCitizenId = req.user.id;
    }
    list = list.filter((c) => c.citizenId === filterCitizenId);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter((c) => c.status === status);
  }

  if (department && typeof department === 'string' && department !== 'ALL') {
    list = list.filter((c) => c.department === department);
  }

  if (ward && typeof ward === 'string' && ward !== 'ALL') {
    list = list.filter((c) => c.ward === ward);
  }

  if (priority && typeof priority === 'string' && priority !== 'ALL') {
    list = list.filter((c) => c.priority === priority);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        (c.landmark && c.landmark.toLowerCase().includes(q))
    );
  }

  const safeList = list.map((c) => sanitizeComplaint(c, req.user));

  res.json({ complaints: safeList });
});

// Get single complaint by ID
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const safeComplaint = sanitizeComplaint(complaint, req.user);

  // Also fetch related duplicate issues in same area
  const duplicates = findPotentialDuplicates(
    {
      title: complaint.title,
      description: complaint.description,
      ward: complaint.ward,
      department: complaint.department,
      address: complaint.address,
      landmark: complaint.landmark,
    },
    db.getComplaints().filter((c) => c.id !== complaint.id)
  );

  res.json({
    complaint: safeComplaint,
    potentialDuplicates: duplicates.slice(0, 3).map(mapDuplicateMatchToPreview),
  });
});

// Create new complaint
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const {
    title,
    description,
    category,
    ward,
    address,
    landmark,
    imageUrl,
    departmentOverride,
  } = req.body;

  if (!title || !description || !ward || !address) {
    return res.status(400).json({ error: 'Title, description, ward, and address are required' });
  }

  // Determine user info
  const citizenId = req.user!.id;
  const cName = req.user!.name;
  const cPhone = req.user!.phone || '';
  const cEmail = req.user!.email || '';

  // 1. Classify department
  const deptMatch = classifyDepartment(title, description, category);
  const finalDept: DepartmentId = (departmentOverride as DepartmentId) || deptMatch.department;

  // 2. Analyze priority with AI Engine
  const priorityAnalysis = await analyzePriority(title, description, category || '');

  // 3. SLA Deadlines
  const createdAt = new Date().toISOString();
  const { targetHours, deadlineIso } = computeSlaDeadline(finalDept, priorityAnalysis.priority, createdAt);

  // 4. Duplicate checks
  const duplicates = findPotentialDuplicates(
    {
      title,
      description,
      ward,
      department: finalDept,
      address,
      landmark,
    },
    db.getComplaints()
  );

  const complaintId = generateComplaintId();

  const newComplaint: Complaint = {
    id: complaintId,
    title,
    description,
    category: category || deptMatch.matchedCategory,
    department: finalDept,
    priority: priorityAnalysis.priority,
    status: 'OPEN',
    ward,
    address,
    landmark,
    citizenId,
    citizenName: cName,
    citizenPhone: cPhone,
    citizenEmail: cEmail,
    createdAt,
    updatedAt: createdAt,
    slaTargetHours: targetHours,
    slaDeadline: deadlineIso,
    slaStatus: 'ON_TRACK',
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80',
    upvotes: 1,
    upvotedBy: [citizenId],
    tags: [finalDept, priorityAnalysis.priority, ward, ...(priorityAnalysis.detectedKeywords || [])],
    aiAnalysis: priorityAnalysis,
    duplicateCount: duplicates.length,
    timeline: [
      {
        id: generateId('t'),
        timestamp: createdAt,
        title: 'Grievance Filed & Registered',
        description: `Citizen ${cName} submitted grievance via CivicResolve portal.`,
        actorName: cName,
        actorRole: 'CITIZEN',
        status: 'OPEN',
      },
      {
        id: generateId('t'),
        timestamp: new Date().toISOString(),
        title: 'Automated AI Triage & Routing',
        description: `Routed to ${finalDept} with ${priorityAnalysis.priority} priority (${targetHours}h SLA target). AI Reasoning: ${priorityAnalysis.reasoning}`,
        actorName: 'CivicResolve AI Engine',
        actorRole: 'SYSTEM',
        status: 'OPEN',
      },
    ],
  };

  db.addComplaint(newComplaint);

  // Notify Citizen
  addNotification({
    userId: citizenId,
    title: `Grievance Lodged: ${complaintId}`,
    message: `Your grievance has been routed to ${finalDept} with ${priorityAnalysis.priority} priority. Tracking Reference: ${complaintId}`,
    type: 'STATUS_UPDATE',
    complaintId,
  });

  // Notify Admin if CRITICAL
  if (priorityAnalysis.priority === 'CRITICAL') {
    addNotification({
      userId: 'ADMIN',
      title: `Critical Alert: ${complaintId}`,
      message: `Critical public safety hazard registered in ${ward} (${title}). Urgent dispatch required.`,
      type: 'SLA_ALERT',
      complaintId,
    });
  }

  res.status(201).json({
    complaint: sanitizeComplaint(newComplaint, req.user),
    duplicatesFound: duplicates.length > 0 ? duplicates.slice(0, 2).map(mapDuplicateMatchToPreview) : [],
  });
});

// Update complaint status (Open -> In Progress -> Resolved / Rejected)
router.post('/:id/status', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user!.role === 'CITIZEN') {
    return res.status(403).json({ error: 'Access denied: insufficient permissions' });
  }

  const { status, remarks, proofImageUrl, assignedOfficer } = req.body;
  const complaint = db.getComplaintById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const validStatuses: ComplaintStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const actorName = req.user!.name;
  const actorRole = req.user!.role;
  const now = new Date().toISOString();

  const updates: Partial<Complaint> = {
    status,
    updatedAt: now,
  };

  if (assignedOfficer) {
    updates.assignedOfficer = assignedOfficer;
  }

  if (status === 'RESOLVED') {
    updates.resolvedAt = now;
    updates.resolutionRemarks = remarks || 'Work completed on site and verified by field inspection team.';
    if (proofImageUrl) {
      updates.resolutionImageUrl = proofImageUrl;
    }
  }

  // Add timeline entry
  const newTimelineEvent = {
    id: generateId('t'),
    timestamp: now,
    title:
      status === 'IN_PROGRESS'
        ? 'Work Order Dispatched'
        : status === 'RESOLVED'
        ? 'Grievance Resolved & Verified'
        : status === 'REJECTED'
        ? 'Grievance Closed / Not Feasible'
        : 'Status Updated',
    description: remarks || `Status changed from ${complaint.status} to ${status}.`,
    actorName,
    actorRole,
    status,
    proofImageUrl: proofImageUrl || undefined,
  };

  updates.timeline = [...complaint.timeline, newTimelineEvent];

  const updated = db.updateComplaint(complaint.id, updates);

  // Notify Citizen
  if (complaint.citizenId) {
    addNotification({
      userId: complaint.citizenId,
      title: `Status Update: ${complaint.id}`,
      message: `Your grievance has been updated to ${status}. ${remarks ? `Remarks: "${remarks}"` : ''}`,
      type: 'STATUS_UPDATE',
      complaintId: complaint.id,
    });
  }

  res.json({ complaint: sanitizeComplaint(updated!, req.user) });
});

// Upvote / Endorse complaint
router.post('/:id/upvote', requireAuth, (req: AuthenticatedRequest, res) => {
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const userId = req.user!.id;
  const hasUpvoted = complaint.upvotedBy.includes(userId);

  let newUpvotes = complaint.upvotes;
  let newUpvotedBy = [...complaint.upvotedBy];

  if (hasUpvoted) {
    newUpvotes = Math.max(1, newUpvotes - 1);
    newUpvotedBy = newUpvotedBy.filter((uid) => uid !== userId);
  } else {
    newUpvotes += 1;
    newUpvotedBy.push(userId);
  }

  const updated = db.updateComplaint(complaint.id, {
    upvotes: newUpvotes,
    upvotedBy: newUpvotedBy,
  });

  res.json({
    complaint: sanitizeComplaint(updated!, req.user),
    hasUpvoted: !hasUpvoted,
  });
});

export default router;
