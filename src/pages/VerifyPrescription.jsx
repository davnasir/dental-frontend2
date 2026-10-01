import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, Search, Stethoscope } from 'lucide-react';
import { prescriptionApi } from '../services/billingApi';

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TONES = {
  VALID: { icon: ShieldCheck, ring: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-700', label: 'Valid prescription' },
  EXPIRED: { icon: ShieldAlert, ring: 'border-amber-200 bg-amber-50', text: 'text-amber-700', label: 'No longer valid' },
  NOT_FOUND: { icon: ShieldX, ring: 'border-rose-200 bg-rose-50', text: 'text-rose-700', label: 'Not recognised' },
};

const CODE_PATTERN = /^[A-Z2-9]{6,20}$/;

export default function VerifyPrescription() {
  const [searchParams, setSearchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';

  const [code, setCode] = useState(codeFromUrl);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runVerify = useCallback(async (raw) => {
    const value = String(raw || '').trim().toUpperCase();
    if (!value) {
      setError('Please enter the verification code printed on the prescription.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await prescriptionApi.verify(value);
      setResult(res.data?.verification || null);
    } catch (err) {
      setError(err.message || 'Could not verify this code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-verify when the page is opened from a scanned QR code.
  useEffect(() => {
    if (codeFromUrl) runVerify(codeFromUrl);
  }, [codeFromUrl, runVerify]);

  const submit = (e) => {
    e.preventDefault();
    const value = String(code || '').trim().toUpperCase();
    if (!CODE_PATTERN.test(value)) {
      setError('That does not look like a valid code (8-12 letters and digits).');
      return;
    }
    setSearchParams({ code: value }, { replace: true });
    runVerify(value);
  };

  const tone = result ? TONES[result.status] || TONES.NOT_FOUND : null;
  const Icon = tone?.icon;

  return (
    <div className="min-h-screen bg-[#D6E8F7] flex flex-col items-center px-4 py-12" lang="en">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-[#0A2255]">Verify a Prescription</h1>
          <p className="text-sm text-[#5A7A9A] mt-1">
            Scan the QR code on a Nahol Dental Care prescription, or type the code printed beneath it.
          </p>
        </div>

        <form onSubmit={submit} className="bg-white border border-[#B8D8EE] rounded-2xl p-5 shadow-card-soft">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5A7A9A] mb-1.5">
            Verification code
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. K7M2QP4XB9"
              autoFocus
              className="flex-1 px-3 py-2 rounded-xl text-sm font-mono tracking-widest bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#14357B] to-[#2299D6] hover:from-[#0F2A5E] hover:to-[#1A7DB3] shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              <Search className="w-4 h-4" /> {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
          {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        </form>

        {result && tone && (
          <div className={`mt-5 border rounded-2xl p-5 ${tone.ring}`}>
            <div className="flex items-center gap-3">
              <Icon className={`w-8 h-8 ${tone.text}`} />
              <div>
                <p className={`text-base font-bold ${tone.text}`}>{tone.label}</p>
                <p className="text-sm text-[#0A2255]/80">{result.message}</p>
              </div>
            </div>

            <dl className="mt-4 pt-4 border-t border-black/5 grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Code</dt>
                <dd className="font-mono font-semibold text-[#0A2255]">{result.verificationCode}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Prescribed by</dt>
                <dd className="font-semibold text-[#0A2255] flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5" /> {result.doctorName || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Issued</dt>
                <dd className="font-semibold text-[#0A2255]">{fmtDate(result.issuedAt)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Valid until</dt>
                <dd className="font-semibold text-[#0A2255]">{fmtDate(result.validUntil)}</dd>
              </div>
            </dl>
          </div>
        )}

        <p className="text-center text-xs text-[#5A7A9A] mt-8">
          <Link to="/" className="underline">Back to Nahol Dental Care</Link>
        </p>
      </div>
    </div>
  );
}
