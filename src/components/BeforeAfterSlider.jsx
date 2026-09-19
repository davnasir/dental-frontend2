import React, { useState, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { resolveImg } from '../utils/image';

export default function BeforeAfterSlider({ beforeImg, afterImg, altText, treatmentType }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-card-soft select-none border border-slate-200 dark:border-slate-800 cursor-ew-resize group"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      tabIndex={0}
      role="slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Before and after transformation slider for ${altText}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setSliderPosition((prev) => Math.max(0, prev - 5));
        if (e.key === 'ArrowRight') setSliderPosition((prev) => Math.min(100, prev + 5));
      }}
    >
      {/* After Image (Background) */}
      <img
        src={resolveImg(afterImg)}
        alt={`${altText} - After Treatment`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-teal-700/85 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm pointer-events-none shadow-sm">
        After
      </div>

      {/* Before Image (Clipped Overlay) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={resolveImg(beforeImg)}
          alt={`${altText} - Before Treatment`}
          className="absolute inset-0 w-full h-full object-cover filter contrast-95"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/85 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm pointer-events-none shadow-sm">
          Before
        </div>
      </div>

      {/* Divider Line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transition-transform"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Button */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-teal-700 text-white border-2 border-white shadow-xl flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
          <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Treatment Badge at Bottom */}
      {treatmentType && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-center pointer-events-none">
          <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">
            {treatmentType}
          </span>
        </div>
      )}
    </div>
  );
}
