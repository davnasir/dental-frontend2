import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../services/authApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    setError('');

    const [err, res] = await authApi.login(email, password);
    setBusy(false);

    if (err) {
      setError(err.message || 'Login failed. Please try again.');
      return;
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D6E8F7] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#14357B] to-[#2299D6] flex items-center justify-center shadow-lg mb-3">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display text-[#0A2255]">Nahol Dental Care</h1>
          <p className="text-sm text-[#5A7A9A]">Admin Dashboard</p>
        </div>

        <div className="bg-white border border-[#B8D8EE] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-[#0A2255] mb-1">Sign in</h2>
          <p className="text-sm text-[#5A7A9A] mb-6">Use your admin credentials to continue.</p>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A7A9A] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white border ${errors.email ? 'border-rose-500' : 'border-[#B8D8EE]'
                    } text-[#0A2255] placeholder-[#5A7A9A] focus:outline-none focus:ring-2 focus:ring-[#2299D6]`}
                />
              </div>
              {errors.email && <span className="text-xs text-rose-400 mt-1 block">{errors.email}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A7A9A] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm bg-white border ${errors.password ? 'border-rose-500' : 'border-[#B8D8EE]'
                    } text-[#0A2255] placeholder-[#5A7A9A] focus:outline-none focus:ring-2 focus:ring-[#2299D6]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7A9A] hover:text-[#0A2255]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-rose-400 mt-1 block">{errors.password}</span>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] hover:from-[#0F2A5E] hover:to-[#1A7DB3] text-white font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* <div className="mt-4 text-center text-xs text-[#5A7A9A]">
            Demo: <span className="text-[#0A2255] font-medium">superadmin@nahol.com</span> / <span className="text-[#0A2255] font-medium">Demo@1234</span>
          </div> */}
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-[#5A7A9A] hover:text-[#2299D6] transition-colors">← Back to website</a>
        </div>
      </div>
    </div>
  );
}