import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppCtx, CRISIS, inr, usePageTitle, usePersisted, waLink } from '../utils'
import { CITIES, EQUIPMENT, LAB_TESTS, PHONE, SERVICES, TEL, VEHICLES, cityBySlug, svcBySlug } from '../data'
import { Consent, CtaBand, EnquiryForm, FaqList, Field, Icon, LeadForm, SvcGrid, Ticks, cityOptions, Crumbs } from '../components/ui'
import { NotFound } from './Pages'

const DOCTORS = [
  ['gp', 'General physician', 'Fever, infections, routine reviews, new symptoms', 1200],
  ['geri', 'Geriatrician', 'Multiple conditions, many medicines, memory or mobility concerns', 1800],
  ['cardio', 'Cardiologist', 'Heart conditions and blood pressure reviews', 2200],
  ['diab', 'Diabetologist', 'Diabetes control and insulin adjustment', 2000],
  ['neuro', 'Neurologist', 'Stroke recovery, Parkinson\'s, nerve problems', 2500],
]
export { DOCTORS }

function DoctorTool() {
  return (
    <div className="tool"><h3>Choose a doctor</h3><p className="muted">Pick the doctor type to see the fee and book a visit.</p>
      {DOCTORS.map(([id, n, d, fee]) => (
        <div className="row-item" key={id}>
          <div><b>{n}</b><div className="meta">{d}</div></div>
          <div style={{ textAlign: 'right' }}><b>{inr(fee)}</b><br />
            <Link className="btn btn-soft btn-sm" style={{ marginTop: 6 }} to={`/book?service=doctor-visits-to-home&type=${id}`}>Book</Link>
          </div>
        </div>
      ))}
    </div>
  )
}

function CounselTool() {
  const [crisis, setCrisis] = useState(false)
  return (
    <div className="tool"><h3>Request a counselling session</h3><p className="muted">Tell us a little about what's happening. Everything you share is kept private.</p>
      {crisis && (
        <div className="alert"><h4>If someone is thinking of harming themselves</h4>
          <p style={{ margin: 0 }}>Please call Tele-MANAS on <a href="tel:14416">14416</a> (free, 24 hours) or <a href="tel:112">112</a> now. We have also flagged your request so a coordinator calls you as a priority.</p>
        </div>
      )}
      <LeadForm kind="counselling" onInput={e => { if (e.target.name === 'message') setCrisis(CRISIS.test(e.target.value)) }} onDone={(_, p) => p === 'Crisis' && setCrisis(true)}>
        <div className="grid2">
          <Field name="concern" label="Main concern" type="select" required placeholder="Choose one" options={['Loneliness or low mood', 'Grief or loss', 'Memory concerns', 'Caregiver stress', 'Family conflict about care', 'Something else']} />
          <Field name="mode" label="How would you like to meet?" type="select" required options={['Video call', 'Phone call', 'At home']} />
        </div>
        <div className="grid2">
          <Field name="language" label="Preferred language" type="select" options={['English', 'Tamil', 'Kannada', 'Telugu', 'Malayalam', 'Hindi']} />
          <Field name="agree" label="Does the senior agree to counselling?" type="select" options={['Yes', "Not yet, we'd like advice first", 'This is for me as a caregiver']} />
        </div>
        <Field name="message" label="What would you like help with?" type="textarea" ph="A few lines are enough" />
        <div className="grid2"><Field name="name" label="Your name" required /><Field name="mobile" label="Mobile number" required type="tel" /></div>
        <Consent /><button className="btn btn-primary" type="submit">Request a session</button>
      </LeadForm>
    </div>
  )
}

