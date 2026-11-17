import { SleepAnalysis, AIRecommendation, HistorySessionItem } from '@/types';

// Baseline clinical polysomnography reference dataset
export const DEFAULT_ANALYSIS: SleepAnalysis = {
  id: 'psg-rec-8821',
  fileName: 'patient_eeg_sleep_overnight.edf',
  fileSize: 45200000,
  createdAt: '2026-11-09T07:30:00Z',
  durationMinutes: 465, // 7h 45m
  totalSleepMinutes: 423,
  efficiency: 88.5,
  awakenings: 3,
  modelConfidence: 94.8,
  deepSleepMinutes: 105, // 22.5%
  remSleepMinutes: 98,   // 21.0%
  lightSleepMinutes: 220,// 47.3%
  wakeMinutes: 42,       // 9.0%
  stageDistribution: {
    wake: 9,
    n1: 8,
    n2: 39,
    n3: 23,
    rem: 21,
  },
  hypnogram: [
    { time: '23:00', stage: 'Wake', stageNumeric: 4 },
    { time: '23:30', stage: 'N1', stageNumeric: 2 },
    { time: '00:00', stage: 'N2', stageNumeric: 2 },
    { time: '00:30', stage: 'N3', stageNumeric: 1 },
    { time: '01:00', stage: 'N3', stageNumeric: 1 },
    { time: '01:30', stage: 'N2', stageNumeric: 2 },
    { time: '02:00', stage: 'REM', stageNumeric: 3 },
    { time: '02:30', stage: 'N2', stageNumeric: 2 },
    { time: '03:00', stage: 'N3', stageNumeric: 1 },
    { time: '03:30', stage: 'N2', stageNumeric: 2 },
    { time: '04:00', stage: 'REM', stageNumeric: 3 },
    { time: '04:30', stage: 'Wake', stageNumeric: 4 },
    { time: '05:00', stage: 'N2', stageNumeric: 2 },
    { time: '05:30', stage: 'REM', stageNumeric: 3 },
    { time: '06:00', stage: 'N1', stageNumeric: 2 },
    { time: '06:30', stage: 'Wake', stageNumeric: 4 },
  ],
  eegSignals: [
    { timeOffset: 0.0, fp1_f3: 12.4, c3_a2: -18.2, o1_a2: 8.5 },
    { timeOffset: 0.1, fp1_f3: 24.1, c3_a2: -5.4, o1_a2: 14.2 },
    { timeOffset: 0.2, fp1_f3: -15.2, c3_a2: 12.8, o1_a2: -9.8 },
    { timeOffset: 0.3, fp1_f3: -32.6, c3_a2: 38.5, o1_a2: -25.1 },
    { timeOffset: 0.4, fp1_f3: 8.9, c3_a2: 19.1, o1_a2: 6.2 },
    { timeOffset: 0.5, fp1_f3: 42.1, c3_a2: -28.4, o1_a2: 35.8 },
    { timeOffset: 0.6, fp1_f3: 15.3, c3_a2: -12.1, o1_a2: 11.4 },
    { timeOffset: 0.7, fp1_f3: -22.7, c3_a2: 18.3, o1_a2: -19.6 },
    { timeOffset: 0.8, fp1_f3: -45.0, c3_a2: 44.2, o1_a2: -38.2 },
    { timeOffset: 0.9, fp1_f3: -8.1, c3_a2: 16.0, o1_a2: -4.3 },
    { timeOffset: 1.0, fp1_f3: 31.4, c3_a2: -21.8, o1_a2: 27.6 },
    { timeOffset: 1.1, fp1_f3: 48.2, c3_a2: -39.1, o1_a2: 41.2 },
    { timeOffset: 1.2, fp1_f3: 19.8, c3_a2: -14.6, o1_a2: 15.9 },
    { timeOffset: 1.3, fp1_f3: -12.3, c3_a2: 8.9, o1_a2: -8.4 },
    { timeOffset: 1.4, fp1_f3: -38.7, c3_a2: 32.5, o1_a2: -31.1 },
    { timeOffset: 1.5, fp1_f3: -5.4, c3_a2: 11.2, o1_a2: -2.8 },
    { timeOffset: 1.6, fp1_f3: 28.6, c3_a2: -19.4, o1_a2: 24.0 },
    { timeOffset: 1.7, fp1_f3: 45.3, c3_a2: -35.2, o1_a2: 39.8 },
    { timeOffset: 1.8, fp1_f3: 14.1, c3_a2: -8.9, o1_a2: 10.2 },
    { timeOffset: 1.9, fp1_f3: -18.6, c3_a2: 15.7, o1_a2: -14.5 },
  ],
  aiExplanation:
    'The EEG sleep recording reveals robust slow-wave architecture during the first 3 hours, indicating healthy deep sleep restoration. REM cycles appeared at regular ~90-minute intervals. A mild arousal phase was noted at 04:30 AM, resolving rapidly into Stage 2 light sleep.',
  status: 'completed',
};

