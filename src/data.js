export const PHONE = "+91 90000 12345", TEL = "tel:+919000012345", WA = "https://wa.me/919000012345";
export const ICONS = {
  doctor: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
  counsel: '<path d="M4 5h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-3-3h-3"/>',
  critical: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  nursing: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 8v6M9 11h6"/>',
  physio: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v6l-4 7M12 13l4 7M6 10h12"/>',
  lab: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
  medicine: '<path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="M8.5 8.5l7 7"/>',
  ambulance: '<path d="M2 7h11v9H2zM13 10h4l4 3v3h-8"/><path d="M7.5 9v4M5.5 11h4"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  equipment: '<path d="M3 6v12M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="1.6"/>'
};
/* ---------- content data ---------- */
export const CITIES = [
  { slug: "chennai", name: "Chennai", pin: ["600", "601", "603"], areas: ["Anna Nagar", "Adyar", "T. Nagar", "Velachery", "Mylapore", "Porur", "OMR", "Tambaram"] },
  { slug: "bengaluru", name: "Bengaluru", pin: ["560", "562"], areas: ["Jayanagar", "Indiranagar", "Whitefield", "Koramangala", "Malleswaram", "HSR Layout", "Hebbal", "JP Nagar"] },
  { slug: "coimbatore", name: "Coimbatore", pin: ["641"], areas: ["RS Puram", "Saibaba Colony", "Peelamedu", "Gandhipuram", "Race Course", "Saravanampatti"] },
  { slug: "hyderabad", name: "Hyderabad", pin: ["500", "501", "502"], areas: ["Banjara Hills", "Jubilee Hills", "Kondapur", "Gachibowli", "Begumpet", "Kukatpally", "Secunderabad"] }
];
export const cityBySlug = s => CITIES.find(c => c.slug === s);
export const pinCity = pin => CITIES.find(c => c.pin.some(p => String(pin).startsWith(p)));

export const NURSING_SUBS = [
  { slug: "home-nursing", name: "Nursing care at home", short: "8, 12 or 24 hour shifts and live-in nursing.", price: "from \u20B91,400 per 12-hour shift", rx: false },
  { slug: "injection-iv", name: "Injection and IV therapy", short: "Injections, IV fluids and antibiotics as prescribed.", price: "from \u20B9450 per visit", rx: true },
  { slug: "wound-care", name: "Wound care and dressing", short: "Surgical, pressure-sore and diabetic wound dressing.", price: "from \u20B9600 per visit", rx: false },
  { slug: "catheter-care", name: "Catheter care", short: "Urinary catheter insertion, change and care.", price: "from \u20B9900 per visit", rx: true },
  { slug: "ryles-tube-care", name: "Ryles tube care", short: "Feeding tube insertion, feeding and care.", price: "from \u20B9900 per visit", rx: true },
  { slug: "tracheostomy-care", name: "Tracheostomy care", short: "Tube cleaning, suctioning and dressing.", price: "from \u20B91,000 per visit", rx: false },
  { slug: "post-operative-care", name: "Post-operative nursing", short: "Recovery care in the weeks after surgery.", price: "from \u20B91,600 per 12-hour shift", rx: false },
  { slug: "bedridden-care", name: "Bedridden patient care", short: "Positioning, hygiene and pressure-sore prevention.", price: "from \u20B91,400 per 12-hour shift", rx: false }
];

