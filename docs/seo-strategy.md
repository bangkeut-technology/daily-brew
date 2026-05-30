# DailyBrew SEO Strategy — Master Document

**Scope:** F&B + retail/small shop, global English, self-serve signups.
**Product wedge:** Three-factor attendance (Device + IP + NFC tag), no biometrics, no GPS, free up to 10 staff.
**Status:** Consolidates v1 (SEO foundation), v2 (device verification), v3 (NFC + IP repositioning).

---

## Table of Contents

1. Executive Summary
2. Positioning & Messaging
3. Competitive Landscape
4. Keyword Strategy
5. Site Architecture & Pages
6. Content Calendar
7. Free Tools / Lead Magnets
8. Technical SEO
9. PR & Authority Building
10. FAQ Block (Drop-In)
11. Schema Markup
12. 90-Day Execution Roadmap
13. Metrics & Decision Thresholds
14. Caveats

---

## 1. Executive Summary

### The product wedge (in one sentence)
DailyBrew is the only QR/NFC attendance app for cafés and small shops that stops buddy punching with **three-factor verification — device, IP, and NFC tag — without biometrics or GPS**.

### The SEO wedge (in one sentence)
Don't fight Clockify, Jibble, or Homebase for head terms; own the intersection of **F&B/retail SMB + QR/NFC clock-in + free tier + privacy-first** through programmatic landing pages, comparison pages, and utility tools.

### The three big strategic calls
1. **Lead with QR on the homepage today; tease NFC as private beta with a waitlist.** Pivot to NFC-led messaging at beta graduation (target Day 60–90). Leading with a not-yet-shipped feature on the homepage kills self-serve conversion.
2. **Own "three-factor attendance" as a category phrase** the way banks own "two-factor auth." Device + IP + NFC is the durable narrative regardless of which layer is shipping today.
3. **Skip the head terms.** Generic "employee attendance app," "time clock," and "leave management" are locked up by DR 80+ incumbents. Win the long tail: industry × feature pages, /vs-X comparisons, country leave calculators, and the buddy-punching cluster.

### Realistic outcomes
- **Day 30:** 0–100 organic visits/mo. 0–10 signups.
- **Day 90:** 500–1,500 organic visits/mo. 15–60 signups.
- **Month 6:** 2,000–6,000 organic visits/mo. 20–180 monthly free signups; 1–18 paid customers from organic.

This assumes consistent shipping. SEO compounds slowly. Paid Google Ads on the same long-tail terms ($500–$1,500/mo) would accelerate signups while organic catches up.

---

## 2. Positioning & Messaging

### Tagline candidates (pick one)
- *"Three-factor attendance for cafés. No GPS. No biometrics. No buddy punching."* — **recommended; strongest narrative**
- *"Verified clock-ins, bound to your device and your shop's WiFi. NFC tap coming soon."* — interim, most honest
- *"Tap. Verified. Counted. The honest time clock for small shops."* — post-NFC-GA

### Homepage H1

**Interim (pre-NFC GA):**
> The verified time clock for cafés — device, network, and soon a tap.

**Post-NFC GA:**
> Tap to clock in. We handle the rest.

### Subhead
> Staff scan a QR code or tap an NFC tag. Each punch is bound to their verified device and your shop's network. Buddy punching becomes mechanically impossible — without a single biometric.

### The three-factor narrative (use on /three-factor-attendance, homepage, sales deck)

> Your bank doesn't trust your password alone — it asks for your phone too. We do the same for clock-ins: the verified device (something you have), the verified network (somewhere you are), and the physical NFC tag (something you tap). Three factors. No selfies. No location permission. No drained batteries.

### Differentiation by competitor type

**vs. biometric-led (Jibble, Deputy, Truein, ClockShark):**
Face recognition was designed for 200-person factories, not 4-person cafés. It introduces real legal exposure — BIPA, GDPR. Your staff don't want their face in someone's cloud. We give you the same anti-buddy-punching guarantee with zero biometric data collected.

**vs. GPS-led (Homebase, Sling, Hubstaff, Deputy):**
Geofencing tells you a phone is near the shop — not whose phone. GPS also requires "Always-On" location permission and drains battery. Staff hate it. We skip GPS entirely and verify the device + the network.

**vs. PIN-led (Clockify, TimeCamp, basic Homebase):**
A 4-digit PIN can be shouted across a stockroom. Clockify's own docs literally invite PIN-sharing ("Give this PIN to a shift manager so that they can clock in for a team"). We bind every punch to a verified device, so PIN-sharing simply doesn't work.

**vs. Connecteam (closest NFC competitor):**
Their NFC is also in beta. The difference: we built device + IP + tag as one experience for cafés. They sell tags as an add-on to a deskless workforce HR suite. We don't ask for GPS. We don't bolt selfie verification on top. We're built for the shop owner who wants honest timesheets, not a workforce management platform.

**vs. Buddy Punch (closest IP-lock competitor):**
They have IP Address Lock — the right idea, bolted onto a generic time clock with face recognition and photo-on-punch. We made device + IP + NFC the *primary* defense, not a side feature, and we don't take photos of your staff every shift.

### F&B/retail SMB voice (use throughout)
- "honest timesheets" (not "time and attendance management")
- "the manager doesn't have to be there" (not "advanced workforce oversight")
- "your barista's phone is enough" (not "BYOD")
- "no extra hardware, no extra app, no extra creepy" (the privacy promise)
- "your café," "your shop," "your 4-person team" (never "your organization")

---

