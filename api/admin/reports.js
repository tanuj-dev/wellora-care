import { HttpError, db, fail, send } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { CLOSED, NON_SALES, ensureCrmSchema, scopeArgs } from '../_lib/crm.js'

// GET ?days=30   CRM reports (BRD 6.10): funnel, first-response SLA, counsellor productivity,
// source and city performance, lost reasons. Only covers leads the user can see.
export default async function handler(req, res) {
  try {
    const user = await requireAdmin(req)
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); throw new HttpError(405, 'Use GET.') }
    await ensureCrmSchema()
    const sql = db()
    const { scope, uid, cities } = scopeArgs(user)
    const days = Math.min(365, Math.max(1, Number(new URL(req.url, 'http://x').searchParams.get('days')) || 30))

    // Every report runs over the same set: sales leads created in the window, repeats folded in.
    const args = [scope, uid, cities, NON_SALES, days]
    const q = text => sql.query(text, args)
    const W = `crm_visible(l.owner_id, l.city, $1, $2, $3::text[]) AND l.duplicate_of IS NULL
               AND l.kind <> ALL($4::text[]) AND l.created_at > now() - make_interval(days => $5::int)`

    const [funnel, sla, owners, sources, citiesRows, lost, daily] = await Promise.all([
      q(`SELECT l.stage, count(*)::int AS n FROM leads l WHERE ${W} GROUP BY l.stage`),
      q(`SELECT
           count(*) FILTER (WHERE l.sla_due_at IS NOT NULL)::int AS with_sla,
           count(*) FILTER (WHERE l.first_contact_at IS NOT NULL AND l.first_contact_at <= l.sla_due_at)::int AS met,
           count(*) FILTER (WHERE l.first_contact_at IS NOT NULL AND l.first_contact_at > l.sla_due_at)::int AS late,
           count(*) FILTER (WHERE l.first_contact_at IS NULL AND l.sla_due_at < now() AND l.stage <> ALL('{${CLOSED.join(',')}}'::text[]))::int AS breached_open,
           percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM l.first_contact_at - l.created_at) / 60)
             FILTER (WHERE l.first_contact_at IS NOT NULL AND l.sla_due_at IS NOT NULL) AS median_minutes
         FROM leads l WHERE ${W}`),
      q(`SELECT l.owner_id, COALESCE(u.name, u.email) AS owner, count(*)::int AS assigned,
           count(*) FILTER (WHERE l.first_contact_at IS NOT NULL)::int AS contacted,
           count(*) FILTER (WHERE l.stage = 'won')::int AS won,
           count(*) FILTER (WHERE l.stage = 'lost')::int AS lost,
           count(*) FILTER (WHERE l.sla_due_at IS NOT NULL)::int AS with_sla,
           count(*) FILTER (WHERE l.first_contact_at <= l.sla_due_at)::int AS sla_met,
           (SELECT count(*)::int FROM lead_tasks t WHERE t.owner_id = l.owner_id AND t.done_at IS NULL AND t.due_at < now()) AS overdue_tasks,
           (SELECT count(*)::int FROM lead_activities a WHERE a.user_id = l.owner_id AND a.type = 'call' AND a.created_at > now() - make_interval(days => $5::int)) AS calls
         FROM leads l LEFT JOIN admin_users u ON u.id = l.owner_id WHERE ${W}
         GROUP BY l.owner_id, u.name, u.email ORDER BY assigned DESC`),
      q(`SELECT l.kind, count(*)::int AS n, count(*) FILTER (WHERE l.stage = 'won')::int AS won,
           count(*) FILTER (WHERE l.stage = 'disqualified')::int AS disqualified
         FROM leads l WHERE ${W} GROUP BY l.kind ORDER BY n DESC`),
      q(`SELECT COALESCE(NULLIF(initcap(btrim(l.city)), ''), 'Not given') AS city, count(*)::int AS n,
           count(*) FILTER (WHERE l.stage = 'won')::int AS won
         FROM leads l WHERE ${W} GROUP BY 1 ORDER BY n DESC LIMIT 15`),
      q(`SELECT l.stage, l.lost_reason AS reason, count(*)::int AS n FROM leads l
         WHERE ${W} AND l.stage IN ('lost', 'disqualified') GROUP BY l.stage, l.lost_reason ORDER BY n DESC`),
      q(`SELECT to_char(date_trunc('day', l.created_at AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD') AS day, count(*)::int AS n,
           count(*) FILTER (WHERE l.stage = 'won')::int AS won
         FROM leads l WHERE ${W} GROUP BY 1 ORDER BY 1`),
    ])
    return send(res, 200, { ok: true, days, funnel, sla: sla[0], owners, sources, cities: citiesRows, lost, daily })
  } catch (e) {
    fail(res, e)
  }
}
