import { createContext, useEffect, useState } from 'react'
import { PHONE, WA } from './data'

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

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

// Sends a form to the backend. Returns { ref, priority } or throws an Error with a readable message.
export async function submitLead(kind, fd) {
  fd.set('kind', kind)
  fd.set('page', location.hash || '#/')
  let total = 0
  for (const v of fd.values()) if (v instanceof File) total += v.size
  if (total > MAX_UPLOAD_BYTES) throw new Error('Attachments are too large. Keep all files together under 4 MB, or send them on WhatsApp.')
  let res
  try {
    res = await fetch('/api/leads', { method: 'POST', body: fd })
  } catch {
    throw new Error('We could not reach our server. Check your connection, or call us on ' + PHONE + '.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.ok) throw new Error(body.error || 'Something went wrong. Please call us on ' + PHONE + '.')
  return body
}

// Builds FormData from a plain object (arrays become repeated fields, File values become uploads).
export function toFormData(obj, files = {}) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(obj)) if (v !== undefined && v !== null && v !== '') fd.append(k, String(v))
  for (const [k, list] of Object.entries(files)) for (const f of list || []) fd.append(k, f, f.name)
  return fd
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
    if (el.type === 'file' && Array.from(el.files).reduce((a, x) => a + x.size, 0) > 4 * 1024 * 1024) set(el, 'Files must be under 4 MB in total.')
  }
  return errors
}
