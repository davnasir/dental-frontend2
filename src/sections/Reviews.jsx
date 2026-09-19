import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageSquareQuote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { reviewsData as localReviews } from '../data/reviews';
import { reviewApi } from '../services/contentApi';
import { useAsyncData } from '../services/useAsyncData';

export default function Reviews({ t, lang }) {
  const { data: reviewsData } = useAsyncData(
    () => reviewApi.listPublic().then((r) => r.data?.items || []),
    localReviews
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (reviewsData.length > 0 && currentIndex >= reviewsData.length) setCurrentIndex(0);
  }, [reviewsData, currentIndex]);

  const nextReview = () => {
    if (reviewsData.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviewsData.length);
  };

  const prevReview = () => {
    if (reviewsData.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviewsData.length) % reviewsData.length);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      nextReview();
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [isPaused, currentIndex]);

  const current = reviewsData[currentIndex];

  if (!current) {
    return (
      <section id="reviews" className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[#5A7A9A]">Reviews will appear here once available.</p>
        </div>
      </section>
    );
  }

  const treatmentLabel = current.treatment && typeof current.treatment === 'object' ? current.treatment[lang] : current.treatment;
  const commentText = current.comment && typeof current.comment === 'object' ? current.comment[lang] : current.comment;

  return (
    <section id="reviews" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{t.reviews.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A2255]">
            {t.reviews.title}
          </h2>

          {/* Rating Badge */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="font-bold text-[#0A2255] text-sm sm:text-base">
              {t.reviews.overallRating}
            </span>
            <span className="text-xs text-[#5A7A9A] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2299D6]" />
              <span>{t.reviews.verifiedBadge}</span>
            </span>
          </div>
        </div>

        {/* Testimonial Showcase Card */}
        <div 
          className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#B8D8EE] shadow-xl relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B8D8EE] pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#14357B] to-[#2299D6] text-white font-bold flex items-center justify-center text-sm shadow-md">
                {current.avatar}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#0A2255]">
                  {current.author}
                </h3>
                <p className="text-xs font-semibold text-[#14357B]">
                  {treatmentLabel} • <span className="text-[#5A7A9A]">{current.date}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(current.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>

          <p className="text-base sm:text-lg text-[#0A2255] leading-relaxed italic font-serif">
            "{commentText}"
          </p>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-4">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {reviewsData.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-8 bg-[#14357B]' : 'w-2 bg-[#B8D8EE]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevReview}
                className="p-2 rounded-full border border-[#B8D8EE] text-[#0A2255] hover:bg-[#EDF7FC] transition-colors shadow-sm"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextReview}
                className="p-2 rounded-full border border-[#B8D8EE] text-[#0A2255] hover:bg-[#EDF7FC] transition-colors shadow-sm"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
