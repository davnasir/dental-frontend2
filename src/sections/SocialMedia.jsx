import React from 'react';
import { Play, Video } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../components/BrandIcons';
import { reelApi, settingsApi } from '../services/contentApi';
import { useAsyncData } from '../services/useAsyncData';
import { resolveImg } from '../utils/image';

const FALLBACK_REELS = [
  { id: 1, title: { en: "3 Mistakes You Are Making While Brushing", bn: "ব্রাশ করার সময় যে ৩টি ভুল আমরা সবাই করি" }, tag: "Oral Hygiene", duration: "0:45", views: "18.4K views", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80", url: "https://instagram.com" },
  { id: 2, title: { en: "How We Do a Single-Visit Root Canal Without Pain", bn: "ব্যথা ছাড়া মাত্র এক সিটিংয়ে কীভাবে রুট ক্যানেল হয়" }, tag: "Clinical Demo", duration: "0:58", views: "24.1K views", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80", url: "https://facebook.com" },
  { id: 3, title: { en: "Real Smile Transformation: From Crowded to Straight", bn: "বাঁকা দাঁতের ব্রেসেস চিকিৎসার সফল রূপান্তর" }, tag: "Before & After", duration: "0:52", views: "32.8K views", image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80", url: "https://instagram.com" },
  { id: 4, title: { en: "What Happens During Dental Scaling?", bn: "ডেন্টাল স্কেলিংয়ে কীভাবে পাথর পরিষ্কার হয়?" }, tag: "Patient Education", duration: "1:05", views: "15.9K views", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80", url: "https://facebook.com" },
];

export default function SocialMedia({ t, lang }) {
  const { data: apiReels } = useAsyncData(
    () => reelApi.listPublic().then((r) => r.data?.items || []),
    FALLBACK_REELS
  );
  const { data: visibility } = useAsyncData(
    () => settingsApi.getPublic('reels_visibility').then((r) => r.data?.item?.value?.enabled).catch(() => true),
    true
  );

  if (visibility === false) return null;

  const reels = (apiReels && apiReels.length > 0 ? apiReels : FALLBACK_REELS).map((r) => ({
    ...r,
    img: resolveImg(r.image),
    views: r.views || '',
    url: r.url || r.videoUrl || '#',
    title: typeof r.title === 'object' ? r.title : { en: r.title || '', bn: r.title || '' },
  }));

  return (
    <section id="updates" className="py-20 lg:py-28 bg-[#D6E8F7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
              <Video className="w-3.5 h-3.5" />
              <span>{t.social.eyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0A2255]">
              {t.social.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#5A7A9A] max-w-xl">
              {t.social.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all">
              <FacebookIcon className="w-4 h-4" />
              <span>Facebook</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all">
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {/* Video Reel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel) => (
            <a
              key={reel.id}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl overflow-hidden bg-white border border-[#B8D8EE] shadow-card-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-[#0A2255]">
                <img
                  src={reel.img}
                  alt={reel.title[lang]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2255]/90 via-[#0A2255]/30 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {reel.tag}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    {reel.duration}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#2299D6]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#2299D6] transition-all">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-sm font-bold leading-snug line-clamp-2">
                    {reel.title[lang]}
                  </h3>
                  {reel.views && (
                    <span className="text-[11px] text-[#5A7A9A] mt-1 block">
                      {reel.views}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}