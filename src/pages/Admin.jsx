import { useCallback, useEffect, useState } from 'react'
import { usePageTitle } from '../utils'

const KINDS = {
  booking: 'Booking', enquiry: 'Enquiry', 'service-enquiry': 'Service callback', contact: 'Contact', 'custom-plan': 'Custom plan',
  counselling: 'Counselling', 'critical-care': 'Critical care', 'medicine-order': 'Medicine order', 'job-application': 'Job application',
  referral: 'Referral', partnership: 'Partnership', unserviceable: 'Area not served',
}
const STATUSES = ['new', 'contacted', 'scheduled', 'closed', 'spam']
const KEY = 'wellora-admin-key'
const HIDDEN = new Set(['consent', 'kind', 'page'])

const readKey = () => { try { return sessionStorage.getItem(KEY) || '' } catch { return '' } }
const writeKey = v => { try { v ? sessionStorage.setItem(KEY, v) : sessionStorage.removeItem(KEY) } catch { /* ignore */ } }
const when = iso => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const label = k => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())

async function api(path, key, opts = {}) {
  const res = await fetch(path, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + key } })
  if (opts.raw && res.ok) return res
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.ok) { const e = new Error(body.error || 'Request failed'); e.status = res.status; throw e }
  return body
}

function Login({ onKey, error }) {
  return (
    <section className="section"><div className="wrap narrow" style={{ maxWidth: 460 }}>
      <div className="form-card">
        <h3>Wellora Care admin</h3>
        <p className="muted">Enter the admin key to see bookings and enquiries.</p>
        {error && <div className="alert" role="alert"><p style={{ margin: 0 }}>{error}</p></div>}
        <form onSubmit={e => { e.preventDefault(); onKey(String(new FormData(e.currentTarget).get('key') || '').trim()) }}>
          <div className="field"><label htmlFor="admin-key">Admin key</label><input id="admin-key" name="key" type="password" autoComplete="current-password" required /></div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Sign in</button>
        </form>
      </div>
    </div></section>
  )
}

function LeadDetail({ lead, adminKey, onSaved }) {
  const [notes, setNotes] = useState(lead.notes || '')
  const [msg, setMsg] = useState('')
  const download = async f => {
    try {
      const res = await api(`/api/admin/file?id=${f.id}`, adminKey, { raw: true })
      const url = URL.createObjectURL(await res.blob())
      const a = Object.assign(document.createElement('a'), { href: url, download: f.filename })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (e) { setMsg(e.message) }
  }
  const save = async () => {
    try { await api('/api/admin/leads', adminKey, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lead.id, notes }) }); setMsg('Notes saved.'); onSaved() }
    catch (e) { setMsg(e.message) }
  }
  const entries = Object.entries(lead.data || {}).filter(([k]) => !HIDDEN.has(k))
  return (
    <div style={{ padding: '6px 0 18px' }}>
      <dl className="summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0 18px' }}>
        {entries.map(([k, v]) => <div key={k}><dt>{label(k)}</dt><dd style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{String(v)}</dd></div>)}
        <div><dt>Submitted from</dt><dd>{lead.page || '-'}</dd></div>
      </dl>
      {lead.files?.length > 0 && (
        <div style={{ marginBottom: 14 }}><div className="legend" style={{ marginBottom: 6 }}>Attachments</div>
          <div className="btn-row">{lead.files.map(f => <button key={f.id} className="btn btn-soft btn-sm" onClick={() => download(f)}>{f.filename} ({Math.ceil(f.size / 1024)} KB)</button>)}</div>
        </div>
      )}
      <div className="field"><label htmlFor={`notes-${lead.id}`}>Internal notes</label><textarea id={`notes-${lead.id}`} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Call outcome, caregiver assigned, follow-up date" /></div>
      <div className="btn-row">
        <button className="btn btn-primary btn-sm" onClick={save}>Save notes</button>
        {lead.mobile && <a className="btn btn-ghost btn-sm" href={`tel:${lead.mobile.replace(/[\s-]/g, '')}`}>Call {lead.mobile}</a>}
        {msg && <span className="hint">{msg}</span>}
      </div>
    </div>
  )
}

