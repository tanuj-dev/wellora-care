import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { HttpError, db } from './db.js'

const scrypt = promisify(scryptCb)
const SESSION_DAYS = 7
export const sha256 = v => createHash('sha256').update(String(v)).digest('hex')

let ready = null
export function ensureAdminSchema() {
  if (ready) return ready
  ready = (async () => {
    const s = db()
    await s`CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login_at TIMESTAMPTZ
    )`
    await s`CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    )`
    await s`CREATE TABLE IF NOT EXISTS admin_login_attempts (
      id BIGSERIAL PRIMARY KEY,
      ip_hash TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
    await s`CREATE INDEX IF NOT EXISTS admin_login_attempts_idx ON admin_login_attempts (ip_hash, created_at)`
    // Roles (added after the first release): existing users without a role become admins.
    await s`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT`
    await s`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false`
    await s`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
    await s`UPDATE admin_users SET role = 'admin' WHERE role IS NULL`
  })().catch(e => { ready = null; throw e })
  return ready
}

// Stored format: scrypt$<salt hex>$<derived key hex>
export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scrypt(String(password), salt, 64)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

export async function verifyPassword(password, stored) {
  const [alg, saltHex, keyHex] = String(stored || '').split('$')
  if (alg !== 'scrypt' || !saltHex || !keyHex) return false
  const key = await scrypt(String(password), Buffer.from(saltHex, 'hex'), 64)
  const want = Buffer.from(keyHex, 'hex')
  return want.length === key.length && timingSafeEqual(key, want)
}

export const normEmail = e => String(e || '').trim().toLowerCase()

export function checkNewPassword(p) {
  p = String(p || '')
  if (p.length < 8) throw new HttpError(422, 'Use at least 8 characters for the password.')
  if (p.length > 200) throw new HttpError(422, 'That password is too long.')
}

export async function createSession(userId) {
  const token = 'ws_' + randomBytes(32).toString('base64url')
  await db()`INSERT INTO admin_sessions (token_hash, user_id, expires_at)
             VALUES (${sha256(token)}, ${userId}, now() + make_interval(days => ${SESSION_DAYS}))`
  return token
}

export async function userForToken(token) {
  const rows = await db()`
    SELECT u.id, u.email, u.name, u.role, u.must_change_password FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
    WHERE s.token_hash = ${sha256(token)} AND s.expires_at > now() AND u.active`
  return rows[0] ? publicUser(rows[0]) : null
}

// admin: everything, including users. staff: work leads. viewer: read-only, no attachments.
export const ROLES = ['admin', 'staff', 'viewer']

export const publicUser = u => ({ id: u.id, email: u.email, name: u.name, role: u.role || 'viewer', mustChangePassword: Boolean(u.must_change_password) })

export function requireRole(user, ...roles) {
  if (!roles.includes(user.role)) throw new HttpError(403, 'Your role does not allow this.')
}
