import { Priority } from '../types.js';
import { GoogleGenAI } from '@google/genai';

interface PriorityAnalysis {
  priority: Priority;
  confidence: number;
  reasoning: string;
  detectedKeywords: string[];
  hazardLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const CRITICAL_KEYWORDS = [
  'sparking',
  'live wire',
  'electrocution',
  'gas leak',
  'open manhole',
  'sinkhole',
  'collapsed',
  'burst pipe flooding',
  'hospital road blocked',
  'toxic',
  'chemical spill',
  'fire hazard',
];

const HIGH_KEYWORDS = [
  'deep pothole',
  'drinking water contaminated',
  'overflowing sewage',
  'school route',
  'ambulance blocked',
  'accident prone',
  'heavy traffic blocked',
  'no water 3 days',
  'foul smell dengue',
  'street completely dark',
];

const MEDIUM_KEYWORDS = [
  'pothole',
  'garbage dumped',
  'street light flicker',
  'low water pressure',
  'drain clogged',
  'stagnant water',
  'broken bench',
  'overgrown grass',
];

export async function analyzePriority(
  title: string,
  description: string,
  category: string
): Promise<PriorityAnalysis> {
  const combinedText = `${title} ${description} ${category}`.toLowerCase();

  const foundCritical = CRITICAL_KEYWORDS.filter((kw) => combinedText.includes(kw));
  const foundHigh = HIGH_KEYWORDS.filter((kw) => combinedText.includes(kw));
  const foundMedium = MEDIUM_KEYWORDS.filter((kw) => combinedText.includes(kw));

  // Attempt Gemini enhancement if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      const prompt = `You are an expert municipal public safety officer. Analyze this civic grievance:
Title: "${title}"
Description: "${description}"
Category: "${category}"

Return STRICT JSON with:
{
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number between 0.7 and 0.99,
  "reasoning": "1-2 sentence explanation of urgency and public safety risk",
  "hazardLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}`;

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 3500)
      );

      const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.priority && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.priority)) {
          return {
            priority: parsed.priority,
            confidence: parsed.confidence || 0.92,
            reasoning: parsed.reasoning,
            detectedKeywords: [...foundCritical, ...foundHigh, ...foundMedium],
            hazardLevel: parsed.hazardLevel || 'MEDIUM',
          };
        }
      }
    } catch {
      // Fallback to rules-based engine
    }
  }

  // Rules-based deterministic fallback
  if (foundCritical.length > 0) {
    return {
      priority: 'CRITICAL',
      confidence: 0.95,
      reasoning: `Immediate life-safety or structural hazard detected (${foundCritical.join(', ')}). Requires rapid response.`,
      detectedKeywords: foundCritical,
      hazardLevel: 'CRITICAL',
    };
  }

  if (foundHigh.length > 0) {
    return {
      priority: 'HIGH',
      confidence: 0.88,
      reasoning: `High civic disruption or public health hazard identified (${foundHigh.join(', ')}). Urgent action recommended.`,
      detectedKeywords: foundHigh,
      hazardLevel: 'HIGH',
    };
  }

  if (foundMedium.length > 0) {
    return {
      priority: 'MEDIUM',
      confidence: 0.82,
      reasoning: `Standard municipal grievance affecting neighborhood convenience (${foundMedium.join(', ')}).`,
      detectedKeywords: foundMedium,
      hazardLevel: 'MEDIUM',
    };
  }

  return {
    priority: 'LOW',
    confidence: 0.75,
    reasoning: 'Routine civic maintenance grievance with standard operational priority.',
    detectedKeywords: [],
    hazardLevel: 'LOW',
  };
}
