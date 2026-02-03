import React from 'react';
import { Send, Loader2, Check, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface TelegramModalProps {
    isVerifying: boolean;
    countdown: number;
    canConfirm: boolean;
    onSubscribe: () => void;
    onConfirm: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isVerifying, countdown, canConfirm, onSubscribe, onConfirm }) => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-hidden">
        {/* === 1. ATMOSPHERE BACKDROP === */}
        {/* Deep dark blur to focus attention purely on the modal */}
        <div 
            className="absolute inset-0 bg-[#020617]/60 backdrop-blur-xl transition-all duration-700 animate-in fade-in" 
            style={{ opacity: 1 }}
        />
        
        {/* Ambient Glows behind the modal for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />

        {/* === 2. MAIN CARD "ACCESS PASS" === */}
        <div className="relative w-full max-w-[24rem] group perspective-1000">
            
            {/* The Glass Container */}
            <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/50 ring-1 ring-white/60 overflow-hidden transform transition-all duration-500 hover:scale-[1.01]">
                
                {/* Decorative Noise/Texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
                
                {/* Header Gradient Mesh */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

                <div className="relative p-8 flex flex-col items-center text-center z-10">
                    
                    {/* === 3. 3D ICONOGRAPHY === */}
                    <div className="relative mb-6">
                        {/* Status Ring */}
                        <div className={`absolute inset-[-8px] rounded-full border-2 border-dashed transition-all duration-1000 ${isVerifying ? 'border-blue-400/50 rotate-180 scale-110' : 'border-slate-200 rotate-0 scale-100'}`} />
                        
                        {/* Icon Container */}
                        <div className="relative w-24 h-24 rounded-[1.8rem] bg-gradient-to-br from-[#2AABEE] to-[#0088CC] shadow-[0_20px_40px_-10px_rgba(42,171,238,0.4)] flex items-center justify-center border-t border-white/30 group-hover:rotate-3 transition-transform duration-500">
                             <Send size={44} className="text-white drop-shadow-md -ml-1 mt-0.5" strokeWidth={2.5} />
                             
                             {/* Glossy Reflection */}
                             <div className="absolute inset-0 rounded-[1.8rem] bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                        </div>

                        {/* Security Badge */}
                        <div className="absolute -bottom-3 -right-3 bg-white p-1.5 rounded-full shadow-lg border border-slate-100">
                            {canConfirm ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white animate-in zoom-in spin-in-90">
                                    <Check size={16} strokeWidth={4} />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                    <Lock size={14} strokeWidth={2.5} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === 4. TYPOGRAPHY === */}
                    <h3 className="text-[1.75rem] font-black text-slate-900 mb-2 leading-tight tracking-tight">
                        {t('tg_modal_title')}
                    </h3>
                    
                    <div className="mb-8 px-2 relative">
                        <p className="text-slate-500 font-medium text-[15px] leading-relaxed">
                            {t('tg_modal_desc')}
                        </p>
                        {/* Trust Indicator */}
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Security Check</span>
                        </div>
                    </div>

                    {/* === 5. ACTIONS === */}
                    <div className="w-full space-y-3">
                        {/* Primary: Subscribe */}
                        <button 
                            onClick={onSubscribe} 
                            className="group/btn relative w-full h-14 rounded-2xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white font-bold text-[15px] shadow-[0_10px_20px_-5px_rgba(42,171,238,0.4)] transition-all active:scale-[0.98] hover:shadow-[0_15px_30px_-5px_rgba(42,171,238,0.5)] overflow-hidden flex items-center justify-center gap-3"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Send size={20} className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                                {t('btn_subscribe')}
                            </span>
                            
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        </button>
                        
                        {/* Secondary: Verify/Countdown */}
                        <div className="relative">
                            {isVerifying ? (
                                <div className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-3 cursor-wait select-none animate-in fade-in">
                                    <div className="relative">
                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                    </div>
                                    <span>
                                        {t('tg_wait')} <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 bg-white border border-slate-200 rounded text-slate-900 shadow-sm ml-1 tabular-nums">{countdown}</span>
                                    </span>
                                </div>
                            ) : (
                                <button 
                                    onClick={onConfirm}
                                    disabled={!canConfirm}
                                    className={`w-full h-14 rounded-2xl font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 border-2
                                        ${canConfirm 
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-[0.98]' 
                                            : 'bg-transparent border-transparent text-slate-400 cursor-not-allowed opacity-50'}`
                                    }
                                >
                                    {canConfirm ? (
                                        <>
                                            <Check size={20} strokeWidth={3} />
                                            {t('btn_check_sub')}
                                        </>
                                    ) : (
                                        <span>{t('tg_verifying')}</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Bottom decorative bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />
            </div>
        </div>
    </div>
  );
};