## 3. Competitive Landscape

### Master competitor matrix

| Vendor | Buddy-punching defense | NFC tap-to-clock-in | IP whitelist | Free tier | F&B/retail SMB fit | Key weakness |
|---|---|---|---|---|---|---|
| **Clockify** | Universal kiosk PIN | No | No | Yes, generous | Generic | PIN explicitly shareable per their own docs |
| **Jibble** | Face recognition | Yes (NFC card → kiosk tablet) | No | Yes, unlimited users | Multi-vertical with cafe page | Face recognition heavy; aggressive upsell |
| **Homebase** | Auto-PIN + GPS + photo | No | No | Yes (1 location, ≤10 staff) | Strong F&B focus | US-centric; pricing escalates; PIN model |
| **7shifts** | Photo + geofencing | No | No | Limited | Restaurant-only | Pricing $44.99–$149.99/loc/mo |
| **Deputy** | Face Unlock (AWS Rekognition) + PIN | No | No | No | Enterprise-leaning | Cloud biometric exposure; complex |
| **When I Work** | Photo Clock In + GPS | No | No | No | Multi-vertical | Time tracking is add-on |
| **Connecteam** | Selfie verification (Expert) + PIN | **Yes (Beta)** | No | Yes, up to 10 | Deskless general | NFC in beta; broad HR-suite drift |
| **Buddy Punch** | Face ID at login + photo at punch | No | **Yes (IP Lock)** | No | SMB general | Face ID only at login per Connecteam review |
| **ClockShark** | Per-employee PIN + face | No | No | No | Construction-leaning | GPS-heavy; not F&B |
| **Truein** | Face recognition (primary) | No | No | No | Contract/multi-site | Pure biometric stack |
| **StaffAny** | PIN + QR | No | No | Yes | SEA F&B (SG/MY/ID) | Regional only |
| **Sling** | Geofencing + Toast PIN | No | No | Yes | Restaurants | No identity layer per When I Work |
| **OnTheClock** | Device & browser auth | No | Yes | Limited | SMB general | User-level only; defeats with cache clear |
| **TimeCamp** | Kiosk PIN | No | Yes | Yes | Knowledge work | Acknowledges its own buddy-punching risk |
| **TimeForge** | IP restriction + multi-method | No | **Yes** | No | Grocery/restaurant | Less brand awareness |
| **OpenTimeClock** | WiFi BSSID restriction | NFC/RFID via PIN field | **Yes (BSSID)** | Yes | Multi-vertical | No F&B framing; many methods, no focus |
| **TimeDock** | Hardware-led | Yes (badge → team lead phone) | No | No | Construction | Not F&B |
| **TimeTac** | Task NFC | Yes (phone → tag, task-based) | No | No | Field/project | Project time tracking voice |
| **Focus (UK)** | Phone → wall tag ("Focus Wave") | Yes | No | No | UK SMB | UK-only; low brand recognition |
| **CheckinMe (Cambodia)** | QR + face/fingerprint | No | No | No (free trial) | Multi-vertical SME | $50–$150 install fee; 30-employee cap; sluggish app per Play reviews |
| **DailyBrew** | **Device + IP + NFC (beta)** | **Yes (beta)** | **Yes (per-record + whitelist)** | **Yes (≤10 staff)** | **F&B + retail SMB** | **NFC in beta; low DR** |

### What the matrix tells you
- **No SMB-tier competitor combines Device + IP + NFC.** Connecteam has NFC (beta), Buddy Punch has IP, OpenTimeClock has BSSID — but none stack all three with a café voice.
- **The biometric vs GPS war is the category default.** Every major incumbent leans on one or the other. The "no biometric, no GPS" positioning is genuinely uncontested at the homepage level.
- **Free tiers are common but constrained.** Homebase caps at 1 location, Connecteam at 10 users, Jibble is unlimited but upsells aggressively. DailyBrew's "free up to 10" is competitive — match it on copy ("free forever for teams of 10 or fewer").
- **Pricing has room above and below.** 7shifts at $44.99–$149.99/loc/mo is the ceiling; Clockify free is the floor. DailyBrew's $19.99 / $39.99 lands in a clean middle.

---

## 4. Keyword Strategy

### Cluster summary (priority order)

| Cluster | Win probability | Why |
|---|---|---|
| **A. Buddy-punching cluster** | High | 6k–12k/mo head, plus long tail; differentiated answer (three-factor) |
| **B. QR-attendance core** | Medium-high | Cluster B from prior strategy; QR is shipped and demoable |
| **C. Industry × feature (F&B/retail)** | Very high | Long tail, KD 5–25, almost no purpose-built F&B pages exist |
| **D. Competitor /vs-X long tail** | High | Niche enough to win at low DR; head terms are aggregator-locked |
| **E. Country leave calculators** | High | Geo-modified, KD 30–45, evergreen utility |
| **F. NFC + IP cluster** | Medium (small volume) | Niche but uncontested; narrative play, not traffic play |
| **G. Free tools / templates** | Medium | Crowded head; vertical-specific variants winnable |
| **H. Privacy/no-biometric/no-GPS** | Low traffic, high intent | Category-creation play; landing destination for PR |

### Tier 1 — must-rank keywords (build pages for these first)

