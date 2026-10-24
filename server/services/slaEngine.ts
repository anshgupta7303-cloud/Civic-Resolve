import { DepartmentId, Priority, SlaStatus } from '../types.js';
import { addHoursToIso, calculateRemainingHours } from '../utils.js';

export const SLA_MATRIX: Record<DepartmentId, Record<Priority, number>> = {
  ROADS: {
    CRITICAL: 12,
    HIGH: 24,
    MEDIUM: 48,
    LOW: 72,
  },
  WASTE: {
    CRITICAL: 6,
    HIGH: 12,
    MEDIUM: 24,
    LOW: 48,
  },
  WATER: {
    CRITICAL: 8,
    HIGH: 16,
    MEDIUM: 36,
    LOW: 48,
  },
  ELECTRICITY: {
    CRITICAL: 6,
    HIGH: 12,
    MEDIUM: 24,
    LOW: 48,
  },
  HEALTH: {
    CRITICAL: 12,
    HIGH: 24,
    MEDIUM: 48,
    LOW: 72,
  },
  PARKS: {
    CRITICAL: 24,
    HIGH: 48,
    MEDIUM: 72,
    LOW: 96,
  },
};

export function getBaseSlaHours(department: DepartmentId, priority: Priority): number {
  const deptTable = SLA_MATRIX[department] || SLA_MATRIX.ROADS;
  return deptTable[priority] || 48;
}

export function computeSlaDeadline(department: DepartmentId, priority: Priority, createdAt: string): { targetHours: number; deadlineIso: string } {
  const targetHours = getBaseSlaHours(department, priority);
  const deadlineIso = addHoursToIso(createdAt, targetHours);
  return { targetHours, deadlineIso };
}

export function evaluateSlaStatus(deadlineIso: string, resolvedAt?: string): SlaStatus {
  if (resolvedAt) {
    const resolvedTime = new Date(resolvedAt).getTime();
    const deadlineTime = new Date(deadlineIso).getTime();
    return resolvedTime <= deadlineTime ? 'ON_TRACK' : 'BREACHED';
  }

  const hoursRemaining = calculateRemainingHours(deadlineIso);
  if (hoursRemaining <= 0) {
    return 'BREACHED';
  }
  // If less than 25% of SLA or under 4 hours remain, mark as WARNING
  if (hoursRemaining < 6) {
    return 'WARNING';
  }
  return 'ON_TRACK';
}
