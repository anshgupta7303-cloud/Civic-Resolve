export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${year}-${randomNum}`;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function calculateHoursDiff(earlierDate: string, laterDate: string): number {
  const d1 = new Date(earlierDate).getTime();
  const d2 = new Date(laterDate).getTime();
  return (d2 - d1) / (1000 * 60 * 60);
}

export function addHoursToIso(isoDate: string, hours: number): string {
  const date = new Date(isoDate);
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date.toISOString();
}

export function calculateRemainingHours(deadlineIso: string): number {
  const now = Date.now();
  const deadline = new Date(deadlineIso).getTime();
  return (deadline - now) / (1000 * 60 * 60);
}

// Simple token similarity (Jaccard similarity on lowercased alphanumeric words)
export function computeTextSimilarity(text1: string, text2: string): number {
  const getTokens = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2)
    );

  const set1 = getTokens(text1);
  const set2 = getTokens(text2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}