export default function Admin() {
  usePageTitle('Admin | Wellora Care')
  const [key, setKey] = useState(readKey)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ kind: '', status: '', q: '' })
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'; m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  const load = useCallback(async () => {
    if (!key) return
    setLoading(true)
    try {
      const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString()
      setData(await api('/api/admin/leads' + (qs ? '?' + qs : ''), key))
      setError('')
    } catch (e) {
      if (e.status === 401) { writeKey(''); setKey(''); setError('That admin key is not right.') }
      else setError(e.message)
    } finally { setLoading(false) }
  }, [key, filters])

  useEffect(() => { load() }, [load])

  const setStatus = async (lead, status) => {
    try {
      await api('/api/admin/leads', key, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lead.id, status }) })
      load()
    } catch (e) { setError(e.message) }
  }

  if (!key) return <Login error={error} onKey={k => { writeKey(k); setKey(k) }} />

  const counts = Object.fromEntries((data?.counts || []).map(c => [c.status, c.n]))
  return (
    <section className="section" style={{ paddingTop: 36 }}><div className="wrap">
      <div className="section-head">
        <div><h1 style={{ fontSize: '2rem' }}>Leads and bookings</h1>
          <p className="muted" style={{ margin: 0 }}>{STATUSES.map(s => `${counts[s] || 0} ${s}`).join(' · ')}</p></div>
        <div className="btn-row">
          <button className="btn btn-soft btn-sm" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { writeKey(''); setKey(''); setData(null) }}>Sign out</button>
        </div>
      </div>
      {error && <div className="alert" role="alert"><p style={{ margin: 0 }}>{error}</p></div>}
      <div className="grid3" style={{ marginBottom: 8 }}>
        <div className="field"><label htmlFor="f-kind">Type</label>
          <select id="f-kind" value={filters.kind} onChange={e => setFilters(f => ({ ...f, kind: e.target.value }))}>
            <option value="">All types</option>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="field"><label htmlFor="f-status">Status</label>
          <select id="f-status" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select></div>
        <form className="field" onSubmit={e => { e.preventDefault(); setFilters(f => ({ ...f, q: String(new FormData(e.currentTarget).get('q') || '') })) }}>
          <label htmlFor="f-q">Search</label>
          <input id="f-q" name="q" type="search" defaultValue={filters.q} placeholder="Name, mobile, reference" />
        </form>
      </div>
      {!data ? <div className="empty">Loading…</div> : !data.leads.length ? <div className="empty">No leads yet. Submissions from the website appear here.</div> : (
        <div className="tool" style={{ padding: '6px 20px' }}>
          {data.leads.map(l => (
            <div key={l.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="row-item" style={{ borderBottom: 0, flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setOpen(open === l.id ? null : l.id)}>
                <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                  <b>{l.name || 'No name'}</b>
                  <span className={'tag' + (l.priority === 'Normal' ? ' rx' : '')} style={l.priority === 'Normal' ? {} : { background: 'var(--danger-bg)', color: 'var(--danger)' }}>{KINDS[l.kind] || l.kind}{l.priority !== 'Normal' ? ` · ${l.priority}` : ''}</span>
                  <div className="meta">{l.ref} · {when(l.created_at)} · {l.mobile || 'no mobile'}{l.data?.serviceName || l.service ? ' · ' + (l.data?.serviceName || l.service) : ''}{l.city ? ' · ' + l.city : ''}{l.files?.length ? ` · ${l.files.length} file${l.files.length > 1 ? 's' : ''}` : ''}</div>
                </div>
                <select aria-label={`Status for ${l.ref}`} value={l.status} onClick={e => e.stopPropagation()} onChange={e => setStatus(l, e.target.value)} style={{ width: 'auto' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {open === l.id && <LeadDetail lead={l} adminKey={key} onSaved={load} />}
            </div>
          ))}
        </div>
      )}
    </div></section>
  )
}
