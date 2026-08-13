import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWaterContext } from '../context/WaterContext';
import { Lock, Droplet, Mail, User, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

function Login() {
  const [mode, setMode]               = useState('login');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign-up fields
  const [signupName, setSignupName]         = useState('');
  const [signupEmail, setSignupEmail]       = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm]   = useState('');

  const { login, register } = useWaterContext();
  const navigate = useNavigate();

  // ── Login ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  // ── Sign-up ──────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (signupPassword !== signupConfirm) { setError('Passwords do not match.'); return; }
    if (signupPassword.length < 6)        { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    // Call backend /register — creates unverified user & sends OTP email
    const result = await register(signupName, signupEmail, signupPassword);
    if (result.success) {
      // Navigate to OTP verification screen — DO NOT log in yet
      navigate('/verify', { state: { email: signupEmail, name: signupName } });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); setLoading(false); };

  const inputClass =
    'w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-slate-500';

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
        style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(24px)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl mb-5"
            style={{ background: 'rgba(6,182,212,0.15)' }}>
            <Droplet size={34} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">AquaAI Portal</h1>
          <p className="text-slate-400 text-sm">Water quality intelligence platform</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-800/60 rounded-xl p-1 mb-7 border border-slate-700/50">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOGIN FORM ── */}
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.form key="login"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
              onSubmit={handleLogin} className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={17} className="text-slate-500" /></div>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    className={inputClass} placeholder="you@example.com" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={17} className="text-slate-500" /></div>
                  <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    className={inputClass} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing In…</span></>
                ) : (
                  <><span>Sign In</span><ArrowRight size={17} /></>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                No account?{' '}
                <button type="button" onClick={() => switchMode('signup')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Create one for free
                </button>
              </p>
            </motion.form>
          )}

          {/* ── SIGN-UP FORM ── */}
          {mode === 'signup' && (
            <motion.form key="signup"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              onSubmit={handleSignup} className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={17} className="text-slate-500" /></div>
                  <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)}
                    className={inputClass} placeholder="Jane Smith" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={17} className="text-slate-500" /></div>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                    className={inputClass} placeholder="you@example.com" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={17} className="text-slate-500" /></div>
                  <input type={showPassword ? 'text' : 'password'} value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                    className={inputClass} placeholder="Min. 6 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CheckCircle size={17} className={signupConfirm && signupConfirm === signupPassword ? 'text-cyan-500' : 'text-slate-500'} />
                  </div>
                  <input type={showConfirm ? 'text' : 'password'} value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)}
                    className={`${inputClass} ${signupConfirm && signupConfirm !== signupPassword ? 'border-red-500/60 focus:ring-red-500' : signupConfirm && signupConfirm === signupPassword ? 'border-cyan-500/60' : ''}`}
                    placeholder="Re-enter password" required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Sending OTP…</span></>
                ) : (
                  <><span>Create Account &amp; Verify Email</span><ArrowRight size={17} /></>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Sign in
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Login;