| Keyword | Est. MSV | KD | Target page |
|---|---|---|---|
| buddy punching | 6,000–12,000 | 40–60 | /stop-buddy-punching + blog #4 |
| what is buddy punching | 1,500–3,500 | 25–40 | Glossary + featured snippet |
| how to stop buddy punching | 400–900 | Medium | /stop-buddy-punching |
| prevent buddy punching | 400–700 | Medium-high | /stop-buddy-punching |
| QR code attendance | 3,000–8,000 | High | /qr-code-attendance |
| QR code time clock | 500–1,500 | Medium | /qr-code-attendance |
| QR code attendance app | 500–1,000 | 25–35 | /qr-code-attendance |
| staff attendance app for restaurants | 200–500 | 30–40 | /restaurants |
| attendance app for cafe | 100–300 | 15–25 | /cafes |
| time clock app for restaurants | 800–1,800 | 45–55 | /restaurants |
| free leave management software | 600–1,200 | 35–45 | /leave-management |
| free leave tracker | 300–700 | 25–35 | /leave-management |
| NFC attendance | 400–1,200 | 15–25 | /tap-to-clock-in |
| NFC time clock | 150–400 | 15–25 | /tap-to-clock-in |
| NFC clock in | 100–300 | 15–25 | /tap-to-clock-in |

### Tier 2 — winnable long tail (build after Tier 1)

| Keyword | Est. MSV | KD | Target page |
|---|---|---|---|
| attendance app for small shop | 50–200 | 10–20 | /small-shops |
| coffee shop employee time tracking | 50–150 | 15–25 | /coffee-shops |
| bar staff attendance | 50–150 | 10–20 | /bars |
| boutique staff time tracking | 20–80 | 5–15 | /boutiques |
| retail staff attendance app | 100–250 | 20–30 | /retail |
| food truck employee time tracking | 50–150 | 15–25 | /food-trucks |
| leave management for restaurants | 50–150 | 10–20 | /restaurants |
| simple leave management for small business | 100–300 | 15–25 | /leave-management |
| time off tracker for small business | 200–500 | 25–35 | /leave-management |
| annual leave calculator uk | 5,000–15,000 | 55–65 | /tools/annual-leave-calculator/uk |
| annual leave calculator malaysia | 500–1,500 | 30–40 | /tools/annual-leave-calculator/malaysia |
| annual leave calculator singapore | 500–1,500 | 30–40 | /tools/annual-leave-calculator/singapore |
| holiday entitlement calculator australia | 800–2,000 | 35–45 | /tools/annual-leave-calculator/australia |
| jibble alternative for cafes | <50 | 5–15 | /vs-jibble |
| free homebase alternative for restaurants | <50 | 5–15 | /vs-homebase |
| anti buddy punching app | <100 | Low | /anti-buddy-punching |
| IP restriction time clock | 50–200 | 5–15 | /ip-verification |
| WiFi-based attendance | 100–400 | 10–20 | /ip-verification |
| no GPS time clock | 50–200 | 10–20 | /no-gps-attendance-app |
| no GPS attendance app | 50–150 | Low | /no-gps-attendance-app |

### Tier 3 — narrative/PR landing pages (low search volume, high conversion intent)

| Keyword | Est. MSV | Notes |
|---|---|---|
| device verification time clock | <30 | Own the term |
| device-bound attendance | <20 | Own the term |
| no biometric time clock | <50 | BIPA narrative |
| no face recognition attendance | <30 | Privacy buyer |
| privacy-friendly time tracking | <50 | Mid-funnel |
| tap to clock in | 80–250 | Post-NFC-GA only |

### SERP warnings (do NOT target as bare terms)
- **"WiFi attendance"** — brand-locked by wifiattendance.com (Redbytes/Edsys, India). Use "WiFi-based attendance," "office WiFi clock-in," or "WiFi attendance for cafés" instead.
- **"Tap and go time clock"** — SERP polluted by retail POS.
- **"Anti buddy punching app"** — SERP polluted by "Kick the Buddy" game.

---

## 5. Site Architecture & Pages

### Recommended sitemap