export const SERVICES = [
  {
    slug: "doctor-visits-to-home", name: "Doctor Visits to Home", icon: "doctor", tool: "doctor",
    short: "A physician at your parent's bedside, same day or scheduled.",
    intro: "Our doctors examine, review medicines and adjust treatment at home, so your parent skips the waiting room, the traffic and the tiring trip.",
    forWho: ["Seniors who find travelling to a clinic tiring or unsafe", "Patients recently discharged from hospital", "Regular reviews of diabetes, blood pressure, heart and thyroid conditions", "Fever, infections and new symptoms that are not emergencies"],
    includes: ["Full examination with vitals and oxygen level", "Review of current medicines and earlier reports", "Digital prescription shared on WhatsApp after the visit", "Referral for lab tests, physiotherapy or nursing when needed", "Follow-up visit with the same doctor"],
    team: "MBBS physicians registered with the state medical council, with geriatricians and specialists available on request.",
    steps: [["Share the concern", "Choose a doctor type and tell us the symptoms."], ["Pick a time", "Book the earliest slot or a time that suits you."], ["Meet the doctor", "You get the doctor's name and registration before the visit."], ["Get the prescription", "It arrives on WhatsApp right after the visit."]],
    pricing: [["General physician visit", "from \u20B91,200"], ["Geriatrician visit", "from \u20B91,800"], ["Follow-up within 7 days", "from \u20B9800"]],
    faqs: [["How soon can a doctor come?", "When a doctor is free nearby we can visit the same day. Otherwise we book the earliest slot, usually within 24 hours."], ["Can the doctor give an injection or start IV fluids?", "The doctor can prescribe them, and a Wellora nurse can give them at home on the same or the next day."], ["Is this service for emergencies?", "No. For chest pain, breathlessness, signs of stroke, fainting or heavy bleeding, call 108 or 112 straight away."]]
  },
  {
    slug: "geriatric-counseling", name: "Geriatric counseling", icon: "counsel", tool: "counsel",
    short: "Someone to talk to, for seniors and the families who care for them.",
    intro: "Trained counsellors help with loneliness, low mood, grief, memory worries and caregiver stress, at home, on video or by phone, in the language your parent is most at ease in.",
    forWho: ["Seniors feeling lonely, anxious or low after retirement, illness or loss", "Families noticing memory changes and unsure what to do next", "Caregivers who feel exhausted or stretched thin", "Families facing difficult decisions about care"],
    includes: ["Private one-to-one sessions of about 50 minutes", "Family sessions to plan care together", "Caregiver support sessions", "Memory screening (not a diagnosis) with referral when needed", "Simple practices to try between sessions"],
    team: "Counselling and clinical psychologists, registered with the Rehabilitation Council of India where required, and geriatric social workers.",
    steps: [["Tell us what is happening", "Share the concern and the preferred language."], ["Choose how to meet", "At home, on video or on a phone call."], ["First session", "Your counsellor listens and suggests a plan."], ["Keep going together", "Continue with the number of sessions you agree on."]],
    pricing: [["Video or phone session", "from \u20B9900"], ["Session at home", "from \u20B91,500"], ["Pack of 4 sessions", "from \u20B93,200"]],
    faqs: [["Will my parent's conversations be kept private?", "Yes. What is said in a session stays with the counsellor. We share a summary with family only if your parent agrees."], ["My father refuses to see a counsellor. What can we do?", "Start with a family session or a caregiver session. Many seniors open up later once the idea feels familiar."], ["Is this the same as seeing a psychiatrist?", "No. Counselling is talk-based support. If medicines may help, the counsellor will suggest seeing a psychiatrist."]]
  },
  {
    slug: "critical-care-at-home", name: "Critical Care at Home", icon: "critical", tool: "critical",
    short: "ICU-level monitoring and life support, set up at home.",
    intro: "When someone you love needs close monitoring after the ICU, we bring trained ICU nurses, a supervising doctor and the right equipment home. Every setup starts with a clinical assessment.",
    forWho: ["Patients stepping down from the ICU who still need monitoring", "People who depend on a ventilator, BiPAP or tracheostomy", "Bedridden patients with complex medical needs", "Families choosing comfort-focused care at home"],
    includes: ["ICU-trained nurses in 12 or 24 hour shifts", "Visits by an intensivist or physician as per the care plan", "Ventilator, BiPAP, monitor, oxygen, suction and ICU bed", "Respiratory therapy and physiotherapy", "Daily updates to the family and the treating doctor", "A written plan for moving to hospital if needed"],
    team: "ICU nurses with critical care experience, supervised by an intensivist, supported by respiratory therapists and a dedicated care coordinator.",
    steps: [["Request an urgent callback", "A coordinator calls you within 15 minutes."], ["Share the discharge summary", "Upload it or send it on WhatsApp."], ["Clinical assessment", "At the hospital or at home, at no extra cost."], ["Agree on the plan", "You receive a written care plan and quote."], ["Setup and care begin", "Equipment is installed and the team arrives."]],
    pricing: [["Clinical assessment", "Included with the care plan"], ["Home ICU care", "Quoted after assessment"]],
    faqs: [["How fast can you set up ICU care at home?", "In most cities we aim to be set up within 24 hours of approving the care plan."], ["What if my parent's condition gets worse?", "The nurse follows an agreed escalation plan, contacts the supervising doctor and arranges a hospital transfer if needed."], ["Is home ICU right for everyone?", "No. Our doctor will tell you honestly if hospital care is the safer choice."]]
  },
  {
    slug: "nursing-services", name: "Nursing Services", icon: "nursing", tool: "nursing", subs: NURSING_SUBS,
    short: "Registered nurses for a single procedure or round-the-clock care.",
    intro: "From a quick injection to 24-hour nursing after surgery, our registered nurses bring hospital-grade care home, with a supervisor checking in on every long-term case.",
    forWho: ["Patients recovering after surgery or a hospital stay", "Bedridden seniors who need skilled daily care", "People living with long-term conditions", "Anyone needing injections, dressings or tube care at home"],
    includes: ["Vital signs monitoring and medicine management", "Injections, IV therapy and infusions as prescribed", "Wound, catheter, feeding tube and tracheostomy care", "Bed bath, positioning and pressure-sore prevention", "Daily care notes shared with the family"],
    team: "GNM and BSc nurses registered with the state nursing council, police-verified and trained in elder care.",
    steps: [["Choose the care", "A single procedure visit or a shift."], ["Share the prescription", "Needed for injections, IV and catheter care."], ["Meet your nurse", "You get the nurse's profile before the first visit."], ["Care with supervision", "A nursing supervisor reviews long-term cases weekly."]],
    pricing: [["Procedure visit", "from \u20B9450"], ["12-hour shift", "from \u20B91,400"], ["24-hour live-in nursing", "from \u20B92,600 per day"]],
    faqs: [["Can I request a female nurse?", "Yes. Tell us your preference for gender and language and we will match it wherever possible."], ["What if we are not happy with the nurse?", "Ask for a replacement any time. We arrange one, usually within 24 hours."], ["Do nurses need a doctor's prescription?", "Yes, for injections, IV therapy and catheter procedures. Upload it while booking."]]
  },
  {
    slug: "physiotherapy-at-home", name: "Physiotherapy at Home", icon: "physio", tool: "physio",
    short: "Recovery and mobility sessions in the comfort of home.",
    intro: "A qualified physiotherapist assesses your parent at home, sets clear goals and works through them session by session, with exercises to keep up between visits.",
    forWho: ["Knee or hip replacement and fracture recovery", "Stroke, Parkinson's and other neurological conditions", "Back pain, neck pain and arthritis", "Seniors who want better balance and fewer falls"],
    includes: ["Assessment with pain, strength and mobility measures", "A written treatment plan with goals", "Hands-on therapy and guided exercise", "A home exercise sheet with simple instructions", "Progress review every five sessions"],
    team: "Physiotherapists with BPT or MPT degrees, specialising in orthopaedic, neurological, cardio-respiratory and geriatric care.",
    steps: [["Book an assessment", "Tell us the condition and any surgery date."], ["First visit", "The therapist assesses and starts treatment."], ["Agree on a plan", "Pick a session package that fits the goals."], ["Track progress", "Get a short progress report every five sessions."]],
    pricing: [["Single session", "from \u20B9800"], ["5 sessions", "from \u20B93,800"], ["10 sessions", "from \u20B97,200"], ["20 sessions", "from \u20B913,600"]],
    faqs: [["How long is each session?", "Usually 45 to 60 minutes, depending on the condition and how your parent is feeling."], ["Do we need equipment at home?", "Most sessions need none. If a walker or wheelchair would help, the therapist will suggest one."], ["When can physiotherapy start after surgery?", "Often within a few days of discharge, once the surgeon agrees. Share the discharge summary when booking."]]
  },
  {
    slug: "home-blood-collection", name: "Home Blood Collection", icon: "lab", tool: "lab",
    short: "Lab tests from home, with reports on your phone.",
    intro: "Choose the tests, pick a morning slot, and a trained phlebotomist collects the sample at home. Accredited partner labs send the report straight to your phone.",
    forWho: ["Seniors who need regular tests for diabetes, thyroid, kidney or heart health", "Patients on medicines that need monitoring", "Families booking yearly health checks for parents", "Anyone who would rather not wait at a lab"],
    includes: ["Collection by a trained phlebotomist using sealed, single-use kits", "Testing at NABL-accredited partner labs", "Digital report on WhatsApp and email", "Free collection on orders above \u20B9999", "Optional doctor review of the report"],
    team: "Trained phlebotomists working with NABL-accredited partner laboratories.",
    steps: [["Choose tests", "Search or pick a health package."], ["Pick a slot", "Fasting tests are collected early morning."], ["Sample collected", "At home, in about ten minutes."], ["Get the report", "Usually within 24 to 48 hours."]],
    pricing: [["Home collection", "\u20B9100, free above \u20B9999"], ["Senior health check", "from \u20B92,499"]],
    faqs: [["Do I need to fast?", "Only for some tests, such as fasting sugar and lipid profile. The test list shows this, and we remind you the night before."], ["Can I book tests for both parents together?", "Yes. Add both names in one booking and the phlebotomist collects both samples in one visit."], ["Can I just send the doctor's prescription?", "Yes. Upload it and our coordinator builds the test list and sends you the total."]]
  },
  {
    slug: "medicine-delivery-at-home", name: "Medicine Delivery at Home", icon: "medicine", tool: "medicine",
    short: "Prescribed medicines, checked by a pharmacist and delivered.",
    intro: "Upload the prescription and a licensed pharmacist checks it, confirms the medicines with you and sends them home. Set up monthly refills so your parent never runs out.",
    forWho: ["Seniors on regular, long-term medicines", "Bedridden patients and their carers", "Families managing a parent's medicines from another city"],
    includes: ["Prescription check by a registered pharmacist", "Your approval before any brand is substituted", "Same-day or next-day delivery in service areas", "GST invoice with batch number and expiry", "Monthly refill reminders"],
    team: "Licensed partner pharmacies with registered pharmacists.",
    steps: [["Upload the prescription", "A clear photo or PDF works."], ["Pharmacist check", "We confirm medicines and price with you."], ["Pay and track", "Online or on delivery."], ["Delivered home", "With a reminder before the next refill."]],
    pricing: [["Delivery", "Free above \u20B9500"], ["Medicines", "At MRP, with available discounts"]],
    faqs: [["Do I need a prescription?", "Yes, for all prescription medicines. Our pharmacist will not dispatch them without a valid one."], ["Will you change the brand?", "Only if you agree. We tell you the alternative and the price before packing."], ["Which medicines can't you deliver?", "We do not supply narcotic and other restricted medicines that the law does not allow for home delivery."]]
  },
  {
    slug: "non-emergency-ambulance", name: "Non-Emergency Ambulances", icon: "ambulance", tool: "ambulance",
    short: "Planned, comfortable patient transport with a trained crew.",
    intro: "Book a stretcher or oxygen-equipped vehicle for discharges, scheduled hospital visits, dialysis or city-to-city transfers. A trained attendant travels with your parent every time.",
    forWho: ["Hospital discharge back home", "Scheduled visits for dialysis, chemotherapy or scans", "Transfers between hospitals or cities", "Pickups from the airport or railway station"],
    includes: ["Stretcher, oxygen and basic monitoring as needed", "Trained attendant on every trip", "Nurse or doctor escort on request", "Help between the bed and the vehicle", "Vehicle and crew details before pickup"],
    team: "Drivers and attendants trained in basic life support, with nurse or doctor escorts available.",
    steps: [["Share the trip", "Pickup, drop, date and time."], ["Tell us the needs", "Stretcher, oxygen, escort."], ["See the fare", "Get an estimate before you confirm."], ["Ride with care", "Crew details arrive before pickup."]],
    pricing: [["Patient transport vehicle", "from \u20B9800 + \u20B925 per km"], ["Oxygen-equipped (BLS)", "from \u20B91,200 + \u20B930 per km"], ["Monitored transfer (ALS)", "from \u20B92,500 + \u20B945 per km"]],
    faqs: [["Can I use this in an emergency?", "No. This is for planned trips only. In an emergency, call 108 or 112."], ["How early should I book?", "At least 2 hours ahead within the city. Book inter-city transfers a day ahead."], ["Can family members travel along?", "Yes, usually one or two, depending on the vehicle."]]
  },
  {
    slug: "medical-equipment-and-consumables", name: "Medical Equipment and Consumables", icon: "equipment", tool: "equipment",
    short: "Rent or buy beds, oxygen and mobility aids, delivered and set up.",
    intro: "Rent or buy what recovery at home needs, from hospital beds to oxygen concentrators. We deliver, install, show you how to use it and collect it when you are done.",
    forWho: ["Families preparing a room for a patient coming home", "Patients who need oxygen or breathing support", "Seniors who need help moving around safely"],
    includes: ["Daily, weekly and monthly rental", "Delivery, installation and a short demo", "Maintenance and replacement during rental", "Pickup at the end and deposit refund", "Everyday care supplies, delivered"],
    team: "Trained technicians who install, service and sanitise every item between rentals.",
    steps: [["Choose rent or buy", "Pick the duration for rentals."], ["Book delivery", "Choose a slot that works."], ["Installed and explained", "Our technician sets it up and shows you how."], ["Extend or return", "Extend online, or schedule a pickup."]],
    pricing: [["Rental", "Daily, weekly or monthly"], ["Security deposit", "Refundable, varies by item"]],
    faqs: [["Do I need a prescription for an oxygen concentrator?", "We ask for one so the flow rate is set correctly and safely."], ["What happens if the equipment stops working?", "Call us. We repair or replace it, usually the same day in the city."], ["Is the equipment sanitised?", "Yes. Every item is cleaned and sanitised before each rental, and we keep a log."]]
  }
];
export const svcBySlug = s => SERVICES.find(x => x.slug === s);

