import React, { useEffect, useState, useRef } from 'react';
import { Award, Users, Stethoscope, HeartHandshake } from 'lucide-react';
import { settingsApi } from '../services/contentApi';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export default function StatsBar({ t }) {
  const [inView, setInView] = useState(false);
  const [siteStats, setSiteStats] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    settingsApi.getPublic('site_stats').then((r) => {
      setSiteStats(r.data?.item?.value || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const years = siteStats?.years ? `${siteStats.years}+` : t.stats.years;
  const patients = siteStats?.patients ? `${Number(siteStats.patients).toLocaleString()}+` : t.stats.patients;
  const procedures = siteStats?.procedures ? `${siteStats.procedures}+` : t.stats.treatments;
  const satisfaction = siteStats?.satisfaction ? `${siteStats.satisfaction}%` : t.stats.satisfaction;

  const stats = [
    { icon: Award, value: years, label: t.stats.yearsLabel, color: "from-[#2299D6] to-[#14357B]" },
    { icon: Users, value: patients, label: t.stats.patientsLabel, color: "from-[#2299D6] to-[#0A2255]" },
    { icon: Stethoscope, value: procedures, label: t.stats.treatmentsLabel, color: "from-[#14357B] to-[#2299D6]" },
    { icon: HeartHandshake, value: satisfaction, label: t.stats.satisfactionLabel, color: "from-[#2299D6] to-[#14357B]" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-12 bg-[#EDF7FC] border-y border-[#B8D8EE] shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`text-center transition-all duration-700 transform ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EDF7FC] text-[#2299D6] mb-3 border border-[#B8D8EE]">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255] tracking-tight">
                  {stat.value}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#5A7A9A]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}