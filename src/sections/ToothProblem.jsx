import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  ShieldAlert,
  Info,
  Sparkles
} from 'lucide-react';
import { toothStagesData } from '../data/toothProgression';
import { settingsApi } from '../services/contentApi';
import { resolveImg } from '../utils/image';

export default function ToothProblem({ t, lang, onBookTreatment }) {
  const [activeStageId, setActiveStageId] = useState(1);
  const [stageImages, setStageImages] = useState({ 1: '', 2: '', 3: '' });
  const currentStage = toothStagesData.find((s) => s.id === activeStageId) || toothStagesData[0];

  useEffect(() => {
    Promise.allSettled([
      settingsApi.getPublic('tooth_stage_1_image'),
      settingsApi.getPublic('tooth_stage_2_image'),
      settingsApi.getPublic('tooth_stage_3_image'),
    ]).then(([r1, r2, r3]) => {
      const extract = (r) => {
        if (r.status !== 'fulfilled') return '';
        const v = r.value?.data?.item?.value;
        return v?.url || (typeof v === 'string' ? v : '');
      };
      setStageImages({ 1: extract(r1), 2: extract(r2), 3: extract(r3) });
    }).catch(() => {});
  }, []);

  return (
    <section id="problem" className="py-20 lg:py-28 bg-white relative overflow-hidden">

      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2299D6]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>{t.toothProblem.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.toothProblem.title}
          </h2>
          <p className="mt-4 text-base text-[#5A7A9A] leading-relaxed">
            {t.toothProblem.subtitle}
          </p>
        </div>

        {/* Stage Selector Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
          {toothStagesData.map((stage) => {
            const isActive = stage.id === activeStageId;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStageId(stage.id)}
                className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${isActive
                    ? 'bg-[#14357B] text-white border-[#2299D6] shadow-lg shadow-[#14357B]/25 scale-[1.02]'
                    : 'bg-white text-[#0A2255] border-[#B8D8EE] hover:border-[#2299D6]/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EDF7FC] text-[#0A2255]'
                    }`}>
                    {stage.stageNumber}
                  </span>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-75 block">
                      {stage.severity}
                    </span>
                    <span className="text-sm font-bold block">
                      {stage.title[lang]}
                    </span>
                  </div>
                </div>

                {isActive && <Sparkles className="w-4 h-4 text-[#2299D6] animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* Main Stage Interactive Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#B8D8EE] shadow-xl">

          {/* Left: Interactive Visual Diagram / Tooth Pathology Graphic */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-[#B8D8EE]/70">

            {/* Stage Visual Indicator */}
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center my-2">
              {stageImages[currentStage.id] ? (
                <img
                  src={resolveImg(stageImages[currentStage.id])}
                  alt={currentStage.title[lang]}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              ) : (
                <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-md">
                <defs>
                  <linearGradient id="enamelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </linearGradient>
                  <linearGradient id="dentinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="100%" stopColor="#FDE68A" />
                  </linearGradient>
                  <linearGradient id="pulpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#BE123C" />
                  </linearGradient>
                </defs>

                {/* Outer Crown & Roots (Enamel & Cementum) */}
                <path
                  d="M50,45 C50,20 80,15 100,28 C120,15 150,20 150,45 C155,75 160,110 150,140 C140,170 145,210 135,225 C125,235 115,220 112,185 C110,160 102,150 100,150 C98,150 90,160 88,185 C85,220 75,235 65,225 C55,210 60,170 50,140 C40,110 45,75 50,45 Z"
                  fill="url(#enamelGrad)"
                  stroke="#CBD5E1"
                  strokeWidth="3"
                />

                {/* Middle Layer (Dentin) */}
                <path
                  d="M62,55 C62,35 85,32 100,40 C115,32 138,35 138,55 C142,80 144,115 138,135 C130,160 132,190 126,200 C120,205 115,195 113,170 C110,145 102,140 100,140 C98,140 90,145 87,170 C85,195 80,205 74,200 C68,190 70,160 62,135 C56,115 58,80 62,55 Z"
                  fill="url(#dentinGrad)"
                  opacity="0.9"
                />

                {/* Inner Pulp Chamber & Root Canals (Living Nerve) */}
                <path
                  d="M80,70 C80,60 90,58 100,64 C110,58 120,60 120,70 C122,85 120,105 118,120 C114,140 122,175 120,188 C118,190 115,188 114,175 C112,150 102,130 100,130 C98,130 88,150 86,175 C85,188 82,190 80,188 C78,175 86,140 82,120 C80,105 78,85 80,70 Z"
                  fill="url(#pulpGrad)"
                  className={currentStage.id >= 2 ? 'animate-pulse' : ''}
                />

                {/* Stage 1 Decay: Surface spot on enamel */}
                {currentStage.id >= 1 && (
                  <circle cx="85" cy="35" r="7" fill="#78350F" className="animate-pulse" />
                )}

                {/* Stage 2 Decay: Deep cavity reaching pulp */}
                {currentStage.id >= 2 && (
                  <path d="M78,30 Q92,40 88,68 Q80,60 78,30 Z" fill="#451A03" />
                )}

                {/* Stage 3 Decay: Root Periapical Abscess / Pus pocket */}
                {currentStage.id === 3 && (
                  <g className="animate-pulse">
                    <circle cx="78" cy="225" r="14" fill="#DC2626" opacity="0.8" />
                    <circle cx="78" cy="225" r="8" fill="#FEF08A" />
                    <circle cx="122" cy="225" r="14" fill="#DC2626" opacity="0.8" />
                    <circle cx="122" cy="225" r="8" fill="#FEF08A" />
                  </g>
                )}
              </svg>
              )}
            </div>

            {/* Stage Label Below Visual */}
            <div className="text-center mt-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentStage.id === 1
                  ? 'bg-[#D6E8F7] text-[#0A2255]'
                  : currentStage.id === 2
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{currentStage.urgency[lang]}</span>
              </span>
              <p className="text-xs text-[#5A7A9A] mt-2">
                {t.toothProblem.preventionTip}
              </p>
            </div>

          </div>

          {/* Right: Pathological Symptoms & Clinical Recommendation */}
          <div className="lg:col-span-7 space-y-6">

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#14357B] tracking-wider">
                <span>{t.toothProblem.stageLabel} {currentStage.stageNumber}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-[#0A2255] mt-1">
                {currentStage.title[lang]}
              </h3>
              <p className="text-sm sm:text-base text-[#5A7A9A] mt-2 font-medium">
                {currentStage.subtitle[lang]}
              </p>
            </div>

            {/* What is happening inside */}
            <div className="p-4 rounded-xl bg-white border border-[#B8D8EE] text-xs sm:text-sm text-[#5A7A9A] leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-[#0A2255] mb-1">
                <Info className="w-4 h-4 text-[#2299D6]" />
                <span>{lang === 'en' ? 'Internal Biological Process:' : 'দাঁতের ভেতরের ক্ষয় প্রক্রিয়া:'}</span>
              </div>
              {currentStage.whatHappens[lang]}
            </div>

            {/* Symptoms Checklist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-2.5">
                {t.toothProblem.symptomsTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStage.symptoms[lang].map((sym, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#0A2255]">
                    <CheckCircle2 className="w-4 h-4 text-[#2299D6] mt-0.5 flex-shrink-0" />
                    <span>{sym}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Treatment Card */}
            <div className="p-4 rounded-2xl bg-[#D6E8F7] border border-[#B8D8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A2255] block">
                  {t.toothProblem.treatmentTitle}
                </span>
                <span className="text-base sm:text-lg font-bold text-[#0A2255] block mt-0.5">
                  {currentStage.treatment[lang]}
                </span>
                <span className="text-xs text-[#5A7A9A] flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentStage.duration[lang]}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onBookTreatment(currentStage.actionServiceId)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#14357B] hover:bg-[#0F2A5E] text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all flex-shrink-0"
              >
                <span>{t.toothProblem.actionCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
