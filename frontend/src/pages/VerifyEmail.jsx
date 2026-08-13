import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWaterContext } from '../context/WaterContext';
import { Droplet, Mail, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

const API = 'http://localhost:8000';

function VerifyEmail() {
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs               = useRef([]);
  const navigate                = useNavigate();
  const location                = useLocation();
  const { verifyOTP }           = useWaterContext();

  // Email & name passed via navigate state from signup
  const email = location.state?.email || '';
  const name  = location.state?.name  || 'there';

  // Redirect away if no email context
  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return; // digits only
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setLoading(true);
    const result = await verifyOTP(email, code);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1400);
    } else {
      setError(result.error || 'Invalid code. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    try {
      const res  = await fetch(`${API}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend. Please try again.');
      }
    } catch {
      setError('Cannot reach server.');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-blue-600/10 blur-[90px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
        style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(24px)' }}
      >
        {/* Success overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 rounded-3xl z-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <CheckCircle2 size={72} className="text-cyan-400 mb-4" />
              </motion.div>
              <p className="text-white text-xl font-bold">Email Verified!</p>
              <p className="text-slate-400 text-sm mt-1">Taking you to the dashboard…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl mb-5"
            style={{ background: 'rgba(6,182,212,0.15)' }}>
            <ShieldCheck size={34} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Verify Your Email</h1>
          <p className="text-slate-400 text-sm">
            We sent a 6-digit code to
          </p>
          <p className="text-cyan-400 text-sm font-semibold flex items-center justify-center gap-1 mt-1">
            <Mail size={14} /> {email}
          </p>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-slate-800/60 text-white outline-none transition-all
                  ${digit
                    ? 'border-cyan-500 shadow-lg shadow-cyan-500/20'
                    : 'border-slate-700 focus:border-cyan-500/70'
                  }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying…</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Continue</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm mb-2">Didn't receive a code?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className={`flex items-center gap-1.5 mx-auto text-sm font-semibold transition-colors ${
              countdown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>

        <p
          className="mt-5 text-center text-xs text-slate-600 cursor-pointer hover:text-slate-400 transition-colors"
          onClick={() => navigate('/login')}
        >
          ← Back to Sign Up
        </p>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
