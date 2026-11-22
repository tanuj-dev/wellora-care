import { HttpError, db, fail } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { ensureCrmSchema, perms, visibleLead } from '../_lib/crm.js'

export default async function handler(req, res) {
  try {
    const user = await requireAdmin(req)
    if (!perms(user).files) throw new HttpError(403, 'Your role does not allow downloading attachments.')
    if (req.method !== 'GET') throw new HttpError(405, 'Use GET.')
    const id = Number(new URL(req.url, 'http://x').searchParams.get('id'))
    if (!id) throw new HttpError(400, 'id is required.')
    await ensureCrmSchema()
    const sql = db()
    const rows = await sql`SELECT lead_id, filename, mime, content_b64 FROM lead_files WHERE id = ${id}`
    if (!rows.length) throw new HttpError(404, 'File not found.')
    await visibleLead(sql, user, { id: rows[0].lead_id }) // only files of leads this user can see
    const f = rows[0]
    res.statusCode = 200
    res.setHeader('Content-Type', f.mime)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(f.filename)}"`)
    res.setHeader('Cache-Control', 'private, no-store')
    res.end(Buffer.from(f.content_b64, 'base64'))
  } catch (e) {
    fail(res, e)
  }
}
