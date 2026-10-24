import { DepartmentId } from '../types.js';

interface DepartmentMatch {
  department: DepartmentId;
  confidence: number;
  matchedCategory: string;
}

const DEPT_KEYWORDS: Record<DepartmentId, string[]> = {
  ROADS: [
    'pothole',
    'road',
    'footpath',
    'sidewalk',
    'bridge',
    'divider',
    'asphalt',
    'speed breaker',
    'crater',
    'manhole cover',
    'traffic signal',
  ],
  WASTE: [
    'garbage',
    'trash',
    'waste',
    'dump',
    'litter',
    'debris',
    'bin',
    'sweep',
    'sanitation',
    'dead animal',
    'rubbish',
  ],
  WATER: [
    'water',
    'pipe',
    'burst',
    'leak',
    'sewage',
    'sewer',
    'drainage',
    'gutter',
    'drinking water',
    'contamination',
    'no water',
    'tap',
  ],
  ELECTRICITY: [
    'street light',
    'streetlight',
    'electric',
    'pole',
    'wire',
    'spark',
    'transformer',
    'blackout',
    'light',
    'cable',
  ],
  HEALTH: [
    'dengue',
    'mosquito',
    'fogging',
    'stray dog',
    'hygiene',
    'epidemic',
    'clinic',
    'vaccine',
    'rabies',
    'foul smell',
  ],
  PARKS: [
    'park',
    'garden',
    'tree',
    'branch',
    'playground',
    'swing',
    'bench',
    'grass',
    'horticulture',
  ],
};

export function classifyDepartment(
  title: string,
  description: string,
  userSelectedCategory?: string
): DepartmentMatch {
  const combined = `${title} ${description} ${userSelectedCategory || ''}`.toLowerCase();

  let bestDept: DepartmentId = 'ROADS';
  let bestScore = 0;

  for (const [dept, keywords] of Object.entries(DEPT_KEYWORDS) as [DepartmentId, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (combined.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestDept = dept;
    }
  }

  // If user explicitly selected a category that maps clearly, verify
  if (userSelectedCategory) {
    const uc = userSelectedCategory.toUpperCase();
    if (uc.includes('ROAD') || uc.includes('POTHOLE')) bestDept = 'ROADS';
    else if (uc.includes('WASTE') || uc.includes('GARBAGE')) bestDept = 'WASTE';
    else if (uc.includes('WATER') || uc.includes('DRAIN') || uc.includes('SEWER')) bestDept = 'WATER';
    else if (uc.includes('LIGHT') || uc.includes('ELECTRIC')) bestDept = 'ELECTRICITY';
    else if (uc.includes('HEALTH')) bestDept = 'HEALTH';
    else if (uc.includes('PARK') || uc.includes('TREE')) bestDept = 'PARKS';
  }

  const confidence = bestScore > 3 ? 0.95 : bestScore > 0 ? 0.8 : 0.65;

  return {
    department: bestDept,
    confidence,
    matchedCategory: bestDept,
  };
}
