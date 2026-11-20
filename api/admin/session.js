import { HttpError, db, fail, send } from '../_lib/db.js'
import { bearer, ipHash, requireAdmin } from '../_lib/auth.js'
import { checkNewPassword, createSession, ensureAdminSchema, hashPassword, normEmail, sha256, verifyPassword } from '../_lib/users.js'

const MAX_FAILS = 8 // failed sign-ins allowed per IP per 15 minutes
const DUMMY_HASH = 'scrypt$' + '0'.repeat(32) + '$' + '0'.repeat(128) // keeps timing equal for unknown emails

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { throw new HttpError(400, 'Invalid JSON.') }
}

// POST   { email, password }               sign in, returns { token, user }
// GET                                      the signed-in user
// PATCH  { currentPassword, newPassword }  change own password (ends other sessions)
// DELETE                                   sign out
export default async function handler(req, res) {
  try {
    await ensureAdminSchema()
    const sql = db()

    if (req.method === 'POST') {
      const { email, password } = await readJson(req)
      const ip = ipHash(req)
      const [{ n }] = await sql`SELECT count(*)::int AS n FROM admin_login_attempts WHERE ip_hash = ${ip} AND created_at > now() - interval '15 minutes'`
      if (n >= MAX_FAILS) throw new HttpError(429, 'Too many sign-in attempts. Wait 15 minutes and try again.')
      const e = normEmail(email)
      const rows = e ? await sql`SELECT id, email, name, password_hash FROM admin_users WHERE email = ${e} AND active` : []
      const ok = await verifyPassword(String(password || ''), rows[0]?.password_hash || DUMMY_HASH)
      if (!rows.length || !ok) {
        await sql`INSERT INTO admin_login_attempts (ip_hash, email) VALUES (${ip}, ${e.slice(0, 200)})`
        throw new HttpError(401, 'Wrong email or password.')
      }
      const u = rows[0]
      await sql`DELETE FROM admin_login_attempts WHERE ip_hash = ${ip} OR created_at < now() - interval '1 day'`
      await sql`DELETE FROM admin_sessions WHERE expires_at < now()`
      await sql`UPDATE admin_users SET last_login_at = now() WHERE id = ${u.id}`
      const token = await createSession(u.id)
      return send(res, 200, { ok: true, token, user: { id: u.id, email: u.email, name: u.name } })
    }

    if (req.method === 'GET') {
      return send(res, 200, { ok: true, user: await requireAdmin(req) })
    }

    if (req.method === 'PATCH') {
      const user = await requireAdmin(req)
      if (!user.id) throw new HttpError(400, 'Sign in with your email and password to change a password.')
      const { currentPassword, newPassword } = await readJson(req)
      const [row] = await sql`SELECT password_hash FROM admin_users WHERE id = ${user.id}`
      if (!(await verifyPassword(String(currentPassword || ''), row?.password_hash))) throw new HttpError(403, 'Your current password is not right.')
      checkNewPassword(newPassword)
      await sql`UPDATE admin_users SET password_hash = ${await hashPassword(newPassword)} WHERE id = ${user.id}`
      await sql`DELETE FROM admin_sessions WHERE user_id = ${user.id} AND token_hash <> ${sha256(bearer(req))}`
      return send(res, 200, { ok: true })
    }

    if (req.method === 'DELETE') {
      const t = bearer(req)
      if (t.startsWith('ws_')) await sql`DELETE FROM admin_sessions WHERE token_hash = ${sha256(t)}`
      return send(res, 200, { ok: true })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    throw new HttpError(405, 'Method not allowed.')
  } catch (e) {
    fail(res, e)
  }
}