export const LAB_TESTS = [
  { id: "cbc", name: "Complete blood count (CBC)", price: 350, fast: false, tat: "Same day", cat: "General" },
  { id: "fbs", name: "Fasting blood sugar", price: 150, fast: true, tat: "Same day", cat: "Diabetes" },
  { id: "hba1c", name: "HbA1c (3-month sugar average)", price: 450, fast: false, tat: "24 hours", cat: "Diabetes" },
  { id: "lipid", name: "Lipid profile", price: 600, fast: true, tat: "24 hours", cat: "Heart" },
  { id: "thyroid", name: "Thyroid profile (T3, T4, TSH)", price: 550, fast: false, tat: "24 hours", cat: "Thyroid" },
  { id: "kft", name: "Kidney function test", price: 700, fast: false, tat: "24 hours", cat: "Kidney" },
  { id: "lft", name: "Liver function test", price: 700, fast: false, tat: "24 hours", cat: "Liver" },
  { id: "vitd", name: "Vitamin D", price: 1200, fast: false, tat: "48 hours", cat: "Vitamins" },
  { id: "b12", name: "Vitamin B12", price: 900, fast: false, tat: "48 hours", cat: "Vitamins" },
  { id: "pkg-senior", name: "Senior health check, 58 parameters", price: 2499, fast: true, tat: "48 hours", cat: "Packages" },
  { id: "pkg-diab", name: "Diabetes care package", price: 1299, fast: true, tat: "24 hours", cat: "Packages" },
  { id: "pkg-heart", name: "Heart health package", price: 1999, fast: true, tat: "48 hours", cat: "Packages" }
];
export const EQUIPMENT = [
  { id: "bed", name: "Semi-electric hospital bed", cat: "Beds", rent: { day: 300, week: 1500, month: 4500 }, deposit: 5000, buy: 45000 },
  { id: "mattress", name: "Air mattress (pressure relief)", cat: "Beds", rent: { day: 80, week: 400, month: 1200 }, deposit: 1000, buy: 3500 },
  { id: "o2", name: "Oxygen concentrator, 5 LPM", cat: "Breathing", rent: { day: 500, week: 2500, month: 7500 }, deposit: 10000, buy: 48000, rx: true },
  { id: "bipap", name: "BiPAP machine", cat: "Breathing", rent: { day: 700, week: 3500, month: 10000 }, deposit: 15000, buy: 85000, rx: true },
  { id: "suction", name: "Suction machine", cat: "Breathing", rent: { day: 200, week: 1000, month: 3000 }, deposit: 3000, buy: 9500 },
  { id: "monitor", name: "Patient monitor (multi-parameter)", cat: "Monitoring", rent: { day: 600, week: 3000, month: 9000 }, deposit: 10000, buy: 60000 },
  { id: "wheelchair", name: "Foldable wheelchair", cat: "Mobility", rent: { day: 100, week: 500, month: 1500 }, deposit: 2000, buy: 7500 },
  { id: "walker", name: "Walker with wheels", cat: "Mobility", rent: { day: 50, week: 250, month: 700 }, deposit: 500, buy: 1800 },
  { id: "diapers", name: "Adult diapers, medium, pack of 10", cat: "Consumables", buy: 450 },
  { id: "underpads", name: "Disposable under pads, pack of 10", cat: "Consumables", buy: 350 },
  { id: "gloves", name: "Examination gloves, box of 100", cat: "Consumables", buy: 300 },
  { id: "dressing", name: "Sterile dressing kit", cat: "Consumables", buy: 150 }
];
export const VEHICLES = [
  { id: "ptv", name: "Patient transport (stretcher)", base: 800, km: 25 },
  { id: "bls", name: "Oxygen-equipped ambulance (BLS)", base: 1200, km: 30 },
  { id: "als", name: "Monitored transfer ambulance (ALS)", base: 2500, km: 45 },
  { id: "wc", name: "Wheelchair-accessible vehicle", base: 600, km: 20 }
];

