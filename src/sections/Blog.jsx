import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Newspaper } from 'lucide-react';
import { blogPosts as localBlog } from '../data/blog';
import { blogApi } from '../services/contentApi';
import { resolveImg } from '../utils/image';
import { useAsyncData } from '../services/useAsyncData';
import { normalizePost } from '../services/blogHelper';

export default function Blog({ t, lang }) {
  const { data: rawBlogPosts } = useAsyncData(
    () => blogApi.listPublic({ lang }).then((r) => r.data?.items || []),
    localBlog,
    [lang]
  );

  const blogPosts = (rawBlogPosts || []).map(normalizePost);
  const latestPosts = blogPosts.slice(0, 6);

  return (
    <section id="blog" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.blog.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.blog.title}
          </h2>
          <p className="mt-4 text-base text-[#5A7A9A]">
            {t.blog.subtitle}
          </p>
        </div>

        {/* Blog Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col justify-between rounded-2xl overflow-hidden bg-white border border-[#B8D8EE] shadow-card-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-[#0A2255]">
                  <img
                    src={resolveImg(post.image)}
                    alt={post.title[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2255]/60 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#14357B] text-white text-[11px] font-semibold">
                      {post.category[lang]}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[#5A7A9A]">
                    <span>{post.date}</span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-[#0A2255] group-hover:text-[#2299D6] transition-colors leading-snug">
                    {post.title[lang]}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A7A9A] line-clamp-3 leading-relaxed">
                    {post.excerpt[lang]}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14357B] hover:text-[#0F2A5E] group/btn transition-colors"
                >
                  <span>{t.blog.readMore}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Posts */}
        {blogPosts.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#14357B] hover:bg-[#2299D6] text-white text-sm font-bold shadow-lg shadow-[#14357B]/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Newspaper className="w-4.5 h-4.5" />
              <span>{t.blog.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
