import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImg } from '../utils/image';

export default function Lightbox({ item, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-[1300] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Arrows */}
      {onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors hidden sm:flex items-center justify-center z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors hidden sm:flex items-center justify-center z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Main Image Container */}
      <div 
        className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={resolveImg(item.afterImg || item.image || item.beforeImg)}
          alt={item.title?.en || "Dental Case Transformation"}
          className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
        />

        {item.title && (
          <div className="mt-4 text-center px-4">
            <h3 className="text-white text-base sm:text-lg font-semibold">
              {item.title.en}
            </h3>
            {item.description && (
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                {item.description.en}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
