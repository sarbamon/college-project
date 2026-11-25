import { SleepAnalysis, AIRecommendation, HistorySessionItem } from '@/types';

function getApiBaseUrl(): string {
  const defaultUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (typeof window === 'undefined') return defaultUrl;
  try {
    const saved = localStorage.getItem('eeg_sleep_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.backendUrl && typeof parsed.backendUrl === 'string') {
        return parsed.backendUrl.replace(/\/+$/, '');
      }
    }
  } catch {
    // ignore storage errors
  }
  return defaultUrl;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Checks connectivity to the FastAPI backend.
 */
export async function checkBackendHealth(): Promise<{ status: string; online: boolean }> {
  const apiUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({ status: 'ok' }));
      return { status: data.status || 'ok', online: true };
    }
    return { status: `HTTP ${res.status}`, online: false };
  } catch (err) {
    return { status: `Backend unreachable (${apiUrl})`, online: false };
  }
}

/**
 * Uploads an EEG file (EDF or CSV) to the FastAPI backend for analysis.
 * POST http://localhost:8000/analyze
 */
export async function uploadEEG(
  file: File,
  onProgress?: (progress: number) => void
): Promise<SleepAnalysis> {
  const apiUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);

  if (onProgress) {
    onProgress(30);
  }

  try {
    const res = await fetch(`${apiUrl}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (onProgress) {
      onProgress(85);
    }

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Analysis request failed with status ${res.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || errorMessage;
      } catch {
        if (errorText) errorMessage = errorText;
      }
      throw new ApiError(errorMessage, res.status);
    }

    const data: SleepAnalysis = await res.json();
    if (onProgress) {
      onProgress(100);
    }
    return data;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Failed to connect to FastAPI backend at ${apiUrl}. Ensure the Python server is running: ${err.message}`,
      503
    );
  }
}

/**
 * Fetches analysis result by ID from the backend.
 * GET http://localhost:8000/analysis/{analysisId}
 */
export async function getAnalysis(analysisId: string): Promise<SleepAnalysis> {
  const apiUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${apiUrl}/analysis/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new ApiError(`Analysis session ${analysisId} not found or failed to load.`, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Unable to fetch analysis from ${apiUrl}: ${err.message}`, 503);
  }
}

/**
 * Fetches all previous sleep analysis sessions.
 * GET http://localhost:8000/history
 */
export async function getSleepHistory(): Promise<HistorySessionItem[]> {
  const apiUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${apiUrl}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new ApiError(`Failed to fetch sleep history (${res.status})`, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Unable to fetch history from ${apiUrl}: ${err.message}`, 503);
  }
}

/**
 * Fetches LLM-generated recommendations for a specific analysis session.
 * GET http://localhost:8000/recommendations/{analysisId}
 */
export async function getRecommendations(analysisId: string): Promise<AIRecommendation> {
  const apiUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${apiUrl}/recommendations/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new ApiError(`Recommendations for ${analysisId} could not be retrieved.`, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Unable to fetch recommendations from ${apiUrl}: ${err.message}`, 503);
  }
}

/**
 * Sends a user query to the AI sleep assistant.
 * POST http://localhost:8000/assistant/chat
 */
export async function sendAssistantMessage(
  analysisId: string | null,
  message: string
): Promise<{ reply: string }> {
  const apiUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${apiUrl}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analysisId,
        message,
      }),
    });

    if (!res.ok) {
      throw new ApiError(`Assistant returned error status ${res.status}`, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Failed to reach Assistant service: ${err.message}`, 503);
  }
}

