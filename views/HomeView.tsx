
import React from 'react';
import { Truck, Package, ArrowRight, ShieldCheck, Globe, ChevronRight, Zap, Activity } from 'lucide-react';
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

  const ServiceTile = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    onClick, 
    color, 
    shadow 
  }: { 
    title: string; 
    subtitle: string; 
    icon: any; 
    onClick: () => void; 
    color: string; 
    shadow: string; 
  }) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-start p-5 bg-white rounded-[2rem] shadow-glass border border-white transition-all duration-300 active:scale-95 overflow-hidden w-full text-left"
    >
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-bl-full`} />
        
        <div className={`mb-4 w-12 h-12 rounded-2xl bg-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg border border-slate-50`}>
            <Icon size={24} strokeWidth={2.5} className={color.replace('from-', 'text-').split(' ')[0]} />
        </div>

        <div className="relative z-10">
            <h3 className="text-lg font-black text-slate-900 leading-[1.2] tracking-tight mb-1">
                {title}
            </h3>
            <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {subtitle}
                </span>
                <ChevronRight size={10} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </button>
  );

  return (
    <div className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-[#F3F4F6]">
        <div className="px-6 pt-safe-top pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header: Logo & Lang */}
            <div className="flex items-center justify-between mb-8 mt-6">
                <div className="flex flex-col">
                     <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                        Gruz<span className="text-electric-blue">Fura</span>
                     </h1>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5 opacity-60">Logistics OS</span>
                </div>
                
                <div className="relative flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                    {(['ru', 'uz', 'kk', 'kg'] as Language[]).map(l => (
                        <button 
                            key={l} 
                            onClick={() => setLanguage(l)} 
                            className={`relative z-10 w-9 h-9 rounded-xl text-[10px] font-black uppercase transition-all duration-300 flex items-center justify-center ${
                                language === l 
                                ? 'text-white shadow-md bg-slate-950' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Block */}
            <div className="relative w-full rounded-[2.5rem] bg-[#0F172A] overflow-hidden shadow-2xl shadow-blue-900/20 mb-8 group select-none">
                <div className="absolute top-[-40%] left-[-10%] w-[120%] h-[180%] bg-[radial-gradient(circle_at_center,rgba(47,84,235,0.3)_0%,transparent_70%)] blur-[80px] animate-pulse" />
                
                <div className="relative p-7 flex flex-col z-10">
                    <div className="flex justify-between items-start mb-6">
                        <LiveStatsWidget />
                        <div className="flex gap-2">
                             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                                <Activity size={16} className="text-blue-400" />
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                                <Globe size={16} className="text-blue-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
                            {t('hero_title')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2 hover:border-emerald-500/30 transition-colors group/badge">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('verified_badge')}</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2 hover:border-blue-400/30 transition-colors group/badge">
                            <Zap size={12} className="text-blue-400" />
                            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">AI-Powered 2.5</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tiles */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <ServiceTile 
                    title={t('btn_find_truck')}
                    subtitle={t('desc_find_truck')}
                    icon={Truck}
                    onClick={() => setView('SEARCH_TRUCK')}
                    color="from-blue-600 to-indigo-600"
                    shadow="shadow-blue-500/20"
                />
                <ServiceTile 
                    title={t('btn_find_cargo')}
                    subtitle={t('desc_find_cargo')}
                    icon={Package}
                    onClick={() => setView('SEARCH_CARGO')}
                    color="from-orange-500 to-red-500"
                    shadow="shadow-orange-500/20"
                />
            </div>

            {/* Hot Feed Section */}
            <div>
                <div className="flex items-center justify-between mb-6 px-1">
                     <div className="flex items-center gap-2.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{t('urgent_header')}</h3>
                     </div>
                     <button className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors flex items-center gap-1.5">
                        {t('btn_view_all')} <ChevronRight size={12} strokeWidth={3} />
                     </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {listings.filter((l) => l.urgent).slice(0, 5).map((l, i) => (
                        <div key={l.id} className="animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                            <ListingCard listing={l} onDelete={() => {}} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
