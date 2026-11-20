// Creates an admin login for the admin panel, or resets the password of an existing one.
//
//   node --env-file=.env.local scripts/create-admin.mjs you@example.com "Your Name"
//
// The password is asked for on the terminal (hidden). For non-interactive use,
// pass it in the ADMIN_PASSWORD environment variable instead.
import { createInterface } from 'node:readline'
import { checkNewPassword, ensureAdminSchema, hashPassword, normEmail } from '../api/_lib/users.js'
import { db } from '../api/_lib/db.js'

function askHidden(q) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = s => { if (s.includes(q)) rl.output.write(s) }
    rl.question(q, a => { rl.close(); process.stdout.write('\n'); resolve(a) })
  })
}

const email = normEmail(process.argv[2])
const name = process.argv[3] || null
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> ["Name"]')
  process.exit(1)
}

let password = process.env.ADMIN_PASSWORD
if (!password) {
  password = await askHidden('Password: ')
  if (password !== await askHidden('Repeat password: ')) { console.error('Passwords do not match.'); process.exit(1) }
}
try { checkNewPassword(password) } catch (e) { console.error(e.message); process.exit(1) }

await ensureAdminSchema()
const rows = await db()`
  INSERT INTO admin_users (email, name, password_hash) VALUES (${email}, ${name}, ${await hashPassword(password)})
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = COALESCE(EXCLUDED.name, admin_users.name), active = true
  RETURNING id, email, (xmax = 0) AS created`
console.log(`${rows[0].created ? 'Created' : 'Updated'} admin ${rows[0].email} (id ${rows[0].id}).`)
