import React from 'react';
import { AlertCircle, PhoneCall, MessageCircle } from 'lucide-react';

export default function EmergencyCTA({ t, lang }) {
  return (
    <section className="py-12 bg-gradient-to-r from-rose-900 via-rose-800 to-[#0A2255] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">

          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>{lang === 'en' ? 'Urgent Dental Care' : 'জরুরি ডেন্টাল সেবা'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              {t.emergency.title}
            </h2>
            <p className="text-sm text-rose-100/80 leading-relaxed">
              {t.emergency.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
            <a
              href="tel:+8801966115115"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-rose-950 hover:bg-rose-50 text-sm font-bold shadow-lg transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-rose-700" />
              <span>{t.emergency.callBtn}</span>
            </a>

            <a
              href="https://wa.me/8801966115115?text=EMERGENCY:%20I%20have%20severe%20tooth%20pain%20and%20need%20urgent%20attention"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2299D6] hover:bg-[#1A7DB3] text-white text-sm font-bold shadow-lg transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.emergency.whatsappBtn}</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
