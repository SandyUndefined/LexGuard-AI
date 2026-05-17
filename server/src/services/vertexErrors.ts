import { config } from '../config';
import { ApiError } from '../errors';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function isVertexModelUnavailableError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    (normalized.includes('publisher model') &&
      (normalized.includes('not found') || normalized.includes('does not have access'))) ||
    (normalized.includes('models/') && normalized.includes('not found')) ||
    normalized.includes('"status":"not_found"') ||
    normalized.includes('status: 404')
  );
}

export function toVertexApiError(error: unknown): ApiError {
  const message = getErrorMessage(error);

  if (isVertexModelUnavailableError(message)) {
    return new ApiError(
      502,
      `Vertex AI model "${config.vertexAI.model}" is not available for project "${config.gcp.project || 'unknown'}" in location "${config.vertexAI.location}". Set VERTEX_AI_MODEL=gemini-2.5-flash, then redeploy or update the Cloud Run service.`,
    );
  }

  return new ApiError(
    502,
    'Vertex AI analysis failed. Check that the Vertex AI API is enabled, billing is active, and the Cloud Run service account has Vertex AI permissions.',
  );
}
