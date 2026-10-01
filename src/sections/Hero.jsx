import React from 'react';
import {
  ShieldCheck,
  Calendar,
  Sparkles,
  MessageCircle,
  PhoneCall,
  Clock,
  MapPin,
  Award,
  Users,
  Star,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function Hero({ t, lang, onOpenAppointment }) {
  return (
    <section
      id="home"
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#EDF7FC] via-white to-[#EDF7FC]"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#2299D6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#2299D6]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D6E8F7]/70 border border-[#B8D8EE] text-[#0A2255] text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#2299D6]" />
              <span>{t.hero.trustBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A2255] font-display leading-[1.15]">
              {t.hero.headingLine1}{' '}
              <span className="gradient-text-teal block sm:inline">
                {t.hero.headingLine2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#5A7A9A] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={onOpenAppointment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] hover:from-[#0F2A5E] hover:to-[#1A7DB3] text-white font-semibold text-base shadow-lg shadow-[#14357B]/25 hover:shadow-glow-teal active:scale-95 transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span>{t.hero.ctaAppointment}</span>
              </button>

              <a
                href="#services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#B8D8EE] hover:bg-[#EDF7FC] text-[#0A2255] font-semibold text-base transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#2299D6]" />
                <span>{t.hero.ctaTreatments}</span>
              </a>

              <a
                href="https://wa.me/8801966115115?text=Hello%20Doctor,%20I%20would%20like%20to%20book%20an%20appointment"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#D6E8F7] border border-[#B8D8EE] text-[#0A2255] font-semibold text-sm hover:bg-[#EDF7FC] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#2299D6]" />
                <span>{t.hero.ctaWhatsApp}</span>
              </a>
            </div>

            {/* Trust Mini-Strip */}
            <div className="pt-4 border-t border-[#B8D8EE] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5A7A9A]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2299D6]" />
                <span>{t.hero.openingHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2299D6]" />
                <span>{t.hero.locationBadge}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-[#2299D6]" />
                <a href="tel:+8801966115115" className="hover:text-[#2299D6] font-semibold">
                  +880 1966 115115
                </a>
              </div>
            </div>
          </div>

          {/* Right Hero Visuals with Floating Cards */}
          <div className="lg:col-span-5 relative flex justify-center">

            {/* Main Visual Image Container */}
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#B8D8EE] bg-slate-900 group">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
                alt="Modern Dental Clinic Operatory and Specialist Doctor"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                fetchpriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2255]/80 via-transparent to-transparent" />

              {/* Bottom Doctor Credential Tag */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0A2255]">
                    Dr Rafeya Akter
                  </h4>
                  <p className="text-[11px] text-[#2299D6] font-medium">
                    BDS (DU), Sapporo Dental College & Hospital
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-[#D6E8F7] text-[#2299D6] text-[10px] font-bold uppercase">
                  Lead Surgeon
                </span>
              </div>
            </div>

            {/* Floating Card 1: 12+ Years Experience (Top-Left) */}
            <div className="absolute -top-4 -left-4 sm:-left-6 p-3 rounded-2xl glass-card shadow-card-hover animate-float-slow hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2299D6] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0A2255] block leading-tight">
                  {t.hero.floatingExp}
                </span>
                <span className="text-[10px] text-[#5A7A9A] block font-medium">
                  {t.hero.floatingExpSub}
                </span>
              </div>
            </div>

            {/* Floating Card 2: 15,000+ Happy Patients (Bottom-Right) */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 p-3 rounded-2xl glass-card shadow-card-hover animate-float-slow [animation-delay:2s] hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2299D6] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0A2255] block leading-tight">
                  {t.hero.floatingPatients}
                </span>
                <span className="text-[10px] text-[#5A7A9A] block font-medium">
                  {t.hero.floatingPatientsSub}
                </span>
              </div>
            </div>

            {/* Floating Card 3: 4.9/5 Rating (Top-Right) */}
            <div className="absolute top-12 -right-4 sm:-right-8 p-2.5 rounded-xl glass-card shadow-card-hover animate-float-slow [animation-delay:4s] hidden md:flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="text-left">
                <span className="text-xs font-bold text-[#0A2255] block">
                  {t.hero.floatingRating}
                </span>
                <span className="text-[9px] text-[#5A7A9A] block">
                  {t.hero.floatingRatingSub}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
