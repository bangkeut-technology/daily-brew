import { Link } from '@tanstack/react-router';
import { useTranslation, Trans } from 'react-i18next';

/**
 * Plain TSX port of frontend/src/app/blog/three-factor-attendance/page.mdx,
 * so the post is reachable on the legacy SPA before the Phase 6 Next.js
 * cutover. Body copy lives in assets/src/locales/{en,fr,km}/blog.json under
 * the `threeFactor` namespace key. Inline rich content uses <Trans> with
 * component placeholders (<strong>, <em>, <linkX>) so locale files stay
 * structure-free.
 */
export function ThreeFactorAttendancePost() {
  const { t } = useTranslation('blog');
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>{t('threeFactor.lead1')}</p>
      <p>{t('threeFactor.lead2')}</p>
      <p>
        <Trans i18nKey="threeFactor.lead3" ns="blog" components={{ strong: <strong /> }} />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('threeFactor.h2Factors')}
      </h2>
      <ul className="space-y-3 list-disc pl-6">
        <li>
          <Trans i18nKey="threeFactor.factor1" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="threeFactor.factor2" ns="blog" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="threeFactor.factor3" ns="blog" components={{ strong: <strong /> }} />
        </li>
      </ul>
      <p>{t('threeFactor.factorsOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('threeFactor.h2NoFace')}
      </h2>
      <p>{t('threeFactor.noFaceP1')}</p>
      <p>
        <Trans i18nKey="threeFactor.noFaceP2" ns="blog" components={{ strong: <strong /> }} />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('threeFactor.h2NoGps')}
      </h2>
      <p>
        <Trans i18nKey="threeFactor.noGps" ns="blog" components={{ em: <em /> }} />
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('threeFactor.h2Forgotten')}
      </h2>
      <p>{t('threeFactor.forgottenIntro')}</p>
      <ul className="space-y-3 list-disc pl-6">
        <li>{t('threeFactor.forgotten1')}</li>
        <li>{t('threeFactor.forgotten2')}</li>
        <li>{t('threeFactor.forgotten3')}</li>
      </ul>
      <p>{t('threeFactor.forgottenOutro')}</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        {t('threeFactor.h2Start')}
      </h2>
      <p>{t('threeFactor.startP1')}</p>
      <p>
        <Trans
          i18nKey="threeFactor.startCta"
          ns="blog"
          components={{
            linkFeatures: <Link to="/features" className="text-coffee no-underline hover:underline" />,
            linkPricing: <Link to="/pricing" className="text-coffee no-underline hover:underline" />,
            linkSignup: <Link to="/sign-up" className="text-coffee no-underline hover:underline" />,
          }}
        />
      </p>
    </div>
  );
}
