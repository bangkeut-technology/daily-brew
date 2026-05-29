import { Link } from '@tanstack/react-router';
import { useTranslation, Trans } from 'react-i18next';

/**
 * Companion post to the anomaly-detection feature. Explains the single
 * boolean ("have we seen this device before for this employee?"), why
 * first-time-on-this-device is the right trigger, what the alert looks
 * like, and how to triage. Espresso+ feature gating noted at the end.
 *
 * Body copy under blog namespace, key prefix `newDeviceAlert.*`.
 * The mono code-block sample uses {br: <br />} so translations can
 * preserve line breaks without re-templating React structure.
 */
export function TheNewDeviceAlertPost() {
  const { t } = useTranslation('blog');
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>{t('newDeviceAlert.lead1')}</p>
      <p>{t('newDeviceAlert.lead2')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('newDeviceAlert.h2Trigger')}
      </h2>
      <p>
        <Trans i18nKey="newDeviceAlert.triggerP1" ns="blog" components={{ em: <em /> }} />
      </p>
      <p>
        <Trans i18nKey="newDeviceAlert.triggerP2" ns="blog" components={{ strong: <strong /> }} />
      </p>
      <p>
        <Trans
          i18nKey="newDeviceAlert.triggerP3"
          ns="blog"
          components={{
            em: <em />,
            linkLiveAlerts: (
              <Link
                to="/blog/$slug"
                params={{ slug: 'live-checkin-alerts-on-telegram' }}
                className="text-coffee no-underline hover:underline"
              />
            ),
          }}
        />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('newDeviceAlert.h2Looks')}
      </h2>
      <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 my-4">
        <p className="font-mono text-[14px] leading-relaxed text-text-primary mb-0 whitespace-pre-line">
          <Trans i18nKey="newDeviceAlert.sample" ns="blog" components={{ strong: <strong /> }} />
        </p>
      </div>
      <p>{t('newDeviceAlert.looksOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('newDeviceAlert.h2When')}
      </h2>
      <ul className="space-y-3 list-disc pl-6">
        <li>
          <Trans i18nKey="newDeviceAlert.when1" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="newDeviceAlert.when2" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="newDeviceAlert.when3" ns="blog" components={{ strong: <strong />, em: <em /> }} />
        </li>
      </ul>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('newDeviceAlert.h2Email')}
      </h2>
      <p>{t('newDeviceAlert.emailP1')}</p>
      <p>{t('newDeviceAlert.emailP2')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('newDeviceAlert.h2NotThis')}
      </h2>
      <p>
        <Trans i18nKey="newDeviceAlert.notThisP1" ns="blog" components={{ em: <em /> }} />
      </p>
      <p>{t('newDeviceAlert.notThisP2')}</p>
      <p>
        <Trans
          i18nKey="newDeviceAlert.notThisCta"
          ns="blog"
          components={{
            linkThreeFactor: (
              <Link
                to="/blog/$slug"
                params={{ slug: 'three-factor-attendance' }}
                className="text-coffee no-underline hover:underline"
              />
            ),
            linkPricing: <Link to="/pricing" className="text-coffee no-underline hover:underline" />,
          }}
        />
      </p>
    </div>
  );
}
