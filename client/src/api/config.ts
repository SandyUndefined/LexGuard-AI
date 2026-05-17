const rawApiUrl = import.meta.env.VITE_API_URL?.trim() ?? '';

export const API_ORIGIN = rawApiUrl.replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
}
