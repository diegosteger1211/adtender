// Separate API client for the supplier portal (uses portal JWT)

const API_BASE = import.meta.env.VITE_API_URL || 'https://adtender-api.adesso-consulting.workers.dev'

function getPortalToken(): string | null {
  return localStorage.getItem('adtender_portal_token')
}

export function storePortalToken(token: string) {
  localStorage.setItem('adtender_portal_token', token)
}

export function clearPortalToken() {
  localStorage.removeItem('adtender_portal_token')
  localStorage.removeItem('adtender_portal_ps_id')
}

export function getPortalPsId(): string | null {
  return localStorage.getItem('adtender_portal_ps_id')
}

export function storePortalPsId(psId: string) {
  localStorage.setItem('adtender_portal_ps_id', psId)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getPortalToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || 'Request failed')
    ;(err as Error & { code?: string }).code = (data as { code?: string }).code
    throw err
  }
  return data as T
}

export const portalApi = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
}
