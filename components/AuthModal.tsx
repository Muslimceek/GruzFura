
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { X, Mail, Lock, User, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        onClose();
      } else {
        await sendPasswordResetEmail(auth, email);
        setSuccess(t('auth_success_reset'));
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'login') return t('auth_login_title');
    if (mode === 'register') return t('auth_register_title');
    return t('auth_forgot_title');
  };

  const getSubtitle = () => {
    if (mode === 'login') return t('auth_login_subtitle');
    if (mode === 'register') return t('auth_register_subtitle');
    return t('auth_forgot_subtitle');
  };

  const getBtnText = () => {
    if (mode === 'login') return t('auth_login_btn');
    if (mode === 'register') return t('auth_register_btn');
    return t('auth_forgot_btn');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors z-10">
          <X size={20} />
        </button>

        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-electric-blue text-white items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {getTitle()}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {getSubtitle()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-electric-blue transition-colors">
                  <User size={18} />
                </div>
                <input 
                  required 
                  type="text" 
                  placeholder={t('auth_name_placeholder')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-electric-blue transition-colors">
                <Mail size={18} />
              </div>
              <input 
                required 
                type="email" 
                placeholder={t('auth_email_placeholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-electric-blue transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  required 
                  type="password" 
                  placeholder={t('auth_password_placeholder')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-xs font-bold px-2">{error}</p>}
            {success && <p className="text-emerald-500 text-xs font-bold px-2">{success}</p>}

            <button 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {getBtnText()}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-3">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('forgot')} className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                  {t('auth_forgot_link')}
                </button>
                <div className="h-px bg-slate-100 w-full" />
                <button onClick={() => setMode('register')} className="text-sm font-bold text-slate-600">
                  {t('auth_no_account')} <span className="text-electric-blue">{t('auth_create_link')}</span>
                </button>
              </>
            ) : (
              <button onClick={() => setMode('login')} className="text-sm font-bold text-slate-600">
                {t('auth_has_account')} <span className="text-electric-blue">{t('auth_login_link')}</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
           <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Sparkles size={12} className="text-blue-500" />
              {t('auth_security_v')}
           </div>
        </div>
      </div>
    </div>
  );
};
