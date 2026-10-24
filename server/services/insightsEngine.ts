import { Complaint, AIInsight, AreaInsight, DepartmentId } from '../types.js';

export function generateAdminInsights(complaints: Complaint[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // 1. Cluster detection: group active complaints by ward + department
  const wardDeptGroups: Record<string, Complaint[]> = {};
  for (const c of complaints) {
    if (c.status === 'OPEN' || c.status === 'IN_PROGRESS') {
      const key = `${c.ward}__${c.department}`;
      if (!wardDeptGroups[key]) wardDeptGroups[key] = [];
      wardDeptGroups[key].push(c);
    }
  }

  for (const [key, group] of Object.entries(wardDeptGroups)) {
    const [ward, dept] = key.split('__') as [string, DepartmentId];
    if (group.length >= 2) {
      insights.push({
        id: `insight-cluster-${ward}-${dept}`,
        type: 'CLUSTER_ALERT',
        severity: group.length >= 3 ? 'CRITICAL' : 'WARNING',
        title: `Grievance Cluster: ${dept.replace('_', ' ')} in ${ward}`,
        description: `${group.length} active grievances reported in ${ward} regarding ${dept.toLowerCase()}. Suggests an underlying systemic infrastructure failure rather than isolated incidents.`,
        department: dept,
        ward: ward,
        affectedComplaintsCount: group.length,
        recommendedAction: `Deploy rapid intervention team to ${ward} to inspect main trunk lines and coordinate batch resolution.`,
        confidenceScore: 0.94,
      });
    }
  }

  // 2. SLA Risk Detection: complaints warning or breached
  const breached = complaints.filter((c) => c.slaStatus === 'BREACHED' && c.status !== 'RESOLVED');
  if (breached.length > 0) {
    insights.push({
      id: 'insight-sla-breach-alert',
      type: 'SLA_RISK',
      severity: 'CRITICAL',
      title: `${breached.length} Unresolved Grievances Have Breached SLA Deadlines`,
      description: `Citizens are experiencing delayed turnaround times on ${breached.length} escalated tickets, predominantly in ${breached[0].department}. High risk of citizen dissatisfaction escalation.`,
      department: breached[0].department,
      affectedComplaintsCount: breached.length,
      recommendedAction: 'Reassign to standby municipal contractors and trigger direct supervisory escalation.',
      confidenceScore: 0.98,
    });
  }

  // 3. Chronic Hotspot detection
  const wardCount: Record<string, number> = {};
  complaints.forEach((c) => {
    wardCount[c.ward] = (wardCount[c.ward] || 0) + 1;
  });

  const sortedWards = Object.entries(wardCount).sort((a, b) => b[1] - a[1]);
  if (sortedWards.length > 0 && sortedWards[0][1] >= 3) {
    const topWard = sortedWards[0][0];
    insights.push({
      id: `insight-hotspot-${topWard}`,
      type: 'CHRONIC_HOTSPOT',
      severity: 'WARNING',
      title: `High Complaint Density in ${topWard}`,
      description: `${topWard} accounts for ${(
        (sortedWards[0][1] / (complaints.length || 1)) *
        100
      ).toFixed(0)}% of all municipal grievances this month. Infrastructure overhaul recommended.`,
      ward: topWard,
      affectedComplaintsCount: sortedWards[0][1],
      recommendedAction: `Schedule a municipal ward committee walk-through and budget review with the local counselor.`,
      confidenceScore: 0.89,
    });
  }

  return insights;
}

export function computeAreaInsights(complaints: Complaint[]): AreaInsight[] {
  const wards = Array.from(new Set(complaints.map((c) => c.ward)));

  return wards.map((ward) => {
    const wardComplaints = complaints.filter((c) => c.ward === ward);
    const total = wardComplaints.length;
    const resolved = wardComplaints.filter((c) => c.status === 'RESOLVED').length;
    const active = total - resolved;

    // top department
    const deptCount: Record<string, number> = {};
    wardComplaints.forEach((c) => {
      deptCount[c.department] = (deptCount[c.department] || 0) + 1;
    });
    const topDept = (Object.entries(deptCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'ROADS') as DepartmentId;

    const onTrackOrResolvedWithinSla = wardComplaints.filter(
      (c) => c.slaStatus === 'ON_TRACK' || (c.status === 'RESOLVED' && c.slaStatus !== 'BREACHED')
    ).length;

    const slaComplianceRate = total > 0 ? Math.round((onTrackOrResolvedWithinSla / total) * 100) : 100;
    const healthIndex = Math.max(
      20,
      Math.min(100, Math.round(slaComplianceRate * 0.7 + (resolved / (total || 1)) * 30))
    );

    return {
      ward,
      name: `Ward ${ward} (Municipal Zone)`,
      totalComplaints: total,
      activeCount: active,
      resolvedCount: resolved,
      topDepartment: topDept,
      slaComplianceRate,
      healthIndex,
    };
  });
}
