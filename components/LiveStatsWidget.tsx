
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';

export const LiveStatsWidget = () => {
  const { t } = useLanguage();
  const [count, setCount] = useState(1255);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2.5">
        <div className="px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black tracking-[0.1em] text-white flex items-center gap-2 shadow-sm uppercase group-hover:bg-white/20 transition-colors">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            {t('live_badge')}
        </div>
        <div className="flex flex-col">
            <span className="text-white/80 text-[11px] font-black tracking-tight leading-none">
                {count.toLocaleString()}
            </span>
            <span className="text-white/40 text-[8px] font-bold uppercase tracking-wider leading-none mt-0.5">
                {t('stats_active')}
            </span>
        </div>
    </div>
  );
};