```
dailybrew.work/
├── / (homepage)
├── /pricing
├── /signup
├── /login
│
├── Industry landing pages (F&B + retail)
│   ├── /cafes
│   ├── /coffee-shops
│   ├── /restaurants
│   ├── /bars
│   ├── /pubs
│   ├── /food-trucks
│   ├── /bakeries
│   ├── /quick-service-restaurants
│   ├── /retail
│   ├── /boutiques
│   ├── /convenience-stores
│   └── /small-shops
│
├── Feature landing pages
│   ├── /three-factor-attendance         ★ narrative anchor
│   ├── /qr-code-attendance              ★ shipped flagship (current)
│   ├── /tap-to-clock-in (NFC)           ★ beta waitlist
│   ├── /device-verified-attendance      ★ supporting layer
│   ├── /ip-verification                 ★ supporting layer
│   ├── /stop-buddy-punching             ★ primary BOFU page
│   ├── /anti-buddy-punching-app
│   ├── /no-gps-attendance-app
│   ├── /no-biometric-time-clock
│   ├── /privacy-friendly-time-tracking
│   ├── /staff-trust                     (PR-landing narrative)
│   ├── /leave-management
│   ├── /time-clock
│   ├── /kiosk-mode
│   └── /how-it-works
│
├── Competitor pages (/vs- and /-alternative)
│   ├── /vs-jibble                       /jibble-alternative
│   ├── /vs-homebase                     /homebase-alternative
│   ├── /vs-7shifts                      /7shifts-alternative
│   ├── /vs-deputy                       /deputy-alternative
│   ├── /vs-when-i-work
│   ├── /vs-connecteam                   ★ closest NFC competitor
│   ├── /vs-clockify
│   ├── /vs-buddy-punch
│   └── /vs-checkinme                    (regional, Cambodia)
│
├── Free tools (lead magnets)
│   ├── /tools/shift-schedule-generator
│   ├── /tools/time-card-calculator
│   ├── /tools/annual-leave-calculator
│   │   ├── /uk
│   │   ├── /singapore
│   │   ├── /malaysia
│   │   ├── /australia
│   │   ├── /india
│   │   └── /philippines
│   ├── /tools/buddy-punching-cost-calculator
│   ├── /tools/leave-policy-generator
│   ├── /tools/attendance-policy-generator
│   ├── /tools/leave-request-form
│   └── /tools/cafe-labor-cost-calculator
│
├── Regional landing pages
│   ├── /singapore
│   ├── /malaysia
│   ├── /philippines
│   ├── /uk
│   ├── /australia
│   ├── /india
│   └── /canada
│
├── Reference / glossary (programmatic)
│   ├── /leave-laws/uk
│   ├── /leave-laws/singapore
│   ├── /leave-laws/malaysia
│   ├── /leave-laws/australia
│   ├── /leave-laws/india
│   ├── /leave-laws/philippines
│   ├── /leave-laws/canada
│   ├── /leave-laws/new-zealand
│   ├── /glossary/buddy-punching
│   ├── /glossary/time-theft
│   ├── /glossary/clopening
│   ├── /glossary/no-call-no-show
│   ├── /glossary/nfc-attendance
│   ├── /glossary/device-verification
│   └── /glossary/[~30 terms total]
│
├── Blog (problem-aware content)
│   └── /blog/[post-slugs in §6]
│
└── /integrations
    ├── /basilbook
    ├── /quickbooks
    ├── /xero
    └── /csv-export
```

### Page priority — first 90 days

| Priority | Page | Status | Targets |
|---|---|---|---|
| **P0** | /ip-verification | New (fully shipped) | "IP restriction time clock," "WiFi-based attendance" |
| **P0** | /three-factor-attendance | New narrative anchor | Brand category creation |
| **P0** | Homepage hero update | Update | Reposition without breaking conversion |
| **P0** | /stop-buddy-punching | New flagship | "stop/prevent buddy punching" |
| **P0** | /tap-to-clock-in (NFC) | New (waitlist) | "NFC attendance," "NFC clock in" |
| **P0** | /cafes | New flagship industry | "attendance app for cafe" |
| **P0** | /qr-code-attendance | Rewrite | "QR code attendance" + three-factor framing |
| **P0** | /tools/annual-leave-calculator/uk | New tool | Highest-volume calculator |
| **P1** | /restaurants | New | "time clock app for restaurants" |
| **P1** | /vs-jibble | New | "jibble alternative" long tail |
| **P1** | /vs-connecteam | New | NFC parity-plus story |
| **P1** | /vs-homebase | New | "homebase alternative" |
| **P1** | /device-verified-attendance | New | Supporting layer |
| **P1** | /no-gps-attendance-app | New | Privacy buyer |
| **P1** | /tools/shift-schedule-generator | New tool | Lead magnet |
| **P1** | /tools/annual-leave-calculator/{sg,my,au} | New | Geo-modified calculators |
| **P2** | /coffee-shops, /bars, /food-trucks, /bakeries | New | Long-tail industry |
| **P2** | /retail, /boutiques, /convenience-stores, /small-shops | New | Retail vertical |
| **P2** | /how-it-works | New | Visual three-factor walkthrough |
| **P2** | /tools/buddy-punching-cost-calculator | New | Link-bait interactive |
| **P2** | /no-biometric-time-clock | New | BIPA narrative landing |
| **P2** | /vs-7shifts, /vs-deputy, /vs-buddy-punch, /vs-clockify | New | Comparison cluster |
| **P3** | /leave-laws/{uk,sg,my,au,in,ph} | Programmatic | Geo-reference cluster |
| **P3** | Glossary (~30 terms) | Programmatic | TOFU traffic |
| **P3** | /privacy-friendly-time-tracking, /staff-trust | New | PR landing |

### Internal linking model
- Home → top 3 industries + top 3 features + /three-factor-attendance above fold.
- /three-factor-attendance → /device-verified-attendance, /ip-verification, /tap-to-clock-in.
- Every industry page → 3 features + 2 /vs- pages + 1 tool.
- Every tool → relevant industry + /signup.
- Every blog post → 1 tool + 1 industry + 1 feature.
- Every /vs-X → matching /X-alternative + /pricing + /signup.
- Breadcrumbs everywhere with `BreadcrumbList` schema.

---

## 6. Content Calendar (12 anchor posts)

Write in this order. Each post is 1,000–1,500 words. Each links to (a) one tool, (b) one industry page, (c) closest feature page.

1. **"NFC attendance vs QR vs face recognition: a 2026 comparison for cafés"** — owns the comparison query.
2. **"What is NFC attendance and why it's the cleanest way to clock in"** — TOFU explainer.
3. **"IP whitelisting is the new geofencing (and it doesn't drain your battery)"** — supports /ip-verification.
4. **"Three-factor attendance: how banking-app security came to the time clock"** — flagship narrative; the post that gets shared.
5. **"Does your staff's phone support NFC? A practical guide for café owners"** — pre-sale objection-handler.
6. **"iPhone vs Android: NFC attendance compatibility in 2026"** — most-asked question.
7. **"Why face recognition is overkill for a 4-person café"** — BIPA-anchored privacy piece.
8. **"How to stop buddy punching without spying on your staff"** — pillar supporting /stop-buddy-punching.
9. **"Buddy punching costs SMBs 2.2% of gross payroll — here's how to actually stop it"** — pairs with the cost calculator.
10. **"PIN-sharing is the new buddy punching: why 4-digit codes don't stop time theft"** — direct attack on Clockify/Homebase PIN model.
11. **"What happens when your café's WiFi changes IP? A practical guide."** — supports /ip-verification.
12. **"How a 3-shop bakery cut payroll variance to zero in 30 days"** — case study format; F&B-native voice.

