import { HttpError, db, fail, send } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { OWNER_ROLES, PARKED, ensureCrmSchema } from '../_lib/crm.js'

// GET: people who can own leads, with their cities and open-lead load (for the assign menu).
export default async function handler(req, res) {
  try {
    await requireAdmin(req)
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); throw new HttpError(405, 'Use GET.') }
    await ensureCrmSchema()
    const team = await db()`
      SELECT u.id, u.name, u.email, u.role, u.cities,
        (SELECT count(*)::int FROM leads l WHERE l.owner_id = u.id AND l.duplicate_of IS NULL AND l.stage <> ALL(${PARKED}::text[])) AS open_leads
      FROM admin_users u
      WHERE u.active AND u.role = ANY(${OWNER_ROLES}::text[])
      ORDER BY (u.role = 'counsellor') DESC, u.name NULLS LAST, u.email`
    return send(res, 200, { ok: true, team })
  } catch (e) {
    fail(res, e)
  }
}
