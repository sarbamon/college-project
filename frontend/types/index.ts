export type SleepStage = 'Wake' | 'REM' | 'N1' | 'N2' | 'N3';

export interface StageDistribution {
  wake: number; // percentage (0-100)
  n1: number;
  n2: number;
  n3: number;
  rem: number;
}

export interface HypnogramDataPoint {
  time: string;       // e.g. "23:00"
  stage: SleepStage;
  stageNumeric: number; // 4 = Wake, 3 = REM, 2 = Light (N1/N2), 1 = Deep (N3)
}

export interface EEGSignalPoint {
  timeOffset: number; // in seconds or milliseconds
  fp1_f3?: number;    // amplitude in microvolts
  c3_a2?: number;     // central channel
  o1_a2?: number;     // occipital channel
}

export interface SleepAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  durationMinutes: number;
  totalSleepMinutes?: number;
  efficiency: number;        // percentage
  awakenings: number;
  modelConfidence: number;   // percentage
  deepSleepMinutes: number;
  remSleepMinutes: number;
  lightSleepMinutes: number;
  wakeMinutes: number;
  stageDistribution: StageDistribution;
  hypnogram: HypnogramDataPoint[];
  eegSignals?: EEGSignalPoint[];
  aiExplanation?: string;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface SleepHabit {
  category: 'Circadian' | 'Environment' | 'Nutrition' | 'Pre-Sleep Routine';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIRecommendation {
  id: string;
  analysisId: string;
  generatedAt: string;
  summary: string;
  suggestedBedtime: string;
  suggestedWakeTime: string;
  targetDurationMinutes: number;
  keyFindings: string[];
  habits: SleepHabit[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HistorySessionItem {
  id: string;
  date: string;
  fileName: string;
  durationMinutes: number;
  efficiency: number;
  deepPercent: number;
  remPercent: number;
  lightPercent: number;
  wakePercent: number;
  status: 'completed' | 'processing' | 'failed';
}

export interface UserPreferences {
  name: string;
  email: string;
  targetBedtime: string;
  targetWakeTime: string;
  targetSleepHours: number;
  notifyOnAnalysis: boolean;
  weeklyInsights: boolean;
  fastApiUrl: string;
}