### Stretch posts (if time allows)
- "Why Connecteam's NFC is also in beta — and what that means for café owners shopping in 2026"
- "7 ways your staff are gaming Homebase / Jibble / 7shifts (and how device verification ends it)"
- "What BIPA, GDPR and Australia's APP mean for your time clock"
- "NFC tags 101 for café owners: where to stick them, how many you need, what to do if one breaks"
- "Buddy punching isn't a tech problem, it's a trust problem"

---

## 7. Free Tools / Lead Magnets

Ranked by expected signup ROI:

1. **Annual Leave Entitlement Calculator** — country-specific (UK, Singapore, Malaysia, Australia, India, Philippines). Form → leave accrued, days remaining, pro-rata. CTA: "Track leave automatically — free up to 10 staff."
2. **Shift Schedule Generator** — drag-and-drop grid, exports to Excel/Sheets/PDF. CTA: "Save your roster permanently — sign up free."
3. **Attendance Policy Generator** — multi-step form → branded PDF + editable Google Doc.
4. **Leave Request Form Template** — printable + Google Form download.
5. **Time Card Calculator** — clock-ins/outs → total hours, overtime, gross pay.
6. **Cafe Labor Cost Calculator** — wage + hours + sales → labour-as-percentage-of-sales.
7. **Buddy Punching Cost Estimator** — team size + average wage → annual loss. Connects the problem to the three-factor solution.
8. **Pro-rata Leave Calculator for Part-time Staff** — targets the Bizimply UK SERP.

**Rule:** All tools ungated (no email wall). Two CTAs: soft "Save your result — create a free account" and hard "Track for your whole team — start free."

---

## 8. Technical SEO

### Priority order

1. **Convert all public marketing pages to SSG or SSR.** Next.js App Router with `generateStaticParams` for industry/competitor/country pages; ISR for blog; pure SSG for tools. Confirm content is in initial HTML via `view-source:`, not just the rendered DOM.
2. **Metadata API on every page.** Unique title, description, og:title, og:image, canonical.
3. **Schema markup** (see §11).
4. **Sitemap & robots.** Partitioned (`sitemap-industries.xml`, `sitemap-vs.xml`, `sitemap-tools.xml`). Submit to Google Search Console + Bing Webmaster.
5. **Core Web Vitals targets.** LCP < 2.0s on 4G mobile; CLS < 0.05; INP < 200ms. Use `next/image` with WebP/AVIF, preload hero, defer non-critical JS, keep marketing-page JS < 100KB.
6. **Separate marketing from app.** `app.dailybrew.work` (logged-in dashboard) is `noindex`; `dailybrew.work` is the marketing site only.
7. **Hreflang on regional pages.** `hreflang="en-GB"`, `en-SG`, `en-MY`, `en-AU`, `en-IN`, `x-default`.
8. **Internal linking automation.** Related-content component auto-linking each page to 3 industries + 3 tools + 2 competitor pages by tag.
9. **CDN.** Vercel or Cloudflare Pages with edge caching. Symfony backend out of the marketing-page request path.
10. **Search Console & Bing from Day 1.** Verify ownership, monitor coverage and CWV.

### OG image
Build one new template: a phone tapping a tag on a wall above the espresso machine. Reuse across the NFC cluster. This is the image that gets shared on LinkedIn/X for hospitality-tech crowd.

---

## 9. PR & Authority Building

The hardware-trust story unlocks four press angles a QR-only story couldn't:

1. **Hospitality/F&B trade press**
   - Targets: Restaurant Dive, Modern Restaurant Management, Restaurant Business Online, Hospitality Tech, FSR Magazine, QSR Magazine, Sprudge (coffee), Eater city editions.
   - Pitch: "The first NFC tap-to-clock-in built specifically for cafés." Founder story + F&B operator angle (Beef & Basil).

2. **Fintech-adjacent / trust press**
   - Targets: TechCrunch security desk, The Information, Sifted (Europe), e27 (SEA), YourStory (India).
   - Pitch: "We brought three-factor authentication to the time clock." Bank-app analogy lands immediately.

3. **NFC / IoT / privacy press**
   - Targets: NFC Forum blog, NFCW, RFID Journal, IAPP Privacy Tracker, The Register, ICO blog (UK).
   - Pitch: "Workplace attendance is the most under-discussed biometric risk in the SMB stack."

4. **Founder-led / indie**
   - Targets: Indie Hackers, MicroConf newsletter, Lenny's Newsletter guest, Hacker News (Show HN: ...), F&B Reddit subs.
   - Pitch: "We built device-bound attendance to avoid using biometrics. Here's why we lost early deals and won the right customers." HN front-page potential.

### Distribution / link-building
- Submit to G2, Capterra, GetApp, SoftwareSuggest, AlternativeTo, SaaSHub, Product Hunt.
- 2 hours each — write quality profiles, gather initial reviews from existing customers (Beef & Basil staff first), respond to leads. These dominate "[competitor] alternative" SERPs; you cannot beat them, so be listed on them.
- Apply for 5 podcast guest spots in the F&B/SMB operator niche.

