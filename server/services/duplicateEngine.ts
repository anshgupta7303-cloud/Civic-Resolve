import { Complaint } from '../types.js';
import { computeTextSimilarity } from '../utils.js';

export interface DuplicateMatch {
  existingComplaint: Complaint;
  similarityScore: number;
  reason: string;
}

export function findPotentialDuplicates(
  newComplaint: {
    title: string;
    description: string;
    ward: string;
    department: string;
    address: string;
    landmark?: string;
  },
  existingComplaints: Complaint[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  const activeComplaints = existingComplaints.filter(
    (c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
  );

  for (const existing of activeComplaints) {
    // Check if in same ward and same department
    const sameWard =
      newComplaint.ward.trim().toLowerCase() === existing.ward.trim().toLowerCase();
    const sameDept = newComplaint.department === existing.department;

    if (!sameDept) continue;

    const titleSim = computeTextSimilarity(newComplaint.title, existing.title);
    const descSim = computeTextSimilarity(newComplaint.description, existing.description);
    const combinedSim = titleSim * 0.6 + descSim * 0.4;

    let addressSim = 0;
    if (newComplaint.address && existing.address) {
      addressSim = computeTextSimilarity(newComplaint.address, existing.address);
    }

    let landmarkMatch = false;
    if (newComplaint.landmark && existing.landmark) {
      landmarkMatch =
        newComplaint.landmark.toLowerCase().trim() ===
        existing.landmark.toLowerCase().trim();
    }

    // High threshold: same ward + high text similarity OR close address match
    let totalScore = combinedSim;
    if (sameWard) totalScore += 0.2;
    if (addressSim > 0.4) totalScore += 0.25;
    if (landmarkMatch) totalScore += 0.3;

    if (totalScore >= 0.55) {
      let reason = 'Similar description and category in the same area';
      if (landmarkMatch) {
        reason = `Identical landmark (${existing.landmark}) in Ward ${existing.ward}`;
      } else if (addressSim > 0.4) {
        reason = `Nearby address in Ward ${existing.ward} with matching civic issue`;
      }

      matches.push({
        existingComplaint: existing,
        similarityScore: Math.min(0.98, totalScore),
        reason,
      });
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
