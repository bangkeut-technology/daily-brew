import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import type { ApiTokenCreated } from '@/types';

interface KioskPairingQrProps {
  token: ApiTokenCreated;
  workspacePublicId: string;
}

/** Mirrors the kiosk's own limit — the column is 64 chars. */
const TERMINAL_ID_MAX = 64;

/**
 * Encodes everything a kiosk needs to start working, as a QR it reads with its
 * own camera on first run.
 *
 * Typing a 48-character key and a 68-character secret onto a wall-mounted
 * tablet is miserable enough that operators would find a worse way, so the
 * credentials travel as a picture instead. They are in the clear inside it —
 * the QR is the key — which is why this only renders in the one modal where
 * both secrets are already on screen, and says so.
 *
 * Prefix follows the existing scheme (`dailybrew:ws:`, `dailybrew:wqr:`) so a
 * scanner can route on it without parsing the body.
 *
 * @see docs/kiosk.md
 */
export function KioskPairingQr({ token, workspacePublicId }: KioskPairingQrProps) {
  const { t } = useTranslation();
  const [terminalId, setTerminalId] = useState('front-door-01');

  const trimmed = terminalId.trim();

  const payload = useMemo(() => {
    if (!trimmed) return null;

    // The API base travels with the credentials so one build of the kiosk works
    // against production and the staging mirror without a rebuild.
    const body = {
      v: 1,
      api: `${window.location.origin}/api/v1`,
      ws: workspacePublicId,
      key: token.token,
      secret: token.signingSecret,
      terminal: trimmed,
    };

    const json = JSON.stringify(body);
    const base64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `dailybrew:kiosk:${base64}`;
  }, [trimmed, workspacePublicId, token.token, token.signingSecret]);

  return (
    <div className="mt-4 rounded-xl border border-cream-3 bg-cream-3/10 p-4">
      <p className="text-[13.5px] font-medium text-text-primary">
        {t('settings.kioskPairTitle', 'Pair a kiosk')}
      </p>
      <p className="mt-0.5 text-[12.5px] text-text-tertiary leading-snug">
        {t(
          'settings.kioskPairHint',
          'Name this door, then scan the code with the kiosk. The code contains the key and the signing secret — treat it like the key itself.',
        )}
      </p>

      <label
        htmlFor="kiosk-terminal-id"
        className="mt-3 block text-[13px] font-medium text-text-secondary mb-1"
      >
        {t('settings.kioskTerminalId', 'Door name')}
      </label>
      <input
        id="kiosk-terminal-id"
        name="kioskTerminalId"
        type="text"
        value={terminalId}
        onChange={(e) => setTerminalId(e.target.value)}
        maxLength={TERMINAL_ID_MAX}
        placeholder="front-door-01"
        className="w-full px-3 py-2 rounded-xl bg-glass-bg border border-cream-3 text-[14px] text-text-primary outline-none focus:border-coffee transition-colors font-mono"
      />
      <p className="mt-1 text-[12px] text-text-tertiary leading-snug">
        {t(
          'settings.kioskTerminalIdHint',
          'Two kiosks sharing a name share their repeat-tap cooldown. Give each door its own.',
        )}
      </p>

      {payload && (
        <div className="mt-3 flex justify-center">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={payload} size={188} fgColor="#6B4226" bgColor="#FFFFFF" level="M" />
          </div>
        </div>
      )}
    </div>
  );
}
