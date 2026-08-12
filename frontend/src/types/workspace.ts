export type { Workspace } from "./auth";

export interface WorkspaceSetting {
  ipRestrictionEnabled: boolean;
  allowedIps: string[] | null;
  deviceVerificationEnabled: boolean;
  timezone: string;
  dateFormat: string;
  geofencingEnabled: boolean;
  geofencingLatitude: number | null;
  geofencingLongitude: number | null;
  geofencingRadiusMeters: number | null;
  telegramNotificationsEnabled: boolean;
  telegramChatId: string | null;
  /** Per-scan "new device" alerts, on top of the daily summary. */
  telegramCheckinAlertsEnabled: boolean;
  pushCheckinAlertsEnabled: boolean;
  tapCheckinEnabled: boolean;
  nfcCheckinEnabled: boolean;
  nfcCheckinIntervalMinutes: number;
}

/**
 * Workspace-scoped API credential (BasilBook and any other consumer). The
 * plaintext key is returned exactly once, by the create call — the server only
 * ever stores its hash.
 */
/** Matches ApiTokenScopeEnum. */
export type ApiTokenScope = "attendance:read" | "attendance:write";

export interface ApiToken {
  publicId: string;
  name: string;
  prefix: string;
  active: boolean;
  scopes: ApiTokenScope[];
  /** False on keys minted before request signing existed — they can read, never write. */
  canSign: boolean;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ApiTokenCreated {
  publicId: string;
  name: string;
  prefix: string;
  scopes: ApiTokenScope[];
  /** Shown once, never retrievable again. */
  token: string;
  /** Signs write requests. Shown once; stored encrypted, never returned again. */
  signingSecret: string;
  createdAt: string;
}
