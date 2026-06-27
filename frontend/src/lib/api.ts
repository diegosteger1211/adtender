// Typed API client

const API_BASE = import.meta.env.VITE_API_URL || 'https://adtender-api.steger.workers.dev'

function getToken(): string | null {
  return localStorage.getItem('adtender_token')
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const data = await res.json()

  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || 'Request failed')
    ;(err as Error & { code?: string; status?: number }).code = (data as { code?: string }).code
    ;(err as Error & { status?: number }).status = res.status
    throw err
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// Store token after login
export function storeToken(token: string) {
  localStorage.setItem('adtender_token', token)
}

export function clearToken() {
  localStorage.removeItem('adtender_token')
}