export const PLANS = [
  { id: "recovery", name: "Recovery at home", period: "30 days", price: "from \u20B965,000", best: "After a hospital stay or surgery", items: ["Nurse, 12 hours a day", "2 doctor visits", "10 physiotherapy sessions", "Equipment advice and setup", "Weekly supervisor review"] },
  { id: "companion", name: "Companion care", period: "per month", price: "from \u20B928,000", best: "Seniors who need daily help and company", items: ["Trained caregiver, 12 hours a day", "Weekly nurse health check", "1 doctor visit a month", "Monthly family update call"], featured: true },
  { id: "healthy", name: "Healthy ageing", period: "per year", price: "from \u20B924,000", best: "Active seniors who want regular check-ins", items: ["4 doctor visits a year", "4 lab health packages", "4 counselling sessions", "Priority care line"] }
];

export const POSTS = [
  { slug: "safer-home-for-elderly-parent", cat: "Home safety", title: "Seven small changes that make a home safer for an elderly parent", date: "12 Sep 2026", mins: 5, tint: "--sage-2",
    excerpt: "Most falls happen at home, and most are preventable with a few simple changes.",
    body: [["", "Most falls in later life happen at home, often on an ordinary day. The good news is that a handful of inexpensive changes reduce the risk a great deal."], ["Light the path", "Add night lights between the bedroom and the bathroom. Many falls happen during a night-time trip to the toilet."], ["Clear the floor", "Remove loose rugs, tuck away cables and keep walkways free of clutter. Non-slip mats belong in the bathroom and near the kitchen sink."], ["Grab bars and raised seats", "A grab bar beside the toilet and inside the shower, and a raised toilet seat, make getting up much easier for weak knees."], ["Keep daily things within reach", "Move frequently used items to shelves between waist and shoulder height so your parent does not need a stool."], ["Check footwear and eyesight", "Well-fitting slippers with a firm sole, and an up-to-date glasses prescription, matter more than most people expect."], ["Build strength", "Simple balance and leg-strength exercises, guided by a physiotherapist, reduce falls. A home assessment can show where to start."]] },
  { slug: "questions-before-hospital-discharge", cat: "Recovery", title: "What to ask before your parent is discharged from hospital", date: "28 Aug 2026", mins: 6, tint: "--lav",
    excerpt: "The day of discharge moves fast. These questions help you leave with a clear plan.",
    body: [["", "Discharge day is often rushed. A short list of questions helps you take your parent home with confidence."], ["Medicines", "Ask which medicines are new, which have stopped, and what each one is for. Request a printed list with timings."], ["Warning signs", "Ask which symptoms mean you should call the doctor, and which mean going straight back to hospital."], ["Care needs", "Will your parent need a nurse, physiotherapy, oxygen or a special bed? Arrange these before you leave, not after you arrive home."], ["Follow-up", "Note the date of the next review and which tests are needed before it."], ["Paperwork", "Collect the discharge summary, test reports and prescriptions. Keep a photo of each on your phone."]] },
  { slug: "caring-for-parents-from-another-city", cat: "Caregiving", title: "Caring from another city: a practical guide for families living away", date: "14 Aug 2026", mins: 7, tint: "--sun",
    excerpt: "Distance makes care harder, but not impossible. A good system makes the difference.",
    body: [["", "Many families care for parents from another city or another country. With the right system, distance becomes manageable."], ["Know the basics", "Keep a shared note with your parent's conditions, medicines, doctors, allergies and insurance details."], ["Build a local circle", "Neighbours, a trusted friend and a home-care provider form a safety net you can call on quickly."], ["Use regular check-ins", "A weekly nurse visit or a fixed call time gives you an early sign when something changes."], ["Plan for emergencies", "Save the nearest hospital, ambulance numbers and a local contact. Make sure your parent's phone has them too."], ["Look after yourself", "Worry from a distance is tiring. Share the load with siblings and ask for help early."]] },
  { slug: "early-signs-of-memory-change", cat: "Memory and dementia", title: "Early signs of memory change, and when to seek help", date: "30 Jul 2026", mins: 5, tint: "--sage",
    excerpt: "Forgetting a name now and then is normal. Here is what is worth a closer look.",
    body: [["", "Occasional forgetfulness is part of ageing. Some changes, though, are worth discussing with a doctor."], ["Signs to notice", "Repeating the same question within minutes, getting lost on familiar routes, trouble handling money, or difficulty following a conversation."], ["Changes in mood", "New anxiety, withdrawal from friends or unusual irritability can also be early signs."], ["What to do", "Speak to a doctor. Some causes of memory problems, such as vitamin deficiency or thyroid issues, are treatable."], ["Support for the family", "A counsellor can help families talk about changes kindly and plan ahead together."]] },
  { slug: "home-physiotherapy-after-knee-replacement", cat: "Rehabilitation", title: "Why home physiotherapy works well after a knee replacement", date: "16 Jul 2026", mins: 4, tint: "--sage-2",
    excerpt: "Practising in the home where you actually live makes recovery practical.",
    body: [["", "The first weeks after a knee replacement decide how well the new joint works. Home physiotherapy makes those weeks easier."], ["Less travel, more consistency", "No car rides with a stiff, painful knee means fewer missed sessions."], ["Real-life practice", "The therapist trains your parent on their own stairs, bathroom and bed, where the movements matter most."], ["Close watch on progress", "Regular measures of bend, strength and walking show what is working and what needs to change."], ["When to start", "Usually within days of discharge, once the surgeon agrees."]] },
  { slug: "spotting-caregiver-burnout", cat: "Caregiving", title: "Caregiver burnout: noticing it before it takes over", date: "2 Jul 2026", mins: 5, tint: "--lav",
    excerpt: "Looking after a parent is meaningful work, and it can quietly wear you down.",
    body: [["", "Caring for a parent is an act of love. It can also leave you exhausted without you noticing."], ["Common signs", "Constant tiredness, poor sleep, irritability, losing interest in things you enjoyed, and feeling that you can never take a break."], ["Small steps that help", "Share tasks with family, keep one protected hour a week for yourself, and accept practical help when it is offered."], ["Bring in support", "A few hours of professional care each week can give you room to rest without guilt."], ["Talk to someone", "Caregiver counselling gives you a space to talk through what you are carrying."]] }
];

