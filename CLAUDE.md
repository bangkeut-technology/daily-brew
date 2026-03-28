# CLAUDE.md — DailyBrew

Staff attendance and leave tracking for restaurants.
Symfony backend + React frontend (Symfony Webpack Encore).

---

## What this product does

- Restaurant owners sign up, create a Workspace (their restaurant)
- Owner creates Employees and assigns them a Shift
- Each Employee gets a unique QR code
- Staff scan the QR code on their phone → mobile web page opens → tap Check In
- Attendance is recorded and compared against their Shift to detect late arrivals and early departures
- Staff submit Leave Requests via mobile web page; owner approves or rejects from dashboard
- Owner defines Closures (date ranges when restaurant is closed) — no attendance expected during these periods

---

## What this product does NOT do

- No KPI / evaluation / scoring
- No payroll, payslips, or salary management
- No LinkedIn OAuth

Any request to add the above should be deferred to a future milestone.

### Espresso Plan ($12.99/month)
Premium features gated behind Espresso subscription:
- Unlimited employees (free = 5 max)
- IP restriction for check-in
- Geofencing for check-in (lat/lng + radius)
- Per-day shift schedules (ShiftTimeRule per day-of-week)
- Leave request management
- Priority support

### Dark Roast Plan (future roadmap — do NOT build)
- Multiple QR codes per workspace (e.g. front door, kitchen, bar)
- Per-QR geofence & WiFi rules
- Employee assignment per QR code
- Manager role (elevated Employee — can view team attendance & approve leave)
- White-label branding (custom logo, colors, app name per workspace)

### Dual Role System
Users can be owners (create workspaces) or employees (linked to an employee record).
- After sign-up, users go through an onboarding wizard to choose their role.
- Owner view: full dashboard, employee management, shift/closure/settings pages
- Employee view: personal dashboard, own attendance, own leave requests
- A user can be both owner and employee in different workspaces.

---

## Data Model

### Entities

**User**
- id, publicId (UUID)
- email, password (nullable for OAuth)
- googleId (nullable), appleId (nullable)
- createdAt, updatedAt
- Role: ROLE_USER (all authenticated users)

**Workspace**
- id, publicId
- name (restaurant name)
- ownerId → User (ManyToOne)
- createdAt, updatedAt

**WorkspaceSetting**
- id
- workspaceId → Workspace (OneToOne)
- ipRestrictionEnabled (boolean, default false)
- allowedIps (array, nullable) — IPs allowed to scan QR codes
- timezone (string, default "Asia/Phnom_Penh")
- locale (string, default "en")

**Shift**
- id, publicId
- workspaceId → Workspace (ManyToOne)
- name (e.g. "Morning", "Evening")
- startTime (time)
- endTime (time)
- createdAt, updatedAt

**Closure**
- id, publicId
- workspaceId → Workspace (ManyToOne)
- name (e.g. "Khmer New Year", "Renovation")
- startDate (date)
- endDate (date)
- createdAt

**Employee**
- id, publicId
- workspaceId → Workspace (ManyToOne)
- userId → User (OneToOne, nullable) — unique constraint on userId
- shiftId → Shift (ManyToOne, nullable)
- name
- phone (nullable)
- qrToken (string, unique) — used in QR code URL
- active (boolean, default true)
- createdAt, updatedAt

**Attendance**
- id, publicId
- employeeId → Employee (ManyToOne)
- date (date)
- checkInAt (datetime, nullable)
- checkOutAt (datetime, nullable)
- isLate (boolean, computed on check-in vs Shift.startTime)
- leftEarly (boolean, computed on check-out vs Shift.endTime)
- ipAddress (string, nullable — recorded for audit)
- createdAt, updatedAt
- Unique constraint: (employeeId, date)

**LeaveRequest**
- id, publicId
- employeeId → Employee (ManyToOne)
- date (date)
- reason (text, nullable)
- status (enum: pending, approved, rejected, default pending)
- reviewedAt (datetime, nullable)
- createdAt, updatedAt

---

## Key Business Rules

### Closure logic
Before creating or flagging any attendance record, check if the date falls within any Closure for the workspace. If yes, skip entirely — no absent flag, no record required.

```php
// Check if date is within any closure
$closure = $closureRepo->findActiveOnDate($workspace, $date);
if ($closure !== null) {
    return; // Do nothing
}
```

### Late / left early detection
Computed at the moment of check-in and check-out, relative to the Employee's assigned Shift. If employee has no Shift, these are always false.

```php
$isLate = $shift && $checkInTime > $shift->getStartTime()->modify('+0 minutes');
$leftEarly = $shift && $checkOutTime < $shift->getEndTime();
```

