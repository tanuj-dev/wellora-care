import { neon } from '@neondatabase/serverless'

let sql = null
let ready = null

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

export function db() {
  if (!sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (!url) throw new HttpError(503, 'The database is not configured yet.')
    sql = neon(url)
  }
  return sql
}

// Creates the tables on first use, so a fresh database needs no manual setup.
export function ensureSchema() {
  if (ready) return ready
  ready = (async () => {
    const s = db()
    await s`CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      ref TEXT UNIQUE NOT NULL,
      kind TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Normal',
      status TEXT NOT NULL DEFAULT 'new',
      name TEXT,
      mobile TEXT,
      service TEXT,
      city TEXT,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      notes TEXT,
      page TEXT,
      ip_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
    await s`CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC)`
    await s`CREATE INDEX IF NOT EXISTS leads_ip_idx ON leads (ip_hash, created_at)`
    await s`CREATE TABLE IF NOT EXISTS lead_files (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      field TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      content_b64 TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
    await s`CREATE INDEX IF NOT EXISTS lead_files_lead_idx ON lead_files (lead_id)`
  })().catch(e => { ready = null; throw e })
  return ready
}

export function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export function fail(res, e) {
  const status = e instanceof HttpError ? e.status : 500
  if (status === 500) console.error(e)
  send(res, status, { ok: false, error: status === 500 ? 'Something went wrong on our side. Please call us instead.' : e.message })
}
