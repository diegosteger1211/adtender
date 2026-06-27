import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import projectRoutes from './routes/projects'
import projectSupplierRoutes from './routes/project-suppliers'
import requirementRoutes from './routes/requirements'
import inviteRoutes from './routes/invite'
import portalRoutes from './routes/portal'
import supplierRoutes from './routes/suppliers'
import userRoutes from './routes/users'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  ENVIRONMENT: string
  CORS_ORIGIN: string
  APP_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

app.get('/api/health', async c => {
  // verify DB connectivity
  const dbOk = await c.env.DB.prepare('SELECT 1 as ok').first<{ ok: number }>().then(() => true).catch(() => false)
  return c.json({
    status: dbOk ? 'ok' : 'degraded',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
    db: dbOk ? 'connected' : 'error',
  })
})

app.route('/api/auth', authRoutes)
app.route('/api/projects', projectRoutes)
app.route('/api/projects', projectSupplierRoutes)
app.route('/api/projects', requirementRoutes)
app.route('/api/projects', inviteRoutes)
app.route('/api/portal', portalRoutes)
app.route('/api/suppliers', supplierRoutes)
app.route('/api/users', userRoutes)

app.notFound(c => c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404))

export default app