A grace period (e.g. 5 minutes) can be added as a WorkspaceSetting field later — not in scope now.

### QR check-in IP restriction
On check-in via QR:
1. If `WorkspaceSetting.ipRestrictionEnabled` is false → allow
2. If enabled and `allowedIps` is empty → allow (misconfiguration fallback)
3. If enabled → check request IP against `allowedIps` → reject with 403 if not matched

### User ↔ Employee (1:1)
- A User can be linked to at most one Employee (`unique` constraint on `employee.user_id`)
- An Employee can exist without a User (QR-only staff)
- Linking is done by the owner from the employee detail page

### Attendance uniqueness
One Attendance record per Employee per day. Attempting a second check-in on the same day returns the existing record.

---

## Authentication

JWT authentication via LexikJWTAuthenticationBundle.

**Supported flows:**
- Email + password (`/api/v1/auth/login`)
- Google OAuth (`/api/v1/auth/google`)
- Apple OAuth (`/api/v1/auth/apple`)

All flows return a JWT. No session, no cookies.

**Who authenticates:**
- Owners (to access the dashboard)
- Employees linked to a User (to view their own attendance history — future)

**Who does NOT authenticate:**
- QR-scanning staff — they use a tokenized URL, no account needed

---

## QR Check-in Flow

1. Owner generates a QR code per employee from the dashboard
2. QR encodes: `https://dailybrew.work/checkin/{qrToken}`
3. Staff scans → mobile browser opens the check-in page (no login)
4. Page shows employee name + Check In button (and Check Out if already checked in today)
5. POST `/api/v1/checkin/{qrToken}` → validates IP if restriction enabled → creates or updates Attendance record
6. Response: success screen with time recorded

The check-in page is a public route — no auth required, token is the only security.

---

## Backend Architecture

### Stack
- Symfony 7
- Doctrine ORM
- LexikJWTAuthenticationBundle
- KnpPaginatorBundle (for list endpoints)
- Symfony Messenger (for async jobs if needed later)

### Structure
```
src/
  ApiController/       # All API controllers
    Auth/
    Workspace/
    Employee/
    Attendance/
    Shift/
    Closure/
    LeaveRequest/
    Checkin/           # Public QR check-in endpoint
  Entity/
  Repository/
  Service/
  Security/
    Voter/
      WorkspaceVoter.php
  EventSubscriber/
```

### API prefix
`/api/v1/{_locale}` — locales: en, fr, km

### Controller pattern
- Controller + Trait pattern (same as existing codebase)
- Business logic in `src/Service/`
- No API Platform

### Multi-tenancy
- Workspace is the root aggregate
- Every entity is scoped to a Workspace
- WorkspaceVoter handles all authorization

---

## Frontend Architecture

### Stack
- React 19 + TypeScript
- TanStack Router (file-based routing)
- TanStack Query (server state)
- shadcn/ui + Radix UI
- Tailwind CSS v4
- Zod (validation)
- React Hook Form
- Axios (HTTP client)
- i18next (en, fr, km)
- Lucide React (icons)
- Sonner (toasts)

### Route structure

```
/                          → Landing page
/sign-in                   → Owner login
/sign-up                   → Owner registration
/auth/callback             → OAuth callback
/checkin/:qrToken          → PUBLIC — mobile check-in page (no auth)

/console/                  → Auth guard
  dashboard                → Today's attendance overview
  employees/               → Employee list
    new                    → Add employee
    :publicId/             → Employee detail + attendance history
  attendance/              → Attendance log (filterable by date)
  leave/                   → Leave request list + approve/reject
  shifts/                  → Shift management
  closures/                → Closure management
  settings                 → WorkspaceSetting (IP restriction etc.)
  profile/                 → User profile
```

### Pages to DELETE from current codebase
- `attendance-batches/` — replaced by Closure
- `evaluations/` — removed entirely
- `manage/criterias/` — removed
- `manage/templates/` — removed
- `manage/members/` — removed (no team members feature yet)
- `manage/allowed-ips/` — replaced by WorkspaceSetting
- `payroll/` — removed entirely
- `shifts/$shiftPublicId/` — simplify, no ShiftTimeRule

### Components to DELETE
- `kpi/` folder — all KPI gantt components
- `attendance-gantt*` — replaced by simple attendance table
- `evaluation-*` — all evaluation components
- `employee-evaluation-*`
- `data-table/evaluation-*`
- `dialog/add-evaluation-*`, `edit-evaluation-*`, `new-evaluation-*`
- `button/employee-evaluation-button`
- `button/remove-template-criteria-button`
- `form/evaluation-*`

