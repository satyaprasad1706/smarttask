import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Eye, EyeOff, Check, X as XIcon, ShieldCheck } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from '../components/Button';

interface ResetPasswordScreenProps {
  key?: string;
  oobCode: string;
  onDone: () => void;
}

interface Rule { label: string; test: (p: string) => boolean; }
const rules: Rule[] = [
  { label: 'At least 8 characters',        test: p => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',    test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)',    test: p => /[a-z]/.test(p) },
  { label: 'One number (0–9)',              test: p => /[0-9]/.test(p) },
  { label: 'One special character (!@#…)',  test: p => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(p: string) {
  const passed = rules.filter(r => r.test(p)).length;
  if (!p.length)   return { score: 0, label: '',            color: '',                    bar: '' };
  if (passed <= 1) return { score: 1, label: 'Weak',        color: 'text-red-500',        bar: 'bg-red-500' };
  if (passed === 2) return { score: 2, label: 'Fair',       color: 'text-orange-500',     bar: 'bg-orange-400' };
  if (passed === 3) return { score: 3, label: 'Good',       color: 'text-yellow-500',     bar: 'bg-yellow-400' };
  if (passed === 4) return { score: 4, label: 'Strong',     color: 'text-blue-500',       bar: 'bg-blue-500' };
  return                  { score: 5, label: 'Very Strong', color: 'text-emerald-500',    bar: 'bg-emerald-500' };
}

export function ResetPasswordScreen({ oobCode, onDone }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);
  const allPassed = rules.every(r => r.test(password));

  const handleReset = async () => {
    setError('');
    if (!allPassed) { setError('Please meet all password requirements'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (e: any) {
      const msgs: Record<string, string> = {
        'auth/expired-action-code': 'This reset link has expired. Please request a new one.',
        'auth/invalid-action-code': 'This reset link is invalid or already used.',
        'auth/weak-password':       'Password is too weak.',
      };
      setError(msgs[e.code] || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (err: boolean) =>
    `w-full px-4 py-3.5 rounded-xl border ${err ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'} bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm`;

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
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-1">Set New Password</h1>
        <p className="text-center text-gray-400 dark:text-gray-500 mb-6 text-sm">Create a strong password for your account</p>

        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">Password Updated!</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your password has been reset successfully.</p>
            </div>
            <Button title="Go to Login" onPress={onDone} />
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Create a strong password"
                  className={`${inputClass(false)} pr-12`} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= strength.score ? strength.bar : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
                </div>
              )}

              {/* Requirements checklist — always visible when typing */}
              <AnimatePresence>
                {password.length > 0 && (
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

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <input type={showCf ? 'text' : 'password'} value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  placeholder="Re-enter your password"
                  className={`${inputClass(!!confirm && confirm !== password)} pr-12`} />
                <button type="button" onClick={() => setShowCf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showCf ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
                {confirm.length > 0 && (
                  <div className={`absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center ${confirm === password ? 'bg-emerald-500' : 'bg-red-400'}`}>
                    {confirm === password
                      ? <Check size={9} className="text-white" strokeWidth={3} />
                      : <XIcon size={9} className="text-white" strokeWidth={3} />}
                  </div>
                )}
              </div>
              {confirm.length > 0 && confirm !== password && (
                <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
                <XIcon size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            <Button title={loading ? 'Updating...' : 'Update Password'} onPress={handleReset}
              className="shadow-lg shadow-blue-600/30" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
