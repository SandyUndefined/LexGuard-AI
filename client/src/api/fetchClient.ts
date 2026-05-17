import { buildApiUrl } from './config';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

interface ApiErrorBody {
  error?: string;
}

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    return body.error || `${response.status} ${response.statusText}`;
  }

  const text = await response.text().catch(() => '');
  return text || `${response.status} ${response.statusText}`;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 120_000, headers, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildApiUrl(path), {
      credentials: 'include',
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw error instanceof Error ? error : new Error('Network request failed.');
  } finally {
    window.clearTimeout(timeout);
  }
}
