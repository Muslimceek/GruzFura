import React, { useEffect, useState } from 'react';
import { X, Mic } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose, onResult }) => {
  const { t } = useLanguage();
  const [state, setState] = useState<'listening' | 'processing' | 'success'>('listening');
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (isOpen) {
      setState('listening');
      setTranscript("");
      
      // Simulation of voice recognition lifecycle
      const t1 = setTimeout(() => {
          setTranscript("Алматы...");
      }, 1500);
      
      const t2 = setTimeout(() => {
          setTranscript("Алматы в Астану...");
      }, 2500);

      const t3 = setTimeout(() => {
          setState('processing');
      }, 3500);

      const t4 = setTimeout(() => {
          setState('success');
          onResult("Алматы в Астану"); // In real app, pass recognized text
          setTimeout(onClose, 800);
      }, 4500);

      return () => {
          clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0B1120]/90 backdrop-blur-3xl transition-opacity duration-500 animate-in fade-in" onClick={onClose} />
      
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-safe-top right-6 p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all z-50">
          <X size={24} />
      </button>

      <div className="relative z-10 flex flex-col items-center w-full px-6">
        
        {/* === THE ORB (Voice Core) === */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
            {/* Core */}
            <div className={`absolute w-24 h-24 rounded-full transition-all duration-500 blur-md
                ${state === 'listening' ? 'bg-electric-blue animate-pulse scale-100' : 
                  state === 'processing' ? 'bg-purple-500 animate-spin scale-75' : 'bg-emerald-500 scale-110'}
            `}></div>

            {/* Outer Rings (Ripples) */}
            {state === 'listening' && (
                <>
                    <div className="absolute inset-0 border-2 border-electric-blue/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div className="absolute inset-[-20px] border border-electric-blue/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_200ms]"></div>
                    <div className="absolute inset-[-40px] border border-electric-blue/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_400ms]"></div>
                </>
            )}

            {/* Icon */}
            <div className="relative z-10 text-white drop-shadow-lg">
                <Mic size={40} className={`transition-transform duration-300 ${state === 'listening' ? 'scale-110' : 'scale-100'}`} />
            </div>
        </div>

        {/* Text Feedback */}
        <div className="text-center space-y-4 h-24">
            {state === 'listening' && (
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">Listening...</h3>
                    <p className="text-white/60 font-medium text-lg min-h-[1.5rem]">{transcript}</p>
                </div>
            )}
            
            {state === 'processing' && (
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
                        Thinking
                    </h3>
                    <p className="text-white/40 text-sm">Analyzing intent with Gemini...</p>
                </div>
            )}

            {state === 'success' && (
                <div className="space-y-2 animate-in zoom-in slide-in-from-bottom-2">
                    <h3 className="text-2xl font-black text-emerald-400">Got it!</h3>
                </div>
            )}
        </div>

        {/* Tips */}
        <div className="absolute bottom-20 left-0 right-0 text-center px-10">
            <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                Try saying "Almaty to Moscow"
            </p>
        </div>

      </div>
    </div>
  );
};