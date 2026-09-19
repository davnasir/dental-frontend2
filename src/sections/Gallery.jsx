import React, { useState, useMemo } from 'react';
import { Sparkles, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { galleryCases as localGallery } from '../data/gallery';
import { galleryApi, settingsApi } from '../services/contentApi';
import { useAsyncData } from '../services/useAsyncData';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

const CATEGORY_LABELS = {
  cosmetic: { en: 'Veneers & Smile Design', bn: 'ভেনিয়ার্স ও স্মাইল' },
  orthodontics: { en: 'Orthodontics & Braces', bn: 'ব্রেসেস' },
  implant: { en: 'Dental Implants', bn: 'ইমপ্ল্যান্ট' },
  whitening: { en: 'Teeth Whitening', bn: 'হোয়াইটনিং' },
};

export default function Gallery({ t, lang, onOpenLightbox }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: galleryCases } = useAsyncData(
    () => galleryApi.listPublic().then((r) => r.data?.items || []),
    localGallery
  );
  const { data: visibility } = useAsyncData(
    () => settingsApi.getPublic('before_after_visibility').then((r) => r.data?.item?.value?.enabled).catch(() => true),
    true
  );

  if (visibility === false) return null;

  const categories = useMemo(() => {
    const all = { id: 'all', label: { en: 'All Cases', bn: 'সকল কেস' } };
    if (!galleryCases || galleryCases.length === 0) return [all];
    const keys = [...new Set(galleryCases.map((c) => c.category).filter(Boolean))];
    return [all, ...keys.map((k) => ({
      id: k,
      label: CATEGORY_LABELS[k] || { en: k, bn: k },
    }))];
  }, [galleryCases]);

  const filteredCases = galleryCases.filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory
  );

  return (
    <section id="gallery" className="py-20 lg:py-28 bg-[#EDF7FC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#2299D6] text-xs font-semibold uppercase tracking-wider mb-3">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{t.gallery.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.gallery.title}
          </h2>
          <p className="mt-4 text-base text-[#5A7A9A] leading-relaxed">
            {t.gallery.subtitle}
          </p>
          <p className="text-xs text-[#2299D6] font-medium mt-2">
            💡 {t.gallery.dragInstruction}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#14357B] text-white shadow-md shadow-[#14357B]/20'
                    : 'bg-white text-[#5A7A9A] hover:bg-[#EDF7FC] border border-[#B8D8EE]'
                }`}
              >
                {cat.label[lang]}
              </button>
            );
          })}
        </div>

        {/* Before & After Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredCases.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-6 rounded-3xl border border-[#B8D8EE] shadow-card-soft space-y-4"
            >
              {/* Interactive Split Slider */}
              <div className="relative group">
                <BeforeAfterSlider
                  beforeImg={item.beforeImg}
                  afterImg={item.afterImg}
                  altText={item.title[lang]}
                  treatmentType={item.treatmentType}
                />

                {/* Lightbox Trigger Button */}
                <button
                  type="button"
                  onClick={() => onOpenLightbox(item)}
                  className="absolute top-3 right-16 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-sm transition-colors z-20"
                  aria-label="View fullscreen image"
                  title="Expand Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Caption & Description */}
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-[#0A2255]">
                  {item.title[lang]}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A7A9A] mt-1.5 leading-relaxed">
                  {item.description[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
