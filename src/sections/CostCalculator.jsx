import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  MessageCircle,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { calculatorTreatments as defaultTreatments } from '../data/calculator';
import { settingsApi } from '../services/contentApi';

export default function CostCalculator({ t, lang, onOpenAppointment }) {
  const [selectedIds, setSelectedIds] = useState(['', '']);
  const [chosenDropdownId, setChosenDropdownId] = useState('');
  const [treatments, setTreatments] = useState(defaultTreatments);

  useEffect(() => {
    settingsApi.getPublic('cost_estimator')
      .then((r) => {
        const val = r.data?.item?.value;
        const list = Array.isArray(val) ? val : val?.treatments;
        if (Array.isArray(list) && list.length > 0) setTreatments(list);
      })
      .catch(() => { });
  }, []);

  const idOf = (item) => String(item?.id ?? '');

  const selectedTreatments = selectedIds
    .map((id) => treatments.find((item) => idOf(item) === String(id)))
    .filter(Boolean);

  const minTotal = selectedTreatments.reduce((sum, item) => sum + (Number(item.minPrice) || 0), 0);
  const maxTotal = selectedTreatments.reduce((sum, item) => sum + (Number(item.maxPrice) || 0), 0);

  const nameOf = (item) => {
    const n = item.name;
    if (!n) return item.nameEn || item.title || item.id || '';
    return n[lang] || n.en || n.bn || '';
  };

  const descOf = (item) => {
    const d = item.desc;
    if (!d) return item.descEn || item.descBn || '';
    return d[lang] || d.en || d.bn || d || '';
  };

  const handleAddTreatment = () => {
    if (!chosenDropdownId) return;
    if (!selectedIds.some((id) => String(id) === String(chosenDropdownId))) {
      setSelectedIds([...selectedIds, chosenDropdownId]);
    }
    setChosenDropdownId('');
  };

  const handleRemoveTreatment = (idToRemove) => {
    setSelectedIds(selectedIds.filter((id) => String(id) !== String(idToRemove)));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  // Generate WhatsApp prefilled message
  const handleWhatsAppQuote = () => {
    if (selectedTreatments.length === 0) return;
    const itemsList = selectedTreatments
      .map((item) => `- ${nameOf(item)} (৳${Number(item.minPrice || 0).toLocaleString()} - ৳${Number(item.maxPrice || 0).toLocaleString()})`)
      .join('%0A');

    const text = `Hello%20Nahol%20Dental%20Care,%0A%0AI%20am%20interested%20in%20an%20estimate%20for%20the%20following%20treatments:%0A${itemsList}%0A%0AEstimated%20Total:%20৳${minTotal.toLocaleString()}%20–%20৳${maxTotal.toLocaleString()}%0A%0APlease%20let%20me%20know%20how%20to%20schedule%20a%20clinical%20examination.`;
    window.open(`https://wa.me/8801966115115?text=${text}`, '_blank');
  };

  return (
    <section id="calculator" className="py-20 lg:py-28 bg-[#EDF7FC] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2299D6]/15 text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>{t.calculator.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0A2255]">
            {t.calculator.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5A7A9A]">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-[#EDF7FC] rounded-3xl p-6 sm:p-8 border border-[#B8D8EE] shadow-xl space-y-6">

          {/* Add Treatment Selector Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={chosenDropdownId}
              onChange={(e) => setChosenDropdownId(e.target.value)}
              className="w-full sm:flex-grow py-3 px-4 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE] text-[#0A2255] text-sm focus:ring-[#2299D6] cursor-pointer"
            >
              <option value="">{t.calculator.selectPlaceholder}</option>
              {treatments.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  disabled={selectedIds.some((id) => String(id) === idOf(item))}
                >
                  {nameOf(item)} (৳{Number(item.minPrice || 0).toLocaleString()} – ৳{Number(item.maxPrice || 0).toLocaleString()})
                  {selectedIds.some((id) => String(id) === idOf(item)) ? ' (Added)' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddTreatment}
              disabled={!chosenDropdownId}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#14357B] hover:bg-[#0F2A5E] disabled:opacity-50 text-white text-sm font-semibold shadow-md active:scale-95 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.calculator.addButton}</span>
            </button>
          </div>

          {/* Selected Item List */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[#5A7A9A]">
              <span>{t.calculator.selectedTitle} ({selectedTreatments.length})</span>
              {selectedTreatments.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-rose-600 hover:underline normal-case font-medium"
                >
                  {lang === 'en' ? 'Clear List' : 'তালিকা খালি করুন'}
                </button>
              )}
            </div>

            {selectedTreatments.length === 0 ? (
              <div className="py-8 text-center text-[#5A7A9A] text-sm bg-[#EDF7FC] rounded-xl border border-dashed border-[#B8D8EE]">
                {t.calculator.emptyState}
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedTreatments.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE] flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-[#0A2255] block">
                        {nameOf(item)}
                      </span>
                      <p className="text-xs text-[#5A7A9A] line-clamp-1">
                        {descOf(item)}
                      </p>
                      <span className="text-[11px] text-[#2299D6] flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration || '—'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm sm:text-base font-bold text-[#2299D6]">
                        ৳{Number(item.minPrice || 0).toLocaleString()} – ৳{Number(item.maxPrice || 0).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTreatment(item.id)}
                        className="p-1.5 rounded-lg text-[#5A7A9A] hover:text-rose-600 hover:bg-rose-950/40 transition-colors"
                        aria-label={`Remove ${nameOf(item)}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Total Box */}
          {selectedTreatments.length > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0A2255] via-[#14357B] to-[#2299D6]/90 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#B8D8EE] font-semibold block">
                  {t.calculator.estimatedRange}
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mt-0.5">
                  ৳{minTotal.toLocaleString()} – ৳{maxTotal.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleWhatsAppQuote}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2299D6] hover:bg-[#2299D6]/80 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.calculator.btnWhatsApp}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAppointment}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0A2255] hover:bg-[#EDF7FC] text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Calendar className="w-4 h-4 text-[#2299D6]" />
                  <span>{t.calculator.btnBookNow}</span>
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 pt-2 text-xs text-[#5A7A9A]">
            <Info className="w-4 h-4 text-[#2299D6] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.calculator.disclaimer}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
