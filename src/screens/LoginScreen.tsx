import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from '../components/Button';

interface LoginScreenProps {
  key?: string | number;
  onLogin: () => void;
}

const errorMap: Record<string, string> = {
  'auth/email-already-in-use': 'Email already registered. Please log in.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/cancelled-popup-request': '',
};

interface Rule { label: string; test: (p: string) => boolean; }
const rules: Rule[] = [
  { label: 'At least 8 characters',       test: p => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',   test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)',   test: p => /[a-z]/.test(p) },
  { label: 'One number (0–9)',             test: p => /[0-9]/.test(p) },
  { label: 'One special character (!@#…)', test: p => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string): { score: number; label: string; color: string; bar: string } {
  const passed = rules.filter(r => r.test(password)).length;
  if (password.length === 0) return { score: 0, label: '',         color: '',                  bar: 'bg-gray-200 dark:bg-gray-700' };
  if (passed <= 1)           return { score: 1, label: 'Weak',     color: 'text-red-500',      bar: 'bg-red-500' };
  if (passed === 2)          return { score: 2, label: 'Fair',     color: 'text-orange-500',   bar: 'bg-orange-400' };
  if (passed === 3)          return { score: 3, label: 'Good',     color: 'text-yellow-500',   bar: 'bg-yellow-400' };
  if (passed === 4)          return { score: 4, label: 'Strong',   color: 'text-blue-500',     bar: 'bg-blue-500' };
  return                            { score: 5, label: 'Very Strong', color: 'text-emerald-500', bar: 'bg-emerald-500' };
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);
  const allRulesPassed = rules.every(r => r.test(password));

  const reset = () => { setError(''); setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setResetSent(false); setShowRules(false); };
  const switchTab = (t: 'login' | 'register') => { setTab(t); reset(); };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError('Enter your email above first'); return; }
    try {
      const continueUrl = window.location.origin + window.location.pathname;
      await sendPasswordResetEmail(auth, email.trim(), { url: continueUrl, handleCodeInApp: true });
      setResetSent(true);
      setError('');
    } catch (e: any) {
      setError(errorMap[e.code] || 'Could not send reset email.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return; }
    if (tab === 'register') {
      if (!name.trim()) { setError('Name is required'); return; }
      if (!allRulesPassed) { setError('Please meet all password requirements'); setShowRules(true); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    }
    setLoading(true);
    try {
      if (tab === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onLogin();
    } catch (e: any) {
      setError(errorMap[e.code] || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      onLogin();
    } catch (e: any) {
      const msg = errorMap[e.code];
      if (msg !== '') setError(msg || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3.5 rounded-xl border ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'} bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 p-4">
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white dark:bg-gray-900 p-7 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 relative z-10">

        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-600/40">
            <CheckSquare size={34} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-1">SmartTask</h1>
        <p className="text-center text-gray-400 dark:text-gray-500 mb-5 text-sm">Stay organized, get things done</p>

        {/* Google */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleGoogle} disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm mb-4 disabled:opacity-60">
          {googleLoading
            ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            : <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>}
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </motion.button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-4">
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => switchTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              {t === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="space-y-3">

            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Full Name</label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="John Doe" className={inputClass(false)} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com" className={inputClass(!!error && !password)} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); if (!showRules && tab === 'register') setShowRules(true); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={tab === 'register' ? 'Create a strong password' : 'Enter your password'}
                  className={`${inputClass(false)} pr-12`} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Strength meter — register only */}
              {tab === 'register' && password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {/* Bar */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= strength.score ? strength.bar : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
                    <button type="button" onClick={() => setShowRules(v => !v)}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2">
                      {showRules ? 'Hide requirements' : 'Show requirements'}
                    </button>
                  </div>
                </div>
              )}

              {/* Requirements checklist */}
              <AnimatePresence>
                {tab === 'register' && showRules && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-1.5 border border-gray-100 dark:border-gray-700">
                      {rules.map(rule => {
                        const passed = rule.test(password);
                        return (
                          <div key={rule.label} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${passed ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                              {passed
                                ? <Check size={10} className="text-white" strokeWidth={3} />
                                : <XIcon size={10} className="text-gray-400" strokeWidth={3} />}
                            </div>
                            <span className={`text-xs transition-colors ${passed ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm password — register only */}
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Re-enter your password"
                    className={`${inputClass(!!confirmPassword && confirmPassword !== password)} pr-12`} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                  {/* Match indicator */}
                  {confirmPassword.length > 0 && (
                    <div className={`absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center ${confirmPassword === password ? 'bg-emerald-500' : 'bg-red-400'}`}>
                      {confirmPassword === password
                        ? <Check size={9} className="text-white" strokeWidth={3} />
                        : <XIcon size={9} className="text-white" strokeWidth={3} />}
                    </div>
                  )}
                </div>
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Forgot password */}
            {tab === 'login' && (
              <div className="flex justify-end -mt-1">
                <button type="button" onClick={handleForgotPassword}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Reset sent confirmation */}
            {resetSent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 space-y-1">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Reset link sent to {email}</p>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 ml-5">⚠ Check your <span className="font-semibold">Spam / Junk</span> folder if you don't see it in your inbox.</p>
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
                <XIcon size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            <Button
              title={loading ? (tab === 'login' ? 'Logging in...' : 'Creating account...') : (tab === 'login' ? 'Log In' : 'Create Account')}
              onPress={handleSubmit}
              className="w-full mt-1 shadow-lg shadow-blue-600/30"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
