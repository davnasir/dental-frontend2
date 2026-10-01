import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, X, BookOpen, Newspaper } from 'lucide-react';
import { blogPosts as localBlog } from '../data/blog';
import { blogApi } from '../services/contentApi';
import { resolveImg } from '../utils/image';
import { useAsyncData } from '../services/useAsyncData';
import { normalizePost } from '../services/blogHelper';
import { translations } from '../data/content';
import { applySeo, resetSeo, SITE_URL, SITE_NAME } from '../services/seo';

export default function AllBlogs() {
  let lang = 'en';
  try { lang = localStorage.getItem('dental_lang') || 'en'; } catch (_) { /* ignore */ }
  const activeLang = ['en', 'bn'].includes(lang) ? lang : 'en';
  const t = translations[activeLang] || translations.en;
  const [query, setQuery] = useState('');

  useEffect(() => {
    applySeo({
      title: `${t.blog.title} | ${SITE_NAME}`,
      description: t.blog.subtitle || undefined,
      url: `${SITE_URL}/blog`,
      type: 'website',
    });
    return () => resetSeo();
  }, [activeLang]);

  const { data: rawBlogPosts } = useAsyncData(
    () => blogApi.listPublic({ lang: activeLang }).then((r) => r.data?.items || []),
    localBlog,
    [activeLang]
  );

  const blogPosts = (rawBlogPosts || []).map(normalizePost);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogPosts;
    return blogPosts.filter((p) => {
      const title = (p.title?.[activeLang] || '').toLowerCase();
      const excerpt = (p.excerpt?.[activeLang] || '').toLowerCase();
      const cat = (p.category?.[activeLang] || '').toLowerCase();
      return title.includes(q) || excerpt.includes(q) || cat.includes(q);
    });
  }, [blogPosts, query, activeLang]);

  return (
    <div className="min-h-screen bg-[#D6E8F7] text-[#0A2255]">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#D6E8F7] pt-14 pb-10 border-b border-[#B8D8EE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#14357B] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{activeLang === 'en' ? 'Back to Home' : 'হোমে ফিরে যান'}</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.blog.eyebrow}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            {t.blog.title}
          </h1>
          <p className="mt-3 text-base text-[#5A7A9A] max-w-2xl">{t.blog.subtitle}</p>

          {/* Search */}
          <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#5A7A9A]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={activeLang === 'en' ? 'Search articles...' : 'নিবন্ধ খুঁজুন...'}
                className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#B8D8EE] bg-white text-sm outline-none focus:ring-2 focus:ring-[#2299D6]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-[#5A7A9A]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#5A7A9A]">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>{activeLang === 'en' ? 'No articles found.' : 'কোনো নিবন্ধ পাওয়া যায়নি।'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <article
                key={post.id}
                className="flex flex-col justify-between rounded-2xl overflow-hidden bg-white border border-[#B8D8EE] shadow-card-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                    <div className="relative h-48 w-full overflow-hidden bg-[#0A2255]">
                    <img
                      src={resolveImg(post.image)}
                      alt={post.title[activeLang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2255]/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#14357B] text-white text-[11px] font-semibold">
                        {post.category[activeLang]}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-[#5A7A9A]">
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-lg font-bold font-display leading-snug group-hover:text-[#2299D6] transition-colors">
                      {post.title[activeLang]}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A7A9A] line-clamp-3 leading-relaxed">
                      {post.excerpt[activeLang]}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14357B] hover:text-[#0A2255] group/btn transition-colors"
                  >
                    <span>{t.blog.readMore}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}