function CriticalTool() {
  const { city } = useContext(AppCtx)
  return (
    <div className="tool"><h3>Urgent callback for home ICU</h3><p className="muted">A coordinator calls within 15 minutes, day or night.</p>
      <LeadForm kind="critical-care">
        <div className="grid2"><Field name="name" label="Your name" required /><Field name="mobile" label="Mobile number" required type="tel" /></div>
        <div className="grid2">
          <Field name="location" label="Where is the patient now?" type="select" required options={['In hospital', 'At home']} />
          <Field name="city" label="City" type="select" required options={cityOptions} defaultValue={city} />
        </div>
        <div className="legend" style={{ marginBottom: 8 }}>Support needed</div>
        <div className="grid2">
          {['Ventilator', 'BiPAP or CPAP', 'Oxygen', 'Tracheostomy care', 'Continuous monitoring', 'Feeding tube'].map(x => (
            <label className="check" key={x}><input type="checkbox" name="support" value={x} /> {x}</label>
          ))}
        </div>
        <div className="grid2">
          <Field name="discharge" label="Expected discharge date" type="date" />
          <Field name="docs" label="Discharge summary or reports" type="file" accept=".pdf,image/*" multiple />
        </div>
        <Consent /><button className="btn btn-primary" type="submit">Request urgent callback</button>
      </LeadForm>
    </div>
  )
}

function NursingTool({ sub }) {
  const [shift, setShift] = useState('1400')
  const [days, setDays] = useState('30')
  const [level, setLevel] = useState('1')
  const rate = Number(shift) * Number(level)
  const n = Math.max(1, Number(days) || 1)
  return (
    <div className="tool"><h3>Estimate shift nursing costs</h3><p className="muted">For ongoing care. Final pricing follows a free nursing assessment.</p>
      <div className="grid3">
        <Field name="shift" label="Shift length" type="select" value={shift} onChange={e => setShift(e.target.value)} options={[['1400', '12 hours'], ['900', '8 hours'], ['2600', '24 hours, live-in']]} />
        <Field name="days" label="Number of days" type="number" min="1" max="365" value={days} onChange={e => setDays(e.target.value)} />
        <Field name="level" label="Care level" type="select" value={level} onChange={e => setLevel(e.target.value)} options={[['1', 'General nursing'], ['1.3', 'Post-operative or tube care'], ['1.6', 'ICU-trained nurse']]} />
      </div>
      <div className="cart">
        <div className="total"><span>Estimated total</span><span>{inr(rate * n)}</span></div>
        <p className="hint" style={{ margin: '6px 0 0' }}>{inr(rate)} per day for {n} day{n > 1 ? 's' : ''}. Includes weekly supervisor review.</p>
      </div>
      <div className="btn-row" style={{ marginTop: 16 }}>
        <Link className="btn btn-primary" to={`/book?service=nursing-services${sub ? '&sub=' + sub.slug : ''}`}>Book a nursing assessment</Link>
      </div>
    </div>
  )
}

function PhysioTool() {
  const [pkg, setPkg] = useState(10)
  return (
    <div className="tool"><h3>Choose a session package</h3><p className="muted">Every package starts with an assessment visit.</p>
      <div className="opts">
        {[[1, 800, 'Single session'], [5, 3800, '5 sessions, 5% off'], [10, 7200, '10 sessions, 10% off'], [20, 13600, '20 sessions, 15% off']].map(([n, p, l]) => (
          <label className="opt" key={n}>
            <input type="radio" name="pkg" checked={pkg === n} onChange={() => setPkg(n)} />
            <span className="grow"><b>{l}</b><br /><span className="hint">{inr(p / n)} per session</span></span><b>{inr(p)}</b>
          </label>
        ))}
      </div>
      <Link className="btn btn-primary" to={`/book?service=physiotherapy-at-home&pkg=${pkg}`}>Book assessment</Link>
    </div>
  )
}

