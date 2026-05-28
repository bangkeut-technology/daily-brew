import {
  Building2,
  Smartphone,
  Crown,
  Nfc,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type PlaybookKey = 'owner' | 'employee' | 'espresso' | 'nfc';

/**
 * Static config for one playbook step. Strings (title, desc, link label)
 * live in i18n under `playbooks.<playbookKey>.steps.<stepKey>.{title,desc,linkLabel}`;
 * this shape only carries the per-step *behavior* (feature flag + link target).
 */
export type PlaybookStepConfig = {
  /** Stable id used as the i18n leaf key under `playbooks.<pk>.steps.<key>`. */
  key: string;
  /**
   * Optional feature-flag key (matches FeatureFlagEnum on the server).
   * When set, this step is hidden if the flag is off — useful for
   * cross-linking to playbooks that aren't live yet.
   */
  feature?: 'nfc_checkin';
  /**
   * Optional deep-link to a console page. By default the link is only
   * shown to authenticated users; set requireAuth: false for public
   * destinations (sign up / sign in).
   */
  link?: {
    to: string;
    hash?: string;
    requireAuth?: boolean;
  };
};

/** Same shape but with strings filled in. Returned by {@link usePlaybook}. */
export type PlaybookStep = PlaybookStepConfig & {
  title: string;
  desc: string;
  /** Optional translated label, when the config carries a link. */
  link?: PlaybookStepConfig['link'] & { label: string };
};

export type PlaybookConfig = {
  key: PlaybookKey;
  icon: LucideIcon;
  accent: string;
  /** Route to the detailed playbook page. */
  to: '/guides/owner' | '/guides/employee' | '/guides/espresso' | '/guides/nfc';
  steps: PlaybookStepConfig[];
};

/** Same shape but with the title/subtitle/teaser strings filled in. */
export type Playbook = Omit<PlaybookConfig, 'steps'> & {
  title: string;
  subtitle: string;
  /** Short one-line teaser used on hubs / persona cards. */
  teaser: string;
  steps: PlaybookStep[];
};

// ---------------------------------------------------------------------------
// Static config — no translatable strings here. Translations live in
// common.json under `playbooks.<key>.{title,subtitle,teaser}` and
// `playbooks.<key>.steps.<stepKey>.{title,desc,linkLabel}`.
// ---------------------------------------------------------------------------
export const playbookConfigs: PlaybookConfig[] = [
  {
    key: 'owner',
    icon: Building2,
    accent: '#6B4226',
    to: '/guides/owner',
    steps: [
      { key: 'createAccount',         link: { to: '/sign-up', requireAuth: false } },
      { key: 'nameRestaurant' },
      { key: 'defineShifts',          link: { to: '/console/shifts' } },
      { key: 'addEmployees',          link: { to: '/console/employees/new' } },
      { key: 'linkUserAccount',       link: { to: '/console/employees' } },
      { key: 'displayQr',             link: { to: '/console/dashboard' } },
      { key: 'watchLive',             link: { to: '/console/attendance' } },
      { key: 'approveLeaveClosures',  link: { to: '/console/leave' } },
    ],
  },
  {
    key: 'employee',
    icon: Smartphone,
    accent: '#4A7C59',
    to: '/guides/employee',
    steps: [
      { key: 'installApp' },
      { key: 'signIn',         link: { to: '/sign-in', requireAuth: false } },
      { key: 'linkRecord',     link: { to: '/console/profile' } },
      { key: 'scanQr' },
      { key: 'tapCheckin' },
      { key: 'tapCheckout' },
      { key: 'submitLeave',    link: { to: '/console/leave' } },
    ],
  },
  {
    key: 'espresso',
    icon: Crown,
    accent: '#C17F3B',
    to: '/guides/espresso',
    steps: [
      { key: 'openSettings',           link: { to: '/console/settings' } },
      { key: 'pickBilling' },
      { key: 'lockCheckin',            link: { to: '/console/settings', hash: 'settings-ip-restriction' } },
      { key: 'enableDeviceVerification', link: { to: '/console/settings', hash: 'settings-device-verification' } },
      { key: 'tryNfc',                 feature: 'nfc_checkin', link: { to: '/guides/nfc', requireAuth: false } },
      { key: 'promoteManager',         link: { to: '/console/employees' } },
      { key: 'connectBasilbook' },
    ],
  },
  {
    key: 'nfc',
    icon: Nfc,
    accent: '#3B6FA0',
    to: '/guides/nfc',
    steps: [
      { key: 'checkEspresso',  link: { to: '/console/settings' } },
      { key: 'turnOnNfc',      link: { to: '/console/settings', hash: 'settings-nfc-checkin' } },
      { key: 'copyUrl',        link: { to: '/console/dashboard' } },
      { key: 'buyStickers' },
      { key: 'installApp' },
      { key: 'writeUrl' },
      { key: 'lockStickers' },
      { key: 'placeStickers' },
      { key: 'testTap' },
      { key: 'pairSecurity',   link: { to: '/console/settings', hash: 'settings-geofencing' } },
    ],
  },
];

export const playbookConfigByKey: Record<PlaybookKey, PlaybookConfig> = Object.fromEntries(
  playbookConfigs.map((p) => [p.key, p]),
) as Record<PlaybookKey, PlaybookConfig>;

/**
 * Inner: build a translated playbook from a static config + a translation
 * function. Pure; doesn't itself call any hook, so it's safe to use inside
 * a loop in {@link usePlaybooks}.
 */
function buildPlaybook(config: PlaybookConfig, t: (key: string) => string): Playbook {
  return {
    ...config,
    title: t(`playbooks.${config.key}.title`),
    subtitle: t(`playbooks.${config.key}.subtitle`),
    teaser: t(`playbooks.${config.key}.teaser`),
    steps: config.steps.map((step) => ({
      ...step,
      title: t(`playbooks.${config.key}.steps.${step.key}.title`),
      desc: t(`playbooks.${config.key}.steps.${step.key}.desc`),
      link: step.link
        ? { ...step.link, label: t(`playbooks.${config.key}.steps.${step.key}.linkLabel`) }
        : undefined,
    })),
  };
}

/**
 * Hook returning one fully-translated {@link Playbook}, including all
 * step titles/descriptions and (where present) link labels. Switching
 * language causes the consumer to re-render with the new copy automatically.
 */
export function usePlaybook(key: PlaybookKey): Playbook {
  const { t } = useTranslation();
  return buildPlaybook(playbookConfigByKey[key], t);
}

/** All four playbooks, fully translated. Convenient for guide hubs. */
export function usePlaybooks(): Playbook[] {
  const { t } = useTranslation();
  // useTranslation called once at the hook top — building each playbook
  // is a pure function, so the loop doesn't violate rules-of-hooks.
  return playbookConfigs.map((p) => buildPlaybook(p, t));
}
