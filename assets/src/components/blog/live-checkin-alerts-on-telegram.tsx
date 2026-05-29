import { Link } from '@tanstack/react-router';
import { useTranslation, Trans } from 'react-i18next';

/**
 * Feature explainer for the WorkspaceSetting.telegramCheckinAlertsEnabled
 * toggle (Settings → Telegram notifications). Live Telegram ping on every
 * staff check-in/out. Off by default because the noise profile is high;
 * this post explains when to turn it on.
 *
 * Body copy under blog namespace, key prefix `liveCheckinAlerts.*`.
 * Device-verification copy is intentionally precise (same-day consistency,
 * not per-lifetime binding).
 */
export function LiveCheckinAlertsOnTelegramPost() {
  const { t } = useTranslation('blog');
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>{t('liveCheckinAlerts.lead1')}</p>
      <p>{t('liveCheckinAlerts.lead2')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('liveCheckinAlerts.h2OffDefault')}
      </h2>
      <p>{t('liveCheckinAlerts.offDefault1')}</p>
      <p>{t('liveCheckinAlerts.offDefault2')}</p>
      <p>{t('liveCheckinAlerts.offDefault3')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('liveCheckinAlerts.h2Looks')}
      </h2>
      <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 my-4 space-y-2">
        <p className="font-mono text-[14px] leading-relaxed text-text-primary mb-0">
          <Trans i18nKey="liveCheckinAlerts.sample1" ns="blog" components={{ strong: <strong /> }} />
        </p>
        <p className="font-mono text-[14px] leading-relaxed text-text-primary mb-0">
          <Trans i18nKey="liveCheckinAlerts.sample2" ns="blog" components={{ strong: <strong /> }} />
        </p>
      </div>
      <p>{t('liveCheckinAlerts.looksOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('liveCheckinAlerts.h2HowTo')}
      </h2>
      <ol className="space-y-3 list-decimal pl-6">
        <li>
          <Trans i18nKey="liveCheckinAlerts.step1" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>{t('liveCheckinAlerts.step2')}</li>
        <li>
          <Trans i18nKey="liveCheckinAlerts.step3" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>{t('liveCheckinAlerts.step4')}</li>
      </ol>
      <p>{t('liveCheckinAlerts.howToOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('liveCheckinAlerts.h2Pairs')}
      </h2>
      <p>{t('liveCheckinAlerts.pairsIntro')}</p>
      <ul className="space-y-3 list-disc pl-6">
        <li>
          <Trans i18nKey="liveCheckinAlerts.pair1" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans
            i18nKey="liveCheckinAlerts.pair2"
            ns="blog"
            components={{
              strong: <strong />,
              em: <em />,
              linkNewDevice: (
                <Link
                  to="/blog/$slug"
                  params={{ slug: 'the-new-device-alert' }}
                  className="text-coffee no-underline hover:underline"
                />
              ),
            }}
          />
        </li>
        <li>
          <Trans i18nKey="liveCheckinAlerts.pair3" ns="blog" components={{ strong: <strong /> }} />
        </li>
      </ul>
      <p>{t('liveCheckinAlerts.pairsOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('liveCheckinAlerts.h2NotThis')}
      </h2>
      <p>
        <Trans i18nKey="liveCheckinAlerts.notThis" ns="blog" components={{ em: <em /> }} />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('liveCheckinAlerts.h2Noise')}
      </h2>
      <p>
        <Trans i18nKey="liveCheckinAlerts.noise" ns="blog" components={{ em: <em /> }} />
      </p>
    </div>
  );
}
