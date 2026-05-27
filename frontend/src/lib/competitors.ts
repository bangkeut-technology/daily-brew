import { SITE_URL } from "@/lib/seo";

export interface Competitor {
  slug: string; // e.g. "vs-jibble"
  name: string;
  metaTitle: string;
  metaDescription: string;
  lede: string;
  /** Factual comparison rows, sourced from public product information. */
  rows: { dimension: string; dailybrew: string; them: string }[];
  /** Fair, specific summary of where the two differ. */
  summary: string;
}

/**
 * Competitor comparison pages (SEO strategy §3/§5). Claims are kept factual
 * and based on public product information; framing is fair, not absolute.
 * One entry = one /vs-<name> page via the shared [slug] template.
 */
export const COMPETITORS: Competitor[] = [
  {
    slug: "vs-jibble",
    name: "Jibble",
    metaTitle: "DailyBrew vs Jibble",
    metaDescription:
      "DailyBrew vs Jibble for cafés: device + network verification with no biometrics, versus Jibble's face-recognition clock-in. Free up to 10 staff.",
    lede: "Jibble is a capable, multi-vertical time tracker that leans on face recognition to stop buddy punching. DailyBrew takes the no-biometric route — binding each punch to a verified device and your shop's network instead.",
    rows: [
      { dimension: "Anti-buddy-punching", dailybrew: "Device + IP + NFC tag (beta)", them: "Face recognition" },
      { dimension: "Biometric data collected", dailybrew: "None", them: "Yes — facial data" },
      { dimension: "Free tier", dailybrew: "Up to 10 staff", them: "Unlimited users (upsells)" },
      { dimension: "Built for", dailybrew: "Cafés & small shops", them: "Multi-vertical" },
    ],
    summary:
      "If you're comfortable storing staff facial data, Jibble's free tier scales further. If you'd rather not collect biometrics in a small café — and avoid the legal surface that comes with them — DailyBrew gives you the same anti-buddy-punching guarantee without a single face scan.",
  },
  {
    slug: "vs-homebase",
    name: "Homebase",
    metaTitle: "DailyBrew vs Homebase",
    metaDescription:
      "DailyBrew vs Homebase: device + network verified clock-ins with no shared PINs, versus Homebase's PIN + GPS model. Free up to 10 staff, no US-only limits.",
    lede: "Homebase is a strong US-focused scheduling and time-clock suite that relies on PINs, GPS, and photo-on-punch. DailyBrew focuses on honest clock-ins through device + network verification — no PINs to share.",
    rows: [
      { dimension: "Anti-buddy-punching", dailybrew: "Device + IP + NFC tag (beta)", them: "Auto-PIN + GPS + photo" },
      { dimension: "GPS / location permission", dailybrew: "Not required", them: "Used for clock-in" },
      { dimension: "Free tier", dailybrew: "Up to 10 staff, any region", them: "1 location, ≤10 staff (US-centric)" },
      { dimension: "Built for", dailybrew: "Cafés & small shops", them: "US SMB hospitality" },
    ],
    summary:
      "Homebase bundles scheduling, hiring, and payroll for US operators. If you want that whole suite, it's comprehensive. If you mainly want clock-ins you can trust — without shared PINs or GPS permissions — DailyBrew is lighter and works anywhere.",
  },
  {
    slug: "vs-connecteam",
    name: "Connecteam",
    metaTitle: "DailyBrew vs Connecteam",
    metaDescription:
      "DailyBrew vs Connecteam: a café-first three-factor clock-in (device + IP + NFC beta) versus Connecteam's deskless HR suite with NFC and selfie verification.",
    lede: "Connecteam is the closest NFC competitor — a broad deskless-workforce HR platform whose NFC is also in beta. DailyBrew builds device + IP + tag as one café-first experience, without selfie verification.",
    rows: [
      { dimension: "Anti-buddy-punching", dailybrew: "Device + IP + NFC tag (beta)", them: "Selfie verification + PIN" },
      { dimension: "NFC tap-to-clock-in", dailybrew: "Beta", them: "Beta" },
      { dimension: "Scope", dailybrew: "Attendance for small shops", them: "Full deskless HR suite" },
      { dimension: "Biometric data collected", dailybrew: "None", them: "Selfie (on higher tiers)" },
    ],
    summary:
      "Connecteam is the right call if you want a full workforce-management platform. If you just want honest timesheets for a small team — three-factor verification without an HR suite or selfie checks — DailyBrew is purpose-built for that.",
  },
  {
    slug: "vs-clockify",
    name: "Clockify",
    metaTitle: "DailyBrew vs Clockify",
    metaDescription:
      "DailyBrew vs Clockify: per-punch device + network verification versus Clockify's shareable kiosk PIN. Stop buddy punching that PIN-based clocks can't.",
    lede: "Clockify has a famously generous free tier, but its kiosk model leans on a PIN that its own docs suggest sharing with a manager. DailyBrew binds each punch to a verified device, so PIN-sharing simply doesn't work.",
    rows: [
      { dimension: "Anti-buddy-punching", dailybrew: "Device + IP + NFC tag (beta)", them: "Shared kiosk PIN" },
      { dimension: "Device binding per punch", dailybrew: "Yes", them: "No" },
      { dimension: "Free tier", dailybrew: "Up to 10 staff", them: "Generous free tier" },
      { dimension: "Built for", dailybrew: "Cafés & small shops", them: "General / knowledge work" },
    ],
    summary:
      "For solo or trust-based teams, Clockify's free tier is hard to beat. But if a shared PIN is a problem — and in a busy shop it usually is — DailyBrew closes the gap PINs leave open.",
  },
  {
    slug: "vs-buddy-punch",
    name: "Buddy Punch",
    metaTitle: "DailyBrew vs Buddy Punch",
    metaDescription:
      "DailyBrew vs Buddy Punch: device + IP verification as the primary defense, no photo-on-punch. A café-first alternative with a free tier for up to 10 staff.",
    lede: "Buddy Punch had the right idea with IP Address Lock, but bolts it onto a generic time clock with face recognition and photo-on-punch. DailyBrew makes device + IP the primary defense — and never photographs your staff.",
    rows: [
      { dimension: "Anti-buddy-punching", dailybrew: "Device + IP + NFC tag (beta)", them: "Face ID + photo at punch" },
      { dimension: "IP / network lock", dailybrew: "Primary defense", them: "Available (add-on)" },
      { dimension: "Photo / biometric on punch", dailybrew: "None", them: "Yes" },
      { dimension: "Free tier", dailybrew: "Up to 10 staff", them: "No free tier" },
    ],
    summary:
      "Both believe in network-based verification. The difference is emphasis: DailyBrew leads with device + IP and skips the camera entirely, so you get the defense without photographing your team every shift.",
  },
  {
    slug: "vs-7shifts",
    name: "7shifts",
    metaTitle: "DailyBrew vs 7shifts",
    metaDescription:
      "DailyBrew vs 7shifts: a free, device-verified time clock for small teams versus 7shifts' restaurant scheduling suite with photo + geofencing punch.",
    lede: "7shifts is a full restaurant scheduling and labor platform with photo + geofenced punching. DailyBrew is a focused, free-to-start time clock that verifies the device and network instead of the face and the GPS.",
    rows: [
      { dimension: "Anti-buddy-punching", dailybrew: "Device + IP + NFC tag (beta)", them: "Photo + geofencing" },
      { dimension: "GPS / location permission", dailybrew: "Not required", them: "Used for clock-in" },
      { dimension: "Starting price", dailybrew: "Free up to 10; $14.99/mo", them: "From ~$44.99/location/mo" },
      { dimension: "Built for", dailybrew: "Cafés & small shops", them: "Restaurants (scheduling-first)" },
    ],
    summary:
      "If you need deep restaurant scheduling and labor forecasting, 7shifts is built for it. If you want trustworthy clock-ins for a small team at a fraction of the price, DailyBrew is the leaner choice.",
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}

export function competitorUrl(slug: string): string {
  return `${SITE_URL}/${slug}`;
}
