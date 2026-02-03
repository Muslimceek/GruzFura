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
    <div className="flex items-center gap-3 mb-4">
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest text-white flex items-center gap-2 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {t('live_badge')}
        </div>
        <span className="text-white/60 text-xs font-medium tracking-wide">
             <span className="text-white font-bold">{count.toLocaleString()}</span> {t('stats_active')}
        </span>
    </div>
  );
};