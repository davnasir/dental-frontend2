import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Calendar,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { settingsApi } from '../services/contentApi';

const DEFAULT_HOURS = [
  { labelEn: 'Saturday – Thursday', labelBn: 'শনিবার – বৃহস্পতিবার', hours: '10:00 AM – 9:00 PM' },
  { labelEn: 'Friday', labelBn: 'শুক্রবার', hours: '4:00 PM – 9:00 PM' },
];

const HoursList = ({ hours, lang }) => (
  <div className="mt-2 space-y-1 text-xs text-[#5A7A9A]">
    {hours.map((row, i) => (
      <div key={i} className="flex justify-between gap-3">
        <span>{lang === 'en' ? row.labelEn || row.label : row.labelBn || row.labelEn || row.label}</span>
        <span className="font-semibold text-[#0A2255]">{row.hours}</span>
      </div>
    ))}
  </div>
);

export default function ContactLocation({ t, lang, onOpenAppointment }) {
  // Per-branch consultation hours (Uttara branch is card #1, Tongi branch is card #2)
  const [uttaraHours, setUttaraHours] = useState(DEFAULT_HOURS);
  const [tongiHours, setTongiHours] = useState(DEFAULT_HOURS);

  useEffect(() => {
    settingsApi.getPublic('consultation_hours_uttara')
      .then((r) => {
        const rows = r.data?.item?.value?.rows;
        if (Array.isArray(rows) && rows.length > 0) setUttaraHours(rows);
      })
      .catch(() => {});
    settingsApi.getPublic('consultation_hours_tongi')
      .then((r) => {
        const rows = r.data?.item?.value?.rows;
        if (Array.isArray(rows) && rows.length > 0) setTongiHours(rows);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#D6E8F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.contact.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.contact.title}
          </h2>
          <p className="mt-4 text-base text-[#5A7A9A]">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Contact Info & Map Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Contact Details Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#B8D8EE] shadow-card-soft flex flex-col justify-between space-y-6">

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    Uttara, Dhaka-1230
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A7A9A] mt-0.5 leading-relaxed">
                    House#19(1st floor), Lake Drive Road, Sector#07, Uttara, Dhaka-1230
                  </p>
                </div>
              </div>
              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    {t.contact.phoneTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm">
                    <a href="tel:+8801966115115" className="text-[#14357B] font-bold hover:underline">
                      +88 01966 115115
                    </a>
                    <span className="text-[#B8D8EE]">•</span>
                    <a
                      href="https://wa.me/8801966115115"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2299D6] font-semibold hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Available</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    {t.contact.emailTitle}
                  </h3>
                  <a href="mailto:info@naholdentalcare.com.bd" className="text-xs sm:text-sm text-[#5A7A9A] hover:text-[#2299D6] transition-colors">
                    info@naholdentalcare.com.bd
                  </a>
                </div>
              </div>

              {/* Weekly Consultation Hours */}
              <div className="flex items-start gap-4 pt-2">
                <div className="w-11 h-11 rounded-xl bg-[#D6E8F7] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="w-full">
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    {t.contact.hoursTitle}
                  </h3>
                  <HoursList hours={uttaraHours} lang={lang} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDF7FC]">
              <button
                type="button"
                onClick={onOpenAppointment}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Online</span>
              </button>
            </div>

          </div>

          {/* Map Preview Embed Column */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-4 border border-[#B8D8EE] shadow-card-soft overflow-hidden flex flex-col justify-between">
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden relative bg-[#B8D8EE]">
              <iframe
                title="Clinic Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.5825695324584!2d90.39075847479556!3d23.868952284215826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xaa614fd11149baf9%3A0x5645d50f0dffafc6!2sNahol%20Dental%20Care%20-%20Uttara%207!5e0!3m2!1sen!2sbd!4v1788884628277!5m2!1sen!2sbd"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-[#5A7A9A]">
                <span>Free patient parking available on premises</span>
              </div>
              <a
                href="https://maps.app.goo.gl/wmM2fwNxzadmWYkh6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14357B] hover:underline"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-5">
          {/* Contact Details Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#B8D8EE] shadow-card-soft flex flex-col justify-between space-y-6">

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    Tongi, Gazipur
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A7A9A] mt-0.5 leading-relaxed">
                    54/A Dream Orchid Tower  1st floor  (Ground floor of Social  Islamic Bank) Aouch para, College Road Tongi, Gazipur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    {t.contact.phoneTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm">
                    <a href="tel:+8801966115115" className="text-[#14357B] font-bold hover:underline">
                      +88 01966 115115
                    </a>
                    <span className="text-[#B8D8EE]">•</span>
                    <a
                      href="https://wa.me/8801966115115"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2299D6] font-semibold hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Available</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    {t.contact.emailTitle}
                  </h3>
                  <a href="mailto:care@naholdentalcare.com" className="text-xs sm:text-sm text-[#5A7A9A] hover:text-[#2299D6] transition-colors">
                    info@naholdentalcare.com.bd
                  </a>
                </div>
              </div>

              {/* Weekly Consultation Hours */}
              <div className="flex items-start gap-4 pt-2">
                <div className="w-11 h-11 rounded-xl bg-[#D6E8F7] text-[#14357B] flex items-center justify-center flex-shrink-0 border border-[#B8D8EE]">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="w-full">
                  <h3 className="text-sm font-bold text-[#0A2255]">
                    {t.contact.hoursTitle}
                  </h3>
                  <HoursList hours={tongiHours} lang={lang} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDF7FC]">
              <button
                type="button"
                onClick={onOpenAppointment}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Online</span>
              </button>
            </div>

          </div>

          {/* Map Preview Embed Column */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-4 border border-[#B8D8EE] shadow-card-soft overflow-hidden flex flex-col justify-between">
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden relative bg-[#B8D8EE]">
              <iframe
                title="Clinic Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3647.4747051301088!2d90.3927989747968!3d23.90823888269949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c5f12da35779%3A0x1c8046d23a3933ad!2sNahol%20Dental%20Care%20-%20Tongi!5e0!3m2!1sen!2sbd!4v1788886383035!5m2!1sen!2sbd"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-[#5A7A9A]">
                <span>Free patient parking available on premises</span>
              </div>
              <a
                href="https://maps.app.goo.gl/Q5dQhoLsGejfPUJZA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14357B] hover:underline"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
