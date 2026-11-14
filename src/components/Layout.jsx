import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppCtx, store } from '../utils'
import { CITIES, LEGAL, PHONE, SERVICES, TEL, WA } from '../data'
import { Logo } from './ui'

export function SiteSearch({ initial = '', style, cta = 'Search', placeholder = 'Search the site' }) {
  const navigate = useNavigate()
  return (
    <form className="search-box" style={style} onSubmit={e => { e.preventDefault(); navigate('/search?q=' + encodeURIComponent(new FormData(e.currentTarget).get('q') || '')) }}>
      <input type="search" name="q" defaultValue={initial} key={initial} placeholder={placeholder} aria-label="Search the site" />
      <button className="btn btn-primary" type="submit">{cta}</button>
    </form>
  )
}

function TopBar() {
  const { city, setCity } = useContext(AppCtx)
  return (
    <div className="topbar"><div className="wrap">
      <a href={TEL}>24x7 care line: {PHONE}</a>
      <a className="hide-sm" href={WA} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
      <a className="hide-sm" href="mailto:care@welloracare.in">care@welloracare.in</a>
      <Link className="hide-sm" to="/search" style={{ marginLeft: 'auto' }}>Search</Link>
      <label className="city"><span className="hide-sm" style={{ whiteSpace: 'nowrap' }}>Your city</span>
        <select aria-label="Choose your city" value={city} onChange={e => setCity(e.target.value)}>
          {CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
    </div></div>
  )
}

function Header({ onBurger }) {
  const loc = useLocation()
  const [sub, setSub] = useState(false)
  useEffect(() => setSub(false), [loc])
  useEffect(() => {
    const h = e => e.key === 'Escape' && setSub(false)
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])
  const top = '/' + (loc.pathname.split('/')[1] || '')
  const item = (to, label, cls) => <li className={cls}><Link to={to} aria-current={top === to ? 'page' : undefined}>{label}</Link></li>
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="brand" to="/" aria-label="Wellora Care home"><Logo size={40} /></Link>
        <ul className="menu">
          {item('/about', 'About us')}
          <li className={'has-sub' + (sub ? ' open' : '')}>
            <button aria-haspopup="true" aria-expanded={sub} onClick={() => setSub(v => !v)}>Services <span aria-hidden="true">&#9662;</span></button>
            <ul className="dropdown">
              {SERVICES.map(s => s.subs ? (
                <li className="has-sub" key={s.slug}>
                  <Link to={`/services/${s.slug}`} aria-haspopup="true">{s.name} <span aria-hidden="true">&rsaquo;</span></Link>
                  <ul className="dropdown flyout">{s.subs.map(x => <li key={x.slug}><Link to={`/services/${s.slug}/${x.slug}`}>{x.name}</Link></li>)}</ul>
                </li>
              ) : <li key={s.slug}><Link to={`/services/${s.slug}`}>{s.name}</Link></li>)}
            </ul>
          </li>
          {item('/locations', 'Locations')}
          {item('/testimonials', 'Testimonials', 'opt-nav')}
          {item('/packages', 'Care plans')}
          {item('/blog', 'Blog', 'opt-nav')}
          {item('/careers', 'Careers')}
          {item('/contact', 'Contact')}
        </ul>
        <Link className="btn btn-primary nav-cta" to="/book">Book a service</Link>
        <button className="burger" onClick={onBurger} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
    </header>
  )
}