export const JOBS = [
  { id: "staff-nurse-chennai", role: "Staff nurse, home care", city: "Chennai", type: "Full time", exp: "1+ years", qual: "GNM or BSc Nursing, state council registration" },
  { id: "icu-nurse-bengaluru", role: "ICU nurse, critical care at home", city: "Bengaluru", type: "Full time", exp: "2+ years in ICU", qual: "BSc Nursing, ICU experience" },
  { id: "physio-coimbatore", role: "Physiotherapist", city: "Coimbatore", type: "Full time", exp: "1+ years", qual: "BPT or MPT" },
  { id: "caregiver-hyderabad", role: "Patient care assistant", city: "Hyderabad", type: "Full time", exp: "Freshers welcome", qual: "GDA certificate preferred, training provided" },
  { id: "phlebotomist-chennai", role: "Phlebotomist", city: "Chennai", type: "Full time", exp: "1+ years", qual: "DMLT or equivalent" },
  { id: "care-coordinator-bengaluru", role: "Care coordinator", city: "Bengaluru", type: "Full time", exp: "2+ years in healthcare service", qual: "Any graduate, good communication in English and Kannada" }
];

export const REVIEWS = [
  { text: "The nurse who came after my mother's hip surgery was patient and careful. The daily notes on WhatsApp meant I could follow everything from Pune.", name: "Sample review", where: "Nursing Services, Chennai" },
  { text: "We set up oxygen and a bed in one afternoon. The technician explained everything twice to my father until he was comfortable.", name: "Sample review", where: "Medical Equipment, Bengaluru" },
  { text: "Appa refused to go to the clinic. The doctor came home, sat with him and changed two medicines. He is sleeping much better now.", name: "Sample review", where: "Doctor Visits, Coimbatore" },
  { text: "The physiotherapist made the exercises feel doable. Three weeks later my aunt was walking to the balcony on her own.", name: "Sample review", where: "Physiotherapy, Hyderabad" },
  { text: "The counsellor spoke to my mother in Tamil and gave her space to talk about my father. It helped the whole family.", name: "Sample review", where: "Geriatric counseling, Chennai" },
  { text: "Sample collection at 7 am, report by evening, and a doctor called to explain it. Very simple.", name: "Sample review", where: "Home Blood Collection, Bengaluru" }
];

