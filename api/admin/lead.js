import { HttpError, db, fail, send } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import {
  ACTIVITY_TYPES, CALL_OUTCOMES, ensureCrmSchema, logActivity, parseDate, perms, readJson, requireEdit, visibleLead, assign,
} from '../_lib/crm.js'

// One lead's workspace (BRD 6.3).
// GET  ?ref=WC-XXXX   the lead, its timeline, tasks, repeat enquiries and earlier enquiries from the same number
// POST { id, type, outcome?, body?, followUp?: { title, dueAt } }   log a call, WhatsApp, email, meeting or note
export default async function handler(req, res) {
  try {
    const user = await requireAdmin(req)
    await ensureCrmSchema()
    const sql = db()

    if (req.method === 'GET') {
      const ref = new URL(req.url, 'http://x').searchParams.get('ref') || ''
      const base = await visibleLead(sql, user, { ref })
      const [lead] = await sql`
        SELECT l.*, o.name AS owner_name, o.email AS owner_email,
          COALESCE((SELECT json_agg(json_build_object('id', f.id, 'field', f.field, 'filename', f.filename, 'mime', f.mime, 'size', f.size) ORDER BY f.id)
                    FROM lead_files f WHERE f.lead_id = l.id), '[]') AS files
        FROM leads l LEFT JOIN admin_users o ON o.id = l.owner_id WHERE l.id = ${base.id}`
      delete lead.ip_hash
      const [activities, tasks, repeats, history] = await Promise.all([
        sql`SELECT a.id, a.type, a.outcome, a.body, a.created_at, u.name AS user_name, u.email AS user_email
            FROM lead_activities a LEFT JOIN admin_users u ON u.id = a.user_id
            WHERE a.lead_id = ${lead.id} ORDER BY a.created_at DESC, a.id DESC LIMIT 200`,
        sql`SELECT t.id, t.title, t.due_at, t.done_at, t.owner_id, u.name AS owner_name, u.email AS owner_email
            FROM lead_tasks t LEFT JOIN admin_users u ON u.id = t.owner_id
            WHERE t.lead_id = ${lead.id} ORDER BY t.done_at IS NOT NULL, t.due_at`,
        sql`SELECT id, ref, kind, data, created_at FROM leads WHERE duplicate_of = ${lead.id} ORDER BY created_at DESC`,
        lead.contact_key
          ? sql`SELECT id, ref, kind, stage, created_at FROM leads
                WHERE contact_key = ${lead.contact_key} AND id <> ${lead.id} AND duplicate_of IS DISTINCT FROM ${lead.id}
                ORDER BY created_at DESC LIMIT 20`
          : [],
      ])
      return send(res, 200, { ok: true, lead, activities, tasks, repeats, history })
    }

    if (req.method === 'POST') {
      const b = await readJson(req)
      let lead = await visibleLead(sql, user, { id: b.id })
      // A counsellor logging work on an unassigned lead takes it.
      if (lead.owner_id == null && perms(user).edit === 'own') {
        await assign(sql, lead.id, user, user, `${user.name || user.email} took the lead.`)
        lead = { ...lead, owner_id: user.id }
      }
      requireEdit(user, lead)

      const type = String(b.type || '')
      if (!ACTIVITY_TYPES.includes(type)) throw new HttpError(422, 'Pick what you did: call, WhatsApp, email, meeting or note.')
      const outcome = type === 'call' ? String(b.outcome || '') : null
      if (type === 'call' && !CALL_OUTCOMES.includes(outcome)) throw new HttpError(422, 'Pick the call outcome.')
      const body = typeof b.body === 'string' ? b.body.trim() : ''
      if (type === 'note' && !body) throw new HttpError(422, 'Write the note first.')
      let followUp = null
      if (b.followUp) {
        followUp = { title: String(b.followUp.title || '').trim().slice(0, 200) || 'Follow up', dueAt: parseDate(b.followUp.dueAt, 'follow-up date') }
      }

      await logActivity(sql, lead.id, user.id, type, body, outcome)
      // Any contact attempt stops the first-response clock; a real conversation moves New to Contacted.
      if (type !== 'note') {
        const spoke = type !== 'call' || outcome === 'connected' || outcome === 'callback_requested'
        await sql`
          UPDATE leads SET first_contact_at = COALESCE(first_contact_at, now()), updated_at = now(),
            stage = CASE WHEN stage = 'new' AND ${spoke}::boolean THEN 'contacted' ELSE stage END,
            status = CASE WHEN stage = 'new' AND ${spoke}::boolean THEN 'contacted' ELSE status END,
            stage_changed_at = CASE WHEN stage = 'new' AND ${spoke}::boolean THEN now() ELSE stage_changed_at END
          WHERE id = ${lead.id}`
        if (lead.stage === 'new' && spoke) await logActivity(sql, lead.id, user.id, 'stage', 'New → Contacted')
      }
      if (followUp) {
        await sql`INSERT INTO lead_tasks (lead_id, owner_id, title, due_at, created_by)
                  VALUES (${lead.id}, ${lead.owner_id ?? user.id}, ${followUp.title}, ${followUp.dueAt}, ${user.id})`
      }
      return send(res, 201, { ok: true })
    }

    res.setHeader('Allow', 'GET, POST')
    throw new HttpError(405, 'Method not allowed.')
  } catch (e) {
    fail(res, e)
  }
}
