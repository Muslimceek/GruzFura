import React from 'react';
import { Truck, Package, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { Language } from '../lib/translations';
import { Listing, ViewState } from '../types';
import { ListingCard } from '../components/ListingCard';
import { LiveStatsWidget } from '../components/LiveStatsWidget';

interface HomeViewProps {
    setView: (view: ViewState) => void;
    setLanguage: (lang: Language) => void;
    language: Language;
    listings: Listing[];
}

export const HomeView: React.FC<HomeViewProps> = ({ setView, setLanguage, language, listings }) => {
  const { t } = useLanguage();

  return (
    <div className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-gradient-to-b from-[#F3F4F6] to-[#EFF2F6]">
        {/* Safe Area Spacer + Header */}
        <div className="px-6 pt-safe-top pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header: Logo & Lang */}
            <div className="flex items-center justify-between mb-8 mt-4">
                <div className="flex flex-col">
                     <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                        Gruz<span className="text-electric-blue">Fura</span>
                     </h1>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-0.5">Logistics OS</span>
                </div>
                
                {/* Micro-interaction Language Switcher */}
                <div className="relative flex bg-white p-1 rounded-2xl shadow-sm border border-white/60">
                    {(['ru', 'uz', 'kk', 'kg'] as Language[]).map(l => (
                        <button 
                            key={l} 
                            onClick={() => setLanguage(l)} 
                            className={`relative z-10 w-9 h-9 rounded-xl text-[10px] font-black uppercase transition-all duration-300 flex items-center justify-center ${
                                language === l 
                                ? 'text-white shadow-md scale-100 bg-slate-900' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Dashboard Card */}
            <div className="relative w-full rounded-[2.5rem] bg-[#0B1120] overflow-hidden shadow-2xl shadow-slate-900/20 mb-8 group ring-4 ring-white/50 ring-offset-2 ring-offset-[#F3F4F6]">
                {/* Animated Background Mesh */}
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-br from-electric-blue/40 via-[#0B1120] to-transparent opacity-60 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-30%] right-[-20%] w-[120%] h-[150%] bg-gradient-to-tl from-solar-orange/30 via-transparent to-transparent opacity-50 blur-3xl"></div>
                
                {/* Content */}
                <div className="relative p-8 flex flex-col h-52 justify-between z-10">
                    <div className="flex justify-between items-start">
                        <LiveStatsWidget />
                        <div className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/5">
                            <Globe size={16} className="text-blue-300 opacity-80" />
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-[2rem] font-black text-white leading-[0.95] tracking-tight mb-3 max-w-[90%] drop-shadow-sm">
                            {t('hero_title')}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck size={12} className="text-emerald-400" />
                                Verified
                            </div>
                            <div className="h-1 w-1 bg-white/30 rounded-full"></div>
                            <span className="text-white/50 text-xs font-medium tracking-wide">AI-Powered 2.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Navigation (Bento Grid) */}
            <div className="grid grid-cols-2 gap-5 mb-10">
                {/* Truck Button */}
                <button onClick={() => setView('SEARCH_TRUCK')} className="group relative h-52 rounded-[2.5rem] bg-white p-6 flex flex-col justify-between shadow-[0_20px_40px_-15px_rgba(47,84,235,0.15)] hover:shadow-[0_30px_60px_-15px_rgba(47,84,235,0.25)] transition-all duration-300 active:scale-[0.98] border border-white/80 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-blue to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Truck size={28} strokeWidth={2} />
                    </div>
                    
                    <div className="relative">
                        <div className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight group-hover:text-electric-blue transition-colors">{t('btn_find_truck')}</div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {t('desc_find_truck')}
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </button>

                {/* Cargo Button */}
                <button onClick={() => setView('SEARCH_CARGO')} className="group relative h-52 rounded-[2.5rem] bg-white p-6 flex flex-col justify-between shadow-[0_20px_40px_-15px_rgba(250,140,22,0.15)] hover:shadow-[0_30px_60px_-15px_rgba(250,140,22,0.25)] transition-all duration-300 active:scale-[0.98] border border-white/80 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-solar-orange to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                        <Package size={28} strokeWidth={2} />
                    </div>
                    
                    <div className="relative">
                        <div className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight group-hover:text-solar-orange transition-colors">{t('btn_find_cargo')}</div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {t('desc_find_cargo')}
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </button>
            </div>

            {/* Hot Feed */}
            <div>
                <div className="flex items-center justify-between mb-5 px-1">
                     <div className="flex items-center gap-3">
                         <div className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                         </div>
                         <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('urgent_header')}</h3>
                     </div>
                     <button className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center gap-1">
                        View All <ArrowRight size={12} />
                     </button>
                </div>
                
                {/* Listings Stack */}
                <div className="space-y-4">
                    {listings.filter((l) => l.urgent).slice(0, 3).map((l, i) => (
                        <div key={l.id} className="animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                            <ListingCard listing={l} onDelete={() => {}} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};