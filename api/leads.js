import Busboy from 'busboy'
import { randomBytes } from 'node:crypto'
import { HttpError, db, fail, send } from './_lib/db.js'
import { afterCapture, contactKeyFor, ensureCrmSchema, findOpenLead, slaDue } from './_lib/crm.js'
import { ipHash } from './_lib/auth.js'

const MAX_TOTAL_BYTES = 4 * 1024 * 1024 // Vercel caps request bodies at 4.5 MB
const ALLOWED_MIME = /^(application\/pdf|image\/(jpeg|png|webp|heic|heif)|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/
const CRISIS = /suicid|kill (my|him|her)self|end (my|his|her) life|self[- ]?harm|want to die|no reason to live/i

// Required fields per form type. "files" lists file fields that must be attached.
const RULES = {
  enquiry: { req: ['name', 'mobile'] },
  'service-enquiry': { req: ['name', 'mobile'] },
  contact: { req: ['name', 'mobile'] },
  'custom-plan': { req: ['name', 'mobile'] },
  counselling: { req: ['name', 'mobile', 'concern', 'mode'] },
  'critical-care': { req: ['name', 'mobile', 'location', 'city'] },
  'medicine-order': { req: ['name', 'mobile', 'address', 'pincode'], files: ['rx'] },
  'job-application': { req: ['name', 'mobile', 'qualification', 'role'], files: ['cv'] },
  referral: { req: ['refname', 'hospital', 'mobile', 'pname', 'fmobile', 'service'] },
  partnership: { req: ['org', 'name', 'mobile', 'email'] },
  booking: { req: ['name', 'mobile', 'pname', 'age', 'address', 'locality', 'pincode', 'service', 'date', 'slot'] },
  unserviceable: { req: ['pincode'], noConsent: true },
}

const validPhone = v => {
  v = String(v || '').replace(/[\s-]/g, '')
  if (v.startsWith('+')) return /^\+\d{8,15}$/.test(v) && (!v.startsWith('+91') || /^\+91[6-9]\d{9}$/.test(v))
  return /^[6-9]\d{9}$/.test(v.replace(/^0/, ''))
}

function parse(req) {
  return new Promise((resolve, reject) => {
    const type = String(req.headers['content-type'] || '')
    if (!type.startsWith('multipart/form-data')) return reject(new HttpError(415, 'Send the form as multipart/form-data.'))
    const fields = {}
    const files = []
    let total = 0
    let tooBig = false
    let badType = false
    const bb = Busboy({ headers: req.headers, limits: { fields: 80, fieldSize: 5000, files: 6, fileSize: MAX_TOTAL_BYTES } })
    bb.on('field', (name, val) => {
      val = String(val).trim()
      if (!val) return
      fields[name] = fields[name] ? fields[name] + ', ' + val : val
    })
    bb.on('file', (field, stream, info) => {
      const chunks = []
      let size = 0
      if (!info.filename) { stream.resume(); return }
      if (!ALLOWED_MIME.test(info.mimeType)) badType = true
      stream.on('data', c => { size += c.length; total += c.length; if (total > MAX_TOTAL_BYTES) tooBig = true; else chunks.push(c) })
      stream.on('limit', () => { tooBig = true })
      stream.on('end', () => {
        if (!tooBig && !badType && size) files.push({ field, filename: info.filename.slice(0, 200), mime: info.mimeType, size, buf: Buffer.concat(chunks) })
      })
    })
    bb.on('error', reject)
    bb.on('close', () => {
      if (tooBig) return reject(new HttpError(413, 'Attachments are too large. Keep all files together under 4 MB, or send them on WhatsApp.'))
      if (badType) return reject(new HttpError(415, 'Attach PDF, JPG, PNG or Word files only.'))
      resolve({ fields, files })
    })
    req.pipe(bb)
  })
}

function validate(kind, f, files) {
  const rule = RULES[kind]
  if (!rule) throw new HttpError(400, 'Unknown form type.')
  const missing = rule.req.filter(k => !f[k])
  if (missing.length) throw new HttpError(422, `Please fill in: ${missing.join(', ')}.`)
  for (const k of ['mobile', 'fmobile']) if (f[k] && !validPhone(f[k])) throw new HttpError(422, 'Enter a 10-digit Indian mobile number, or include your country code.')
  if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) throw new HttpError(422, 'Enter a valid email address.')
  if (f.pincode && !/^\d{6}$/.test(f.pincode)) throw new HttpError(422, 'Enter a 6-digit pincode.')
  if (!rule.noConsent && !f.consent) throw new HttpError(422, 'Please tick the consent box.')
  for (const k of rule.files || []) if (!files.some(x => x.field === k)) throw new HttpError(422, 'Please attach the required file.')
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw new HttpError(405, 'Use POST.') }
    const { fields, files } = await parse(req)
    const { kind = '', page = '', website = '', ...data } = fields

    // Honeypot: bots fill the hidden "website" field. Pretend it worked.
    if (website) return send(res, 200, { ok: true, ref: 'WC-' + randomBytes(3).toString('hex').toUpperCase() })

    validate(kind, data, files)
    await ensureCrmSchema()
    const sql = db()

    const ip = ipHash(req)
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM leads WHERE ip_hash = ${ip} AND created_at > now() - interval '10 minutes'`
    if (n >= 10) throw new HttpError(429, 'Too many requests from this connection. Please call us instead.')

    let priority = kind === 'critical-care' ? 'High' : 'Normal'
    if (kind === 'counselling' && CRISIS.test(data.message || '')) priority = 'Crisis'

    // CRM: a repeat enquiry from a number with an open lead is attached to that lead (BRD CRM-FR-002).
    const contactKey = contactKeyFor(kind, data)
    const existing = await findOpenLead(sql, kind, contactKey)
    const stage = existing ? 'merged' : 'new'
    const due = existing ? null : slaDue(kind, priority)
    const city = data.city || null

    let row
    for (let i = 0; i < 3 && !row; i++) {
      const ref = 'WC-' + randomBytes(4).toString('hex').toUpperCase().slice(0, 6)
      const rows = await sql`
        INSERT INTO leads (ref, kind, priority, status, stage, name, mobile, service, city, data, page, ip_hash,
                           contact_key, duplicate_of, sla_due_at, stage_changed_at)
        VALUES (${ref}, ${kind}, ${priority}, ${existing ? 'closed' : 'new'}, ${stage}, ${data.name || data.refname || null}, ${data.mobile || null},
                ${data.service || null}, ${city}, ${JSON.stringify(data)}, ${String(page).slice(0, 300)}, ${ip},
                ${contactKey}, ${existing?.id ?? null}, ${due}, now())
        ON CONFLICT (ref) DO NOTHING
        RETURNING id, ref`
      row = rows[0]
    }
    if (!row) throw new Error('Could not create a reference number')

    for (const file of files) {
      await sql`INSERT INTO lead_files (lead_id, field, filename, mime, size, content_b64)
                VALUES (${row.id}, ${file.field}, ${file.filename}, ${file.mime}, ${file.size}, ${file.buf.toString('base64')})`
    }
    // Routing must never cost the customer their booking: the lead is already saved.
    try { await afterCapture(sql, row, { kind, priority, city, contactKey, existing }) } catch (e) { console.error('CRM routing failed', e) }
    send(res, 201, { ok: true, ref: row.ref, priority })
  } catch (e) {
    fail(res, e)
  }
}
