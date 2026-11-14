import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppCtx, inr, saveLead, store, usePageTitle, validPhone, waLink } from '../utils'
import { LAB_TESTS, PHONE, SERVICES, TEL, cityBySlug, pinCity, svcBySlug } from '../data'
import { Field, Icon, PageHead, cityOptions } from '../components/ui'

const SLOTS = ['7 to 9 am', '9 to 11 am', '11 am to 1 pm', '2 to 4 pm', '4 to 6 pm', '6 to 8 pm']
const RED_FLAGS = ['Chest pain or pressure', 'Severe breathlessness', 'Face drooping, arm weakness or slurred speech', 'Fainting or not responding', 'Heavy bleeding', 'Seizure']
const FILE_SERVICES = ['nursing-services', 'doctor-visits-to-home', 'home-blood-collection', 'critical-care-at-home']

function init(q, city) {
  const slug = q.get('service') || ''
  let items = []
  if (q.get('from') === 'lab') {
    const ids = store.get('wellora-labcart', [])
    items = LAB_TESTS.filter(t => ids.includes(t.id)).map(t => ({ label: t.name, total: t.price, fast: t.fast }))
  }
  if (q.get('from') === 'eq') items = store.get('wellora-eqcart', []).map(c => ({ label: c.label, total: c.total + c.deposit }))
  return {
    step: 1, service: svcBySlug(slug) ? slug : '', sub: q.get('sub') || '', type: q.get('type') || 'gp', pkg: q.get('pkg') || '',
    flags: [], items, err: '', consent: false, ref: '',
    d: { city, gender: 'Female', relation: 'Mother', access: 'Ground floor' },
  }
}

