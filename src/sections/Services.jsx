import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Clock,
  Banknote,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { servicesData as localServices } from '../data/services';
import { serviceApi } from '../services/serviceApi';
import { categoryApi, settingsApi } from '../services/contentApi';
import { useAsyncData } from '../services/useAsyncData';
import { resolveImg } from '../utils/image';

export default function Services({ t, lang, onSelectService, onBookService }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: servicesData } = useAsyncData(
    () => serviceApi.listPublic({ lang }).then((r) => r.data?.items || []),
    localServices,
    [lang]
  );

  const { data: apiCategories } = useAsyncData(
    () => categoryApi.listPublic().then((r) => r.data?.items || []),
    []
  );

  const { data: categoriesVisibility } = useAsyncData(
    () => settingsApi.getPublic('categories_visibility').then((r) => r.data?.item?.value?.enabled).catch(() => true),
    true
  );

  const categories = useMemo(() => {
    const all = { id: 'all', label: { en: 'All Treatments', bn: 'সকল চিকিৎসা' } };
    if (!apiCategories || apiCategories.length === 0) return [all];
    return [all, ...apiCategories.map((c) => ({
      id: c.key,
      label: c.name || { en: c.key, bn: c.key },
    }))];
  }, [apiCategories]);

  const filteredServices = useMemo(() => {
    return servicesData.filter((svc) => {
      const matchesCategory = activeCategory === 'all' || svc.categoryKey === activeCategory || svc.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const nameMatch = svc.name[lang]?.toLowerCase().includes(query);
      const descMatch = svc.shortDesc?.[lang]?.toLowerCase().includes(query);
      return matchesCategory && (nameMatch || descMatch);
    });
  }, [activeCategory, searchQuery, lang, servicesData]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === 'all') return null;
    const cat = categories.find((c) => c.id === activeCategory);
    return cat?.label?.[lang] || null;
  }, [activeCategory, categories, lang]);

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#EDF7FC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#2299D6] text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>{t.services.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.services.title}
          </h2>
          <p className="mt-4 text-base text-[#5A7A9A] leading-relaxed">
            {t.services.subtitle}
          </p>
        </div>

        {/* Dynamic category heading */}
        {activeCategoryName && categoriesVisibility !== false && (
          <div className="text-center mb-6">
            <p className="text-lg font-bold font-display text-[#2299D6]">
              {lang === 'en' ? 'Comprehensive Dental Care Under One Roof' : 'এক ছাদের নিচে সম্পূর্ণ দন্ত চিকিৎসা'}
            </p>
            <p className="text-sm text-[#5A7A9A] mt-1">{activeCategoryName}</p>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categoriesVisibility === false
              ? null
              : categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
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

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.services.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#B8D8EE] text-[#0A2255] placeholder-[#5A7A9A] focus:ring-[#2299D6] transition-all"
            />
          </div>

        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service, idx) => (
            <div
              key={service.id}
              className="group rounded-2xl bg-white border border-[#B8D8EE] overflow-hidden shadow-card-soft hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                {/* Image Header with Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={resolveImg(service.image)}
                    alt={service.name[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md text-white font-mono text-xs font-bold flex items-center justify-center border border-white/20">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {service.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2299D6]/90 text-[#0A2255] font-bold text-[11px] uppercase tracking-wider backdrop-blur-sm">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  {/* Service Category & Price on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <span className="text-[11px] uppercase font-bold tracking-wider opacity-85 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                      {service.category}
                    </span>
                    <span className="text-xs font-bold text-white bg-[#0A2255]/80 backdrop-blur-sm px-2.5 py-0.5 rounded border border-[#2299D6]/30">
                      {service.priceFormatted}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold font-display text-[#0A2255] group-hover:text-[#2299D6] transition-colors">
                    {service.name[lang]}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A7A9A] line-clamp-2 leading-relaxed">
                    {service.shortDesc?.[lang] || ''}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#5A7A9A] pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2299D6]" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-5 pt-0 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  className="flex-grow flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#B8D8EE] text-[#5A7A9A] text-xs font-semibold hover:bg-[#EDF7FC] hover:text-[#2299D6] transition-colors"
                >
                  <span>{t.services.viewDetails}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onBookService(service)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#14357B] hover:bg-[#0F2A5E] text-white text-xs font-semibold shadow-sm active:scale-95 transition-all flex-shrink-0"
                  title={t.services.bookThis}
                >
                  <span>{lang === 'en' ? 'Book' : 'বুকিং'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if search has no match */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#B8D8EE]">
            <p className="text-[#5A7A9A] text-sm">
              {lang === 'en' ? 'No dental treatments match your search query.' : 'আপনার অনুসন্ধানের সাথে কোনো চিকিৎসা মেলেনি।'}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-semibold text-[#2299D6] hover:underline"
            >
              {lang === 'en' ? 'Clear Filters & Show All' : 'ফিল্টার মুছুন ও সবগুলো দেখুন'}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}