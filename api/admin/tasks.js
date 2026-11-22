import { HttpError, db, fail, send } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { ensureCrmSchema, parseDate, perms, readJson, requireEdit, scopeArgs, visibleLead } from '../_lib/crm.js'

// Follow-up tasks (BRD CRM-FR-017/018).
// GET   ?view=mine|team        open tasks, oldest due first ("team" = every task on leads the user can see)
// POST  { leadId, title, dueAt, ownerId? }
// PATCH { id, done: true|false }
export default async function handler(req, res) {
  try {
    const user = await requireAdmin(req)
    await ensureCrmSchema()
    const sql = db()
    const { scope, uid, cities } = scopeArgs(user)

    if (req.method === 'GET') {
      const team = new URL(req.url, 'http://x').searchParams.get('view') === 'team' && perms(user).team
      const tasks = await sql`
        SELECT t.id, t.title, t.due_at, t.owner_id, u.name AS owner_name, u.email AS owner_email,
          l.id AS lead_id, l.ref, l.name AS lead_name, l.mobile, l.stage, l.kind, l.priority
        FROM lead_tasks t JOIN leads l ON l.id = t.lead_id LEFT JOIN admin_users u ON u.id = t.owner_id
        WHERE t.done_at IS NULL
          AND crm_visible(l.owner_id, l.city, ${scope}, ${uid}, ${cities}::text[])
          AND (${team}::boolean OR t.owner_id = ${uid})
        ORDER BY t.due_at LIMIT 500`
      return send(res, 200, { ok: true, tasks, team })
    }

    if (req.method === 'POST') {
      const b = await readJson(req)
      const lead = await visibleLead(sql, user, { id: b.leadId })
      requireEdit(user, lead)
      const title = String(b.title || '').trim().slice(0, 200)
      if (!title) throw new HttpError(422, 'Say what needs to be done.')
      const due = parseDate(b.dueAt, 'due date')
      let owner = lead.owner_id ?? user.id
      if (b.ownerId != null && perms(user).assign) owner = Number(b.ownerId)
      const [task] = await sql`INSERT INTO lead_tasks (lead_id, owner_id, title, due_at, created_by)
                               VALUES (${lead.id}, ${owner}, ${title}, ${due}, ${user.id}) RETURNING id`
      return send(res, 201, { ok: true, id: task.id })
    }

    if (req.method === 'PATCH') {
      const b = await readJson(req)
      const [task] = await sql`SELECT id, lead_id, owner_id FROM lead_tasks WHERE id = ${Number(b.id)}`
      if (!task) throw new HttpError(404, 'Task not found.')
      const lead = await visibleLead(sql, user, { id: task.lead_id })
      if (String(task.owner_id) !== String(user.id)) requireEdit(user, lead)
      const done = b.done !== false
      await sql`UPDATE lead_tasks SET done_at = ${done ? new Date() : null}, done_by = ${done ? user.id : null} WHERE id = ${task.id}`
      return send(res, 200, { ok: true })
    }

    res.setHeader('Allow', 'GET, POST, PATCH')
    throw new HttpError(405, 'Method not allowed.')
  } catch (e) {
    fail(res, e)
  }
}