export default function Book() {
  usePageTitle('Book a service | Wellora Care')
  const [q] = useSearchParams()
  const { city } = useContext(AppCtx)
  const [bk, setBk] = useState(() => init(q, city))
  const boxRef = useRef(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    boxRef.current?.scrollIntoView({ block: 'start' })
  }, [bk.step, bk.err])

  const up = p => setBk(b => ({ ...b, ...p }))
  const setD = (k, v) => setBk(b => ({ ...b, d: { ...b.d, [k]: v } }))
  const { d } = bk
  const s = svcBySlug(bk.service)
  const effSub = s?.subs ? (bk.sub || s.subs[0].slug) : ''
  const fasting = bk.items.some(i => i.fast)
  const bf = (name, label, o = {}) => <Field name={name} label={label} {...o} value={d[name] ?? ''} onChange={e => setD(name, e.target.value)} />

  const next = () => {
    let err = ''
    const patch = {}
    if (bk.step === 1) {
      if (!bk.service) err = 'Choose the care you need to continue.'
      if (s?.subs) patch.sub = effSub
    } else if (bk.step === 2) {
      if (!d.name || !d.pname || !d.age) err = "Fill in your name, the patient's name and age."
      else if (!validPhone(d.mobile)) err = 'Enter a 10-digit Indian mobile number, or include your country code, for example +44.'
    } else if (bk.step === 3) {
      if (!d.address?.trim() || !d.locality?.trim()) err = 'Add the full address and area.'
      else if (!/^\d{6}$/.test(d.pincode || '')) err = 'Enter a 6-digit pincode.'
      else if (bk.service === 'non-emergency-ambulance' && !d.drop?.trim()) err = 'Add the drop address or hospital.'
      else {
        const c = pinCity(d.pincode)
        if (!c) {
          err = `We don't serve pincode ${d.pincode} yet. We've noted your request and will call you about options nearby.`
          saveLead({ kind: 'unserviceable', service: bk.service, mobile: d.mobile, pincode: d.pincode })
        } else patch.d = { ...d, city: c.slug }
      }
    } else if (bk.step === 4) {
      if (!d.date) err = 'Choose a date.'
      else if (!d.slot) err = 'Choose a time slot.'
    }
    up({ ...patch, err, step: err ? bk.step : bk.step + 1 })
  }
  const back = () => up({ err: '', step: Math.max(1, bk.step - 1) })
  const confirm = () => {
    if (!bk.consent) return up({ err: 'Please tick the consent box to confirm.' })
    const ref = saveLead({ kind: 'booking', service: s ? s.name : bk.service, sub: bk.sub, doctorType: bk.type, items: bk.items.map(i => i.label).join('; '), ...d })
    if (bk.service === 'home-blood-collection') store.set('wellora-labcart', [])
    if (bk.service === 'medical-equipment-and-consumables') store.set('wellora-eqcart', [])
    up({ ref, step: 6, err: '' })
  }

  const nav = label => (
    <div className="btn-row" style={{ marginTop: 8 }}>
      {bk.step > 1 && <button className="btn btn-soft" onClick={back}>Back</button>}
      <button className="btn btn-primary" onClick={next}>{label || 'Continue'}</button>
    </div>
  )
  const err = bk.err && <div className="alert" role="alert"><p style={{ margin: 0 }}>{bk.err}</p></div>

  let body
  if (bk.step === 1) {
    const blocked = bk.service === 'doctor-visits-to-home' && bk.flags.length > 0
    body = <>
      <h3>Step 1: Choose the care</h3>{err}
      <div className="opts">
        {SERVICES.map(x => (
          <label className="opt" key={x.slug}>
            <input type="radio" name="bk-service" checked={bk.service === x.slug} onChange={() => up({ service: x.slug, sub: '', flags: [] })} />
            <span className="ic" style={{ width: 40, height: 44 }}><Icon k={x.icon} /></span>
            <span className="grow"><b>{x.name}</b><br /><span className="hint">{x.short}</span></span>
          </label>
        ))}
      </div>
      {s?.subs && <Field name="bk-sub" label="Which nursing service?" type="select" value={effSub} onChange={e => up({ sub: e.target.value })} options={s.subs.map(x => [x.slug, x.name + (x.rx ? ' (prescription needed)' : '')])} />}
      {bk.service === 'doctor-visits-to-home' && <>
        <Field name="bk-type" label="Doctor type" type="select" value={bk.type} onChange={e => up({ type: e.target.value })}
          options={[['gp', 'General physician, ' + inr(1200)], ['geri', 'Geriatrician, ' + inr(1800)], ['cardio', 'Cardiologist, ' + inr(2200)], ['diab', 'Diabetologist, ' + inr(2000)], ['neuro', 'Neurologist, ' + inr(2500)]]} />
        <div className="legend">Is your parent having any of these right now?</div>
        <div style={{ margin: '8px 0 14px' }}>
          {RED_FLAGS.map(f => (
            <label className="check" key={f}>
              <input type="checkbox" checked={bk.flags.includes(f)} onChange={e => up({ flags: e.target.checked ? [...bk.flags, f] : bk.flags.filter(x => x !== f) })} /> {f}
            </label>
          ))}
        </div>
        {blocked && (
          <div className="alert" role="alert"><h4>This needs emergency care now</h4>
            <p>Please call <a href="tel:108">108</a> or <a href="tel:112">112</a>, or go to the nearest hospital. A home visit is not safe for these symptoms.</p>
            <a className="btn btn-danger" href="tel:108">Call 108</a>
          </div>
        )}
      </>}
      {bk.service === 'critical-care-at-home' && <div className="note">Home ICU care starts with a free clinical assessment. We'll call you within 15 minutes of booking.</div>}
      {bk.items.length > 0 && <div className="note"><b>From your cart:</b> {bk.items.map(i => i.label).join(', ')}</div>}
      {!blocked && nav()}
    </>
  } else if (bk.step === 2) {
    body = <>
      <h3>Step 2: About you and the patient</h3>{err}
      <div className="grid2">{bf('name', 'Your name', { required: true })}{bf('mobile', 'Your mobile number', { required: true, type: 'tel' })}</div>
      {bf('email', 'Email for confirmation and invoice', { type: 'email' })}
      <div className="grid3">
        {bf('pname', "Patient's name", { required: true })}
        {bf('age', 'Age', { type: 'number', required: true, min: 1, max: 120 })}
        {bf('gender', 'Gender', { type: 'select', options: ['Female', 'Male', 'Other'] })}
      </div>
      {bf('relation', 'Patient is my', { type: 'select', options: ['Mother', 'Father', 'Grandparent', 'Spouse', 'Relative', 'Myself'] })}
      {bf('notes', 'Health condition and current needs', { type: 'textarea', ph: 'Conditions, recent surgery, mobility, medicines' })}
      {FILE_SERVICES.includes(bk.service) && (
        <Field name="files" label="Upload prescription, reports or discharge summary" type="file" accept=".pdf,image/*" multiple
          onChange={e => setD('files', Array.from(e.target.files).map(f => f.name).join(', '))} help={d.files ? 'Attached: ' + d.files : undefined} />
      )}
      {nav()}
    </>
  } else if (bk.step === 3) {
    body = <>
      <h3>Step 3: Where should we come?</h3>{err}
      {bf('address', 'House number, street and landmark', { type: 'textarea', required: true })}
      <div className="grid3">
        {bf('locality', 'Area', { required: true })}
        {bf('city', 'City', { type: 'select', options: cityOptions })}
        {bf('pincode', 'Pincode', { required: true, inputMode: 'numeric', maxLength: 6 })}
      </div>
      {bf('access', 'Floor and lift', { type: 'select', options: ['Ground floor', 'Upper floor with lift', 'Upper floor, no lift'] })}
      {bk.service === 'non-emergency-ambulance' && bf('drop', 'Drop address or hospital', { type: 'textarea', required: true })}
      {nav('Check my area')}
    </>
  } else if (bk.step === 4) {
    const min = new Date().toISOString().slice(0, 10)
    const slots = fasting ? SLOTS.slice(0, 2) : SLOTS
    body = <>
      <h3>Step 4: Pick a date and time</h3>{err}
      <div className="note" style={{ background: 'var(--sage)', borderColor: 'var(--primary)' }}>Good news: we serve pincode {d.pincode} in {cityBySlug(d.city)?.name || ''}.</div>
      {bf('date', 'Date', { type: 'date', required: true, min })}
      <div className="legend" style={{ marginBottom: 8 }}>Time slot</div>
      <div className="opts" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
        {slots.map(t => <label className="opt" key={t}><input type="radio" name="slot" checked={d.slot === t} onChange={() => setD('slot', t)} /> {t}</label>)}
      </div>
      {fasting && <p className="hint">Only morning slots are shown because your tests need fasting.</p>}
      {nav('Review booking')}
    </>
  } else if (bk.step === 5) {
    const total = bk.items.reduce((a, i) => a + i.total, 0)
    const subName = bk.sub && s?.subs ? s.subs.find(x => x.slug === bk.sub)?.name : ''
    body = <>
      <h3>Step 5: Review and confirm</h3>{err}
      <dl className="summary grid2">
        <div><dt>Service</dt><dd>{s?.name}{subName ? ', ' + subName : ''}</dd></div>
        <div><dt>When</dt><dd>{d.date}, {d.slot}</dd></div>
        <div><dt>Patient</dt><dd>{d.pname}, {d.age}, {d.gender}</dd></div>
        <div><dt>Contact</dt><dd>{d.name}, {d.mobile}</dd></div>
        <div style={{ gridColumn: '1/-1' }}><dt>Address</dt><dd>{d.address}, {d.locality}, {d.pincode}</dd></div>
        {bk.items.length > 0 && (
          <div style={{ gridColumn: '1/-1' }}><dt>Items</dt><dd>
            {bk.items.map((i, k) => <div key={k}>{i.label} ({inr(i.total)})</div>)}
            <b>Total {inr(total)}</b>
          </dd></div>
        )}
      </dl>
      <div className="legend" style={{ marginBottom: 8 }}>Payment</div>
      <div className="opts">
        <label className="opt"><input type="radio" name="pay" checked={(d.pay || 'online') === 'online'} onChange={() => setD('pay', 'online')} /> <span className="grow"><b>Pay online now</b><br /><span className="hint">UPI, cards, net banking. International cards accepted.</span></span></label>
        <label className="opt"><input type="radio" name="pay" checked={d.pay === 'later'} onChange={() => setD('pay', 'later')} /> <span className="grow"><b>Pay after the service</b><br /><span className="hint">We send a payment link once the visit is done.</span></span></label>
      </div>
      <label className="check"><input type="checkbox" checked={bk.consent} onChange={e => up({ consent: e.target.checked })} /> <span>I agree that Wellora Care may contact me and use these details to arrange care, as described in the <Link to="/legal/privacy">privacy policy</Link>.</span></label>
      <div className="btn-row" style={{ marginTop: 8 }}>
        <button className="btn btn-soft" onClick={back}>Back</button>
        <button className="btn btn-primary" onClick={confirm}>Confirm booking</button>
      </div>
    </>
  } else {
    body = (
      <div className="success" role="status"><h3>Booking received</h3><p>Your booking reference is</p><p className="ref">{bk.ref}</p>
        <p>We've sent the details to {d.mobile}. A care advisor will call within 5 minutes to confirm, and you'll receive your caregiver's name and qualifications before the visit.</p>
        <div className="btn-row">
          <a className="btn btn-primary" href={waLink('Hello Wellora Care, my booking reference is ' + bk.ref)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
          <Link className="btn btn-soft" to="/">Back to home</Link>
        </div>
      </div>
    )
  }

  return <>
    <PageHead title="Book a service" lede="Five short steps. A care advisor confirms everything with you before the visit." trail={[['Book a service']]} />
    <section className="section"><div className="wrap layout">
      <div className="form-card" ref={boxRef} style={{ scrollMarginTop: 110 }}>
        <div className="progress" aria-label={`Step ${Math.min(bk.step, 5)} of 5`}>{[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= bk.step ? 'on' : ''} />)}</div>
        {body}
      </div>
      <aside className="sticky">
        <div className="card"><h3>Prefer to talk?</h3><p className="muted">Our care line is open 24 hours.</p>
          <a className="btn btn-ghost" href={TEL} style={{ width: '100%' }}>Call {PHONE}</a>
          <a className="btn btn-soft" style={{ width: '100%', marginTop: 10 }} href={waLink("Hello Wellora Care, I'd like to book a service")} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        </div>
        <div className="note" style={{ marginTop: 16 }}>For emergencies, call <a href="tel:108">108</a> or <a href="tel:112">112</a>.</div>
      </aside>
    </div></section>
  </>
}
