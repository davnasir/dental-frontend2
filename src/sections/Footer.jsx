import React from 'react';
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon } from '../components/BrandIcons';

export default function Footer({ t, lang, onOpenAppointment }) {
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const elem = document.querySelector(id);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A2255] text-[#5A7A9A] pt-16 pb-24 md:pb-12 border-t border-[#B8D8EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#B8D8EE]">

          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Nahol Dental Care Logo"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#2299D6] shadow-glow-teal bg-white"
              />
              <span className="text-2xl font-bold tracking-tight text-white font-display">
                Nahol Dental Care
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#5A7A9A] leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>

            <div className="pt-2 text-xs text-[#2299D6] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.footer.bmdcReg}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/naholdentalcare.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0A2255] hover:bg-[#14357B] text-white flex items-center justify-center transition-colors"
                aria-label="Visit Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@nahol.dental.care?_r=1&_t=ZS-99Z2KJszgxB"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0A2255] hover:bg-[#14357B] text-white flex items-center justify-center transition-colors"
                aria-label="Visit Instagram"
              >
                <TiktokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5A7A9A]">
              <li>
                <a href="#about" onClick={(e) => handleScrollTo(e, '#about')} className="hover:text-[#2299D6] transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScrollTo(e, '#services')} className="hover:text-[#2299D6] transition-colors">
                  {t.nav.services}
                </a>
              </li>
              <li>
                <a href="#problem" onClick={(e) => handleScrollTo(e, '#problem')} className="hover:text-[#2299D6] transition-colors">
                  {t.nav.problem}
                </a>
              </li>
              <li>
                <a href="#calculator" onClick={(e) => handleScrollTo(e, '#calculator')} className="hover:text-[#2299D6] transition-colors">
                  {t.nav.calculator}
                </a>
              </li>
              <li>
                <a href="#gallery" onClick={(e) => handleScrollTo(e, '#gallery')} className="hover:text-[#2299D6] transition-colors">
                  {t.nav.gallery}
                </a>
              </li>
              <li>
                <a href="#reviews" onClick={(e) => handleScrollTo(e, '#reviews')} className="hover:text-[#2299D6] transition-colors">
                  {t.nav.reviews}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Treatments */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t.footer.specialties}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5A7A9A]">
              <li>Root Canal Treatment (RCT)</li>
              <li>Dental Implants & Bone Grafting</li>
              <li>In-Office Laser Teeth Whitening</li>
              <li>Porcelain Veneers & Smile Makeover</li>
              <li>Surgical Wisdom Tooth Removal</li>
              <li>Orthodontic Braces & Aligners</li>
              <li>Composite Aesthetic Tooth Fillings</li>
            </ul>
          </div>

          {/* Col 4: Visiting Schedule & Quick Action */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t.footer.hours}
            </h4>
            <div className="space-y-1.5 text-xs text-[#5A7A9A]">
              <div className="flex justify-between">
                <span>Sat – Thu:</span>
                <span className="font-semibold text-white">10:00 AM – 9:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Friday:</span>
                <span className="font-semibold text-white">4:00 PM – 9:00 PM</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAppointment}
                className="w-full py-2.5 px-4 rounded-xl bg-[#14357B] hover:bg-[#0F2A5E] text-white text-xs font-semibold shadow-sm transition-all"
              >
                {t.nav.bookCta}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer and Copyright */}
        <div className="pt-8 text-center space-y-3">
          <div className="text-xs text-[#5A7A9A]">
            © {new Date().getFullYear()} {t.footer.rights} <a
              className="font-bold text-white"
              href="https://webfix.com.bd"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.footer.webfix}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