### Check-in mobile page
- Fully public route `/checkin/:qrToken`
- Mobile-first design
- Shows: employee name, today's date, current status (not checked in / checked in at X)
- Single large button: "Check In" or "Check Out"
- No navigation, no sidebar — standalone page
- Handles IP restriction error gracefully ("Check-in not allowed from this location")

### Sidebar navigation (console)
```
Dashboard
Employees
Attendance
Leave Requests
──────────────
Shifts
Closures
Settings
──────────────
Profile
```

---

## Entities to DELETE from current codebase

```
src/Entity/
  EmployeeEvaluation.php    ← delete
  EmployeeScore.php         ← delete
  EvaluationCriteria.php    ← delete
  EvaluationTemplate.php    ← delete
  EvaluationTemplateCriteria.php ← delete
  PayrollRun.php            ← delete
  Payslip.php               ← delete
  PayslipItem.php           ← delete
  EmployeeSalary.php        ← delete
  ShiftTimeRule.php         ← delete
  WorkspaceAllowedIp.php    ← replace with WorkspaceSetting.allowedIps
  AttendanceBatch.php       ← delete (replaced by Closure)
  LeaveRequest.php          ← KEEP (already exists)
  DemoSession.php           ← delete (no demo mode)
```

New entities to create:
```
  Closure.php               ← new
  WorkspaceSetting.php      ← new
```

---

## Commands

```bash
# Backend
composer install
php bin/console doctrine:migrations:migrate
php bin/console lexik:jwt:generate-keypair

# Frontend
npm ci
npm run router:generate
npm run dev
```

---

## Frontend Style Guide

### Design Language
Warm & friendly café feel — think Notion's calm layout with a coffee-house palette.
Glassmorphism cards. Smooth transitions. Sidebar with icons + labels. Card-heavy dashboard.

---

### Color Palette

```css
:root {
  /* Backgrounds */
  --cream:        #FAF7F2;  /* page background */
  --cream-2:      #F3EDE3;  /* sidebar background */
  --cream-3:      #EBE2D6;  /* dividers, hover states, borders */

  /* Brand */
  --coffee:       #6B4226;  /* primary action, logo, active nav */
  --coffee-light: #9B6B45;  /* hover on primary */
  --amber:        #C17F3B;  /* accent, badges, nav dot, card top bar */
  --amber-light:  #E8A85A;  /* gradients */

  /* Text */
  --text-primary:   #2C2420;  /* headings, names */
  --text-secondary: #7C6860;  /* subtitles, meta */
  --text-tertiary:  #AE9D95;  /* hints, shift labels, timestamps */

  /* Glass */
  --glass-bg:     rgba(255,255,255,0.62);
  --glass-border: rgba(255,255,255,0.85);

  /* Status */
  --green: #4A7C59;   /* present, on time, approved */
  --red:   #C0392B;   /* absent, rejected */
  --blue:  #3B6FA0;   /* info, evening shift */

  /* Sidebar */
  --sidebar-w: 220px;
}
```

**Background radial gradient** — always apply to `body::before`:
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 0% 0%,   rgba(193,127,59,0.10) 0%, transparent 55%),
    radial-gradient(ellipse at 100% 100%, rgba(107,66,38,0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 10%,  rgba(232,168,90,0.07) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}
```

---

### Typography

```css
/* Headings — warm editorial feel */
font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;

/* Body, labels, data, UI elements */
font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace — timestamps, tokens */
font-family: 'Segoe UI', 'SF Mono', monospace;
font-variant-numeric: tabular-nums;
```

| Element | Size | Weight | Font |
|---|---|---|---|
| Page title | 24px | 600 | Serif |
| Card title | 14px | 600 | Sans |
| Nav item | 13.5px | 400/500 | Sans |
| Body / name | 13.5px | 500 | Sans |
| Subtitle | 13px | 400 | Sans |
| Label / badge | 10.5–11px | 500 | Sans |
| Timestamp | 12.5px | 400 | Mono |

---

### Glass Card

The primary container component. Use for all dashboard panels, lists, and forms.

```tsx
// Tailwind equivalent
<div className="
  bg-white/60 backdrop-blur-md
  border border-white/85
  rounded-2xl
  shadow-[0_2px_12px_rgba(107,66,38,0.05)]
  overflow-hidden
  transition-all duration-200
  hover:-translate-y-0.5
  hover:shadow-[0_6px_20px_rgba(107,66,38,0.10)]
">
```

```css
/* Raw CSS */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(107,66,38,0.05);
  overflow: hidden;
}
```

**Card header** — always has a title + optional action link:
```tsx
<div className="px-5 py-4 border-b border-[#EBE2D6]/80 flex items-center justify-between">
  <span className="text-sm font-semibold text-[#2C2420]">Today's Attendance</span>
  <span className="text-xs text-[#C17F3B] font-medium cursor-pointer">View all →</span>