---

## 10. FAQ Block (Drop-In Ready)

Use across homepage, /three-factor-attendance, /tap-to-clock-in, /stop-buddy-punching. Mark up with `FAQPage` schema.

**Q: What is NFC tap-to-clock-in?**
A: A small NFC sticker — about the size of a coin — goes on the wall by your espresso machine or back-of-house door. When a staff member arrives, they tap their phone on the sticker and they're clocked in. No QR scan, no app navigation, no PIN. Every tap still goes through DailyBrew's verification stack — the same device, the same network, and the same backend that a QR scan uses.

**Q: Do all phones support NFC tap?**
A: Practically yes for any phone bought new since around 2019. All Android phones since 2015 and all iPhones since iPhone 7 (2016) have NFC hardware. iPhone XS and newer (2018+) detect tags in the background without the app being open — that's the seamless flow. Older iPhones and a small share of Android phones need the staff member to open DailyBrew first, tap the NFC button, then tap the tag — still about 3 seconds.

**Q: What if my staff's phone doesn't support NFC?**
A: They use the QR code instead — every shop gets a QR sticker as well as the NFC tag. The QR code is the universal fallback, and it goes through the same device + IP verification stack. You don't have to choose; both work side by side.

**Q: What happens if my phone breaks?**
A: Your manager resets your device binding in two taps. The next time you scan, your new phone is registered as your trusted device, and your old one is automatically deauthorized.

**Q: How does IP verification work if my café's WiFi has a changing IP?**
A: Most café WiFi networks have a dynamic public IP but the network itself doesn't change. DailyBrew's whitelist supports IP ranges (CIDR) so a typical ISP-assigned range still works. For shops on aggressively rotating IPs, you can either (a) request a static IP from your ISP (usually $5–10/mo), (b) use the per-record IP capture for visibility-only without strict blocking, or (c) rely on the NFC tag + device verification — the IP becomes one signal among three, not a single point of failure.

**Q: What if my staff use mobile data instead of WiFi?**
A: That's the exact case the whitelist defeats — a mobile data clock-in from the parking lot fails the network check. If you want to allow mobile-data clock-ins in some scenarios (e.g., supply runs), DailyBrew lets you flag rather than block, so the clock-in goes through but gets surfaced for your review.

**Q: Can I clock in from home if I'm working remotely?**
A: That depends on your settings. By default, the whitelist blocks clock-ins outside the shop's network. If you have an owner or manager who needs to log admin hours from home, you can allow specific user roles to bypass the whitelist while keeping it strict for hourly staff.

**Q: Is IP tracking legal and GDPR-compliant?**
A: Yes, when handled with disclosure. IP addresses are personal data under GDPR, but recording them for fraud prevention and payroll integrity is a legitimate interest under Article 6(1)(f). DailyBrew records only the IP at the moment of clock-in (no continuous tracking), stores it in your account region, and lists it in our data processing addendum. We provide template staff notices for US, UK, EU, Canada, Australia, and India.

**Q: Can I clock in on a shared tablet at the front of the café?**
A: Yes. DailyBrew supports shared-tablet kiosk mode. In that mode, the tablet is the verified device for everyone assigned to it. The per-record device fingerprint still applies, so you get the same buddy-punching protection.

**Q: What if I forget my phone at home?**
A: Tell your manager. They can clock you in manually from the dashboard, and the punch is logged as a manager override (visible in the audit trail). No biometric workaround, no PIN to share.

**Q: Can a manager override and clock me in?**
A: Yes — manager overrides are first-class and always audit-logged with the manager's name, the timestamp, and a reason field. Small teams need flexibility for forgotten phones, broken screens, and shift handovers.

**Q: How is this different from face recognition?**
A: Face recognition verifies who is in front of the camera by storing a mathematical representation of your face. DailyBrew verifies which device is being used, by checking a token registered to that device the first time you used it. The first approach requires consent for biometric processing and exposes you to laws like BIPA (which has produced settlements like Facebook's $650M and Cothron v. White Castle's $9.39M). Ours doesn't — no biometric data is collected, stored, or processed.

**Q: Can two staff share one phone?**
A: They can, but each staff member's clock-ins from that phone will only work for the person it was originally registered to. The second staff member would either need their own device registered, or the manager has to reset and re-bind. This is deliberate — it's the mechanism that kills buddy punching.

**Q: What happens if the NFC tag is damaged or stolen?**
A: Tags are inexpensive — a starter pack ships with every paid plan, and replacements ship within a week. If a tag is stolen, void its ID in your dashboard and the punches against it stop counting. Because the model requires device + IP + tag, a stolen tag alone is useless without an enrolled staff phone on the shop's network.

**Q: Do I need to buy a special NFC tag from DailyBrew?**
A: No — any NDEF-formatted NFC tag works (NTAG 213, 215, 216 are standard). DailyBrew ships a starter pack so you don't have to source them, but you can order from Amazon or GoToTags and program them in your dashboard. No hardware lock-in.

**Q: How is three-factor attendance different from just QR code attendance?**
A: QR alone proves the staff member was near the QR code at some point — a photo of the code, shared in a group chat, can be scanned from the parking lot. DailyBrew's QR is already bound to the verified device and the shop's IP, so we've never been a bare-QR vendor. NFC tap adds the third factor: the phone must be physically within a few centimeters of a tag that lives only at your shop. Device (something you have) + IP (somewhere you are) + tag (something you tap) — that's the three.

