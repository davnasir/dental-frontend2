import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadApi } from '../services/uploadApi';
import { resolveImg } from '../utils/image';

export default function AssetUpload({ value, onChange, accept = 'image/*', label = 'Upload image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value ? resolveImg(value) : null);
  const inputRef = useRef(null);

  useEffect(() => {
    setPreview(value ? resolveImg(value) : null);
  }, [value]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB');
      return;
    }
    setError('');
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const data = await uploadApi.uploadImage(file);
      const url = data?.url || data?.filename;
      setPreview(resolveImg(url));
      onChange?.(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setPreview(value ? resolveImg(value) : null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setPreview(null);
    onChange?.('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
        id={`asset-upload-${label.replace(/\s/g, '-')}`}
      />
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <img src={preview} alt="" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-semibold flex items-center gap-1"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor={`asset-upload-${label.replace(/\s/g, '-')}`}
          className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-2" />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG up to 5 MB</span>
        </label>
      )}
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
}