import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { BLOG_POSTS } from '@/lib/blog';
import { ThreeFactorAttendancePost } from '@/components/blog/three-factor-attendance';
import { TheBuddyPunchingTaxPost } from '@/components/blog/the-buddy-punching-tax';

const POST_COMPONENTS: Record<string, () => React.ReactElement> = {
  'three-factor-attendance': ThreeFactorAttendancePost,
  'the-buddy-punching-tax': TheBuddyPunchingTaxPost,
};

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post || !POST_COMPONENTS[params.slug]) {
      throw notFound();
    }
    return { post };
  },
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const PostBody = POST_COMPONENTS[post.slug];

  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo title={post.title} description={post.description} path={`/blog/${post.slug}`} />
      <LandingNav />

      <main className="page-enter pt-20">
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-20">
          <div className="mb-10">
            <Link
              to="/blog"
              className="text-[14px] font-medium text-text-tertiary hover:text-coffee no-underline transition-colors"
            >
              ← All posts
            </Link>
          </div>

          <header className="mb-10">
            <time
              dateTime={post.date}
              className="text-[12px] font-mono font-medium uppercase tracking-wider text-text-tertiary"
            >
              {post.date}
            </time>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-text-primary sm:text-4xl leading-tight">
              {post.title}
            </h1>
          </header>

          <PostBody />
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
