import { createContext, useEffect, useState } from 'react'
import { WA } from './data'

export const AppCtx = createContext(null)

export const inr = n => '₹' + Math.round(Number(n)).toLocaleString('en-IN')

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } },
}

export function usePersisted(key, initial) {
  const [v, setV] = useState(() => store.get(key, initial))
  useEffect(() => { store.set(key, v) }, [key, v])
  return [v, setV]
}

export function saveLead(data) {
  const ref = 'WC-' + Date.now().toString(36).toUpperCase().slice(-6)
  const leads = store.get('wellora-leads', [])
  leads.push({ ref, at: new Date().toISOString(), page: location.hash || '#/', ...data })
  store.set('wellora-leads', leads)
  return ref
}

export const waLink = text => WA + '?text=' + encodeURIComponent(text)

export function validPhone(v) {
  v = String(v || '').replace(/[\s-]/g, '')
  if (v.startsWith('+')) return /^\+\d{8,15}$/.test(v) && (!v.startsWith('+91') || /^\+91[6-9]\d{9}$/.test(v))
  return /^[6-9]\d{9}$/.test(v.replace(/^0/, ''))
}

export const CRISIS = /suicid|kill (my|him|her)self|end (my|his|her) life|self[- ]?harm|want to die|no reason to live/i

export function usePageTitle(title) {
  useEffect(() => { document.title = title }, [title])
}

export function validateForm(f) {
  const errors = {}
  const set = (el, m) => { if (!errors[el.name]) errors[el.name] = m }
  for (const el of f.elements) {
    if (!el.name) continue
    if (el.required) {
      const bad = el.type === 'checkbox' ? !el.checked : el.type === 'file' ? !el.files.length : !String(el.value).trim()
      if (bad) { set(el, el.type === 'checkbox' ? 'Please tick to continue.' : el.type === 'file' ? 'Please attach a file.' : 'This field is required.'); continue }
    }
    const v = String(el.value || '').trim()
    if (el.type === 'tel' && v && !validPhone(v)) set(el, 'Enter a 10-digit Indian mobile number, or include your country code.')
    if (el.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) set(el, 'Enter a valid email address.')
    if (el.name === 'pincode' && v && !/^\d{6}$/.test(v)) set(el, 'Enter a 6-digit pincode.')
    if (el.type === 'file' && Array.from(el.files).some(x => x.size > 10 * 1024 * 1024)) set(el, 'Each file must be under 10 MB.')
  }
  return errors
}
