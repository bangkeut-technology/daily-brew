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
  tapCheckinEnabled: boolean;
  nfcCheckinEnabled: boolean;
  nfcCheckinIntervalMinutes: number;
}