function LabTool() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [cartIds, setCartIds] = usePersisted('wellora-labcart', [])
  const cats = ['All', ...new Set(LAB_TESTS.map(t => t.cat))]
  const list = LAB_TESTS.filter(t => (cat === 'All' || t.cat === cat) && t.name.toLowerCase().includes(q.toLowerCase()))
  const cart = LAB_TESTS.filter(t => cartIds.includes(t.id))
  const sub = cart.reduce((a, t) => a + t.price, 0)
  const fee = sub > 999 || !sub ? 0 : 100
  return (
    <div className="tool"><h3>Choose your tests</h3><p className="muted">Add tests or packages. You can book for more than one person in the next step.</p>
      <div className="search-box" style={{ margin: '12px 0' }}><input type="search" placeholder="Search tests, for example thyroid" value={q} onChange={e => setQ(e.target.value)} aria-label="Search tests" /></div>
      <div className="filters">{cats.map(c => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div>
        {list.length ? list.map(t => (
          <div className="row-item" key={t.id}>
            <div><b>{t.name}</b>{t.fast && <span className="tag">Fasting</span>}<div className="meta">Report in {t.tat}</div></div>
            <div style={{ textAlign: 'right', flex: 'none' }}><b>{inr(t.price)}</b><br />
              {cartIds.includes(t.id)
                ? <button className="btn btn-soft btn-sm" style={{ marginTop: 6 }} onClick={() => setCartIds(c => c.filter(x => x !== t.id))}>Remove</button>
                : <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => setCartIds(c => [...c, t.id])}>Add</button>}
            </div>
          </div>
        )) : <div className="empty">No tests match "{q}". Try another name, or upload a prescription when booking.</div>}
      </div>
      <div className="cart" aria-live="polite">
        {cart.length ? <>
          <b>{cart.length} selected</b>
          {cart.map(t => <div className="row-item" style={{ padding: '6px 0' }} key={t.id}><span>{t.name}</span><span>{inr(t.price)}</span></div>)}
          <div className="row-item" style={{ padding: '6px 0' }}><span>Home collection</span><span>{fee ? inr(fee) : 'Free'}</span></div>
          <div className="total"><span>Total</span><span>{inr(sub + fee)}</span></div>
          {cart.some(t => t.fast) && <p className="hint" style={{ margin: '8px 0 0' }}>Includes fasting tests: collection between 7 and 11 am, after 10 to 12 hours without food.</p>}
          <div className="btn-row" style={{ marginTop: 14 }}><button className="btn btn-primary" onClick={() => navigate('/book?service=home-blood-collection&from=lab')}>Book home collection</button></div>
        </> : <span className="muted">No tests selected yet. Free home collection on orders above {inr(999)}.</span>}
      </div>
    </div>
  )
}

