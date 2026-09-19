import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-[1400] max-w-md bg-white border border-[#B8D8EE] shadow-2xl rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-[#2299D6] flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      )}
      
      <div className="flex-grow pr-2 text-sm text-[#0A2255] font-medium">
        {message}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1 text-[#5A7A9A] hover:text-[#0A2255] rounded"
        aria-label="Close message"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
