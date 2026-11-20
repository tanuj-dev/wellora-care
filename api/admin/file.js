import { HttpError, db, ensureSchema, fail } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { requireRole } from '../_lib/users.js'

export default async function handler(req, res) {
  try {
    requireRole(await requireAdmin(req), 'admin', 'staff')
    if (req.method !== 'GET') throw new HttpError(405, 'Use GET.')
    const id = Number(new URL(req.url, 'http://x').searchParams.get('id'))
    if (!id) throw new HttpError(400, 'id is required.')
    await ensureSchema()
    const rows = await db()`SELECT filename, mime, content_b64 FROM lead_files WHERE id = ${id}`
    if (!rows.length) throw new HttpError(404, 'File not found.')
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
