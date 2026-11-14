import { useEffect, useMemo, useRef, useState } from 'react'
import { HashRouter, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AppCtx, store } from './utils'
import Layout from './components/Layout'
import { EnquiryForm } from './components/ui'
import ServicePage from './pages/Service'
import Book from './pages/Book'
import { About, Blog, Careers, City, Contact, Faqs, Home, Job, Legal, Locations, NotFound, Packages, Partner, Post, Refer, Search, Services, Testimonials } from './pages/Pages'

function ServiceRoute() {
  const { slug, sub } = useParams()
  return <ServicePage key={slug + sub} slug={slug} subSlug={sub} />
}
function CityServiceRoute() {
  const { city, slug } = useParams()
  return <ServicePage key={city + slug} slug={slug} citySlug={city} />
}
function BookRoute() {
  const { search } = useLocation()
  return <Book key={search} />
}

function EnquiryDialog({ enq, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (enq && d && !d.open) d.showModal?.()
    if (!enq && d?.open) d.close()
  }, [enq])
  return (
    <dialog ref={ref} aria-labelledby="enq-title" onClose={onClose}>
      <div className="dlg">
        <button className="x" onClick={onClose} aria-label="Close">&times;</button>
        <h3 id="enq-title">Talk to a care advisor</h3>
        <p className="muted">Share a few details and we will call you back within 5 minutes, 8 am to 10 pm.</p>
        {enq && <EnquiryForm key={enq.n} service={enq.service} msg={enq.msg} callback />}
      </div>
    </dialog>
  )
}

export default function App() {
  const [city, setCityState] = useState(() => store.get('wellora-city', 'chennai'))
  const [enq, setEnq] = useState(null)
  const ctx = useMemo(() => ({
    city,
    setCity: c => { setCityState(c); store.set('wellora-city', c) },
    openEnquiry: (service = '', msg = '') => setEnq({ service, msg, n: Date.now() }),
  }), [city])

  return (
    <AppCtx.Provider value={ctx}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceRoute />} />
            <Route path="/services/:slug/:sub" element={<ServiceRoute />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/locations/:city" element={<City />} />
            <Route path="/locations/:city/:slug" element={<CityServiceRoute />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/book" element={<BookRoute />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Post />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:id" element={<Job />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/refer" element={<Refer />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/legal/:k" element={<Legal />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <EnquiryDialog enq={enq} onClose={() => setEnq(null)} />
      </HashRouter>
    </AppCtx.Provider>
  )
}
