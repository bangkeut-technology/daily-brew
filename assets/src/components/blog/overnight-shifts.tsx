import { useTranslation, Trans } from 'react-i18next';

/**
 * Feature explainer for overnight shifts (a Shift whose endTime is earlier
 * than its startTime — 18:00–02:00). Covers the one decision the whole
 * feature rests on (the night is filed under the day it started), the
 * post-midnight scan grace window, the +1 marker, and manual entry.
 *
 * Body copy under blog namespace, key prefix `overnightShifts.*`.
 * Mirrors frontend/src/app/blog/overnight-shifts/page.mdx — keep in sync.
 */
export function OvernightShiftsPost() {
  const { t } = useTranslation('blog');
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>{t('overnightShifts.lead1')}</p>
      <p>{t('overnightShifts.lead2')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('overnightShifts.h2OneRow')}
      </h2>
      <p>
        <Trans i18nKey="overnightShifts.oneRow1" ns="blog" components={{ strong: <strong /> }} />
      </p>
      <p>{t('overnightShifts.oneRow2')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('overnightShifts.h2NoSwitch')}
      </h2>
      <p>
        <Trans
          i18nKey="overnightShifts.noSwitch1"
          ns="blog"
          components={{ strong: <strong />, code: <code className="font-mono text-[14.5px] text-text-primary" /> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="overnightShifts.noSwitch2"
          ns="blog"
          components={{ code: <code className="font-mono text-[14.5px] text-text-primary" /> }}
        />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('overnightShifts.h2Scanning')}
      </h2>
      <p>{t('overnightShifts.scanning1')}</p>
      <p>
        <Trans i18nKey="overnightShifts.scanning2" ns="blog" components={{ strong: <strong />, em: <em /> }} />
      </p>
      <p>{t('overnightShifts.scanning3')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('overnightShifts.h2Marker')}
      </h2>
      <p>
        <Trans i18nKey="overnightShifts.marker1" ns="blog" components={{ strong: <strong /> }} />
      </p>
      <p>
        <Trans
          i18nKey="overnightShifts.marker2"
          ns="blog"
          components={{ code: <code className="font-mono text-[14.5px] text-text-primary" /> }}
        />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('overnightShifts.h2ByHand')}
      </h2>
      <p>
        <Trans
          i18nKey="overnightShifts.byHand1"
          ns="blog"
          components={{
            strong: <strong />,
            em: <em />,
            code: <code className="font-mono text-[14.5px] text-text-primary" />,
          }}
        />
      </p>
      <p>
        <Trans i18nKey="overnightShifts.byHand2" ns="blog" components={{ strong: <strong /> }} />
      </p>
      <p>
        <Trans
          i18nKey="overnightShifts.byHand3"
          ns="blog"
          components={{ code: <code className="font-mono text-[14.5px] text-text-primary" /> }}
        />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('overnightShifts.h2Flags')}
      </h2>
      <p>{t('overnightShifts.flags1')}</p>
      <p>{t('overnightShifts.flags2')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('overnightShifts.h2Unchanged')}
      </h2>
      <p>{t('overnightShifts.unchanged1')}</p>
      <p>
        <Trans
          i18nKey="overnightShifts.unchanged2"
          ns="blog"
          components={{ code: <code className="font-mono text-[14.5px] text-text-primary" /> }}
        />
      </p>
    </div>
  );
}
