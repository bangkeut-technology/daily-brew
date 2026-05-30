import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { BLOG_POSTS } from '@/lib/blog';

export const Route = createFileRoute('/blog/')({
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { t } = useTranslation();
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="Blog"
        description="Notes on attendance, time clocks, and small-team operations. New posts as we ship."
        path="/blog"
      />
      <LandingNav />

      <main className="page-enter pt-20">
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber">{t('routes.blogIndex.eyebrow')}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary sm:text-5xl">
            {t('routes.blogIndex.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            {t('routes.blogIndex.subtitle')}
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-7 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
                >
                  <time
                    dateTime={post.date}
                    className="text-[12px] font-mono font-medium uppercase tracking-wider text-text-tertiary"
                  >
                    {post.date}
                  </time>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
                    {post.description}
                  </p>
                  <span className="mt-4 inline-block text-[14px] font-medium text-coffee">
                    {t('routes.blogIndex.readPost')}
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
