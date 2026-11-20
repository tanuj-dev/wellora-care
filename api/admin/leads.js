import { HttpError, db, ensureSchema, fail, send } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { requireRole } from '../_lib/users.js'

const STATUSES = ['new', 'contacted', 'scheduled', 'closed', 'spam']

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { throw new HttpError(400, 'Invalid JSON.') }
}

export default async function handler(req, res) {
  try {
    const user = await requireAdmin(req)
    await ensureSchema()
    const sql = db()

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://x')
      const kind = url.searchParams.get('kind') || ''
      const status = url.searchParams.get('status') || ''
      const q = (url.searchParams.get('q') || '').trim()
      const like = '%' + q.replace(/[%_\\]/g, m => '\\' + m) + '%'
      const leads = await sql`
        SELECT l.id, l.ref, l.kind, l.priority, l.status, l.name, l.mobile, l.service, l.city, l.data, l.notes, l.page, l.created_at,
          COALESCE((SELECT json_agg(json_build_object('id', f.id, 'field', f.field, 'filename', f.filename, 'mime', f.mime, 'size', f.size) ORDER BY f.id)
                    FROM lead_files f WHERE f.lead_id = l.id), '[]') AS files
        FROM leads l
        WHERE (${kind}::text = '' OR l.kind = ${kind}::text)
          AND (${status}::text = '' OR l.status = ${status}::text)
          AND (${q}::text = '' OR l.ref ILIKE ${like}::text OR l.name ILIKE ${like}::text OR l.mobile ILIKE ${like}::text OR l.data::text ILIKE ${like}::text)
        ORDER BY l.created_at DESC
        LIMIT 300`
      const counts = await sql`SELECT status, count(*)::int AS n FROM leads GROUP BY status`
      return send(res, 200, { ok: true, leads, counts })
    }

    if (req.method === 'PATCH') {
      requireRole(user, 'admin', 'staff')
      const { id, status, notes } = await readJson(req)
      if (!id) throw new HttpError(400, 'id is required.')
      if (status && !STATUSES.includes(status)) throw new HttpError(400, 'Unknown status.')
      const rows = await sql`
        UPDATE leads SET
          status = COALESCE(${status || null}::text, status),
          notes = COALESCE(${typeof notes === 'string' ? notes.slice(0, 4000) : null}::text, notes),
          updated_at = now()
        WHERE id = ${Number(id)}
        RETURNING id, status, notes`
      if (!rows.length) throw new HttpError(404, 'Lead not found.')
      return send(res, 200, { ok: true, lead: rows[0] })
    }

    res.setHeader('Allow', 'GET, PATCH')
    throw new HttpError(405, 'Method not allowed.')
  } catch (e) {
    fail(res, e)
  }
}
