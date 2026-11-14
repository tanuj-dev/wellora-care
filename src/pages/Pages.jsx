import { useContext } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppCtx, usePageTitle } from '../utils'
import { CITIES, FAQ_GROUPS, JOBS, LEGAL, NURSING_SUBS, PHONE, PLANS, POSTS, REVIEWS, SERVICES, TEL, WA, cityBySlug } from '../data'
import { Consent, CtaBand, EnquiryForm, FaqList, Field, Icon, LeadForm, LogoMark, PageHead, PostCards, ReviewCards, Steps, SvcGrid, Ticks, Crumbs, cityOptions, serviceOptions } from '../components/ui'
import { SiteSearch } from '../components/Layout'

/* ---------------- Home ---------------- */
export function Home() {
  usePageTitle('Wellora Care | Home healthcare and elder care at home')
  const { city, setCity, openEnquiry } = useContext(AppCtx)
  const navigate = useNavigate()
  const onFind = e => {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    setCity(d.get('city'))
    navigate(`/locations/${d.get('city')}/${d.get('service')}`)
  }
  return <>
    <section className="wrap hero">
      <div>
        <h1>Care for your parents, in the home they love.</h1>
        <p className="lede">Doctors, nurses, physiotherapists, lab tests, medicines and equipment, arranged by one team and delivered at home.</p>
        <form className="finder" onSubmit={onFind} aria-label="Find the right care" key={city}>
          I'm looking for{' '}
          <select name="service" aria-label="Type of care">{SERVICES.map(s => <option key={s.slug} value={s.slug}>{s.name.toLowerCase()}</option>)}</select>
          {' '}for my{' '}
          <select name="who" aria-label="Who needs care">{['mother', 'father', 'parents', 'grandparent', 'spouse', 'myself'].map(x => <option key={x}>{x}</option>)}</select>
          {' '}in{' '}
          <select name="city" aria-label="City" defaultValue={city}>{CITIES.map(x => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select>.
          <div className="btn-row">
            <button className="btn btn-primary" type="submit">Show me how it works</button>
            <button className="btn btn-soft" type="button" onClick={() => openEnquiry()}>Talk to an advisor</button>
          </div>
        </form>
        <p className="muted" style={{ fontSize: '.95rem' }}>Need help right now? Call <a href={TEL}>{PHONE}</a>, open 24 hours. For emergencies, call 108.</p>
      </div>
      <div className="hero-visual">
        <div className="arch">
          <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="400" height="500" fill="var(--sage-2)" />
            <circle cx="285" cy="150" r="58" fill="var(--sun)" />
            <path d="M0 345 C80 300 160 315 230 345 S350 330 400 300 V500 H0Z" fill="var(--sage)" />
            <path d="M150 470 C120 380 150 300 230 250 C250 340 220 420 150 470Z" fill="var(--primary)" />
            <path d="M150 470 C175 400 200 330 230 250" stroke="var(--sage-2)" strokeWidth="3" fill="none" />
            <path d="M160 470 C120 430 85 380 80 320 C130 340 160 390 160 470Z" fill="var(--lav-ink)" opacity=".7" />
            <path d="M0 440 C110 410 250 430 400 400 V500 H0Z" fill="var(--primary-deep)" opacity=".9" />
          </svg>
        </div>
        <div className="chip c1"><b><span className="dot" />Nurse checked in</b>10:02 am, vitals shared with family</div>
        <div className="chip c2"><b>Physio session 4 of 10</b>Walked to the balcony unaided</div>
      </div>
    </section>
    <div className="wrap"><div className="promises">
      <div><b>Verified caregivers</b><span>ID, police and reference checks for every professional</span></div>
      <div><b>Clinical supervision</b><span>A nursing supervisor reviews every long-term case weekly</span></div>
      <div><b>24-hour care line</b><span>A real person answers, day or night</span></div>
      <div><b>Replacement promise</b><span>Not the right fit? A new caregiver, usually within 24 hours</span></div>
    </div></div>

    <section className="section"><div className="wrap">
      <div className="section-head"><div><h2>Everything recovery at home needs</h2><p className="lede">Nine services, one coordinator. Start with one and add more as needs change.</p></div><Link className="btn btn-ghost" to="/services">All services</Link></div>
      <SvcGrid />
    </div></section>

    <section className="section tint"><div className="wrap">
      <h2>How care begins</h2>
      <p className="lede" style={{ marginBottom: 34 }}>Most families go from first call to care at home within a day.</p>
      <Steps steps={[
        ["Tell us what's happening", 'Call, WhatsApp or fill a short form. A care advisor calls back within 5 minutes.'],
        ['Free assessment', "For ongoing care, a nurse or doctor understands your parent's needs at home or in hospital."],
        ['A plan you agree on', 'Clear services, schedule and price in writing, before anything starts.'],
        ['Care at home', 'Your caregiver arrives, and you get regular updates on your phone.'],
      ]} />
    </div></section>

    <section className="section"><div className="wrap split">
      <div className="arch" style={{ aspectRatio: '1/1', maxWidth: 440 }}>
        <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="400" fill="var(--lav)" /><circle cx="120" cy="130" r="44" fill="var(--sun)" />
          <path d="M60 400 C70 300 140 240 220 230 C300 220 350 280 360 400Z" fill="var(--sage-2)" />
          <path d="M200 400 C180 320 200 260 270 220 C290 300 270 360 200 400Z" fill="var(--primary)" />
          <path d="M200 400 C160 370 130 330 130 280 C175 300 200 340 200 400Z" fill="var(--lav-ink)" opacity=".7" />
        </svg>
      </div>
      <div>
        <h2>Why families choose Wellora</h2>
        <Ticks items={[
          <><b>One team for everything.</b> Nursing, doctor visits, tests, medicines and equipment are coordinated together, so nothing falls through the gaps.</>,
          <><b>Updates you can see.</b> Daily notes and vitals reach you on WhatsApp, wherever you live.</>,
          <><b>Clear prices.</b> You see the cost before care starts, with a GST invoice for every payment.</>,
          <><b>Care in your language.</b> Caregivers who speak Tamil, Kannada, Telugu, Malayalam, Hindi and English.</>,
        ]} />
        <Link className="btn btn-primary" to="/about">About Wellora Care</Link>
      </div>
    </div></section>

    <section className="section tint"><div className="wrap">
      <div className="section-head"><div><h2>Care plans</h2><p className="lede">Bundled care for common situations, priced in one place.</p></div><Link className="btn btn-ghost" to="/packages">Compare plans</Link></div>
      <div className="cards3">
        {PLANS.map(p => (
          <div className={'card' + (p.featured ? ' feature' : '')} key={p.id}>
            <h3>{p.name}</h3><p className="muted" style={{ margin: 0 }}>{p.best}</p>
            <div className="price">{p.price}</div><p className="muted">{p.period}</p>
            <Link className={`btn ${p.featured ? 'btn-soft' : 'btn-ghost'} btn-sm`} to="/packages">See what's included</Link>
          </div>
        ))}
      </div>
    </div></section>

    <section className="section"><div className="wrap">
      <div className="section-head"><div><h2>What families tell us</h2></div><Link className="btn btn-ghost" to="/testimonials">More stories</Link></div>
      <ReviewCards list={REVIEWS.slice(0, 3)} />
    </div></section>

    <section className="section tint"><div className="wrap">
      <h2>Where we care</h2>
      <p className="lede" style={{ marginBottom: 24 }}>Teams on the ground in four cities, with more on the way.</p>
      <div className="city-row">{CITIES.map(x => <Link key={x.slug} className="city-pill" to={`/locations/${x.slug}`}><LogoMark size={22} /> {x.name}</Link>)}</div>
    </div></section>

    <section className="section"><div className="wrap">
      <div className="section-head"><div><h2>From our care library</h2></div><Link className="btn btn-ghost" to="/blog">All articles</Link></div>
      <PostCards list={POSTS.slice(0, 3)} />
    </div></section>

    <section className="section tint"><div className="wrap narrow">
      <h2>Questions families ask first</h2>
      <FaqList items={FAQ_GROUPS[0].items.concat(FAQ_GROUPS[1].items.slice(0, 2), FAQ_GROUPS[3].items.slice(0, 1))} />
      <p style={{ marginTop: 20 }}><Link to="/faqs">See all questions</Link></p>
    </div></section>
    <CtaBand />
  </>
}

/* ---------------- About ---------------- */
export function About() {
  usePageTitle('About Wellora Care')
  return <>
    <PageHead title="About Wellora Care" lede="We started Wellora Care so that growing older at home feels safe, dignified and well supported, for parents and for the families who love them." trail={[['About us']]} />
    <section className="section"><div className="wrap split">
      <div>
        <h2>Our story</h2>
        <p>Many families we know were caring for parents from a distance, juggling nurses from one agency, equipment from another and doctors who never spoke to each other. Wellora Care brings all of that under one roof, with one coordinator who knows your parent by name.</p>
        <p>We believe most recovery and everyday care can happen at home, when it is planned well and checked often.</p>
      </div>
      <div className="card">
        <h3>What we stand for</h3>
        <Ticks style={{ margin: 0 }} items={[
          <><b>Dignity first.</b> Care that respects routines, privacy and choices.</>,
          <><b>Honest advice.</b> If hospital is safer, we say so.</>,
          <><b>Clinical rigour.</b> Protocols, supervision and records, the way a good hospital works.</>,
          <><b>Families in the loop.</b> Clear updates, every day.</>,
        ]} />
      </div>
    </div></section>
    <section className="section tint"><div className="wrap">
      <h2>How we keep care safe</h2>
      <p className="lede" style={{ marginBottom: 30 }}>Every professional goes through the same checks before their first visit.</p>
      <Steps steps={[
        ['Identity and police check', 'Government ID and police verification for every caregiver.'],
        ['Qualification check', 'Degrees and council registrations verified at source.'],
        ['Skills assessment', 'Practical tests in nursing procedures and elder care.'],
        ['Ongoing supervision', 'Weekly reviews and refresher training on infection control and safety.'],
      ]} />
    </div></section>
    <section className="section"><div className="wrap">
      <h2>Our clinical leadership</h2>
      <p className="lede" style={{ marginBottom: 24 }}>Profiles with names, qualifications and registration numbers will appear here.</p>
      <div className="cards3">
        {[['doctor', 'Medical director', 'Leads clinical protocols and reviews medical content on this site.'], ['nursing', 'Head of nursing', 'Oversees nurse training, supervision and quality audits.'], ['physio', 'Head of rehabilitation', 'Designs physiotherapy programmes and measures outcomes.']].map(([i, t, d]) => (
          <div className="card" key={t}><span className="ic"><Icon k={i} /></span><h3 style={{ marginTop: 14 }}>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></div>
        ))}
      </div>
    </div></section>
    <CtaBand />
  </>
}

export function Services() {
  usePageTitle('Home healthcare services | Wellora Care')
  return <>
    <PageHead title="Our services" lede="Choose a service to see what's included, who delivers it, prices and how to book." trail={[['Services']]} />
    <section className="section"><div className="wrap"><SvcGrid /></div></section>
    <CtaBand />
  </>
}

/* ---------------- Locations ---------------- */
export function Locations() {
  usePageTitle('Locations | Wellora Care')
  return <>
    <PageHead title="Where we care" lede="Wellora Care teams work across four cities. Choose yours to see areas covered and local contacts." trail={[['Locations']]} />
    <section className="section"><div className="wrap cards3" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
      {CITIES.map(c => (
        <Link key={c.slug} className="card" style={{ textDecoration: 'none', color: 'inherit' }} to={`/locations/${c.slug}`}>
          <h3>{c.name}</h3><p className="muted">{c.areas.slice(0, 5).join(', ')} and more</p>
          <span className="btn btn-ghost btn-sm">See {c.name}</span>
        </Link>
      ))}
    </div></section>
    <CtaBand />
  </>
}

export function City() {
  const { city: slug } = useParams()
  const c = cityBySlug(slug)
  usePageTitle(c ? `Home healthcare in ${c.name} | Wellora Care` : 'Page not found | Wellora Care')
  if (!c) return <NotFound />
  return <>
    <PageHead title={`Home healthcare in ${c.name}`} lede={`Nurses, doctors, physiotherapists, lab tests and equipment, delivered across ${c.name}.`} trail={[['Locations', '/locations'], [c.name]]} />
    <section className="section"><div className="wrap layout">
      <div>
        <div className="block"><h2>Areas we cover</h2>
          <div className="city-row" style={{ gap: 8 }}>{c.areas.map(a => <span key={a} className="btn btn-soft btn-sm" style={{ cursor: 'default' }}>{a}</span>)}</div>
          <p className="hint" style={{ marginTop: 12 }}>Pincodes starting with {c.pin.join(', ')}. Check yours while booking.</p>
        </div>
        <div className="block"><h2>Services in {c.name}</h2><SvcGrid style={{ gridTemplateColumns: 'repeat(2,1fr)' }} href={s => `/locations/${c.slug}/${s.slug}`} /></div>
        <div className="block"><h2>Families in {c.name} say</h2><ReviewCards list={REVIEWS.filter(r => r.where.includes(c.name)).concat(REVIEWS.filter(r => !r.where.includes(c.name))).slice(0, 3)} /></div>
      </div>
      <aside className="sticky">
        <div className="card"><h3>{c.name} care office</h3><p className="muted">Branch address to be added.</p>
          <p><a href={TEL}>{PHONE}</a><br /><a href={`mailto:${c.slug}@welloracare.in`}>{c.slug}@welloracare.in</a></p>
          <p className="muted" style={{ margin: 0 }}>Care line open 24 hours. Office visits 9 am to 6 pm, Monday to Saturday.</p>
        </div>
        <div className="form-card" style={{ marginTop: 16 }}><h3>Get a call back</h3><EnquiryForm city={c.slug} message={false} /></div>
      </aside>
    </div></section>
    <CtaBand />
  </>
}

/* ---------------- Packages ---------------- */
export function Packages() {
  usePageTitle('Care plans and pricing | Wellora Care')
  const { openEnquiry } = useContext(AppCtx)
  const rows = [
    ['Daily caregiver or nurse', 'Nurse, 12 hours', 'Caregiver, 12 hours', 'No'],
    ['Doctor visits', '2 in 30 days', '1 a month', '4 a year'],
    ['Physiotherapy', '10 sessions', 'On request', 'On request'],
    ['Lab tests', 'As prescribed', 'On request', '4 health packages'],
    ['Counselling', 'On request', 'On request', '4 sessions'],
    ['Supervisor review', 'Weekly', 'Weekly nurse check', 'Quarterly'],
  ]
  return <>
    <PageHead title="Care plans" lede="Bundles for common situations, so you know what's covered and what it costs." trail={[['Care plans']]} />
    <section className="section"><div className="wrap">
      <div className="cards3">
        {PLANS.map(p => (
          <div className={'card' + (p.featured ? ' feature' : '')} key={p.id}>
            <h3>{p.name}</h3><p className="muted">{p.best}</p><div className="price">{p.price}</div><p className="muted">{p.period}</p>
            <Ticks items={p.items} />
            <button className={`btn ${p.featured ? 'btn-soft' : 'btn-primary'}`} onClick={() => openEnquiry('other', `Interested in the ${p.name} plan`)}>Ask about this plan</button>
          </div>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 14 }}>Indicative prices for Chennai. Final pricing follows a free assessment.</p>
    </div></section>
    <section className="section tint"><div className="wrap"><h2>Compare plans</h2>
      <div className="tbl-wrap"><table>
        <thead><tr><th>Included</th>{PLANS.map(p => <th key={p.id}>{p.name}</th>)}</tr></thead>
        <tbody>{rows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
      </table></div>
    </div></section>
    <section className="section"><div className="wrap split" style={{ alignItems: 'start' }}>
      <div><h2>Need something different?</h2><p className="lede">Tell us what your parent needs and we'll build a custom plan, usually within a day.</p>
        <Ticks items={['Mix any of our nine services', "Change or pause the plan with 3 days' notice", 'One monthly invoice']} />
      </div>
      <div className="form-card"><h3>Request a custom plan</h3><EnquiryForm kind="custom-plan" service="other" cta="Request my plan" /></div>
    </div></section>
  </>
}

/* ---------------- Blog ---------------- */
export function Blog() {
  usePageTitle('Care library | Wellora Care')
  const [q] = useSearchParams()
  const cat = q.get('cat') || 'All'
  const cats = ['All', ...new Set(POSTS.map(p => p.cat))]
  return <>
    <PageHead title="Care library" lede="Practical guides for families caring for parents at home, reviewed by our clinical team." trail={[['Care library']]} />
    <section className="section"><div className="wrap">
      <div className="filters">{cats.map(c => <Link key={c} className={`btn btn-sm ${c === cat ? 'btn-primary' : 'btn-soft'}`} to={'/blog' + (c === 'All' ? '' : '?cat=' + encodeURIComponent(c))}>{c}</Link>)}</div>
      <PostCards list={POSTS.filter(p => cat === 'All' || p.cat === cat)} />
    </div></section>
  </>
}

export function Post() {
  const { slug } = useParams()
  const { openEnquiry } = useContext(AppCtx)
  const p = POSTS.find(x => x.slug === slug)
  usePageTitle(p ? `${p.title} | Wellora Care` : 'Page not found | Wellora Care')
  if (!p) return <NotFound />
  return <>
    <section className="page-head"><div className="wrap narrow">
      <Crumbs trail={[['Care library', '/blog'], [p.cat]]} />
      <h1 style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)' }}>{p.title}</h1>
      <p className="muted">{p.date}, {p.mins} min read. Written by the Wellora Care team. Clinical review details to be added.</p>
    </div></section>
    <section className="section"><div className="wrap narrow article">
      {p.body.map(([h, t], i) => <div key={i}>{h && <h2>{h}</h2>}<p>{t}</p></div>)}
      <div className="note" style={{ marginTop: 30 }}>This article is general information, not medical advice. Speak to a doctor about your parent's situation.</div>
      <div className="cta-band" style={{ marginTop: 30 }}>
        <div><h2 style={{ fontSize: '1.5rem' }}>Want help putting this into practice?</h2><p style={{ margin: 0, opacity: 0.9 }}>A care advisor can suggest the right support at home.</p></div>
        <div className="btn-row"><button className="btn btn-primary" onClick={() => openEnquiry()}>Talk to an advisor</button></div>
      </div>
    </div></section>
    <section className="section tint"><div className="wrap"><h2>Keep reading</h2><PostCards list={POSTS.filter(x => x.slug !== slug).slice(0, 3)} /></div></section>
  </>
}

/* ---------------- Careers ---------------- */
export function Careers() {
  usePageTitle('Careers | Wellora Care')
  const [q] = useSearchParams()
  const city = q.get('city') || 'All'
  const list = JOBS.filter(j => city === 'All' || j.city === city)
  return <>
    <PageHead title="Work with us" lede="Join nurses, therapists and caregivers who make home the best place to recover." trail={[['Careers']]} />
    <section className="section"><div className="wrap">
      <div className="cards3" style={{ marginBottom: 40 }}>
        <div className="card"><h3>Fair, on-time pay</h3><p className="muted" style={{ margin: 0 }}>Monthly salary credited on time, with shift and travel allowances.</p></div>
        <div className="card"><h3>Training that grows you</h3><p className="muted" style={{ margin: 0 }}>Elder care, critical care and communication courses, with certificates.</p></div>
        <div className="card"><h3>Support on every case</h3><p className="muted" style={{ margin: 0 }}>A supervisor you can call any time, and a team that has your back.</p></div>
      </div>
      <div className="section-head"><h2>Open roles</h2>
        <div className="filters" style={{ margin: 0 }}>{['All', ...CITIES.map(c => c.name)].map(c => <Link key={c} className={`btn btn-sm ${c === city ? 'btn-primary' : 'btn-soft'}`} to={'/careers' + (c === 'All' ? '' : '?city=' + c)}>{c}</Link>)}</div>
      </div>
      {list.length ? (
        <div className="tool">{list.map(j => (
          <div className="row-item" key={j.id}>
            <div><b>{j.role}</b><div className="meta">{j.city}, {j.type}, {j.exp}</div></div>
            <Link className="btn btn-ghost btn-sm" to={`/careers/${j.id}`}>View and apply</Link>
          </div>
        ))}</div>
      ) : <div className="empty">No open roles in {city} right now. Send your CV and we'll contact you when one opens.</div>}
    </div></section>
  </>
}

export function Job() {
  const { id } = useParams()
  const j = JOBS.find(x => x.id === id)
  usePageTitle(j ? `${j.role}, ${j.city} | Wellora Care careers` : 'Page not found | Wellora Care')
  if (!j) return <NotFound />
  return <>
    <PageHead title={j.role} lede={`${j.city}. ${j.type}. ${j.exp}.`} trail={[['Careers', '/careers'], [j.role]]} />
    <section className="section"><div className="wrap layout">
      <div className="prose">
        <h2>About the role</h2><p>You will provide care to patients in their homes, following care plans set by our clinical team and keeping families informed with clear daily notes.</p>
        <h2>What you'll need</h2><ul><li>{j.qual}</li><li>Experience: {j.exp}</li><li>Kind, patient and clear in how you communicate</li><li>Comfortable travelling within the city</li></ul>
        <h2>What you'll get</h2><ul><li>Monthly salary with shift and travel allowances</li><li>Paid training and certifications</li><li>Health insurance</li><li>A supervisor available every day</li></ul>
      </div>
      <div className="form-card"><h3>Apply for this role</h3>
        <LeadForm kind="job-application">
          <input type="hidden" name="role" value={j.role} /><input type="hidden" name="jobcity" value={j.city} />
          <Field name="name" label="Full name" required />
          <Field name="mobile" label="Mobile number" required type="tel" />
          <Field name="email" label="Email" type="email" />
          <Field name="qualification" label="Highest qualification" required />
          <Field name="experience" label="Years of experience" type="number" min="0" max="50" />
          <Field name="registration" label="Council registration number" help="For nurses and therapists" />
          <Field name="cv" label="Upload CV" type="file" required accept=".pdf,.doc,.docx" help="PDF or Word, up to 5 MB" />
          <Consent /><button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Send application</button>
        </LeadForm>
      </div>
    </div></section>
  </>
}

/* ---------------- Contact, FAQs, etc ---------------- */
export function Contact() {
  usePageTitle('Contact us | Wellora Care')
  return <>
    <PageHead title="Contact us" lede="Talk to a care advisor any time. We usually call back within 5 minutes." trail={[['Contact']]} />
    <section className="section"><div className="wrap split" style={{ alignItems: 'start' }}>
      <div>
        <div className="card" style={{ marginBottom: 16 }}><h3>Call or message</h3>
          <div className="row-item"><span>Care line, 24 hours</span><a href={TEL}>{PHONE}</a></div>
          <div className="row-item"><span>WhatsApp</span><a href={WA} target="_blank" rel="noopener noreferrer">Chat with us</a></div>
          <div className="row-item"><span>Email</span><a href="mailto:care@welloracare.in">care@welloracare.in</a></div>
          <div className="row-item"><span>Careers</span><a href="mailto:careers@welloracare.in">careers@welloracare.in</a></div>
        </div>
        <div className="card"><h3>Our cities</h3>
          {CITIES.map(c => <div className="row-item" key={c.slug}><span><b>{c.name}</b><br /><span className="meta">Branch address to be added</span></span><Link className="btn btn-soft btn-sm" to={`/locations/${c.slug}`}>Details</Link></div>)}
        </div>
        <p style={{ marginTop: 18 }}><Link to="/refer">Refer a patient</Link> &nbsp; <Link to="/partner">Partner with us</Link></p>
      </div>
      <div className="form-card"><h3>Send us a message</h3><EnquiryForm kind="contact" callback cta="Send message" /></div>
    </div></section>
  </>
}

export function Faqs() {
  usePageTitle('Frequently asked questions | Wellora Care')
  const [q] = useSearchParams()
  const navigate = useNavigate()
  const { openEnquiry } = useContext(AppCtx)
  const raw = q.get('q') || ''
  const term = raw.toLowerCase()
  const groups = FAQ_GROUPS.map(g => ({ name: g.name, items: g.items.filter(([a, b]) => !term || (a + b).toLowerCase().includes(term)) })).filter(g => g.items.length)
  return <>
    <PageHead title="Questions and answers" lede="Answers to what families ask us most." trail={[['FAQs']]} />
    <section className="section"><div className="wrap narrow">
      <form className="search-box" onSubmit={e => { e.preventDefault(); navigate('/faqs?q=' + encodeURIComponent(new FormData(e.currentTarget).get('q') || '')) }}>
        <input type="search" name="q" defaultValue={raw} key={raw} placeholder="Search questions" aria-label="Search questions" />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      {groups.length
        ? groups.map(g => <div key={g.name}><h2 style={{ fontSize: '1.4rem', marginTop: 30 }}>{g.name}</h2><FaqList items={g.items} /></div>)
        : <div className="empty">No answers match "{term}". <a href="#" onClick={e => { e.preventDefault(); openEnquiry() }}>Ask a care advisor</a></div>}
    </div></section>
    <CtaBand />
  </>
}

export function Testimonials() {
  usePageTitle('Family stories | Wellora Care')
  return <>
    <PageHead title="Family stories" lede="What families say about care at home with Wellora." trail={[['Family stories']]} />
    <section className="section"><div className="wrap">
      <ReviewCards list={REVIEWS} />
      <div className="note" style={{ marginTop: 24 }}>These are sample reviews for layout. Replace them with real, consented reviews before launch.</div>
    </div></section>
    <CtaBand />
  </>
}

export function Refer() {
  usePageTitle('Refer a patient | Wellora Care')
  const { city } = useContext(AppCtx)
  return <>
    <PageHead title="Refer a patient" lede="For hospitals, doctors and discharge teams. We contact the family within an hour and keep you updated." trail={[['Refer a patient']]} />
    <section className="section"><div className="wrap narrow"><div className="form-card">
      <LeadForm kind="referral">
        <h3>Referrer</h3>
        <div className="grid2"><Field name="refname" label="Your name" required /><Field name="hospital" label="Hospital or clinic" required /></div>
        <div className="grid2"><Field name="mobile" label="Your mobile number" required type="tel" /><Field name="email" label="Email" type="email" /></div>
        <h3 style={{ marginTop: 10 }}>Patient</h3>
        <div className="grid2"><Field name="pname" label="Patient name" required /><Field name="fmobile" label="Family contact number" required type="tel" /></div>
        <Field name="service" label="Care needed" type="select" required options={serviceOptions} placeholder="Choose a service" />
        <div className="grid2"><Field name="city" label="City" type="select" options={cityOptions} defaultValue={city} /><Field name="discharge" label="Expected discharge" type="date" /></div>
        <Field name="notes" label="Clinical notes" type="textarea" />
        <Consent>The patient or family has agreed to be contacted by Wellora Care.</Consent>
        <button className="btn btn-primary" type="submit">Send referral</button>
      </LeadForm>
    </div></div></section>
  </>
}

export function Partner() {
  usePageTitle('Partner with us | Wellora Care')
  return <>
    <PageHead title="Partner with us" lede="For hospitals, insurers, employers and senior living communities." trail={[['Partner with us']]} />
    <section className="section"><div className="wrap split" style={{ alignItems: 'start' }}>
      <div><Ticks items={[
        <><b>Hospitals:</b> smooth discharge to home with shared updates.</>,
        <><b>Insurers and TPAs:</b> home care for covered members with clear billing.</>,
        <><b>Employers:</b> elder-care support as an employee benefit.</>,
        <><b>Senior communities:</b> on-site nursing, physiotherapy and lab collections.</>,
      ]} /></div>
      <div className="form-card">
        <LeadForm kind="partnership">
          <Field name="org" label="Organisation" required />
          <Field name="ptype" label="Type" type="select" options={['Hospital', 'Insurer or TPA', 'Employer', 'Senior living', 'Other']} />
          <div className="grid2"><Field name="name" label="Your name" required /><Field name="mobile" label="Mobile number" required type="tel" /></div>
          <Field name="email" label="Work email" type="email" required />
          <Field name="message" label="How would you like to work together?" type="textarea" />
          <Consent /><button className="btn btn-primary" type="submit">Send enquiry</button>
        </LeadForm>
      </div>
    </div></section>
  </>
}

export function Legal() {
  const { k } = useParams()
  const l = LEGAL[k]
  usePageTitle(l ? `${l.title} | Wellora Care` : 'Page not found | Wellora Care')
  if (!l) return <NotFound />
  const others = Object.keys(LEGAL).filter(x => x !== k)
  return <>
    <PageHead title={l.title} lede="Draft for legal review. Last updated 2 October 2026." trail={[['Legal'], [l.title]]} />
    <section className="section"><div className="wrap narrow prose">
      {l.body.map(([h, t]) => <div key={h}><h2>{h}</h2><p>{t}</p></div>)}
      <p className="muted" style={{ marginTop: 30 }}>Other policies: {others.map((x, i) => <span key={x}>{i > 0 && ', '}<Link to={`/legal/${x}`}>{LEGAL[x].title}</Link></span>)}</p>
    </div></section>
  </>
}

export function Search() {
  usePageTitle('Search | Wellora Care')
  const [q] = useSearchParams()
  const { openEnquiry } = useContext(AppCtx)
  const raw = q.get('q') || ''
  const term = raw.trim().toLowerCase()
  const hits = !term ? [] : [
    ...SERVICES.filter(s => (s.name + s.short + s.intro + s.includes.join(' ')).toLowerCase().includes(term)).map(s => ['Service', s.name, '/services/' + s.slug, s.short]),
    ...NURSING_SUBS.filter(s => (s.name + s.short).toLowerCase().includes(term)).map(s => ['Nursing', s.name, '/services/nursing-services/' + s.slug, s.short]),
    ...POSTS.filter(p => (p.title + p.excerpt).toLowerCase().includes(term)).map(p => ['Article', p.title, '/blog/' + p.slug, p.excerpt]),
    ...FAQ_GROUPS.flatMap(g => g.items).filter(([a, b]) => (a + b).toLowerCase().includes(term)).map(([a, b]) => ['Question', a, '/faqs?q=' + encodeURIComponent(term), b]),
  ]
  return <>
    <PageHead title="Search" trail={[['Search']]}><SiteSearch initial={raw} placeholder="Search services, articles and questions" /></PageHead>
    <section className="section"><div className="wrap narrow">
      {!term ? <div className="empty">Type what you're looking for above.</div>
        : hits.length ? <>
          <p className="muted">{hits.length} result{hits.length > 1 ? 's' : ''} for "{term}"</p>
          <div className="tool">{hits.map(([t, n, h, d], i) => (
            <Link key={i} className="row-item" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} to={h}>
              <span className="badge">{t}</span><b style={{ display: 'block', marginTop: 6 }}>{n}</b><span className="meta">{d}</span>
            </Link>
          ))}</div>
        </> : <div className="empty">Nothing matches "{term}". Try "nurse", "oxygen" or "physiotherapy", or <a href="#" onClick={e => { e.preventDefault(); openEnquiry() }}>ask a care advisor</a>.</div>}
    </div></section>
  </>
}

export function NotFound() {
  usePageTitle('Page not found | Wellora Care')
  return (
    <section className="section"><div className="wrap narrow" style={{ textAlign: 'center' }}>
      <LogoMark size={80} />
      <h1>We couldn't find that page</h1>
      <p className="lede" style={{ margin: '0 auto 24px' }}>It may have moved. Try one of our services, or search.</p>
      <SiteSearch style={{ maxWidth: 520, margin: '0 auto 24px' }} />
      <div className="btn-row" style={{ justifyContent: 'center' }}>
        <Link className="btn btn-primary" to="/">Go to home</Link>
        <a className="btn btn-ghost" href={TEL}>Call {PHONE}</a>
      </div>
    </div></section>
  )
}