</div>
```

---

### Stat Card

Used in the 4-column dashboard grid. Has a colored top bar accent and a hover lift.

```tsx
<div
  className="relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-5
             shadow-sm cursor-default overflow-hidden
             transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
>
  {/* Colored top accent bar */}
  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[--accent] opacity-60" />

  <p className="text-[10.5px] uppercase tracking-[0.8px] font-medium text-[#7C6860] mb-2.5">
    Present today
  </p>
  <p className="text-[32px] font-semibold text-[#2C2420] leading-none tracking-[-1px] mb-1.5">
    7
  </p>
  <p className="text-xs text-[#AE9D95]">of 9 employees</p>

  {/* Background emoji icon */}
  <span className="absolute top-4 right-4 text-xl opacity-[0.18] select-none">✅</span>
</div>
```

Accent colors per card type:
- Present → `#4A7C59` (green)
- Late → `#C17F3B` (amber)
- On leave → `#3B6FA0` (blue)
- Absent → `#C0392B` (red)

---

### Employee Avatar

Color is deterministic per employee — derive from name or index. Never use photos.

```tsx
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #C17F3B, #6B4226)',
  'linear-gradient(135deg, #3B6FA0, #1a3a5c)',
  'linear-gradient(135deg, #4A7C59, #2a4a35)',
  'linear-gradient(135deg, #9B6B45, #5a3a1a)',
  'linear-gradient(135deg, #7C5C9B, #3a2a5c)',
  'linear-gradient(135deg, #C0392B, #6b1a10)',
];

function Avatar({ name, index, size = 32, radius = '50%' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size,
      borderRadius: radius,
      background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: 'white', flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

// Small (attendance rows): size=32, radius='50%'
// Large (employee cards): size=42, radius='12px'
// Phone (QR page): size=64, radius='20px'
```

---

### Status Badge

```tsx
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const badgeStyles: Record<BadgeVariant, string> = {
  green: 'bg-[#4A7C59]/10 text-[#4A7C59]',
  amber: 'bg-[#C17F3B]/10 text-[#C17F3B]',
  red:   'bg-[#C0392B]/10 text-[#C0392B]',
  blue:  'bg-[#3B6FA0]/10 text-[#3B6FA0]',
  gray:  'bg-[#AE9D95]/15 text-[#7C6860]',
};

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${badgeStyles[variant]}`}>
      {label}
    </span>
  );
}

