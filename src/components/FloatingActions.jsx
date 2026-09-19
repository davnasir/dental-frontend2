import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, ArrowUp, Calendar } from 'lucide-react';

export default function FloatingActions({ t, onOpenAppointment }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop Floating Actions (Right Side) */}
      <div className="fixed bottom-8 right-6 z-40 hidden md:flex flex-col items-center gap-3">

        {/* Back to top */}
        <button
          type="button"
          onClick={scrollToTop}
          className={`w-12 h-12 rounded-full bg-white text-[#0A2255] border border-[#B8D8EE] shadow-xl flex items-center justify-center hover:bg-[#EDF7FC] hover:text-[#14357B] transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          aria-label="Back to top"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Quick Phone Call Button */}
        <a
          href="tel:+8801966115115"
          className="w-12 h-12 rounded-full bg-[#14357B] text-white shadow-lg shadow-[#14357B]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Call clinic directly"
          title="Direct Call: +880 1948-921229"
        >
          <Phone className="w-5 h-5" />
        </a>

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/8801966115115?text=Hello%20Doctor,%20I%20would%20like%20to%20consult%20regarding%20dental%20care"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Chat on WhatsApp"
          title="Chat with Clinic on WhatsApp"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
          <MessageCircle className="w-7 h-7 fill-current" />
        </a>
      </div>

      {/* Mobile Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#B8D8EE] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="grid grid-cols-3 gap-2">

          {/* Call button */}
          <a
            href="tel:+8801948921229"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#EDF7FC] text-[#0A2255] text-xs font-semibold active:scale-95 transition-transform"
          >
            <Phone className="w-4 h-4 text-[#2299D6] mb-0.5" />
            <span>{t.mobileBar.call}</span>
          </a>

          {/* WhatsApp button */}
          <a
            href="https://wa.me/8801948921229?text=Hello%20Doctor,%20I%20would%20like%20to%20book%20a%20dental%20appointment"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#EDF7FC] text-[#2299D6] text-xs font-semibold border border-[#B8D8EE] active:scale-95 transition-transform"
          >
            <MessageCircle className="w-4 h-4 text-[#2299D6] mb-0.5" />
            <span>{t.mobileBar.whatsapp}</span>
          </a>

          {/* Book button */}
          <button
            type="button"
            onClick={onOpenAppointment}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>{t.mobileBar.book}</span>
          </button>
        </div>
      </div>
    </>
  );
}