export const FAQ_GROUPS = [
  { name: "Getting started", items: [["How do I book a service?", "Use the Book a service button, call our care line, or message us on WhatsApp. A care advisor confirms the details with you."], ["Which cities do you serve?", "Chennai, Bengaluru, Coimbatore and Hyderabad. Enter your pincode while booking to check your area."], ["Can I book for a parent in another city?", "Yes. Many of our families live away. You book and pay, and we coordinate with your parent at home."]] },
  { name: "Staff and safety", items: [["How do you check your staff?", "Every caregiver goes through ID checks, police verification, reference checks, skill tests and our own training before their first visit."], ["Who supervises the care?", "A nursing supervisor reviews every long-term case at least once a week and is your point of contact."], ["Can I ask for a replacement?", "Yes, at any time. We usually arrange a replacement within 24 hours."]] },
  { name: "Payments and cancellations", items: [["How can I pay?", "UPI, cards, net banking, or a payment link sent to you. International cards work for families abroad."], ["What is your cancellation policy?", "Cancel or reschedule free up to 4 hours before a visit. See the cancellation and refund policy for details."], ["Do you give invoices?", "Yes, a GST invoice is emailed for every payment."]] },
  { name: "Medical questions", items: [["Is Wellora Care an emergency service?", "No. In an emergency, call 108 or 112 straight away."], ["Do you work with our family doctor?", "Yes. With your permission we share updates with your parent's doctor."], ["Is my parent's health data safe?", "We store data in India, limit who can see it, and only share it with your consent."]] }
];