export const DEFAULT_RECOMMENDATION: AIRecommendation = {
  id: 'rec-ai-8821',
  analysisId: 'psg-rec-8821',
  generatedAt: '2026-11-09T07:35:00Z',
  summary:
    'Your deep sleep proportion (23%) is excellent for cellular and neural recovery. A mid-sleep awakening occurred around 04:30 AM, likely linked to ambient temperature fluctuation or late caffeine clearance.',
  suggestedBedtime: '22:45 PM',
  suggestedWakeTime: '06:45 AM',
  targetDurationMinutes: 480,
  keyFindings: [
    'Deep sleep architecture is within optimal clinical bounds (20-25%).',
    'Slight delay in initial sleep onset latency (~22 minutes).',
    'High model confidence score (94.8%) across all epoch classifications.',
  ],
  habits: [
    {
      category: 'Circadian',
      title: 'Anchor Morning Natural Light Exposure',
      description: 'Spend 10-15 minutes outdoors within 30 minutes of waking to synchronise cortisol peak.',
      priority: 'high',
    },
    {
      category: 'Nutrition',
      title: 'Shift Caffeine Cut-off to 1:00 PM',
      description: 'Adenosine receptor blockade from late caffeine may explain the 04:30 AM micro-arousal.',
      priority: 'high',
    },
    {
      category: 'Environment',
      title: 'Maintain Bedroom Temperature at 18-20°C',
      description: 'Thermal comfort prevents nighttime wakefulness during lighter REM cycles.',
      priority: 'medium',
    },
    {
      category: 'Pre-Sleep Routine',
      title: 'Wind-Down Buffer (30 mins before bed)',
      description: 'Limit blue-light emitting devices to facilitate natural melatonin secretion.',
      priority: 'medium',
    },
  ],
};

export const DEFAULT_HISTORY: HistorySessionItem[] = [
  {
    id: 'psg-rec-8821',
    date: '2026-11-09',
    fileName: 'patient_eeg_sleep_overnight.edf',
    durationMinutes: 465,
    efficiency: 88.5,
    deepPercent: 23,
    remPercent: 21,
    lightPercent: 47,
    wakePercent: 9,
    status: 'completed',
  },
  {
    id: 'psg-rec-8819',
    date: '2026-11-07',
    fileName: 'polysomnography_recording_ch1_ch2.csv',
    durationMinutes: 420,
    efficiency: 82.1,
    deepPercent: 19,
    remPercent: 18,
    lightPercent: 52,
    wakePercent: 11,
    status: 'completed',
  },
  {
    id: 'psg-rec-8815',
    date: '2026-11-04',
    fileName: 'ambulatory_eeg_session_04nov.edf',
    durationMinutes: 495,
    efficiency: 91.0,
    deepPercent: 25,
    remPercent: 22,
    lightPercent: 46,
    wakePercent: 7,
    status: 'completed',
  },
  {
    id: 'psg-rec-8808',
    date: '2026-10-31',
    fileName: 'sleep_study_epoch_filtered.edf',
    durationMinutes: 385,
    efficiency: 76.4,
    deepPercent: 14,
    remPercent: 16,
    lightPercent: 54,
    wakePercent: 16,
    status: 'completed',
  },
];

// Aliases for compatibility
export const DEMO_ANALYSIS = DEFAULT_ANALYSIS;
export const DEMO_RECOMMENDATION = DEFAULT_RECOMMENDATION;
export const DEMO_HISTORY = DEFAULT_HISTORY;
