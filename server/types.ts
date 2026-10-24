export type DepartmentId =
  | 'ROADS'
  | 'WASTE'
  | 'WATER'
  | 'ELECTRICITY'
  | 'HEALTH'
  | 'PARKS';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type SlaStatus = 'ON_TRACK' | 'WARNING' | 'BREACHED';

export type UserRole = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export interface DepartmentMeta {
  id: DepartmentId;
  name: string;
  code: string;
  officerInCharge: string;
  contactEmail: string;
  contactPhone: string;
  baseSlaHours: Record<Priority, number>;
  icon: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actorName: string;
  actorRole: UserRole | 'SYSTEM';
  status: ComplaintStatus;
  proofImageUrl?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  department: DepartmentId;
  priority: Priority;
  status: ComplaintStatus;
  ward: string;
  address: string;
  landmark?: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  createdAt: string;
  updatedAt: string;
  slaTargetHours: number;
  slaDeadline: string;
  slaStatus: SlaStatus;
  imageUrl?: string;
  resolutionImageUrl?: string;
  resolutionRemarks?: string;
  resolvedAt?: string;
  assignedOfficer?: string;
  upvotes: number;
  upvotedBy: string[];
  timeline: TimelineEvent[];
  isDuplicateOf?: string;
  duplicateCount?: number;
  tags: string[];
  aiAnalysis?: {
    confidence: number;
    reasoning: string;
    detectedKeywords: string[];
    hazardLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  ward: string;
  role: UserRole;
  department?: DepartmentId;
  avatar?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'STATUS_UPDATE' | 'SLA_ALERT' | 'ASSIGNMENT' | 'DUPLICATE_LINK' | 'INFO';
  complaintId?: string;
  read: boolean;
  createdAt: string;
}

export interface AdminKPIs {
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  resolutionRatePercentage: number;
  avgResolutionTimeHours: number;
  slaBreachedCount: number;
  slaWarningCount: number;
  criticalPendingCount: number;
  activeCitizens: number;
}

export interface ActionQueueItem {
  id: string;
  complaintId: string;
  title: string;
  ward: string;
  department: DepartmentId;
  priority: Priority;
  slaStatus: SlaStatus;
  hoursRemaining: number;
  actionRequired: 'TRIAGE' | 'ESCALATE' | 'REASSIGN' | 'APPROVE_RESOLUTION' | 'MERGE_DUPLICATE';
  suggestedAction: string;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  type: 'CLUSTER_ALERT' | 'SLA_RISK' | 'CHRONIC_HOTSPOT' | 'SATISFACTION_DROP';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  department?: DepartmentId;
  ward?: string;
  affectedComplaintsCount: number;
  recommendedAction: string;
  confidenceScore: number;
}

export interface AreaInsight {
  ward: string;
  name: string;
  totalComplaints: number;
  activeCount: number;
  resolvedCount: number;
  topDepartment: DepartmentId;
  slaComplianceRate: number;
  healthIndex: number; // 0 - 100
}

export interface DuplicatePreview {
  id: string;
  title: string;
  status: ComplaintStatus;
  address: string;
  similarityScore: number;
  reason: string;
  createdAt: string;
}
