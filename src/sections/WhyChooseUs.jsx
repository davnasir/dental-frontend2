import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Microscope, 
  BadgeCheck, 
  Flame, 
  Smile, 
  PhoneCall, 
  HeartHandshake, 
  CalendarClock
} from 'lucide-react';

export default function WhyChooseUs({ t, lang }) {
  const pillars = [
    {
      icon: BadgeCheck,
      title: {
        en: "12+ Years Lead Surgeon Expertise",
        bn: "১২+ বছরের অভিজ্ঞ ডেন্টাল সার্জন"
      },
      desc: {
        en: "Trained under top oral & maxillofacial professors with specialized clinical fellowships.",
        bn: "ঢাকা মেডিকেল কলেজ ও আন্তর্জাতিক প্রশিক্ষণপ্রাপ্ত বিশেষজ্ঞ ডেন্টাল চিকিৎসকের সরাসরি তত্ত্বাবধান।"
      }
    },
    {
      icon: Microscope,
      title: {
        en: "Digital 3D Intraoral Diagnostics",
        bn: "ডিজিটাল থ্রি-ডি ও আরভিজি এক্স-রে"
      },
      desc: {
        en: "Ultra-low radiation RVG sensors and intraoral camera diagnostics for pinpoint accuracy.",
        bn: "ন্যূনতম রেডিয়েশনের ডিজিটাল সেন্সর যা দাঁতের ভেতরের ক্ষুদ্রতম সমস্যাও নিখুঁতভাবে শনাক্ত করে।"
      }
    },
    {
      icon: Flame,
      title: {
        en: "100% Class-B Vacuum Autoclave",
        bn: "১০০% আন্তর্জাতিক মানের জীবাণুমুক্তকরণ"
      },
      desc: {
        en: "European standard vacuum sterilization with single-use sealed pouches opened before you.",
        bn: "ক্লাস-বি ভ্যাকুয়াম অটোক্লেভে ১৩৪°C তাপে জীবাণুমুক্ত করে রোগীর সামনে সিলযুক্ত প্যাকেট খোলা হয়।"
      }
    },
    {
      icon: Smile,
      title: {
        en: "Painless Anesthesia Protocol",
        bn: "ব্যথামুক্ত অ্যানেস্থেসিয়া পদ্ধতি"
      },
      desc: {
        en: "Computerized micro-delivery and surface numbing gels eliminate traditional injection fear.",
        bn: "জেল প্রয়োগ ও সূক্ষ্ম অ্যানেস্থেসিয়া পদ্ধতির ফলে কোনো সূঁচের ভয় বা ব্যথা থাকে না।"
      }
    },
    {
      icon: ShieldCheck,
      title: {
        en: "100% Transparent Pricing",
        bn: "সম্পূর্ণ স্বচ্ছ মূল্য তালিকা"
      },
      desc: {
        en: "Itemized written estimates before treatment starts. Never any surprise add-ons or hidden fees.",
        bn: "চিকিৎসা শুরুর পূর্বেই সম্ভাব্য খরচের পরিষ্কার ধারণা দেওয়া হয়, কোনো বাড়তি লুকায়িত খরচ নেই।"
      }
    },
    {
      icon: PhoneCall,
      title: {
        en: "Same-Day Emergency Priority",
        bn: "জরুরি ব্যথায় তাৎক্ষণিক সেবা"
      },
      desc: {
        en: "Dedicated slots reserved daily for acute toothaches, facial swellings, and trauma.",
        bn: "তীব্র দাঁতে ব্যথা, মাড়ি ফোলা বা ভাঙা দাঁতের ক্ষেত্রে তাৎক্ষণিক চিকিৎসার বিশেষ অগ্রাধিকার।"
      }
    },
    {
      icon: HeartHandshake,
      title: {
        en: "Zero-Anxiety Patient Care",
        bn: "ভয়হীন ও রোগীবান্ধব পরিবেশ"
      },
      desc: {
        en: "Calm, clean clinical environment with relaxing music and empathetic doctor-patient dialogue.",
        bn: "পরিপাটি ও শান্ত পরিবেশ যেখানে ছোট-বড় সবার মনস্তাত্ত্বিক স্বস্তি নিশ্চিত করা হয়।"
      }
    },
    {
      icon: CalendarClock,
      title: {
        en: "Fast Online & WhatsApp Booking",
        bn: "সহজ অনলাইন ও হোয়াটসঅ্যাপ বুকিং"
      },
      desc: {
        en: "Seamless scheduling via web form or direct 1-click WhatsApp with 15-min confirmation.",
        bn: "ওয়েবসাইট বা সরাসরি হোয়াটসঅ্যাপে এক ক্লিকেই সময় নির্ধারণ ও দ্রুত কনফার্মেশন।"
      }
    }
  ];

  return (
    <section id="why-us" className="py-20 lg:py-28 bg-[#EDF7FC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#2299D6] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.whyUs.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.whyUs.title}
          </h2>
          <p className="mt-4 text-base text-[#5A7A9A]">
            {t.whyUs.subtitle}
          </p>
        </div>

        {/* 8 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#B8D8EE] shadow-card-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EDF7FC] text-[#2299D6] flex items-center justify-center mb-4 border border-[#B8D8EE] group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold font-display text-[#0A2255] mb-2 leading-snug">
                  {pillar.title[lang]}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A7A9A] leading-relaxed">
                  {pillar.desc[lang]}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
