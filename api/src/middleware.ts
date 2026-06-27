import { createMiddleware } from 'hono/factory'
import { verifyJwt, type JwtPayload } from './auth'

type Env = {
  Bindings: { JWT_SECRET: string }
  Variables: { user: JwtPayload }
}

export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const auth = c.req.header('Authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null

  if (!token) {
    return c.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED', status: 401 }, 401)
  }

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  const payload = await verifyJwt(token, secret)

  if (!payload) {
    return c.json({ error: 'Invalid or expired token', code: 'TOKEN_INVALID', status: 401 }, 401)
  }

  c.set('user', payload)
  await next()
})

export const requireRole = (...roles: string[]) =>
  createMiddleware<Env>(async (c, next) => {
    const user = c.get('user')
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
    }
    await next()
  })
