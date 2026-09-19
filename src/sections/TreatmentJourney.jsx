import React from 'react';
import { 
  Compass, 
  SearchCheck, 
  FileText, 
  Zap, 
  CheckCircle, 
  HeartHandshake 
} from 'lucide-react';

export default function TreatmentJourney({ t, lang }) {
  const steps = [
    {
      number: "01",
      icon: SearchCheck,
      title: {
        en: "Initial Consultation & X-Ray",
        bn: "পরামর্শ ও ডিজিটাল এক্স-রে"
      },
      desc: {
        en: "Comprehensive oral examination with low-dose digital imaging to evaluate tooth roots and bone health.",
        bn: "মুখের পুঙ্খানুপুঙ্খ ক্লিনিক্যাল পরীক্ষা এবং ডিজিটাল এক্স-রে দ্বারা গোড়ার অবস্থা পর্যবেক্ষণ।"
      }
    },
    {
      number: "02",
      icon: FileText,
      title: {
        en: "Personalized Treatment Plan",
        bn: "সুনির্দিষ্ট চিকিৎসা পরিকল্পনা"
      },
      desc: {
        en: "We explain treatment options, duration, and exact transparent pricing with zero pressure.",
        bn: "চিকিৎসার সঠিক পদ্ধতি, সম্ভাব্য সময়কাল ও সম্পূর্ণ স্বচ্ছ খরচের তালিকা বুঝিয়ে দেওয়া।"
      }
    },
    {
      number: "03",
      icon: Zap,
      title: {
        en: "Gentle Painless Treatment",
        bn: "ব্যথামুক্ত আধুনিক চিকিৎসা"
      },
      desc: {
        en: "Procedures performed with rotary precision and gentle local numbness for total physical relaxation.",
        bn: "উন্নত রোটারি ও আল্ট্রাসনিক প্রযুক্তির মাধ্যমে সম্পূর্ণ ব্যথাহীন ও আরামদায়ক সেবা প্রদান।"
      }
    },
    {
      number: "04",
      icon: CheckCircle,
      title: {
        en: "Restoration & Bite Harmony",
        bn: "পুনরুদ্ধার ও নিখুঁত সমাপ্তি"
      },
      desc: {
        en: "Finishing touches with composite polishing or custom crown placement to restore natural bite.",
        bn: "দাঁতের স্বাভাবিক কামড় ও মসৃণতা নিশ্চিত করতে পলিশিং অথবা কাস্টম ক্রাউন স্থাপন।"
      }
    },
    {
      number: "05",
      icon: HeartHandshake,
      title: {
        en: "Ongoing Preventive Care",
        bn: "দীর্ঘমেয়াদী যত্ন ও ফলো-আপ"
      },
      desc: {
        en: "Complimentary check-up instructions and 6-month hygiene reminders to protect your smile long-term.",
        bn: "চিকিৎসা পরবর্তী পরামর্শ ও প্রতি ৬ মাস অন্তর হাসি সুস্থ রাখার রিমাইন্ডার সুবিধা।"
      }
    }
  ];

  return (
    <section id="journey" className="py-20 lg:py-28 bg-white bg-[#EDF7FC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2299D6]/15 text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>{t.journey.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.journey.title}
          </h2>
          <p className="mt-4 text-base text-[#5A7A9A]">
            {t.journey.subtitle}
          </p>
        </div>

        {/* 5-Step Roadmap Desktop & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-4 relative">
          
          {/* Connector Line on Desktop */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-[#2299D6] via-[#2299D6]/80 to-[#14357B]/60 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="relative z-10 p-6 rounded-2xl bg-[#EDF7FC] border border-[#B8D8EE] text-center flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Step Circle */}
                <div className="w-14 h-14 rounded-2xl bg-[#14357B] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-[#14357B]/20 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="text-xs font-mono font-bold text-[#2299D6] uppercase tracking-widest mb-1">
                  Step {step.number}
                </span>

                <h3 className="text-base font-bold font-display text-[#0A2255] mb-2 leading-snug">
                  {step.title[lang]}
                </h3>

                <p className="text-xs text-[#5A7A9A] leading-relaxed">
                  {step.desc[lang]}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