// Usage
<Badge label="On time"  variant="green" />
<Badge label="Late"     variant="amber" />
<Badge label="Absent"   variant="red"   />
<Badge label="On leave" variant="gray"  />
<Badge label="Pending"  variant="amber" />
<Badge label="Approved" variant="green" />
<Badge label="Rejected" variant="red"   />
```

---

### Buttons

```tsx
// Primary — coffee brown, hover lifts
<button className="
  flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium
  bg-[#6B4226] text-white border-none cursor-pointer
  transition-all duration-150
  hover:bg-[#9B6B45] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]
">
  + Add Employee
</button>

// Secondary — glass, subtle border
<button className="
  flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium
  bg-white/62 backdrop-blur-sm text-[#2C2420]
  border border-[#EBE2D6] cursor-pointer
  transition-all duration-150
  hover:bg-[#EBE2D6]
">
  Export
</button>

// Approve (inline in leave rows)
<button className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer
  bg-[#4A7C59]/12 text-[#4A7C59] transition-colors hover:bg-[#4A7C59]/20">
  ✓ Approve
</button>

// Reject (inline in leave rows)
<button className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer
  bg-[#C0392B]/10 text-[#C0392B] transition-colors hover:bg-[#C0392B]/18">
  ✕ Reject
</button>
```

---

### Sidebar Navigation Item

```tsx
function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer mb-px
        font-sans text-[13.5px] transition-all duration-[180ms]
        ${active
          ? 'bg-white/62 backdrop-blur-sm text-[#6B4226] font-medium border border-white/85 shadow-[0_1px_4px_rgba(107,66,38,0.08)]'
          : 'text-[#7C6860] hover:bg-[#EBE2D6] hover:text-[#2C2420]'
        }
      `}
    >
      {icon}
      {label}
      {badge && (
        <span className="ml-auto mr-3.5 bg-[#C17F3B] text-white text-[10px] font-semibold px-1.5 py-px rounded-full">
          {badge}
        </span>
      )}
      {/* Active dot */}
      <span className={`absolute right-2.5 w-1 h-1 rounded-full bg-[#C17F3B] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
```

---

### Page Transitions

Every page mount should fade in + slide up slightly:

```css
@keyframes pageIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: pageIn 0.25s ease forwards;
}
```

In React with TanStack Router, apply via route wrapper or `useEffect` on mount.

---

### Attendance Row

Standard pattern used in dashboard and attendance log pages:

```tsx
function AttendanceRow({ employee, shift, time, checkOut, status, index }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 transition-colors duration-[120ms] hover:bg-[#EBE2D6]/35 cursor-default">
      <Avatar name={employee} index={index} size={32} />
      <div className="flex-1">
        <div className="text-[13.5px] font-medium text-[#2C2420] font-sans">{employee}</div>
        <div className="text-[11px] text-[#AE9D95] font-sans">{shift}</div>
      </div>
      <div className="text-[12.5px] text-[#7C6860] font-mono tabular-nums">
        {time}{checkOut ? ` → ${checkOut}` : ''}
      </div>
      <Badge label={status.label} variant={status.variant} />
    </div>
  );
}
```

---

### QR Check-in Mobile Page

Standalone public page — no sidebar, no nav, no auth. Mobile-first. Max width 400px, centered.

```tsx
// pages/checkin/[qrToken].tsx
export default function CheckinPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <p className="text-[11px] font-medium tracking-[2px] uppercase text-[#AE9D95] mb-8 font-sans">
        DailyBrew
      </p>

      {/* Avatar */}
      <div className="w-16 h-16 rounded-[20px] flex items-center justify-center text-2xl font-bold text-white mb-4"
           style={{ background: 'linear-gradient(135deg, #E8A85A, #6B4226)',
                    boxShadow: '0 4px 14px rgba(107,66,38,0.25)' }}>
        SK
      </div>

      {/* Name + Shift */}
      <h1 className="text-[18px] font-semibold text-[#2C2420] mb-1">Sophea Keo</h1>
      <p className="text-[12px] text-[#AE9D95] mb-6 font-sans">☀️ Morning · 08:00–17:00</p>

      {/* Status pill */}
      <div className="bg-[#4A7C59]/10 border border-[#4A7C59]/20 rounded-full px-4 py-1.5
                      text-[12px] text-[#4A7C59] font-medium mb-8 font-sans">
        ✓ Checked in at 07:58
      </div>

      {/* CTA button */}
      <button className="w-full max-w-xs bg-[#6B4226] text-white text-[16px] font-semibold
                         rounded-2xl py-4 border-none cursor-pointer
                         shadow-[0_4px_14px_rgba(107,66,38,0.30)]
                         active:scale-[0.97] transition-transform">
        Check Out
      </button>

      {/* Time */}
      <p className="text-[11px] text-[#AE9D95] mt-6 font-sans">Thursday, 26 March · 10:24 AM</p>
    </div>
  );
}
```

**Error states on the check-in page:**
- IP restricted: show a warm amber warning card, no button
- Already checked out: show completed state, no button
- Invalid token: show 404-style message

---

### Empty States

Use a dashed border card with a centered + prompt:

```tsx
<div className="border-[1.5px] border-dashed border-[#EBE2D6] rounded-2xl
                bg-white/30 flex flex-col items-center justify-center
                min-h-[120px] cursor-pointer transition-colors
                hover:bg-[#EBE2D6]/30">
  <span className="text-2xl text-[#AE9D95] mb-1.5">+</span>
  <span className="text-[13px] text-[#AE9D95] font-sans">Add employee</span>
</div>
```

---

### Do / Don't

| Do | Don't |
|---|---|
| Use cream backgrounds (#FAF7F2) | Use pure white backgrounds |
| Glass cards with `backdrop-blur` | Flat opaque cards |
| Serif font for page titles | Inter or Roboto anywhere |
| Deterministic avatar gradients | User photos or generic icons |
| Amber accent for interactive elements | Blue as primary accent |
| `hover:-translate-y-px` lift on cards | Box-shadow only (no lift) |
| Sentence case everywhere | Title Case on labels |
| Tabular nums for timestamps | Default font for numbers |
| Warm status colors (green/amber/red) | Gray-only status indicators |

---

## Out of scope (do not build unless explicitly asked)

- ShiftTimeRule (per-day-of-week shift hours)
- Payroll / payslip generation
- KPI / evaluation / scoring
- Team members / manager roles (only owner role for now)
- Employee mobile app (Expo) — check-in is mobile web only
- Push notifications
- Export to CSV/Excel
- Demo mode
