import React from 'react';
import { ShieldCheck, Award, CheckCircle2, Calendar, Stethoscope, FileBadge } from 'lucide-react';
import { doctorProfile } from '../data/doctor';

export default function AboutDoctor({ t, lang, onOpenAppointment }) {
  return (
    <section id="about" className="py-20 lg:py-28 bg-[#EDF7FC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Doctor Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-[#B8D8EE] bg-slate-900">
              <img
                src={doctorProfile.avatar}
                alt={doctorProfile.name[lang]}
                className="w-full h-auto aspect-[3/4] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2255]/80 via-transparent to-transparent" />

              {/* Bottom Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white backdrop-blur-md border border-[#B8D8EE] shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#2299D6] text-white flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#5A7A9A] block font-medium">
                      {doctorProfile.experienceYears} Clinical Service
                    </span>
                    <span className="text-sm font-bold text-[#0A2255] block">
                      {doctorProfile.bmdcReg}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Strip Floating */}
            <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm mx-auto">
              {doctorProfile.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-[#B8D8EE] text-center shadow-sm"
                >
                  <span className="text-lg font-bold text-[#2299D6] font-display block">
                    {ach.value}
                  </span>
                  <span className="text-[11px] text-[#5A7A9A] block font-medium">
                    {ach.label[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Bio Column */}
          <div className="lg:col-span-7 space-y-6">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#2299D6] text-xs font-semibold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t.about.eyebrow}</span>
            </div>

            {/* Name & Credentials */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0A2255]">
                {t.about.title}
              </h2>
              <p className="mt-2 text-sm sm:text-base font-semibold text-[#2299D6]">
                {t.about.qualifications}
              </p>
            </div>

            {/* Bio Paragraphs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {t.about.badges2.map((badge, idx) => (
                <ul key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-[#B8D8EE] shadow-sm">
                  <CheckCircle2 className="w-4 h-3 text-[#2299D6] flex-shrink-0" />
                  <li className="text-xs sm:text-sm font-medium text-[#0A2255]"> {badge} </li>
                </ul>

              ))}
            </div>
            <p className="text-[#5A7A9A] leading-relaxed text-sm sm:text-base">
              {t.about.bio1}
            </p>
            <p className="text-[#5A7A9A] leading-relaxed text-sm sm:text-base">
              {t.about.bio2}
            </p>
            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {t.about.badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#B8D8EE] shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#2299D6] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-[#0A2255]">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
            {/* CTA and Schedule */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={onOpenAppointment}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] hover:from-[#0F2A5E] hover:to-[#1A7DB3] text-white font-semibold text-sm shadow-md hover:shadow-glow-teal active:scale-95 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.about.meetDoctorCta}</span>
              </button>

              <span className="text-xs text-[#5A7A9A]">
                {t.about.scheduleNote}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