export const LEGAL = {
  privacy: { title: "Privacy policy", body: [["What we collect", "Name, contact details, address, details about the person receiving care and health information you choose to share, so we can arrange and deliver care."], ["Why we use it", "To respond to enquiries, deliver services, send updates and invoices, and meet legal duties. We do not sell personal data."], ["Consent and your rights", "We process personal data with your consent under the Digital Personal Data Protection Act, 2023. You may access, correct or ask us to delete your data, or withdraw consent, by writing to our grievance officer."], ["Where it is stored", "Data is stored on servers located in India, protected by encryption and access controls."], ["How long we keep it", "Only as long as needed for care, legal and accounting requirements."]] },
  terms: { title: "Terms of service", body: [["Our services", "Wellora Care arranges home healthcare by qualified professionals. Services are not a substitute for emergency or hospital care."], ["Bookings", "A booking is confirmed when we send a booking reference. Prices on this site are indicative and confirmed before service."], ["Your responsibilities", "Share accurate medical information and a safe environment for our staff."], ["Liability", "Our liability is limited as permitted by law. Full terms are provided with each care agreement."]] },
  refund: { title: "Cancellation and refund policy", body: [["Visits", "Cancel or reschedule free of charge up to 4 hours before the visit. Later cancellations may be charged up to 50% of the visit fee."], ["Long-term care", "Give 3 days' notice to stop a monthly plan. Unused days are refunded after adjustment."], ["Equipment", "Security deposits are refunded within 7 working days of pickup, less any damage charges shown to you."], ["Refund method", "Refunds go back to the original payment method within 7 to 10 working days."]] },
  disclaimer: { title: "Medical disclaimer", body: [["Not medical advice", "Content on this website is for general information and does not replace advice from a qualified doctor."], ["Emergencies", "Wellora Care is not an emergency service. In an emergency, call 108 or 112, or go to the nearest hospital."]] },
  grievance: { title: "Grievance redressal", body: [["Grievance officer", "Name to be announced. Email: grievance@welloracare.in. Phone: " + PHONE + "."], ["Timelines", "We acknowledge complaints within 48 hours and aim to resolve them within 15 days."]] },
  cookies: { title: "Cookie policy", body: [["What we use", "This site uses only essential browser storage to remember your city, cookie choice and items in your cart."], ["Your choice", "You can clear these at any time from your browser settings."]] }
};
