import { HttpError, db, fail, send } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import {
  CLOSED, DISQUALIFY_REASONS, LOST_REASONS, OWNER_ROLES, PARKED, STAGES, assign, ensureCrmSchema, legacyStatus,
  logActivity, parseDate, perms, readJson, requireEdit, scopeArgs, visibleLead,
} from '../_lib/crm.js'

// GET   ?stage=&owner=me|none|<id>&kind=&q=&sla=breached   leads the user can see (repeat enquiries folded in)
// PATCH { id, stage?, reason?, reasonNote?, followUpAt?, ownerId?, notes? }
export default async function handler(req, res) {
  try {
    const user = await requireAdmin(req)
    await ensureCrmSchema()
    const sql = db()
    const { scope, uid, cities } = scopeArgs(user)

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://x')
      const p = k => (url.searchParams.get(k) || '').trim()
      const kind = p('kind'), stage = p('stage'), sla = p('sla'), q = p('q')
      const owner = p('owner')
      const ownerId = owner === 'me' ? String(uid ?? '') : /^\d+$/.test(owner) ? owner : ''
      const like = '%' + q.replace(/[%_\\]/g, m => '\\' + m) + '%'
      const leads = await sql`
        SELECT l.id, l.ref, l.kind, l.priority, l.stage, l.name, l.mobile, l.service, l.city, l.data, l.notes, l.page,
          l.created_at, l.owner_id, l.assigned_at, l.first_contact_at, l.sla_due_at, l.lost_reason, l.stage_changed_at,
          o.name AS owner_name, o.email AS owner_email,
          COALESCE((SELECT json_agg(json_build_object('id', f.id, 'field', f.field, 'filename', f.filename, 'mime', f.mime, 'size', f.size) ORDER BY f.id)
                    FROM lead_files f WHERE f.lead_id = l.id), '[]') AS files,
          (SELECT min(t.due_at) FROM lead_tasks t WHERE t.lead_id = l.id AND t.done_at IS NULL) AS next_task_at,
          (SELECT count(*)::int FROM leads d WHERE d.duplicate_of = l.id) AS repeat_count
        FROM leads l LEFT JOIN admin_users o ON o.id = l.owner_id
        WHERE crm_visible(l.owner_id, l.city, ${scope}, ${uid}, ${cities}::text[])
          AND l.duplicate_of IS NULL
          AND (${kind}::text = '' OR l.kind = ${kind}::text)
          AND (${stage}::text = '' OR (${stage}::text = 'open' AND l.stage <> ALL(${PARKED}::text[])) OR l.stage = ${stage}::text)
          AND (${owner}::text = '' OR (${owner}::text = 'none' AND l.owner_id IS NULL) OR l.owner_id::text = ${ownerId}::text)
          AND (${sla}::text <> 'breached' OR (l.first_contact_at IS NULL AND l.sla_due_at < now() AND l.stage <> ALL(${CLOSED}::text[])))
          AND (${q}::text = '' OR l.ref ILIKE ${like}::text OR l.name ILIKE ${like}::text OR l.mobile ILIKE ${like}::text OR l.data::text ILIKE ${like}::text)
        ORDER BY l.created_at DESC
        LIMIT 300`
      const counts = await sql`
        SELECT stage, count(*)::int AS n FROM leads l
        WHERE crm_visible(l.owner_id, l.city, ${scope}, ${uid}, ${cities}::text[]) AND l.duplicate_of IS NULL
        GROUP BY stage`
      return send(res, 200, { ok: true, leads, counts })
    }

    if (req.method === 'PATCH') {
      const b = await readJson(req)
      let lead = await visibleLead(sql, user, { id: b.id })
      const p = perms(user)

      // Assignment: team leads and above assign anyone; a counsellor may only take an unassigned lead.
      if (b.ownerId !== undefined) {
        const target = b.ownerId === null ? null : Number(b.ownerId)
        const claiming = target != null && String(target) === String(user.id) && lead.owner_id == null && p.edit === 'own'
        if (!p.assign && !claiming) throw new HttpError(403, 'Your role cannot reassign leads.')
        let owner = null
        if (target != null) {
          ;[owner] = await sql`SELECT id, name, email FROM admin_users WHERE id = ${target} AND active AND role = ANY(${OWNER_ROLES}::text[])`
          if (!owner) throw new HttpError(422, 'That person cannot own leads.')
        }
        if (String(owner?.id ?? '') !== String(lead.owner_id ?? '')) {
          const by = user.name || user.email || 'Admin'
          const note = claiming ? `${by} took the lead.` : owner ? `Assigned to ${owner.name || owner.email} by ${by}.` : `Unassigned by ${by}.`
          const reason = typeof b.assignNote === 'string' && b.assignNote.trim() ? ` Reason: ${b.assignNote.trim().slice(0, 300)}` : ''
          await assign(sql, lead.id, owner, user, note + reason)
          lead = { ...lead, owner_id: owner?.id ?? null }
        }
      }

      if (b.stage !== undefined && b.stage !== lead.stage) {
        requireEdit(user, lead)
        const stage = String(b.stage)
        if (!STAGES.includes(stage)) throw new HttpError(422, 'Unknown stage.')
        let reason = null
        if (stage === 'lost' || stage === 'disqualified') {
          const list = stage === 'lost' ? LOST_REASONS : DISQUALIFY_REASONS
          if (!list[b.reason]) throw new HttpError(422, `Pick a reason before marking the lead ${stage === 'lost' ? 'Lost' : 'Disqualified'}.`)
          reason = b.reason
        }
        let followUp = null
        if (stage === 'nurture') followUp = parseDate(b.followUpAt, 're-engagement date')
        const note = typeof b.reasonNote === 'string' ? b.reasonNote.trim().slice(0, 1000) || null : null
        await sql`
          UPDATE leads SET stage = ${stage}, status = ${legacyStatus(stage)}, stage_changed_at = now(), updated_at = now(),
            lost_reason = ${reason}, lost_note = ${reason ? note : null},
            first_contact_at = CASE WHEN ${stage}::text <> 'new' THEN COALESCE(first_contact_at, now()) ELSE first_contact_at END
          WHERE id = ${lead.id}`
        const from = lead.stage, label = reason ? ` (${(stage === 'lost' ? LOST_REASONS : DISQUALIFY_REASONS)[reason]})` : ''
        await logActivity(sql, lead.id, user.id, 'stage', `${cap(from)} → ${cap(stage)}${label}${note ? `: ${note}` : ''}`)
        if (CLOSED.includes(stage)) {
          await sql`UPDATE lead_tasks SET done_at = now(), done_by = ${user.id} WHERE lead_id = ${lead.id} AND done_at IS NULL`
        }
        if (followUp) {
          await sql`INSERT INTO lead_tasks (lead_id, owner_id, title, due_at, created_by)
                    VALUES (${lead.id}, ${lead.owner_id ?? user.id}, 'Re-engage: check if they are ready now', ${followUp}, ${user.id})`
        }
      }

      if (typeof b.notes === 'string') {
        requireEdit(user, lead)
        await sql`UPDATE leads SET notes = ${b.notes.slice(0, 4000)}, updated_at = now() WHERE id = ${lead.id}`
      }
      return send(res, 200, { ok: true })
    }

    res.setHeader('Allow', 'GET, PATCH')
    throw new HttpError(405, 'Method not allowed.')
  } catch (e) {
    fail(res, e)
  }
}

const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