function EqTool() {
  const navigate = useNavigate()
  const [cat, setCat] = useState('All')
  const [mode, setMode] = useState({})
  const [unit, setUnit] = useState({})
  const [qty, setQty] = useState({})
  const [cart, setCart] = usePersisted('wellora-eqcart', [])
  const price = p => {
    const m = mode[p.id] || (p.rent ? 'rent' : 'buy')
    const n = Math.max(1, Number(qty[p.id] || 1))
    if (m === 'buy') return { mode: m, qty: n, total: p.buy * n, deposit: 0 }
    const u = unit[p.id] || 'month'
    return { mode: m, qty: n, unit: u, total: p.rent[u] * n, deposit: p.deposit }
  }
  const cats = ['All', ...new Set(EQUIPMENT.map(p => p.cat))]
  const plural = { day: 'days', week: 'weeks', month: 'months' }
  const rentTotal = cart.reduce((a, c) => a + c.total, 0)
  const dep = cart.reduce((a, c) => a + c.deposit, 0)
  const add = p => {
    const pr = price(p)
    const label = pr.mode === 'rent' ? `${p.name}, rent ${pr.qty} ${pr.unit}${pr.qty > 1 ? 's' : ''}` : `${p.name} x ${pr.qty}`
    setCart(c => [...c, { id: p.id, label, total: pr.total, deposit: pr.deposit }])
  }
  return (
    <div className="tool"><h3>Rent or buy</h3><p className="muted">Delivery, installation and a short demo are included in city limits.</p>
      <div className="filters">{cats.map(c => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="prod-grid">
        {EQUIPMENT.filter(p => cat === 'All' || p.cat === cat).map(p => {
          const pr = price(p)
          return (
            <div className="prod" key={p.id}>
              <h4>{p.name}</h4>
              {p.rx && <span className="tag rx" style={{ margin: 0 }}>Prescription needed</span>}
              {p.rent ? (
                <div className="seg" role="group" aria-label="Rent or buy">
                  {['rent', 'buy'].map(m => <button key={m} type="button" aria-pressed={pr.mode === m} onClick={() => setMode(s => ({ ...s, [p.id]: m }))}>{m === 'rent' ? 'Rent' : 'Buy'}</button>)}
                </div>
              ) : <div className="hint" style={{ margin: '10px 0' }}>Buy only</div>}
              {pr.mode === 'rent' ? <>
                <div className="grid2" style={{ gap: '0 10px' }}>
                  <div className="field"><label>Duration</label><input type="number" min="1" max="24" value={qty[p.id] ?? 1} onChange={e => setQty(s => ({ ...s, [p.id]: e.target.value }))} /></div>
                  <div className="field"><label>Per</label>
                    <select value={pr.unit} onChange={e => setUnit(s => ({ ...s, [p.id]: e.target.value }))}>
                      {['day', 'week', 'month'].map(u => <option key={u} value={u}>{u} ({inr(p.rent[u])})</option>)}
                    </select>
                  </div>
                </div>
                <p className="hint" style={{ margin: '0 0 10px' }}>{pr.qty} {plural[pr.unit]}: <b>{inr(pr.total)}</b> + refundable deposit {inr(p.deposit)}</p>
              </> : <>
                <div className="field"><label>Quantity</label><input type="number" min="1" max="50" value={qty[p.id] ?? 1} onChange={e => setQty(s => ({ ...s, [p.id]: e.target.value }))} /></div>
                <p className="hint" style={{ margin: '0 0 10px' }}>Price: <b>{inr(pr.total)}</b></p>
              </>}
              <button className="btn btn-ghost btn-sm" onClick={() => add(p)}>Add to cart</button>
            </div>
          )
        })}
      </div>
      <div className="cart" aria-live="polite">
        {cart.length ? <>
          <b>Your cart</b>
          {cart.map((c, i) => (
            <div className="row-item" style={{ padding: '6px 0' }} key={i}>
              <span>{c.label}</span>
              <span>{inr(c.total)} <button className="btn btn-soft btn-sm" onClick={() => setCart(x => x.filter((_, j) => j !== i))} aria-label={`Remove ${c.label}`}>Remove</button></span>
            </div>
          ))}
          {dep > 0 && <div className="row-item" style={{ padding: '6px 0' }}><span>Refundable deposit</span><span>{inr(dep)}</span></div>}
          <div className="total"><span>Payable now</span><span>{inr(rentTotal + dep)}</span></div>
          <div className="btn-row" style={{ marginTop: 14 }}><button className="btn btn-primary" onClick={() => navigate('/book?service=medical-equipment-and-consumables&from=eq')}>Schedule delivery</button></div>
        </> : <span className="muted">Your cart is empty. Add an item to schedule delivery.</span>}
      </div>
    </div>
  )
}

function AmbTool() {
  const [f, setF] = useState({ vehicle: 'ptv', km: '12', trip: '1', wait: '0', nurse: false, doctor: false })
  const set = k => e => setF(s => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const v = VEHICLES.find(x => x.id === f.vehicle)
  const km = Math.max(1, Number(f.km) || 1), trips = Number(f.trip), wait = Math.max(0, Number(f.wait) || 0)
  const dist = v.km * km * trips, w = wait * 300, esc = (f.nurse ? 1500 : 0) + (f.doctor ? 3500 : 0)
  return (
    <div className="tool"><h3>Fare estimate</h3><p className="muted">For trips within the city. Inter-city transfers are quoted separately.</p>
      <Field name="vehicle" label="Vehicle type" type="select" value={f.vehicle} onChange={set('vehicle')} options={VEHICLES.map(x => [x.id, x.name])} />
      <div className="grid3">
        <Field name="km" label="Distance (km, one way)" type="number" min="1" max="1000" value={f.km} onChange={set('km')} />
        <Field name="trip" label="Trip" type="select" value={f.trip} onChange={set('trip')} options={[['1', 'One way'], ['2', 'Round trip']]} />
        <Field name="wait" label="Waiting hours" type="number" min="0" max="24" value={f.wait} onChange={set('wait')} />
      </div>
      <label className="check"><input type="checkbox" checked={f.nurse} onChange={set('nurse')} /> Nurse escort (+{inr(1500)})</label>
      <label className="check"><input type="checkbox" checked={f.doctor} onChange={set('doctor')} /> Doctor escort (+{inr(3500)})</label>
      <div className="cart">
        <span className="hint">Estimated fare</span>
        <div className="fare">{inr(v.base + dist + w + esc)}</div>
        <p className="hint" style={{ margin: 0 }}>Base {inr(v.base)}, distance {inr(dist)} ({km * trips} km), waiting {inr(w)}, escort {inr(esc)}. Tolls and parking extra.</p>
      </div>
      <div className="btn-row" style={{ marginTop: 16 }}><Link className="btn btn-primary" to="/book?service=non-emergency-ambulance">Book this trip</Link></div>
    </div>
  )
}

function MedicineTool() {
  return (
    <div className="tool"><h3>Order medicines</h3><p className="muted">Upload the prescription. A pharmacist calls to confirm before anything is packed.</p>
      <LeadForm kind="medicine-order">
        <Field name="rx" label="Prescription" type="file" required accept=".pdf,image/*" multiple help="Photo or PDF. All pages, clearly visible." />
        <div className="grid2"><Field name="name" label="Your name" required /><Field name="mobile" label="Mobile number" required type="tel" /></div>
        <Field name="address" label="Delivery address" type="textarea" required />
        <div className="grid2">
          <Field name="pincode" label="Pincode" required inputMode="numeric" maxLength={6} />
          <Field name="pay" label="Payment" type="select" options={['Pay online after confirmation', 'Pay on delivery']} />
        </div>
        <label className="check"><input type="checkbox" name="refill" value="yes" /> Remind me every month to refill these medicines</label>
        <label className="check"><input type="checkbox" name="substitute" value="ask" /> Call me before substituting any brand</label>
        <Consent /><button className="btn btn-primary" type="submit">Send for pharmacist check</button>
      </LeadForm>
    </div>
  )
}

function Tool({ s, sub }) {
  switch (s.tool) {
    case 'doctor': return <DoctorTool />
    case 'counsel': return <CounselTool />
    case 'critical': return <CriticalTool />
    case 'nursing': return <NursingTool sub={sub} />
    case 'physio': return <PhysioTool />
    case 'lab': return <LabTool />
    case 'equipment': return <EqTool />
    case 'ambulance': return <AmbTool />
    case 'medicine': return <MedicineTool />
    default: return null
  }
}

export default function ServicePage({ slug, subSlug, citySlug }) {
  const { city: CITY } = useContext(AppCtx)
  const s = svcBySlug(slug)
  const sub = subSlug && s?.subs ? s.subs.find(x => x.slug === subSlug) : null
  const city = citySlug ? cityBySlug(citySlug) : null
  const name = sub ? sub.name : s?.name
  const title = city ? `${name} in ${city.name}` : name
  usePageTitle(`${title} | Wellora Care`)
  if (!s || (subSlug && !sub) || (citySlug && !city)) return <NotFound />

  const trail = [['Services', '/services']]
  if (sub) trail.push([s.name, '/services/' + s.slug])
  if (city) trail.push([city.name, '/locations/' + city.slug])
  trail.push([name])
  const intro = sub ? `${sub.short} ${s.intro}` : s.intro
  const emergency = ['non-emergency-ambulance', 'critical-care-at-home', 'doctor-visits-to-home'].includes(s.slug)
  const related = SERVICES.filter(x => x.slug !== s.slug).slice(0, 3)

  return <>
    {emergency && <div className="emergency"><div className="wrap">Is this an emergency? Call <a href="tel:108">108</a> or <a href="tel:112">112</a> now. Wellora Care is not an emergency service.</div></div>}
    <section className="page-head"><div className="wrap">
      <Crumbs trail={trail} />
      <div className="svc-hero">
        <div>
          <span className="ic" style={{ marginBottom: 16 }}><Icon k={s.icon} /></span>
          <h1>{title}</h1>
          <p className="lede">{intro}</p>
          {city && <p className="muted">Serving {city.areas.join(', ')} and nearby areas.</p>}
          <div className="btn-row">
            <Link className="btn btn-primary" to={`/book?service=${s.slug}${sub ? '&sub=' + sub.slug : ''}`}>{s.tool === 'critical' ? 'Request an assessment' : 'Book now'}</Link>
            <a className="btn btn-ghost" href={TEL}>Call {PHONE}</a>
            <a className="btn btn-soft" href={waLink(`Hello Wellora Care, I'd like to know more about ${name}${city ? ' in ' + city.name : ''}`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="form-card">
          <h3>Get a call back</h3>
          <p className="muted" style={{ fontSize: '.95rem' }}>About {name.toLowerCase()}, within 5 minutes.</p>
          <EnquiryForm key={slug + (subSlug || '')} service={s.slug} hideService city={city ? city.slug : CITY} message={false} kind="service-enquiry" />
        </div>
      </div>
    </div></section>

    <section className="section"><div className="wrap layout">
      <div>
        {s.subs && (
          <div className="block"><h2>{sub ? 'Other nursing services' : 'Nursing services we offer'}</h2>
            <div className="sub-grid">
              {s.subs.map(x => (
                <Link key={x.slug} to={`/services/${s.slug}/${x.slug}`} aria-current={sub?.slug === x.slug ? 'page' : undefined}>
                  <b>{x.name}</b>{x.rx && <span className="tag rx">Prescription needed</span>}
                  <small>{x.short}</small><small>{x.price}</small>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="block"><h2>Who it's for</h2><Ticks items={s.forWho} /></div>
        <div className="block"><h2>What's included</h2><Ticks items={s.includes} /></div>
        <div className="block"><h2>Who provides the care</h2><p>{s.team}</p></div>
        <div className="block"><h2>How it works</h2>
          <ol className="steps" style={{ gridTemplateColumns: `repeat(${Math.min(s.steps.length, 4)},1fr)` }}>
            {s.steps.map(([a, b]) => <li key={a}><b>{a}</b><span>{b}</span></li>)}
          </ol>
        </div>
        <div className="block"><Tool s={s} sub={sub} /></div>
        <div className="block"><h2>Questions about {name.toLowerCase()}</h2><FaqList items={s.faqs} /></div>
      </div>
      <aside className="sticky">
        <div className="card"><h3>Prices</h3>
          {s.pricing.map(([a, b]) => <div className="row-item" key={a}><span>{a}</span><b style={{ textAlign: 'right' }}>{b}</b></div>)}
          {sub && <div className="row-item"><span>{sub.name}</span><b style={{ textAlign: 'right' }}>{sub.price}</b></div>}
          <p className="hint" style={{ margin: '12px 0 0' }}>Indicative prices. The final price is confirmed before care starts.</p>
        </div>
        <div className="card" style={{ marginTop: 16 }}><h3>Also available in</h3>
          <div className="city-row" style={{ gap: 8 }}>{CITIES.map(c => <Link key={c.slug} className="btn btn-soft btn-sm" to={`/locations/${c.slug}/${s.slug}`}>{c.name}</Link>)}</div>
        </div>
      </aside>
    </div></section>

    <section className="section tint"><div className="wrap"><h2>Related services</h2><SvcGrid list={related} /></div></section>
    <CtaBand />
  </>
}
