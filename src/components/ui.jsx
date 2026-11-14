import { createContext, useContext, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppCtx, CRISIS, saveLead, validateForm, waLink } from '../utils'
import { CITIES, ICONS, PHONE, POSTS, SERVICES, TEL } from '../data'

export const serviceOptions = SERVICES.map(s => [s.slug, s.name]).concat([['other', 'Not sure yet']])
export const cityOptions = CITIES.map(c => [c.slug, c.name])

export const Icon = ({ k }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[k] || '' }} />
)

export const LogoMark = ({ size = 40, sun }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path d="M8 44V22a16 16 0 0 1 32 0v22" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
    <path d="M24 42c-1-9 2-16 10-20 0 9-3 16-10 20z" fill="var(--primary)" />
    <path d="M24 42c-5-4-8-9-8-15 5 2 8 7 8 15z" fill="var(--lav-ink)" opacity=".75" />
    {sun && <circle cx="24" cy="12.5" r="3" fill="var(--sun)" />}
  </svg>
)

export const Logo = ({ size = 40 }) => (
  <><LogoMark size={size} sun /><span className="word">wellora<span> care</span></span></>
)

/* ---------- forms ---------- */
export const FormCtx = createContext({ errors: {} })

export function Field({ name, label, type = 'text', required, options = [], placeholder, ph, help, value, defaultValue, onChange, ...rest }) {
  const { errors } = useContext(FormCtx)
  const id = useId()
  const err = errors[name]
  const ctl = type === 'file' ? (onChange ? { onChange } : {}) : onChange ? { value: value ?? '', onChange } : { defaultValue: defaultValue ?? value }
  const common = { id, name, required, className: err ? 'invalid' : undefined, ...ctl, ...rest }
  let input
  if (type === 'select') {
    input = (
      <select {...common}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{t}</option> })}
      </select>
    )
  } else if (type === 'textarea') input = <textarea {...common} placeholder={ph} />
  else input = <input type={type} placeholder={ph} {...common} />
  return (
    <div className="field">
      <label htmlFor={id}>{label}{!required && <> <span className="hint">(optional)</span></>}</label>
      {input}
      {help && <span className="hint">{help}</span>}
      {err && <span className="err">{err}</span>}
    </div>
  )
}

export function Consent({ children }) {
  const { errors } = useContext(FormCtx)
  return (
    <>
      <label className="check">
        <input type="checkbox" name="consent" required className={errors.consent ? 'invalid' : undefined} />{' '}
        <span>{children || <>I agree that Wellora Care may contact me and use these details to arrange care, as described in the <Link to="/legal/privacy">privacy policy</Link>.</>}</span>
      </label>
      {errors.consent && <p className="err" style={{ margin: '-4px 0 12px' }}>{errors.consent}</p>}
    </>
  )
}

const THANKS = {
  'job-application': n => `Thank you, ${n}. Our hiring team will review your application and call you within 3 working days.`,
  referral: () => 'Thank you. We will contact the family within an hour and update you on the same number.',
  partnership: n => `Thank you, ${n}. Our partnerships team will reply within 2 working days.`,
  'medicine-order': n => `Thank you, ${n}. A pharmacist will call within 30 minutes to confirm your medicines and total.`,
  'critical-care': n => `Thank you, ${n}. This is marked urgent. A care coordinator will call you within 15 minutes.`,
  counselling: n => `Thank you, ${n}. A counsellor coordinator will call you within the next working hour to set up the first session.`,
}

export function LeadForm({ kind, children, onInput, onDone }) {
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)
  const submit = e => {
    e.preventDefault()
    const f = e.currentTarget
    const errs = validateForm(f)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) { const el = f.elements[first]; el?.focus?.(); return }
    const data = {}
    for (const [k, v] of new FormData(f).entries()) {
      const val = v instanceof File ? v.name : v
      if (!val) continue
      data[k] = data[k] ? data[k] + ', ' + val : val
    }
    let priority = kind === 'critical-care' ? 'High' : 'Normal'
    if (kind === 'counselling' && CRISIS.test(data.message || '')) priority = 'Crisis'
    const ref = saveLead({ kind, priority, ...data })
    const n = (data.name || data.refname || '').split(' ')[0]
    const msg = THANKS[kind] ? THANKS[kind](n) : `Thank you${n ? ', ' + n : ''}. A care advisor will call you on ${data.mobile || ''} within 5 minutes, between 8 am and 10 pm. Later requests are called first thing next morning.`
    onDone?.(data, priority)
    setDone({ ref, msg })
  }
  if (done) {
    return (
      <div className="success" role="status">
        <p style={{ margin: '0 0 4px' }}>Your reference number</p>
        <p className="ref">{done.ref}</p>
        <p>{done.msg}</p>
        <a className="btn btn-soft btn-sm" href={waLink('Hello Wellora Care, my reference is ' + done.ref)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
      </div>
    )
  }
  return (
    <FormCtx.Provider value={{ errors }}>
      <form noValidate onSubmit={submit} onInput={onInput}>{children}</form>
    </FormCtx.Provider>
  )
}

