/**
 * Industry landing pages — one entry = one /<slug> page rendered by the shared
 * IndustryView template. Copy stays in the F&B/retail SMB voice: "your shop",
 * "your barista's phone", honest timesheets. Mirrors frontend/src/lib/industries.ts
 * (kept in sync manually until the Next.js cutover).
 */
export interface Industry {
  slug: string;
  /** Lower-case plural used inline in copy, e.g. "cafés". */
  name: string;
  /** Title-case label for headings, e.g. "Cafés". */
  label: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  lede: string;
  painPoints: { title: string; body: string }[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'cafes',
    name: 'cafés',
    label: 'Cafés',
    metaTitle: 'Attendance app for cafés',
    metaDescription:
      "Free staff attendance for cafés. Baristas scan a QR or tap to clock in — each punch bound to their device and your shop's WiFi. No biometrics, no buddy punching.",
    eyebrow: 'For café owners',
    lede:
      "Your barista's phone is enough. Staff scan a QR to clock in, every punch bound to their verified device and your café's network — so the morning rush starts with honest timesheets, not a manager hovering over a tablet.",
    painPoints: [
      {
        title: 'The 6am rush',
        body:
          "When you're pulling shots you can't watch the clock-in screen. Verified device + network means you don't have to — a punch from the wrong phone or off your WiFi just won't count.",
      },
      {
        title: 'Closing-shift trust',
        body:
          "Late-night solo shifts are where time theft creeps in. Each clock-out is bound to the same device that clocked in, so 'my friend punched me out' stops working.",
      },
      {
        title: 'Part-timers and students',
        body:
          'High-churn teams mean constant new faces. Free for up to 10 active staff, set up in minutes — add a barista and they\'re scanning the same day.',
      },
    ],
  },
  {
    slug: 'coffee-shops',
    name: 'coffee shops',
    label: 'Coffee shops',
    metaTitle: 'Coffee shop employee time tracking',
    metaDescription:
      'Time tracking for coffee shop staff. QR clock-in bound to each barista\'s device and your network — no PINs to share, no biometrics, free for up to 10 active employees.',
    eyebrow: 'For coffee shop owners',
    lede:
      "Track every barista's hours without a punch clock or a shared PIN. Clock-ins are bound to the device and the network, so your timesheets match who was actually behind the bar.",
    painPoints: [
      {
        title: 'Shared-PIN drift',
        body:
          'A 4-digit code gets passed around the back bar. Binding each punch to a verified device makes PIN-sharing pointless.',
      },
      {
        title: 'Multiple shifts a day',
        body:
          'Openers, mids, closers — track them all with clean check-in/out times and automatic late flags against each shift.',
      },
      {
        title: 'Owner not on-site',
        body:
          "Run reports from your phone. The verification happens whether or not you're standing at the register.",
      },
    ],
  },
  {
    slug: 'restaurants',
    name: 'restaurants',
    label: 'Restaurants',
    metaTitle: 'Staff attendance app for restaurants',
    metaDescription:
      'Restaurant staff attendance and time clock. Front- and back-of-house clock in by QR, bound to device + network. Leave management and late flags. Free up to 10 active employees.',
    eyebrow: 'For restaurant owners',
    lede:
      "Front of house, kitchen, and dish — everyone clocks in the same simple way, and every punch is verified against the device and your restaurant's network. No hardware to mount, no biometrics to store.",
    painPoints: [
      {
        title: 'Big, mixed teams',
        body:
          'Servers, line cooks, hosts on different shifts. Per-day shift schedules and automatic late/left-early flags keep the whole roster honest.',
      },
      {
        title: 'Buddy punching on busy nights',
        body:
          'Friday rush is when covering for a late colleague happens. Device binding makes a punch only count for the person it belongs to.',
      },
      {
        title: 'Leave and time-off chaos',
        body:
          'Staff request time off, you approve in a tap, and approved leave automatically suppresses attendance expectations.',
      },
    ],
  },
  {
    slug: 'bars',
    name: 'bars',
    label: 'Bars & pubs',
    metaTitle: 'Bar staff attendance app',
    metaDescription:
      'Attendance for bar and pub staff. Late-night, high-turnover teams clock in by QR bound to device + network — no biometrics, no buddy punching. Free up to 10 active employees.',
    eyebrow: 'For bar & pub owners',
    lede:
      "Late nights and quick turnover are exactly where timesheets get fuzzy. Verified device and network clock-ins keep them honest, even when nobody's watching the door.",
    painPoints: [
      {
        title: 'Late-night solo closes',
        body:
          'The riskiest shift for time theft. Check-out bound to the check-in device removes the easy workaround.',
      },
      {
        title: 'Casual & relief staff',
        body:
          "Bring on cover for one busy weekend and they're clocking in the same way — no setup overhead.",
      },
      {
        title: 'Cash-heavy, trust-light',
        body:
          'When margins are tight, paying for hours nobody worked hurts. Tighten timesheets without spying on your team.',
      },
    ],
  },
  {
    slug: 'bakeries',
    name: 'bakeries',
    label: 'Bakeries',
    metaTitle: 'Attendance app for bakeries',
    metaDescription:
      'Staff attendance for bakeries. Early-morning bakers clock in by QR bound to device + network. Track hours and late flags without biometrics. Free up to 10 active employees.',
    eyebrow: 'For bakery owners',
    lede:
      "Bakers start before dawn, often before you arrive. Verified clock-ins mean the 4am start is recorded honestly whether or not anyone's there to see it.",
    painPoints: [
      {
        title: 'Pre-dawn starts',
        body: 'No manager on-site at 4am. Device + network verification works unattended.',
      },
      {
        title: 'Split production & counter teams',
        body:
          'Bakers and front-counter staff on different schedules — track both with per-shift expectations.',
      },
      {
        title: 'Thin margins',
        body: 'Every padded hour eats into a tight P&L. Honest timesheets, free for small teams.',
      },
    ],
  },
  {
    slug: 'food-trucks',
    name: 'food trucks',
    label: 'Food trucks',
    metaTitle: 'Food truck employee time tracking',
    metaDescription:
      "Time tracking for food truck crews. Clock in by QR from the truck, bound to each crew member's device. No fixed hardware, no biometrics. Free up to 10 active employees.",
    eyebrow: 'For food truck owners',
    lede:
      "You move locations, but your timesheets shouldn't get messy. Crew clock in from their own phones, bound to their device — no mounted hardware required.",
    painPoints: [
      {
        title: 'No fixed address',
        body:
          'A device-bound QR travels with the truck. (Network checks are optional when your location changes daily.)',
      },
      {
        title: 'Tiny, tight crews',
        body:
          'Two or three people, long shifts. Free for up to 10 active staff, with clean hours for payroll.',
      },
      {
        title: 'Events & pop-ups',
        body: 'Spin up attendance for a weekend festival crew in minutes; wind it down after.',
      },
    ],
  },
  {
    slug: 'retail',
    name: 'retail shops',
    label: 'Retail',
    metaTitle: 'Retail staff attendance app',
    metaDescription:
      "Attendance for retail staff. Sales associates clock in by QR bound to device + the shop's network. No biometrics, no GPS tracking. Free for up to 10 active employees.",
    eyebrow: 'For shop owners',
    lede:
      "Sales floor, stockroom, register — your team clocks in the same simple way, every punch verified against the device and your shop's network.",
    painPoints: [
      {
        title: 'Stockroom PIN-sharing',
        body:
          'A code shouted across the back room is the classic leak. Device binding closes it.',
      },
      {
        title: 'Seasonal hiring',
        body:
          'Holiday rushes mean temporary staff. Add and remove them without contracts or hardware.',
      },
      {
        title: 'Multiple key-holders',
        body:
          'Manager overrides are first-class and audit-logged for forgotten phones and shift handovers.',
      },
    ],
  },
  {
    slug: 'small-shops',
    name: 'small shops',
    label: 'Small shops',
    metaTitle: 'Attendance app for small shops',
    metaDescription:
      'Simple staff attendance for small shops. Your team clocks in by QR bound to their device and your network. No biometrics, no contracts. Free for up to 10 active employees.',
    eyebrow: 'For small business owners',
    lede:
      "You don't need an enterprise workforce platform to run a 4-person shop. Honest clock-ins bound to the device and your network — set up before your next shift.",
    painPoints: [
      {
        title: 'You wear every hat',
        body:
          "Attendance shouldn't be another thing to babysit. Set it once; verification runs itself.",
      },
      {
        title: 'No IT, no hardware',
        body: 'No terminals to buy, no biometrics to manage. Staff use the phones they already carry.',
      },
      {
        title: 'Free where it counts',
        body:
          'Free forever for up to 10 active employees — most small shops never pay a cent.',
      },
    ],
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
