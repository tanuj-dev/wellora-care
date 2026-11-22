import { HttpError, db, ensureSchema } from './db.js'
import { ensureAdminSchema } from './users.js'

// ---------------------------------------------------------------------------
// CRM model (BRD-CRM-001, MVP): lead stages, ownership, first-response SLA,
// activities, follow-up tasks, de-duplication by mobile number and auto-routing.
// ---------------------------------------------------------------------------

export const STAGES = ['new', 'contacted', 'qualified', 'assessment', 'quote', 'negotiation', 'won', 'lost', 'nurture', 'disqualified']
export const CLOSED = ['won', 'lost', 'disqualified', 'merged'] // 'merged' = a repeat enquiry folded into an open lead
export const PARKED = [...CLOSED, 'nurture'] // not counted as an open lead

export const LOST_REASONS = {
  price: 'Price', competitor: 'Chose a competitor', family: 'Family or own attendant', admitted: 'Patient admitted',
  deceased: 'Patient passed away', unserviceable: 'Not serviceable', no_response: 'No response', other: 'Other',
}
export const DISQUALIFY_REASONS = {
  spam: 'Spam', wrong_number: 'Wrong number', job_seeker: 'Job seeker', unserviceable: 'Not serviceable', test: 'Test entry', other: 'Other',
}
export const ACTIVITY_TYPES = ['call', 'whatsapp', 'email', 'meeting', 'note']
export const CALL_OUTCOMES = ['connected', 'no_answer', 'busy', 'wrong_number', 'callback_requested']

// Form types that are not sales enquiries: no routing, SLA or de-duplication.
export const NON_SALES = ['job-application', 'unserviceable']

// The old `status` column is kept in step so older admin builds still read sensibly.
const LEGACY_STATUS = {
  new: 'new', contacted: 'contacted', qualified: 'contacted', assessment: 'scheduled', quote: 'scheduled', negotiation: 'scheduled',
  won: 'closed', lost: 'closed', nurture: 'closed', disqualified: 'spam', merged: 'closed',
}
export const legacyStatus = stage => LEGACY_STATUS[stage] || 'new'

// What each role may do. scope: which leads are visible ('all', 'city' = the user's cities,
// 'own' = owned by the user plus the unassigned queue in their cities).
export const PERMS = {
  admin: { scope: 'all', edit: 'all', assign: true, export: true, files: true, team: true },
  staff: { scope: 'all', edit: 'all', assign: true, export: true, files: true, team: true },
  city_head: { scope: 'city', edit: 'all', assign: true, export: true, files: true, team: true },
  team_lead: { scope: 'city', edit: 'all', assign: true, export: true, files: true, team: true },
  counsellor: { scope: 'own', edit: 'own', assign: false, export: false, files: true, team: false },
  viewer: { scope: 'all', edit: 'none', assign: false, export: true, files: false, team: true },
}
export const OWNER_ROLES = ['counsellor', 'team_lead', 'city_head', 'staff', 'admin']

export const perms = user => PERMS[user?.role] || PERMS.viewer
export const scopeArgs = user => ({ scope: perms(user).scope, uid: user?.id ?? null, cities: (user?.cities || []).map(normCity) })
export const normCity = c => String(c || '').trim().toLowerCase()

export function canEdit(user, lead) {
  const p = perms(user)
  if (p.edit === 'all') return true
  if (p.edit === 'own') return lead.owner_id != null && String(lead.owner_id) === String(user.id)
  return false
}
export function requireEdit(user, lead) {
  if (!canEdit(user, lead)) throw new HttpError(403, lead.owner_id == null && perms(user).edit === 'own'
    ? 'Take this lead first, then you can work on it.' : 'Your role does not allow changes to this lead.')
}