function Drawer({ open, onClose }) {
  return (
    <nav className={'drawer' + (open ? ' open' : '')} aria-label="Mobile menu">
      <div className="top">
        <Link className="brand" to="/"><Logo size={36} /></Link>
        <button className="burger" style={{ display: 'grid', margin: 0 }} onClick={onClose} aria-label="Close menu">&times;</button>
      </div>
      <SiteSearch style={{ marginTop: 0 }} cta="Go" placeholder="Search" />
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About us</Link></li>
        <li><details><summary>Services</summary><ul>
          {SERVICES.map(s => (
            <li key={s.slug}><Link to={`/services/${s.slug}`}>{s.name}</Link>
              {s.subs && <ul>{s.subs.map(x => <li key={x.slug}><Link to={`/services/${s.slug}/${x.slug}`}>{x.name}</Link></li>)}</ul>}
            </li>
          ))}
        </ul></details></li>
        {[['/locations', 'Locations'], ['/testimonials', 'Testimonials'], ['/packages', 'Care plans'], ['/blog', 'Blog'], ['/careers', 'Careers'], ['/contact', 'Contact'], ['/faqs', 'FAQs']].map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}
      </ul>
      <Link className="btn btn-primary" to="/book" style={{ width: '100%', marginTop: 20 }}>Book a service</Link>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="site-footer"><div className="wrap">
      <div className="foot-grid">
        <div>
          <Link className="brand" to="/"><Logo size={40} /></Link>
          <p style={{ marginTop: 16, opacity: 0.85, maxWidth: '34ch' }}>Home healthcare and elder care for families across South India.</p>
          <p><a href={TEL}>{PHONE}</a><br /><a href="mailto:care@welloracare.in">care@welloracare.in</a></p>
        </div>
        <div><h4>Services</h4><ul>{SERVICES.map(s => <li key={s.slug}><Link to={`/services/${s.slug}`}>{s.name}</Link></li>)}</ul></div>
        <div><h4>Company</h4><ul>
          {[['/about', 'About us'], ['/packages', 'Care plans'], ['/testimonials', 'Family stories'], ['/blog', 'Care library'], ['/careers', 'Careers'], ['/refer', 'Refer a patient'], ['/partner', 'Partner with us'], ['/faqs', 'FAQs'], ['/contact', 'Contact']].map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}
        </ul></div>
        <div>
          <h4>Cities</h4><ul>{CITIES.map(c => <li key={c.slug}><Link to={`/locations/${c.slug}`}>{c.name}</Link></li>)}</ul>
          <h4 style={{ marginTop: 22 }}>Policies</h4><ul>{Object.keys(LEGAL).map(k => <li key={k}><Link to={`/legal/${k}`}>{LEGAL[k].title}</Link></li>)}</ul>
        </div>
      </div>
      <div className="foot-base">
        <span>&copy; 2026 Wellora Care. Not an emergency service: call 108 or 112 in an emergency.</span>
        <span>Demo site: phone numbers, prices, addresses and reviews are placeholders.</span>
      </div>
    </div></footer>
  )
}

function CookieBar() {
  const [ok, setOk] = useState(() => store.get('wellora-cookie', false))
  if (ok) return null
  return (
    <div className="cookie" role="region" aria-label="Cookie notice">
      <p style={{ margin: '0 0 12px' }}>We use only essential browser storage to remember your city and cart. <Link to="/legal/cookies">Learn more</Link></p>
      <button className="btn btn-primary btn-sm" onClick={() => { store.set('wellora-cookie', true); setOk(true) }}>Okay</button>
    </div>
  )
}

export default function Layout({ children }) {
  const { openEnquiry } = useContext(AppCtx)
  const [drawer, setDrawer] = useState(false)
  const loc = useLocation()
  useEffect(() => { setDrawer(false); window.scrollTo(0, 0) }, [loc.pathname, loc.search])
  useEffect(() => {
    const h = e => e.key === 'Escape' && setDrawer(false)
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])
  return (
    <>
      <a className="skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
      <TopBar />
      <Header onBurger={() => setDrawer(true)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      <a className="wa-float" href={WA + '?text=Hello%20Wellora%20Care%2C%20I%20need%20help%20with%20care%20at%20home'} target="_blank" rel="noopener noreferrer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" /></svg>
        Chat on WhatsApp
      </a>
      <div className="mbar">
        <a href={TEL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>Call</a>
        <a href={WA} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" /></svg>WhatsApp</a>
        <button onClick={() => openEnquiry()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H8l-4 4z" /><path d="M8 9h8M8 12h5" /></svg>Enquire</button>
      </div>
      <CookieBar />
    </>
  )
}
