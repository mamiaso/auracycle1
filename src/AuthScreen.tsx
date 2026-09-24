import { useState } from 'react';
import { Heart, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Language, translations } from '@/lib/translations';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register';

export default function AuthScreen({ lang, setLang, onSuccess }: Props) {
  const t = translations[lang];
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDark = false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password.length < 6) {
        setError(t.authErrorWeak);
        return;
      }
      if (password !== passwordConfirm) {
        setError(t.authErrorMismatch);
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          if (signUpError.message.toLowerCase().includes('already') || signUpError.message.toLowerCase().includes('registered')) {
            setError(t.authErrorEmailExists);
          } else {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          onSuccess();
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(t.authErrorInvalid);
          setLoading(false);
          return;
        }

        if (data.user) {
          onSuccess();
        }
      }
    } catch {
      setError(t.authErrorGeneric);
      setLoading(false);
    }
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setError(null);
    setPasswordConfirm('');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 text-slate-800"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md w-full rounded-3xl p-8 border shadow-xl space-y-6 bg-white border-rose-100 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-2xl font-black font-serif">
            {mode === 'register' ? t.registerTitle : t.loginTitle}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'register' ? t.registerSubtitle : t.loginSubtitle}
          </p>
        </div>

        <div className="flex justify-center gap-1 bg-slate-100 p-1 rounded-2xl">
          {(['tr', 'de', 'ar'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                lang === l ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {t.emailPlaceholder}
            </label>
            <input
              type="email"
              required
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50 border-slate-200 text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> {t.passwordPlaceholder}
            </label>
            <input
              type="password"
              required
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50 border-slate-200 text-slate-800"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> {t.passwordConfirmPlaceholder}
              </label>
              <input
                type="password"
                required
                placeholder={t.passwordConfirmPlaceholder}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:border-transparent transition bg-slate-50 border-slate-200 text-slate-800 ${
                  passwordConfirm && password !== passwordConfirm
                    ? 'focus:ring-red-400 border-red-200'
                    : 'focus:ring-rose-400'
                }`}
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {t.authErrorMismatch}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white py-4 rounded-2xl text-xs font-bold transition shadow-md shadow-rose-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span>{mode === 'register' ? t.registerBtn : t.loginBtn}</span>
          </button>
        </form>

        <button
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-center text-[11px] text-rose-500 hover:text-rose-600 font-semibold transition"
        >
          {mode === 'login' ? t.registerLink : t.loginLink}
        </button>
      </div>

      {isDark && <span className="hidden" />}
    </div>
  );
}
