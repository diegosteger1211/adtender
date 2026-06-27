// JWT + PBKDF2 authentication — Web Crypto API (Workers compatible)

export type JwtPayload = {
  sub: string        // user id
  email: string
  name: string
  role: string
  tenantId: string
  iat: number
  exp: number
}

const JWT_HEADER = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '')

function b64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, ttlSeconds = 86400): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const full: JwtPayload = { ...payload, iat: now, exp: now + ttlSeconds }
  const header = JWT_HEADER
  const body = b64url(JSON.stringify(full))
  const data = `${header}.${body}`
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const sigB64 = b64url(String.fromCharCode(...new Uint8Array(sig)))
  return `${data}.${sigB64}`
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const [header, body, sig] = token.split('.')
    if (!header || !body || !sig) return null
    const key = await getKey(secret)
    const data = `${header}.${body}`
    const sigBytes = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data))
    if (!valid) return null
    const payload: JwtPayload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    keyMaterial,
    256
  )
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `pbkdf2:${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // demo shortcut — allows seeded users without hashing
  if (stored.startsWith('demo:')) return password === stored.slice(5)

  const [, saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)))
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    keyMaterial,
    256
  )
  const computed = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return computed === hashHex
}
