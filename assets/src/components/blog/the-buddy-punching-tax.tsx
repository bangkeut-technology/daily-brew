import { Link } from '@tanstack/react-router';
import { useTranslation, Trans } from 'react-i18next';

/**
 * Companion post to the /stop-buddy-punching marketing page.
 * Cost-and-cure framing: 2.2% payroll number from Nucleus Research,
 * 75% prevalence from APA, then why face/GPS aren't the right fix for
 * small cafés, then the three-layer solution. Cross-links back to
 * three-factor-attendance for the deeper conceptual piece.
 *
 * Body copy under blog namespace, key prefix `buddyPunchingTax.*`.
 */
export function TheBuddyPunchingTaxPost() {
  const { t } = useTranslation('blog');
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>
        <Trans i18nKey="buddyPunchingTax.lead1" ns="blog" components={{ strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="buddyPunchingTax.lead2" ns="blog" components={{ em: <em /> }} />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('buddyPunchingTax.h2What')}
      </h2>
      <p>{t('buddyPunchingTax.whatIntro')}</p>
      <ul className="space-y-3 list-disc pl-6">
        <li>{t('buddyPunchingTax.what1')}</li>
        <li>{t('buddyPunchingTax.what2')}</li>
        <li>{t('buddyPunchingTax.what3')}</li>
        <li>{t('buddyPunchingTax.what4')}</li>
      </ul>
      <p>{t('buddyPunchingTax.whatOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('buddyPunchingTax.h2BadFixes')}
      </h2>
      <p>
        <Trans i18nKey="buddyPunchingTax.badFace" ns="blog" components={{ strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="buddyPunchingTax.badGps" ns="blog" components={{ strong: <strong />, em: <em /> }} />
      </p>
      <p>{t('buddyPunchingTax.badOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('buddyPunchingTax.h2Fix')}
      </h2>
      <ol className="space-y-3 list-decimal pl-6">
        <li>
          <Trans i18nKey="buddyPunchingTax.fix1" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="buddyPunchingTax.fix2" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="buddyPunchingTax.fix3" ns="blog" components={{ strong: <strong /> }} />
        </li>
      </ol>
      <p>{t('buddyPunchingTax.fixOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('buddyPunchingTax.h2Today')}
      </h2>
      <p>
        <Trans
          i18nKey="buddyPunchingTax.todayCta"
          ns="blog"
          components={{
            linkThreeFactor: (
              <Link
                to="/blog/$slug"
                params={{ slug: 'three-factor-attendance' }}
                className="text-coffee no-underline hover:underline"
              />
            ),
            linkStopBuddy: <Link to="/stop-buddy-punching" className="text-coffee no-underline hover:underline" />,
            linkSignup: <Link to="/sign-up" className="text-coffee no-underline hover:underline" />,
          }}
        />
      </p>
    </div>
  );
}
