import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { faqItems as localFaqs } from '../data/faq';
import { faqApi } from '../services/contentApi';
import { useAsyncData } from '../services/useAsyncData';

export default function FAQ({ t, lang }) {
  const { data: faqItems } = useAsyncData(
    () => faqApi.listPublic().then((r) => r.data?.items || []),
    localFaqs
  );
  const [openId, setOpenId] = useState('faq-1');

  const toggleFAQ = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#D6E8F7] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.faq.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0A2255]">
            {t.faq.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5A7A9A]">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#2299D6]/50 shadow-md'
                    : 'bg-white/60 border-[#B8D8EE] hover:border-[#A8D4F0]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                >
                  <span className="text-sm sm:text-base font-bold text-[#0A2255] font-display">
                    {item.question[lang]}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                    isOpen
                      ? 'bg-[#14357B] text-white rotate-180'
                      : 'bg-[#EDF7FC] text-[#5A7A9A]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#5A7A9A] leading-relaxed border-t border-[#EDF7FC]/80">
                    {item.answer[lang]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
