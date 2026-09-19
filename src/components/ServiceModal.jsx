import React, { useEffect } from 'react';
import { X, Clock, Banknote, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { resolveImg } from '../utils/image';

export default function ServiceModal({ service, onClose, onBookService, lang, t }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!service) return null;

  return (
    <div 
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#B8D8EE] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar with Image */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#14357B] flex-shrink-0">
          <img 
            src={resolveImg(service.image)} 
            alt={service.name[lang]} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D192E] via-[#14357B]/40 to-transparent" />
          
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title on image */}
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#2299D6] text-white mb-2">
              {service.category}
            </span>
            <h2 id="modal-service-title" className="text-xl sm:text-2xl font-bold text-white font-display">
              {service.name[lang]}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Summary Box */}
          <p className="text-[#5A7A9A] leading-relaxed text-sm sm:text-base">
            {service.shortDesc[lang]}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#EDF7FC]/70 border border-[#B8D8EE]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2299D6] text-white flex items-center justify-center flex-shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#5A7A9A] block font-medium">
                  {lang === 'en' ? 'Estimated Pricing' : 'আনুমানিক মূল্য'}
                </span>
                <span className="text-sm font-bold text-[#0A2255]">
                  {service.priceFormatted}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2299D6] text-white flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#5A7A9A] block font-medium">
                  {lang === 'en' ? 'Typical Duration' : 'সময়কাল'}
                </span>
                <span className="text-sm font-bold text-[#0A2255]">
                  {service.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Key Clinical Benefits */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A2255] mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2299D6]" />
              <span>{lang === 'en' ? 'Clinical Benefits & Features' : 'চিকিৎসার প্রধান সুবিধাসমূহ'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(service.benefits?.[lang] || []).map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#0A2255]">
                  <CheckCircle className="w-4 h-4 text-[#2299D6] mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Procedure Steps */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A2255] mb-3">
              {lang === 'en' ? 'Step-by-Step Procedure' : 'চিকিৎসা পদ্ধতি'}
            </h3>
            <ol className="space-y-2.5">
              {(service.procedure?.[lang] || []).map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#5A7A9A]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EDF7FC] text-[#0A2255] font-semibold text-xs flex items-center justify-center border border-[#B8D8EE]">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Recovery Guidance */}
          <div className="p-3.5 rounded-lg bg-[#EDF7FC] border border-[#B8D8EE] text-xs sm:text-sm text-[#5A7A9A]">
            <span className="font-semibold text-[#0A2255] block mb-0.5">
              {lang === 'en' ? 'Post-Treatment Recovery:' : 'চিকিৎসা পরবর্তী যত্ন:'}
            </span>
            <span>{service.recovery?.[lang] || ''}</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#EDF7FC] border-t border-[#B8D8EE] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-[#5A7A9A] text-center sm:text-left">
            {lang === 'en' ? 'Consultation required for final clinical assessment.' : 'চূড়ান্ত চিকিৎসা পরিকল্পনা ডাক্তারের পরীক্ষার পর নির্ধারিত হয়।'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-lg border border-[#B8D8EE] text-[#0A2255] text-sm font-semibold hover:bg-[#EDF7FC] transition-colors"
            >
              {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookService(service);
              }}
              className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#14357B] to-[#2299D6] text-white text-sm font-semibold shadow-md hover:shadow-glow-teal transition-all"
            >
              <span>{t.services.bookThis}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
