
import React, { useState, useMemo } from 'react';
import { 
  Truck, ShieldCheck, Zap, Globe, Package, 
  Check, Sparkles, BrainCircuit, Users, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Swipe logic
  const dragThreshold = 80;

  const pages = useMemo(() => [
    {
      title: t('onboarding_title_1'),
      description: t('onboarding_desc_1'),
      icon: Users,
      color: "from-[#1565D8] to-[#0B2136]",
      accent: "bg-[#1565D8]",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" 
          />
          <div className="relative flex items-center gap-4 sm:gap-6">
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white shadow-2xl"
            >
              <Package size={32} strokeWidth={1.5} />
            </motion.div>
            <div className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-blue-400 to-transparent relative opacity-40">
               <motion.div 
                animate={{ x: [0, 40], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1 left-0 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa]" 
               />
            </div>
            <motion.div 
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: 'spring', damping: 15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-[#1565D8] shadow-[0_20px_50px_rgba(21,101,216,0.4)] flex items-center justify-center text-white border border-white/20"
            >
              <Truck size={32} strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: t('onboarding_title_2'),
      description: t('onboarding_desc_2'),
      icon: BrainCircuit,
      color: "from-purple-600 to-[#0B2136]",
      accent: "bg-purple-600",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-72 h-72 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)]" 
          />
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />
            <BrainCircuit size={48} strokeWidth={1} className="relative z-10" />
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ 
                  scale: [1, 1.8, 1], 
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                className="absolute w-1 h-1 bg-purple-300 rounded-full"
                style={{
                  top: `${50 + 40 * Math.sin(i * Math.PI / 3)}%`,
                  left: `${50 + 40 * Math.cos(i * Math.PI / 3)}%`,
                }}
              />
            ))}
          </motion.div>
        </div>
      )
    },
    {
      title: t('onboarding_title_3'),
      description: t('onboarding_desc_3'),
      icon: Globe,
      color: "from-cyan-600 to-[#0B2136]",
      accent: "bg-cyan-600",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
           <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="w-64 h-64 border border-white/5 rounded-full absolute" 
           />
           <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-[-30px] bg-cyan-400/20 blur-[50px] rounded-full" 
              />
              <Globe size={90} className="text-cyan-400 relative z-10 opacity-90 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" strokeWidth={1} />
           </div>
        </div>
      )
    },
    {
      title: t('onboarding_title_4'),
      description: t('onboarding_desc_4'),
      icon: ShieldCheck,
      color: "from-emerald-600 to-[#0B2136]",
      accent: "bg-emerald-600",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
           <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-3xl rounded-[2.2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex items-center justify-center text-emerald-400 border border-white/20"
           >
             <ShieldCheck size={60} strokeWidth={1} />
             <motion.div 
               initial={{ scale: 0, rotate: -45 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
               className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full shadow-xl ring-4 ring-[#0B2136]"
             >
               <Check size={20} strokeWidth={4} />
             </motion.div>
           </motion.div>
        </div>
      )
    },
    {
      title: t('onboarding_title_5'),
      description: t('onboarding_desc_5'),
      icon: Sparkles,
      color: "from-slate-900 to-[#0B2136]",
      accent: "bg-white",
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-8">
           <div className="flex gap-4">
              {[Truck, Zap, Package].map((Icon, i) => (
                <motion.div 
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (i * 0.1), type: 'spring' }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl ${i === 1 ? 'bg-white text-[#0B2136] scale-125 z-10' : 'bg-white/5 backdrop-blur-xl text-white/40 border border-white/10'}`}
                >
                  <Icon size={28} strokeWidth={1.5} />
                </motion.div>
              ))}
           </div>
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/60 text-[10px] font-black tracking-[0.2em] uppercase"
           >
             2026 LOGISTICS CORE
           </motion.div>
        </div>
      )
    }
  ], [t]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setDirection(1);
      setCurrentPage(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(onComplete, 600);
  };

  const onDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -dragThreshold) {
      handleNext();
    } else if (info.offset.x > dragThreshold) {
      handlePrev();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '50%' : '-50%',
      opacity: 0,
      scale: 0.98,
      filter: 'blur(8px)'
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '50%' : '-50%',
      opacity: 0,
      scale: 0.98,
      filter: 'blur(8px)'
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(40px)' }}
      className={`fixed inset-0 z-[200] bg-[#0B2136] flex flex-col font-sans overflow-hidden transition-all duration-500 ${isExiting ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      {/* Background Layering */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 bg-gradient-to-br ${pages[currentPage].color} transition-all duration-1000 ease-in-out`}
        />
      </AnimatePresence>
      
      {/* Texture & Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header: Progress & Skip */}
      <div className="relative z-10 px-6 pt-safe-top mt-6 sm:mt-10 flex items-center justify-between">
         <div className="flex gap-1.5 flex-1 max-w-[160px]">
            {pages.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ 
                    width: i === currentPage ? '100%' : i < currentPage ? '100%' : '0%',
                    opacity: i <= currentPage ? 1 : 0.2
                  }}
                  className="h-full bg-white shadow-[0_0_8px_white]"
                  transition={{ duration: 0.5 }}
                />
              </div>
            ))}
         </div>
         <button 
           onClick={handleFinish}
           className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors"
         >
           {t('onboarding_skip')}
         </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col items-center px-6 overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* Visual Part */}
            <div className="w-full h-[35vh] sm:h-[40vh] flex items-center justify-center">
              <div className="w-full h-full max-h-[300px]">
                {pages[currentPage].visual}
              </div>
            </div>

            {/* Card Part */}
            <div className="w-full max-w-sm mt-4 sm:mt-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-40" />
              
              {/* Icon in Card */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`w-16 h-16 rounded-[1.5rem] ${pages[currentPage].accent} ${pages[currentPage].accent === 'bg-white' ? 'text-[#0B2136]' : 'text-white'} flex items-center justify-center mx-auto shadow-xl border border-white/10 mb-6`}
              >
                {React.createElement(pages[currentPage].icon, { size: 30, strokeWidth: 1.5 })}
              </motion.div>
              
              <motion.h2 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[26px] sm:text-[32px] font-black text-white leading-tight tracking-tight mb-4"
              >
                {pages[currentPage].title}
              </motion.h2>
              
              <motion.p 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-base sm:text-lg font-medium leading-relaxed"
              >
                {pages[currentPage].description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Button: Always Visible & Padded */}
      <div className="relative z-10 px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+24px)] flex flex-col items-center">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={handleNext}
          className="group relative w-full max-w-sm h-16 sm:h-18 rounded-[2rem] bg-white text-[#0B2136] font-black text-lg sm:text-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2.5 overflow-hidden"
        >
          {/* Glossy Animation */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-blue-50/40 to-transparent skew-x-12 pointer-events-none"
          />
          
          <span className="relative z-10 flex items-center gap-2">
            {currentPage === pages.length - 1 ? t('onboarding_start') : t('onboarding_next')}
            <ChevronRight size={22} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
        
        {/* Swipe Hint on first page */}
        {currentPage === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]"
          >
            Swipe to explore
          </motion.p>
        )}
      </div>

      {/* Bottom Shadow Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default Onboarding;
