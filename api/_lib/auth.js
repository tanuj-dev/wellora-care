import { createHash, timingSafeEqual } from 'node:crypto'
import { HttpError } from './db.js'
import { ensureAdminSchema, userForToken } from './users.js'

const digest = v => createHash('sha256').update(String(v)).digest()

export const bearer = req => String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()

// Admin endpoints accept "Authorization: Bearer <token>". The token is either a session
// token from /api/admin/session (an admin user in the database) or the ADMIN_KEY.
// Resolves to the signed-in user, or { id: null, name: 'Admin key' } for the key.
export async function requireAdmin(req) {
  const got = bearer(req)
  if (!got) throw new HttpError(401, 'Sign in to continue.')
  if (got.startsWith('ws_')) {
    await ensureAdminSchema()
    const user = await userForToken(got)
    if (!user) throw new HttpError(401, 'Your session has ended. Sign in again.')
    return user
  }
  const key = process.env.ADMIN_KEY
  if (key && timingSafeEqual(digest(got), digest(key))) return { id: null, email: null, name: 'Admin key', role: 'admin', mustChangePassword: false }
  throw new HttpError(401, 'Wrong admin key.')
}

export function ipHash(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
  return createHash('sha256').update(ip + '|' + (process.env.ADMIN_KEY || 'wellora')).digest('hex').slice(0, 32)
}
