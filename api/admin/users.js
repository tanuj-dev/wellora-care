import { HttpError, db, fail, send } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { ROLES, checkNewPassword, ensureAdminSchema, hashPassword, normEmail, requireRole } from '../_lib/users.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { throw new HttpError(400, 'Invalid JSON.') }
}

const cleanName = n => (typeof n === 'string' ? n.trim().slice(0, 120) || null : undefined)
const checkRole = r => { if (!ROLES.includes(r)) throw new HttpError(422, 'Pick a role: admin, staff or viewer.') }

// There must always be at least one active admin who can sign in.
async function assertAdminRemains(sql, excludingId) {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM admin_users WHERE role = 'admin' AND active AND id <> ${excludingId}`
  if (!n) throw new HttpError(409, 'This is the last active admin. Make someone else an admin first.')
}

const COLUMNS = 'id, email, name, role, active, must_change_password, created_at, last_login_at'

// Admins only.
// GET                                              list users
// POST   { email, name, role, password }           add a user (they must change the password on first sign-in)
// PATCH  { id, name?, role?, active?, password? }  edit, enable/disable, or reset password
// DELETE { id }                                    remove a user
export default async function handler(req, res) {
  try {
    const me = await requireAdmin(req)
    requireRole(me, 'admin')
    await ensureAdminSchema()
    const sql = db()
    const cols = sql.unsafe(COLUMNS)

    if (req.method === 'GET') {
      const users = await sql`SELECT ${cols} FROM admin_users ORDER BY active DESC, created_at`
      return send(res, 200, { ok: true, users, me: me.id })
    }

    if (req.method === 'POST') {
      const b = await readJson(req)
      const email = normEmail(b.email)
      if (!EMAIL.test(email) || email.length > 200) throw new HttpError(422, 'Enter a valid email address.')
      checkRole(b.role)
      checkNewPassword(b.password)
      const [exists] = await sql`SELECT id FROM admin_users WHERE email = ${email}`
      if (exists) throw new HttpError(409, 'A user with this email already exists.')
      const [user] = await sql`
        INSERT INTO admin_users (email, name, role, password_hash, must_change_password)
        VALUES (${email}, ${cleanName(b.name) ?? null}, ${b.role}, ${await hashPassword(b.password)}, true)
        RETURNING ${cols}`
      return send(res, 201, { ok: true, user })
    }

    if (req.method === 'PATCH') {
      const b = await readJson(req)
      const id = Number(b.id)
      const [target] = await sql`SELECT id, role, active FROM admin_users WHERE id = ${id}`
      if (!target) throw new HttpError(404, 'User not found.')
      const self = id === Number(me.id)
      if (b.role !== undefined) checkRole(b.role)
      if (self && b.role !== undefined && b.role !== target.role) throw new HttpError(409, 'You cannot change your own role.')
      if (self && b.active === false) throw new HttpError(409, 'You cannot disable your own account.')
      const losingAdmin = target.role === 'admin' && target.active && ((b.role && b.role !== 'admin') || b.active === false)
      if (losingAdmin) await assertAdminRemains(sql, id)
      if (b.password !== undefined) checkNewPassword(b.password)
      const hash = b.password !== undefined ? await hashPassword(b.password) : null
      const name = cleanName(b.name)
      const [user] = await sql`
        UPDATE admin_users SET
          name = CASE WHEN ${name !== undefined} THEN ${name ?? null}::text ELSE name END,
          role = COALESCE(${b.role ?? null}::text, role),
          active = COALESCE(${typeof b.active === 'boolean' ? b.active : null}::boolean, active),
          password_hash = COALESCE(${hash}::text, password_hash),
          must_change_password = CASE WHEN ${hash !== null && !self} THEN true ELSE must_change_password END,
          updated_at = now()
        WHERE id = ${id}
        RETURNING ${cols}`
      // A disabled account or a reset password signs that user out everywhere.
      if (b.active === false || (hash && !self)) await sql`DELETE FROM admin_sessions WHERE user_id = ${id}`
      return send(res, 200, { ok: true, user })
    }

    if (req.method === 'DELETE') {
      const { id } = await readJson(req)
      const [target] = await sql`SELECT id, role, active FROM admin_users WHERE id = ${Number(id)}`
      if (!target) throw new HttpError(404, 'User not found.')
      if (Number(id) === Number(me.id)) throw new HttpError(409, 'You cannot remove your own account.')
      if (target.role === 'admin' && target.active) await assertAdminRemains(sql, target.id)
      await sql`DELETE FROM admin_users WHERE id = ${target.id}`
      return send(res, 200, { ok: true })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    throw new HttpError(405, 'Method not allowed.')
  } catch (e) {
    fail(res, e)
  }
}