export function EnquiryForm({ kind = 'enquiry', service = '', hideService, city, callback, message = true, cta = 'Request a callback', msg = '' }) {
  const { city: CITY } = useContext(AppCtx)
  return (
    <LeadForm kind={kind} key={city || CITY}>
      <Field name="name" label="Your name" required ph="Full name" />
      <Field name="mobile" label="Mobile number" required type="tel" ph="10-digit mobile, or +country code" inputMode="tel" autoComplete="tel" />
      {hideService
        ? <input type="hidden" name="service" value={service} />
        : <Field name="service" label="Care needed" type="select" required options={serviceOptions} defaultValue={service} placeholder="Choose a service" />}
      <Field name="city" label="City" type="select" required options={cityOptions} defaultValue={city || CITY} />
      {callback && <Field name="time" label="Best time to call" type="select" options={['As soon as possible', 'Morning, 8 am to 12 pm', 'Afternoon, 12 pm to 4 pm', 'Evening, 4 pm to 8 pm', 'Night, 8 pm to 10 pm']} />}
      {message && <Field name="message" label="Anything we should know?" type="textarea" ph="For example: my mother had knee surgery last week" defaultValue={msg} />}
      <Consent />
      <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>{cta}</button>
    </LeadForm>
  )
}

/* ---------- content blocks ---------- */
export function Crumbs({ trail }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {trail.map(([t, h], i) => <span key={i}> / {h ? <Link to={h}>{t}</Link> : <span>{t}</span>}</span>)}
    </nav>
  )
}

export function PageHead({ title, lede, trail, children }) {
  return (
    <section className="page-head"><div className="wrap">
      <Crumbs trail={trail} />
      <h1>{title}</h1>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </div></section>
  )
}

export function FaqList({ items }) {
  return <div className="faq">{items.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
}

export function ReviewCards({ list }) {
  return (
    <div className="cards3">
      {list.map((r, i) => (
        <blockquote className="card quote" style={{ margin: 0 }} key={i}>
          <div className="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p>{r.text}</p>
          <footer>{r.name}, {r.where}</footer>
        </blockquote>
      ))}
    </div>
  )
}

export function PostCards({ list = POSTS }) {
  return (
    <div className="cards3">
      {list.map(p => (
        <Link className="post" to={`/blog/${p.slug}`} key={p.slug}>
          <div className="thumb" style={{ background: `var(${p.tint})` }}><LogoMark size={54} /></div>
          <div className="body">
            <small>{p.cat}, {p.mins} min read</small>
            <h3 style={{ marginTop: 6 }}>{p.title}</h3>
            <p className="muted" style={{ margin: 0 }}>{p.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function SvcCard({ s, to }) {
  return (
    <Link className="svc" to={to || `/services/${s.slug}`}>
      <span className="ic"><Icon k={s.icon} /></span>
      <span><h3>{s.name}</h3><p>{s.short}</p></span>
    </Link>
  )
}

export const SvcGrid = ({ list = SERVICES, style, href }) => (
  <div className="svc-grid" style={style}>{list.map(s => <SvcCard key={s.slug} s={s} to={href?.(s)} />)}</div>
)

export function CtaBand() {
  const { openEnquiry } = useContext(AppCtx)
  return (
    <section className="section"><div className="wrap"><div className="cta-band">
      <div>
        <h2>Not sure what your parent needs?</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>Talk to a care advisor. We listen, suggest the right care and arrange a free assessment where needed.</p>
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => openEnquiry()}>Talk to a care advisor</button>
        <a className="btn btn-ghost" href={TEL}>Call {PHONE}</a>
      </div>
    </div></div></section>
  )
}

export function Ticks({ items, style }) {
  return <ul className="ticks" style={style}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
}

export function Steps({ steps, style }) {
  return <ol className="steps" style={style}>{steps.map(([a, b]) => <li key={a}><b>{a}</b><span>{b}</span></li>)}</ol>
}