let ready = null
export function ensureCrmSchema() {
  if (ready) return ready
  ready = (async () => {
    await ensureSchema()
    await ensureAdminSchema()
    const s = db()
    await s`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_assigned_at TIMESTAMPTZ`
    await s`ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS stage TEXT,
      ADD COLUMN IF NOT EXISTS owner_id BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS contact_key TEXT,
      ADD COLUMN IF NOT EXISTS duplicate_of BIGINT REFERENCES leads(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS lost_reason TEXT,
      ADD COLUMN IF NOT EXISTS lost_note TEXT,
      ADD COLUMN IF NOT EXISTS stage_changed_at TIMESTAMPTZ`
    // One-time backfill for leads captured before the CRM existed (no SLA is applied to them).
    await s`UPDATE leads SET
        stage = CASE status WHEN 'scheduled' THEN 'assessment' WHEN 'closed' THEN 'won' WHEN 'spam' THEN 'disqualified' WHEN 'contacted' THEN 'contacted' ELSE 'new' END,
        lost_reason = CASE WHEN status = 'spam' THEN 'spam' END,
        first_contact_at = CASE WHEN status <> 'new' THEN updated_at END,
        stage_changed_at = updated_at,
        contact_key = NULLIF(right(regexp_replace(COALESCE(CASE WHEN kind = 'referral' THEN data->>'fmobile' END, mobile, ''), '[^0-9]', '', 'g'), 10), '')
      WHERE stage IS NULL`
    await s`CREATE INDEX IF NOT EXISTS leads_owner_stage_idx ON leads (owner_id, stage)`
    await s`CREATE INDEX IF NOT EXISTS leads_contact_idx ON leads (contact_key)`
    await s`CREATE INDEX IF NOT EXISTS leads_dup_idx ON leads (duplicate_of)`
    await s`CREATE TABLE IF NOT EXISTS lead_activities (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      user_id BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      outcome TEXT,
      body TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
    await s`CREATE INDEX IF NOT EXISTS lead_activities_lead_idx ON lead_activities (lead_id, created_at DESC)`
    await s`CREATE TABLE IF NOT EXISTS lead_tasks (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      owner_id BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      due_at TIMESTAMPTZ NOT NULL,
      done_at TIMESTAMPTZ,
      done_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
      created_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
    await s`CREATE INDEX IF NOT EXISTS lead_tasks_owner_idx ON lead_tasks (owner_id, done_at, due_at)`
    await s`CREATE INDEX IF NOT EXISTS lead_tasks_lead_idx ON lead_tasks (lead_id)`
    // Visibility rule used by every CRM query, so it lives in one place.
    try {
      await s`CREATE OR REPLACE FUNCTION crm_visible(l_owner BIGINT, l_city TEXT, scope TEXT, uid BIGINT, cities TEXT[])
        RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
          SELECT scope = 'all'
            OR (scope = 'city' AND (cardinality(cities) = 0 OR l_city IS NULL OR lower(btrim(l_city)) = ANY(cities)))
            OR (scope = 'own' AND (l_owner = uid OR (l_owner IS NULL
                  AND (cardinality(cities) = 0 OR l_city IS NULL OR lower(btrim(l_city)) = ANY(cities)))))
        $$`
    } catch (e) {
      // Two cold starts racing on CREATE OR REPLACE: the other one won, which is fine.
      if (!/concurrently|already exists/i.test(String(e.message))) throw e
    }
  })().catch(e => { ready = null; throw e })
  return ready
}

// ---- First-response SLA (BRD section 8). Business hours 08:00-21:00 IST, seven days a week.
const MIN = 60000
const IST = 330 * MIN
export function slaDue(kind, priority, at = new Date()) {
  if (NON_SALES.includes(kind)) return null
  const ist = new Date(at.getTime() + IST)
  const hour = ist.getUTCHours() + ist.getUTCMinutes() / 60
  const inHours = hour >= 8 && hour < 21
  if (priority && priority !== 'Normal') return new Date(at.getTime() + (inHours ? 15 : 30) * MIN)
  const base = kind === 'referral' ? 30 : kind === 'partnership' ? 240 : 15
  if (inHours) return new Date(at.getTime() + base * MIN)
  const open = new Date(ist)
  open.setUTCHours(8, 0, 0, 0)
  if (hour >= 21) open.setUTCDate(open.getUTCDate() + 1)
  return new Date(open.getTime() - IST + base * MIN)
}

export const contactKeyFor = (kind, data) =>
  String((kind === 'referral' ? data.fmobile : data.mobile) || '').replace(/\D/g, '').slice(-10) || null

export async function logActivity(sql, leadId, userId, type, body, outcome = null) {
  await sql`INSERT INTO lead_activities (lead_id, user_id, type, outcome, body)
            VALUES (${leadId}, ${userId ?? null}, ${type}, ${outcome}, ${body ? String(body).slice(0, 4000) : null})`
}

// Least-loaded active counsellor covering the city; city specialists before generalists.
export async function pickOwner(sql, city) {
  const c = normCity(city) || null
  const rows = await sql`
    SELECT u.id, u.name, u.email FROM admin_users u
    WHERE u.active AND u.role = 'counsellor'
      AND (cardinality(u.cities) = 0 OR ${c}::text IS NULL OR ${c}::text = ANY(u.cities))
    ORDER BY (${c}::text IS NOT NULL AND cardinality(u.cities) > 0) DESC,
      (SELECT count(*) FROM leads l WHERE l.owner_id = u.id AND l.stage <> ALL(${PARKED}::text[])) ASC,
      u.last_assigned_at ASC NULLS FIRST, u.id
    LIMIT 1`
  return rows[0] || null
}

export async function assign(sql, leadId, owner, byUser, note) {
  await sql`UPDATE leads SET owner_id = ${owner?.id ?? null}, assigned_at = now(), updated_at = now() WHERE id = ${leadId}`
  if (owner) await sql`UPDATE admin_users SET last_assigned_at = now() WHERE id = ${owner.id}`
  await logActivity(sql, leadId, byUser?.id, 'system', note)
}

// Before a website lead is stored: find an open lead from the same number to attach it to.
export async function findOpenLead(sql, kind, contactKey) {
  if (!contactKey || NON_SALES.includes(kind)) return null
  const rows = await sql`
    SELECT id, ref, priority, stage, owner_id FROM leads
    WHERE contact_key = ${contactKey} AND duplicate_of IS NULL AND stage <> ALL(${CLOSED}::text[])
      AND kind <> ALL(${NON_SALES}::text[])
    ORDER BY created_at DESC LIMIT 1`
  return rows[0] || null
}

const label = k => k.replace(/-/g, ' ')

// After a website lead is stored: fold repeats into the open lead, or route the new one.
export async function afterCapture(sql, row, { kind, priority, city, contactKey, existing }) {
  if (existing) {
    await logActivity(sql, existing.id, null, 'system', `New ${label(kind)} enquiry ${row.ref} from the same number was attached to this lead.`)
    const urgent = priority !== 'Normal' && existing.priority === 'Normal'
    if (existing.stage === 'nurture') {
      await sql`UPDATE leads SET stage = 'new', status = 'new', first_contact_at = NULL, stage_changed_at = now(),
                  sla_due_at = ${slaDue(kind, priority)}, updated_at = now() WHERE id = ${existing.id}`
      await logActivity(sql, existing.id, null, 'system', 'The customer came back while in Nurture. Stage moved to New.')
    }
    if (urgent) await sql`UPDATE leads SET priority = ${priority}, updated_at = now() WHERE id = ${existing.id}`
    return
  }
  if (NON_SALES.includes(kind)) return
  if (contactKey) {
    const [prev] = await sql`SELECT ref FROM leads WHERE contact_key = ${contactKey} AND id <> ${row.id} AND stage = 'won' ORDER BY created_at DESC LIMIT 1`
    if (prev) await logActivity(sql, row.id, null, 'system', `Returning customer: previously converted on ${prev.ref}.`)
  }
  const owner = await pickOwner(sql, city)
  if (owner) await assign(sql, row.id, owner, null, `Auto-assigned to ${owner.name || owner.email}${city ? ` (${city})` : ''}.`)
  else await logActivity(sql, row.id, null, 'system', 'No counsellor is available for this city. The lead is waiting in the unassigned queue.')
}

// Loads one lead the user is allowed to see, or throws 404.
export async function visibleLead(sql, user, { id, ref }) {
  const { scope, uid, cities } = scopeArgs(user)
  const rows = await sql`
    SELECT l.* FROM leads l
    WHERE (l.id = ${id ? Number(id) : null} OR l.ref = ${ref || null})
      AND crm_visible(l.owner_id, l.city, ${scope}, ${uid}, ${cities}::text[])`
  if (!rows[0]) throw new HttpError(404, 'Lead not found.')
  return rows[0]
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { throw new HttpError(400, 'Invalid JSON.') }
}

export function parseDate(v, what = 'date') {
  const d = new Date(v)
  if (!v || Number.isNaN(d.getTime())) throw new HttpError(422, `Enter a valid ${what}.`)
  return d
}
