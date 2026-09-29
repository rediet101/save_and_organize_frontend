// Thin client for the FastAPI backend (multilingual-save-organize-app/backend).
// Endpoints: GET /health, POST /extract.

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, linkFailure = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    // Set when the backend answers with a LinkFailureDetail: { reason, platform, message }.
    this.linkFailure = linkFailure
  }
}

export async function checkHealth(signal) {
  const res = await fetch(`${API_BASE}/health`, { signal })
  if (!res.ok) throw new ApiError(`Health check failed (${res.status})`, { status: res.status })
  return res.json()
}

/**
 * @param {{
 *   raw_text?: string | null,
 *   image_base64?: string | null,
 *   image_mime_type?: string | null,
 *   source_platform: string,
 *   source_url?: string | null,
 * }} payload ExtractionRequest
 * @returns {Promise<{ items: object[], model_used: string, processing_ms: number }>}
 */
export async function extract(payload) {
  let res
  try {
    res = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ApiError(`Can't reach the backend at ${API_BASE}. It may be waking up — try again in a moment.`)
  }

  const data = await res.json().catch(() => null)
  if (res.ok && data) return data

  const detail = data?.detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail) && 'reason' in detail) {
    throw new ApiError(detail.message, { status: res.status, linkFailure: detail })
  }
  if (Array.isArray(detail)) {
    // FastAPI/Pydantic validation errors.
    throw new ApiError(detail.map((d) => d.msg).join('; '), { status: res.status })
  }
  if (typeof detail === 'string') {
    throw new ApiError(detail, { status: res.status })
  }
  if (res.status >= 500) {
    throw new ApiError(
      `The backend hit an error (${res.status}). Check that GEMINI_API_KEY is set in backend/.env and look at the server logs.`,
      { status: res.status },
    )
  }
  throw new ApiError(`Request failed (${res.status})`, { status: res.status })
}

export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
