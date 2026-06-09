import {
  Building2,
  Smartphone,
  Crown,
  Nfc,
  type LucideIcon,
} from 'lucide-react';

export type PlaybookStep = {
  title: string;
  desc: string;
  /**
   * Optional feature-flag key (matches FeatureFlagEnum on the server).
   * When set, this step is hidden if the flag is off — useful for
   * cross-linking to playbooks that aren't live yet.
   */
  feature?: 'nfc_checkin';
  /**
   * Optional deep-link to a console page. Rendered as a small CTA under the
   * step description. By default the link is only shown to authenticated
   * users; set requireAuth: false for public destinations (sign up / sign in).
   */
  link?: {
    to: string;
    label: string;
    hash?: string;
    requireAuth?: boolean;
  };
};

export type Playbook = {
  key: 'owner' | 'employee' | 'espresso' | 'nfc';
  title: string;
  subtitle: string;
  /** Short one-line teaser used on hubs / persona cards */
  teaser: string;
  icon: LucideIcon;
  accent: string;
  /** Route to the detailed playbook page */
  to: '/guides/owner' | '/guides/employee' | '/guides/espresso' | '/guides/nfc';
  steps: PlaybookStep[];
};

export const playbooks: Playbook[] = [
  {
    key: 'owner',
    title: 'Owner setup',
    subtitle: 'From sign-up to live attendance, in about 10 minutes.',
    teaser: 'Create your workspace, define shifts, add staff, and start tracking.',
    icon: Building2,
    accent: '#6B4226',
    to: '/guides/owner',
    steps: [
      {
        title: 'Create your account',
        desc: 'Sign up with email, Google, or Apple. No credit card needed.',
        link: { to: '/sign-up', label: 'Sign up', requireAuth: false },
      },
      {
        title: 'Name your restaurant',
        desc: 'In the onboarding wizard, pick the owner role and give your workspace a name. Timezone auto-detects from your browser.',
      },
      {
        title: 'Define your shifts',
        desc: 'Console → Shifts. Add Morning, Evening, or any custom shift with start and end times.',
        link: { to: '/console/shifts', label: 'Open Shifts' },
      },
      {
        title: 'Add your employees',
        desc: 'Console → Employees → Add. Fill in name and assign a shift. Linking to a user account is optional now — you can do it later from the employee detail page.',
        link: { to: '/console/employees/new', label: 'Add an employee' },
      },
      {
        title: 'Link an employee to a user account',
        desc: 'Open the employee → Link user card → paste the user\'s public ID (they can copy theirs from Console → Profile). Once linked, the user signs in to see their own attendance, submit leave, and check in via the app. Unlink anytime from the same card.',
        link: { to: '/console/employees', label: 'Open Employees' },
      },
      {
        title: 'Display the workspace QR',
        desc: 'Your dashboard shows the QR code. Print it and pin it at the staff entrance — one QR for the whole restaurant.',
        link: { to: '/console/dashboard', label: 'Open Dashboard' },
      },
      {
        title: 'Watch attendance live',
        desc: 'As staff check in, your dashboard updates with present, late, on leave, and absent counts.',
        link: { to: '/console/attendance', label: 'Open Attendance' },
      },
      {
        title: 'Approve leave and schedule closures',
        desc: 'Review leave requests on the Leave tab. Add closures for holidays so staff are not marked absent.',
        link: { to: '/console/leave', label: 'Review leave requests' },
      },
    ],
  },
  {
    key: 'employee',
    title: 'Employee day-to-day',
    subtitle: 'Check in, check out, and request time off from your phone.',
    teaser: 'Install the app, link to your workspace, and scan the QR to clock in.',
    icon: Smartphone,
    accent: '#4A7C59',
    to: '/guides/employee',
    steps: [
      {
        title: 'Install the DailyBrew app',
        desc: 'Available free on the App Store and Google Play.',
      },
      {
        title: 'Sign in',
        desc: 'Use email, Google, or Apple — the same account works on every phone you sign in from.',
        link: { to: '/sign-in', label: 'Sign in', requireAuth: false },
      },
      {
        title: 'Link to your employee record',
        desc: 'Two ways: (a) your owner pastes your user public ID — find it on Console → Profile — into the Link user card on your employee page; or (b) you paste the employee public ID your owner shares into the onboarding wizard or Console → Profile → Link to a workspace. You can link to several workspaces if you work at more than one restaurant.',
        link: { to: '/console/profile', label: 'Open Profile' },
      },
      {
        title: 'Scan the QR at the restaurant',
        desc: 'Point the app at the QR on the wall. The check-in screen opens automatically.',
      },
      {
        title: 'Tap Check in',
        desc: 'On-time or Late status appears immediately, based on your assigned shift.',
      },
      {
        title: 'Tap Check out at the end of your shift',
        desc: 'Scan the same QR and tap Check out. If device verification is on, you must use the same phone you checked in with.',
      },
      {
        title: 'Submit leave from the Leave tab',
        desc: 'Pick the dates and type (paid or unpaid). Your owner gets notified and reviews it.',
        link: { to: '/console/leave', label: 'Submit leave' },
      },
    ],
  },
  {
    key: 'espresso',
    title: 'Upgrade to Espresso',
    subtitle: 'Unlock leave management, geofencing, managers, and BasilBook integration.',
    teaser: 'Lock check-in to your restaurant, promote managers, and sync with BasilBook.',
    icon: Crown,
    accent: '#C17F3B',
    to: '/guides/espresso',
    steps: [
      {
        title: 'Open Settings → Subscription',
        desc: 'From your dashboard, click Settings, then Upgrade in the Subscription card.',
        link: { to: '/console/settings', label: 'Open Settings' },
      },
      {
        title: 'Pick monthly or yearly',
        desc: 'Monthly is $19.99. Yearly is $199 — about 17% cheaper. A 14-day free trial covers your first run.',
      },
      {
        title: 'Lock check-in to your restaurant',
        desc: 'Settings → enable IP restriction (use the "Use my current IP" button) or set a geofence with latitude, longitude, and radius (default 100 m).',
        link: { to: '/console/settings', hash: 'settings-ip-restriction', label: 'Open IP / Geofence settings' },
      },
      {
        title: 'Turn on device verification',
        desc: 'Forces each employee to use the same phone for both check-in and check-out, preventing buddy punching.',
        link: { to: '/console/settings', hash: 'settings-device-verification', label: 'Open device verification' },
      },
      {
        title: 'Try NFC check-in (optional)',
        desc: 'Replace the QR scan with a one-second tap against an NFC sticker. NTAG213 tags cost about a dollar each and program in 30 seconds with a free app.',
        feature: 'nfc_checkin',
        link: { to: '/guides/nfc', label: 'Set up NFC check-in', requireAuth: false },
      },
      {
        title: 'Promote a manager',
        desc: 'Employee detail → set role to manager. Managers approve leave and see all attendance, up to 2 per workspace on Espresso.',
        link: { to: '/console/employees', label: 'Open Employees' },
      },
      {
        title: 'Connect BasilBook',
        desc: 'Settings → API tokens → Generate. Copy the token once and paste it into BasilBook to sync attendance with your accounting.',
      },
    ],
  },
  {
    key: 'nfc',
    title: 'Set up NFC check-in',
    subtitle: 'Replace the QR scan with a one-second tap against an NFC sticker.',
    teaser: 'Buy stickers, program them with your workspace URL, place them at the counter — staff tap their phone and they\'re in.',
    icon: Nfc,
    accent: '#3B6FA0',
    to: '/guides/nfc',
    steps: [
      {
        title: 'Make sure you\'re on Espresso',
        desc: 'NFC check-in is included in Espresso along with geofencing, device verification, and managers. Free plans see a "Espresso" badge next to the NFC toggle.',
        link: { to: '/console/settings', label: 'Open Settings' },
      },
      {
        title: 'Turn on NFC check-in',
        desc: 'Console → Settings → "NFC check-in" card → flip the toggle, then Save. This unlocks the "Tap NFC tag" button on each employee\'s home screen in the mobile app.',
        link: { to: '/console/settings', hash: 'settings-nfc-checkin', label: 'Open NFC check-in settings' },
      },
      {
        title: 'Copy your check-in URL',
        desc: 'Console → Dashboard → "Check-in QR code" card. Under the QR you\'ll see a "For NFC tags" row with the URL — click the copy icon. The URL looks like https://dailybrew.work/checkin/<your-token>. Each workspace has its own URL, so if you run multiple restaurants copy each one separately.',
        link: { to: '/console/dashboard', label: 'Open Dashboard' },
      },
      {
        title: 'Buy NTAG213 NFC stickers',
        desc: 'NTAG213 holds 137 bytes — plenty for our URL — and runs about $0.50–$1 each. Search "NTAG213 sticker" on Amazon or Lazada. Get round stickers for the host stand, PVC cards for the till, or key fobs for managers. NTAG215 (504 bytes) works too if you want headroom.',
      },
      {
        title: 'Install a free tag-writing app',
        desc: 'On the phone you\'ll use to program the tags, install "NFC Tools" (wakdev, free on iOS and Android) or NXP "TagWriter" on Android. You only need this once.',
      },
      {
        title: 'Write the URL onto a sticker',
        desc: 'In NFC Tools: Write tab → Add a record → URL/URI → paste the URL you copied → OK → Write. Hold your phone against a blank sticker. You\'ll feel a buzz in 1–2 seconds when it\'s done. Repeat for each sticker.',
      },
      {
        title: 'Lock the stickers (recommended)',
        desc: 'In NFC Tools: Other → Lock tag. This makes the sticker read-only forever so a staff member can\'t accidentally — or intentionally — overwrite it. Skip if you might re-program later.',
      },
      {
        title: 'Stick them where staff naturally pass',
        desc: 'Front of the host stand, under the bar lip, beside the time-clock area. The phone needs to be within 1–4 cm of the sticker, so avoid putting it behind glass or thick wood. Adding a small "Tap to check in" label next to it removes confusion on day one.',
      },
      {
        title: 'Test the tap',
        desc: 'Lock your phone (or close the DailyBrew app). Tap the sticker. On iPhone XS or newer, a banner appears at the top — tap it. On older iPhones, open the app first then tap. Android handles both automatically. After Face ID or passcode, you\'ll see "Checked in".',
      },
      {
        title: 'Pair with geofence / IP / device verification',
        desc: 'NFC by itself only proves the phone touched the tag — pair it with your geofence radius, allowed IP list, or device verification (already in Settings) so a stolen tag image or a copied tag can\'t be used from off-site.',
        link: { to: '/console/settings', hash: 'settings-geofencing', label: 'Open Geofencing' },
      },
    ],
  },
];

export const playbookByKey: Record<Playbook['key'], Playbook> = Object.fromEntries(
  playbooks.map((p) => [p.key, p]),
) as Record<Playbook['key'], Playbook>;
