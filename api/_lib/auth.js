import { createHash, timingSafeEqual } from 'node:crypto'
import { HttpError } from './db.js'

const digest = v => createHash('sha256').update(String(v)).digest()

// Admin endpoints accept "Authorization: Bearer <ADMIN_KEY>".
export function requireAdmin(req) {
  const key = process.env.ADMIN_KEY
  if (!key) throw new HttpError(503, 'ADMIN_KEY is not set on the server.')
  const got = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!got || !timingSafeEqual(digest(got), digest(key))) throw new HttpError(401, 'Wrong admin key.')
}

export function ipHash(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
  return createHash('sha256').update(ip + '|' + (process.env.ADMIN_KEY || 'wellora')).digest('hex').slice(0, 32)
}
