import { db, ensureSchema, send } from './_lib/db.js'

export default async function handler(req, res) {
  let database = 'not configured'
  try {
    await ensureSchema()
    await db()`SELECT 1`
    database = 'ok'
  } catch (e) {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) database = 'error'
  }
  send(res, database === 'ok' ? 200 : 503, { ok: database === 'ok', database, adminKey: Boolean(process.env.ADMIN_KEY) })
}
