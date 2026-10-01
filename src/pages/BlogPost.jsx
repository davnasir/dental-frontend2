import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, User, Clock } from 'lucide-react';
import { blogPosts as localBlog } from '../data/blog';
import { blogApi } from '../services/contentApi';
import { resolveImg } from '../utils/image';
import { normalizePost } from '../services/blogHelper';
import { translations } from '../data/content';
import { applySeo, resetSeo, SITE_URL, SITE_NAME, absoluteMediaUrl } from '../services/seo';

// Standalone blog article page. Every published post lives at its own URL
// (/blog/:slug) and injects its own title/description/canonical/OG tags plus an
// Article JSON-LD block, so Google indexes each article individually and the
// card modals that used to exist can be replaced with real links.
export default function BlogPost() {
  const { slug } = useParams();

  let lang = 'en';
  try { lang = localStorage.getItem('dental_lang') || 'en'; } catch (_) { /* ignore */ }
  const activeLang = ['en', 'bn'].includes(lang) ? lang : 'en';
  const t = translations[activeLang] || translations.en;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPost(null);

    const source = localBlog.find((b) => b.slug === slug);
    const local = source ? normalizePost({ ...source, id: `local-${source.id}` }) : null;

    blogApi
      .getPublic(slug)
      .then((res) => {
        if (cancelled) return;
        setPost(normalizePost(res.data?.blog));
      })
      .catch(() => {
        if (cancelled) return;
        // The API may be unreachable or the post unpublished -- fall back to the
        // bundled demo data so a visiting search bot still gets a page.
        setPost(local);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  // Per-page SEO tags + structured data. Runs when the post resolves.
  useEffect(() => {
    if (!post) return;
    const titleRaw = typeof post.seoTitle === 'string' && post.seoTitle ? post.seoTitle : post.title;
    const title = typeof titleRaw === 'object' ? (titleRaw[activeLang] || titleRaw.en || '') : titleRaw;
    const excerptRaw = post.seoDescription || post.excerpt;
    const description =
      (typeof excerptRaw === 'object' ? (excerptRaw[activeLang] || excerptRaw.en || '') : excerptRaw) || '';
    const url = `${SITE_URL}/blog/${slug}`;

    applySeo({
      title: title ? `${title} | ${SITE_NAME}` : undefined,
      description: description.slice(0, 320),
      url,
      image: post.image,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        image: absoluteMediaUrl(post.image),
        datePublished: post.date || undefined,
        dateModified: post.publishedAt ? String(post.publishedAt).slice(0, 10) : post.date || undefined,
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      },
    });
    return () => resetSeo();
  }, [post, slug, activeLang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D6E8F7] text-[#0A2255] flex items-center justify-center">
        <p className="text-[#5A7A9A]">{activeLang === 'en' ? 'Loading article...' : 'নিবন্ধ লোড হচ্ছে...'}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#D6E8F7] text-[#0A2255] flex flex-col items-center justify-center px-4">
        <p className="text-2xl font-bold font-display mb-2">
          {activeLang === 'en' ? 'Article not found' : 'নিবন্ধটি পাওয়া যায়নি'}
        </p>
        <Link to="/blog" className="mt-2 text-sm font-semibold text-[#14357B] hover:underline">
          {activeLang === 'en' ? 'Back to all articles' : 'সব নিবন্ধে ফিরে যান'}
        </Link>
      </div>
    );
  }

  const category = post.category[activeLang] || post.category.en;
  const contentText = post.content[activeLang] || post.content.en || '';
  const paragraphs = contentText.split(/\n\s*\n|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#D6E8F7] text-[#0A2255]">
      <header className="bg-gradient-to-b from-white to-[#D6E8F7] pt-14 pb-10 border-b border-[#B8D8EE]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#14357B] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{activeLang === 'en' ? 'Back to Articles' : 'সব নিবন্ধে ফিরে যান'}</span>
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            {category}
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">{post.title[activeLang]}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#5A7A9A]">
            {post.date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {post.author || SITE_NAME}
            </span>
            {post.readTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {post.image && (
          <div className="rounded-2xl overflow-hidden shadow-card-soft mb-8">
            <img
              src={resolveImg(post.image)}
              alt={post.title[activeLang]}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        <article className="text-sm sm:text-base text-[#3A5A7A] leading-relaxed space-y-4">
          {(post.excerpt[activeLang] || post.excerpt.en) && (
            <p className="font-medium text-[#0A2255] text-base sm:text-lg">
              {post.excerpt[activeLang] || post.excerpt.en}
            </p>
          )}
          {(paragraphs.length > 1 ? paragraphs : [contentText]).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        <div className="mt-10 pt-6 border-t border-[#B8D8EE] flex justify-between items-center">
          <Link to="/blog" className="text-sm font-bold text-[#14357B] hover:text-[#0A2255]">
            ← {activeLang === 'en' ? 'More articles' : 'আরও নিবন্ধ'}
          </Link>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#14357B] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#14357B]/20 hover:bg-[#2299D6] transition-colors"
          >
            {activeLang === 'en' ? 'Book an Appointment' : 'অ্যাপয়েন্টমেন্ট নিন'}
          </Link>
        </div>
      </main>
    </div>
  );
}