**Q: Why is NFC in beta and what does that mean for me?**
A: We're shipping NFC carefully because hardware-software handshakes deserve testing on the actual phones your staff use. Joining the beta means free tags, founder-direct support, and first access — in exchange for telling us what breaks. The QR + device + IP stack is fully shipped and is what most customers run on today.

---

## 11. Schema Markup

### SoftwareApplication (homepage, /qr-code-attendance, /three-factor-attendance, /tap-to-clock-in)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DailyBrew",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "featureList": [
    "QR code clock-in for staff attendance",
    "NFC tap-to-clock-in (beta)",
    "Per-attendance-record device verification",
    "IP whitelist verification (per-record + per-location)",
    "Three-factor attendance verification",
    "No biometric data collection",
    "No GPS tracking required",
    "Buddy punching prevention",
    "Cloud-based timesheet export",
    "Leave management"
  ],
  "offers": [
    {"@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD"},
    {"@type": "Offer", "name": "Expresso", "price": "12.99", "priceCurrency": "USD"},
    {"@type": "Offer", "name": "Dark Roast", "price": "39.99", "priceCurrency": "USD"}
  ]
}
```

### FAQPage (homepage, /three-factor-attendance, /tap-to-clock-in, /stop-buddy-punching)
Wrap the FAQ block from §10 in `FAQPage` schema.

### HowTo (on /device-verified-attendance and /how-it-works)

```json
{
  "@type": "HowTo",
  "name": "How three-factor attendance works with DailyBrew",
  "step": [
    {"@type":"HowToStep","name":"Add staff","text":"Add each staff member to your DailyBrew workspace."},
    {"@type":"HowToStep","name":"First scan","text":"Staff member scans QR or taps NFC for the first time. The device is registered and locked to that staff member."},
    {"@type":"HowToStep","name":"Network check","text":"Each clock-in records the IP; clock-ins outside your whitelisted shop network are blocked or flagged."},
    {"@type":"HowToStep","name":"Trusted clock-ins","text":"Subsequent scans/taps from the verified device on the verified network are trusted automatically."},
    {"@type":"HowToStep","name":"Blocked attempts","text":"Any scan from a different device, or from a non-whitelisted IP, is rejected or flagged for manager review."}
  ]
}
```

### Other
- `BreadcrumbList` on every non-home page.
- `Article` schema on blog posts.
- `Product` schema with `offers.availability` = `PreOrder` on /tap-to-clock-in to signal beta.
- `Review` markup on /vs-X pages with founder attribution.

---

## 12. 90-Day Execution Roadmap

### Days 1–30 — Foundation

**Ship in this order:**
1. SSR the marketing site (non-negotiable; nothing else works without this).
2. Update homepage hero to interim version (QR-anchored, NFC teased as waitlist).
3. /cafes — new flagship industry page with café-themed copy (baristas, espresso, morning rush, weekend brunch).
4. /qr-code-attendance — rewrite to lead with QR + device + IP as unified three-factor framing.
5. /three-factor-attendance — narrative anchor.
6. /ip-verification — fully shipped feature, no caveats.
7. /tap-to-clock-in — NFC waitlist page (free starter tags, founder onboarding, first access).
8. /stop-buddy-punching — primary BOFU buddy-punching page.
9. /tools/annual-leave-calculator/uk — first calculator.

**Other Day-30 deliverables:**
- SoftwareApplication + FAQPage schema deployed.
- Google Search Console + Bing Webmaster verified.
- Submit to G2, Capterra, GetApp, SoftwareSuggest, AlternativeTo, SaaSHub.
- Product Hunt launch in week 4.
- Sitemap published.

**Realistic outcome:** 0–100 organic visits/mo. 0–10 signups.

### Days 31–60 — Tool + comparison cluster

**Ship:**
- /vs-jibble, /vs-homebase, /vs-connecteam (the closest NFC competitor), /vs-buddy-punch.
- /restaurants, /coffee-shops, /bars (industry expansion).
- /device-verified-attendance, /no-gps-attendance-app (privacy buyer).
- /tools/shift-schedule-generator.
- /tools/annual-leave-calculator/{singapore,malaysia,australia}.
- /tools/attendance-policy-generator.
- /tools/buddy-punching-cost-calculator (link-bait).
- Blog posts #1–6 from §6.
- Pitch 5 podcast guest spots; HN/IH/F&B Reddit posts.

**Realistic outcome:** 200–800 organic visits/mo. 5–25 signups.

### Days 61–90 — Programmatic + PR

**Ship:**
- 8 country leave-law reference pages.
- 6 more industry pages (food-trucks, bakeries, QSR, boutiques, convenience-stores, small-shops).
- 4 more /vs- pages.
- 10 glossary entries (programmatic from JSON).
- /integrations/basilbook (high-intent integration page).
- /how-it-works (visual three-factor walkthrough).
- Blog posts #7–12.
- First link-building round: guest posts on F&B/SMB blogs + the 4 PR angles from §9.
- Soft-launch NFC beta to first 10 waitlist signups; capture case studies and quotes.

**Realistic outcome:** 500–1,500 organic visits/mo. 15–60 signups.

### Days 60–90 — NFC graduation (parallel track)

- When NFC reliability hits >95% first-tap success across iPhone XS+ and Android NFC devices, flip homepage to NFC-led messaging.
- Move /tap-to-clock-in to primary nav.
- Demote /qr-code-attendance to "no-hardware-needed entry point."
- Threshold to pull back: if first-tap success <80% on common iPhones, OR meaningful share of staff are on iPhone 6/SE-1st-gen, keep QR-led messaging. Revisit in 30-day cycles.
- Threshold to accelerate: if waitlist >100 shops by Day 45, OR a Connecteam comparison post gets traction, flip the homepage earlier.

---

## 13. Metrics & Decision Thresholds

### Primary metric: Self-serve signups per week
Segmented by: total signups, NFC waitlist signups (leading indicator), signups attributed to new pages (via UTM or first-page-seen).

### Day-90 evaluation thresholds

| Threshold | Diagnosis | Action |
|---|---|---|
| /cafes not on page 2 for "attendance app for cafe" | Differentiation too weak | Rewrite with 800 more words of operator-specific copy |
| /qr-code-attendance not in top 30 for "QR code attendance app" | SERP intent is informational, not BOFU | Pivot to guide format with product mentioned in-context |
| UK Leave Calculator <500 monthly impressions in GSC | Technical issue (rendering/schema/canonical) | Audit page; not a content problem |
| Organic signups >50/mo | Plan is working | Double down: months 4–6 build out India, Philippines, Canada, NZ |
| Organic signups <10/mo despite traffic | Product-page conversion issue | Stop building pages; rewrite home + pricing + onboarding |
| Self-serve signups drop after homepage update | Hero regression | Roll back hero within 7 days |
| Connecteam comparison post +30 signups in 14 days | Validation of three-factor narrative | Accelerate to NFC-led homepage |
| 4 core feature pages <500 combined sessions/mo at Day 60 | Bottleneck is backlinks, not content | Pivot 50% effort to digital PR, podcast tour, HN/IH for 30 days |
| /no-biometric-time-clock ranks page 1 but converts <0.5% | Wrong page type for the intent | Kill standalone; fold into /stop-buddy-punching |
| NFC beta first-tap success <80% on common iPhones | Hardware reliability problem | Keep QR-led messaging; revisit in 30 days |
| NFC waitlist >100 shops by Day 45 | Demand validated | Bring NFC-led homepage flip forward |

### What NOT to do
- Don't try to outrank Clockify, Homebase, or Jibble on head terms in Year 1.
- Don't write generic "best time tracking software" listicles — they reward aggregators.
- Don't gate any tool behind an email form.
- Don't pursue payroll, HR-suite, or onboarding keywords.
- Don't start a long-form blog at high cadence — 1 well-targeted post per week is fine.
- Don't lead the homepage with "tap to clock in" until NFC is GA.
- Don't target "WiFi attendance" as a bare term.
- Don't claim "first to market on device verification" — frame as "device verification at the attendance record level" or "per-punch device binding."

---

## 14. Caveats

1. **Keyword volumes and difficulty are directional estimates**, not Ahrefs/Semrush exports. Validate via paid tool before committing engineering time per page.
2. **Competitor Domain Rating figures are inferred** from traffic data, not directly cited. Use Ahrefs' free Website Authority Checker before pricing campaigns.
3. **NFC search demand is genuinely small** (~2,500–8,000 monthly across the cluster). This is a brand-and-narrative play, not a traffic play. The traffic engine remains QR + IP + comparison pages.
4. **iPhone NFC background reading requires iPhone XS or newer.** For shops where staff carry iPhone 6/6s/SE-1st-gen, the flow has an extra "open app, tap NFC" step. Honest FAQ handles this but it's real setup friction.
5. **wifiattendance.com owns the "WiFi attendance" SERP.** Use modified phrases only.
6. **Connecteam's NFC is in beta and they still market it openly.** This is permission to do the same — and a warning: the most marketing-resourced competitor in this niche hasn't graduated NFC yet, which suggests engineering edges are real. Plan support hours.
7. **OnTheClock is the closest device-verification competitor** ("Enable device & browser authorization"). Frame the differentiation as "per-record device binding," not "first to market."
8. **G2/Capterra listings cost time, not just submission.** Plan ~2 hours each.
9. **AI search (Google AI Overviews, Perplexity, ChatGPT) is increasingly important** but still volatile. Schema + structured data work is the right hedge.
10. **Buddy-punching cost statistics from different primary sources.** The "75% of businesses affected" figure is American Payroll Association. The "2.2% of gross payroll" and "$373M annually" figures are Nucleus Research. Attribute correctly.
11. **Traffic projections assume average execution.** A solo founder with one good month and three slow ones sees linear-not-compound growth. The Month-6 figures assume consistent shipping.
12. **The plan ignores paid acquisition entirely.** $500–$1,500/mo on the same long-tail terms would accelerate signups while organic compounds.
13. **Stay anchored to F&B + retail SMB voice.** Easy to drift into "deskless workforce" generalities when describing NFC, or "compliance" generalities when describing BIPA. The differentiator is being the only credible three-factor attendance app built specifically for cafés and small shops.
14. **Cambodia operating base is not a disadvantage** for global English, but be careful about timezone-only support claims against StaffAny on SEA queries — that's StaffAny's stated edge.
15. **The interim hero copy must not break conversion.** If self-serve signups drop after the update, roll back within 7 days — that's the canary.

---

**End of master document.** This consolidates SEO Strategy v1 (foundation), v2 (device verification), and v3 (NFC + IP repositioning). Treat sections 5, 6, 10, and 12 as execution-ready — copy out and ship.
