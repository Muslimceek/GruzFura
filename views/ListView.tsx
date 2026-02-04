
import React, { useMemo, useState } from 'react';
import { Search, LayoutGrid, ArrowUpDown, MapPin, Navigation, Filter, X, ChevronDown, Mic } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { Listing, ViewState } from '../types';
import { ListingCard } from '../components/ListingCard';
import { VoiceSearchModal } from '../components/VoiceSearchModal';

interface ListViewProps {
    type: 'truck' | 'cargo';
    listings: Listing[];
    searchFrom: string;
    searchTo: string;
    setSearchFrom: (val: string) => void;
    setSearchTo: (val: string) => void;
    setView: (view: ViewState) => void;
    currentUser: any;
    onDelete: (id: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ type, listings, searchFrom, searchTo, setSearchFrom, setSearchTo, setView, currentUser, onDelete }) => {
    const { t } = useLanguage();
    const isTruck = type === 'truck';
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    const filtered = useMemo(() => {
      return listings
        .filter((l: Listing) => l.kind === type)
        .filter((l: Listing) => {
          const matchFrom = l.fromCity.toLowerCase().includes(searchFrom.toLowerCase());
          const matchTo = l.toCity.toLowerCase().includes(searchTo.toLowerCase());
          return matchFrom && matchTo;
        });
    }, [listings, type, searchFrom, searchTo]);

    const handleSwap = () => {
        const temp = searchFrom;
        setSearchFrom(searchTo);
        setSearchTo(temp);
    };

    const handleVoiceResult = (text: string) => {
        if (text.includes(" в ")) {
            const parts = text.split(" в ");
            setSearchFrom(parts[0]);
            setSearchTo(parts[1]);
        } else {
             setSearchFrom(text);
        }
    };

    const accentBg = isTruck ? 'bg-electric-blue' : 'bg-solar-orange';
    const accentText = isTruck ? 'text-electric-blue' : 'text-solar-orange';
    const shadowClass = isTruck ? 'shadow-glow-blue' : 'shadow-glow-orange';

    return (
      <div className="flex flex-col h-full bg-[#F3F4F6] relative">
          
          <VoiceSearchModal 
            isOpen={isVoiceOpen} 
            onClose={() => setIsVoiceOpen(false)} 
            onResult={handleVoiceResult} 
          />

          {/* Header */}
          <div className="pt-safe-top px-4 pb-3 bg-[#F3F4F6]/90 backdrop-blur-xl sticky top-0 z-40 border-b border-white/20 transition-all duration-300 shadow-sm">
              <div className="flex items-center justify-between mt-3">
                   <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                           {isTruck ? 'Transport' : 'Logistics'}
                       </span>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                          {isTruck ? t('all_trucks') : t('all_cargos')}
                          <span className={`${accentText} ml-0.5`}>.</span>
                      </h2>
                  </div>

                  <div className="flex gap-2">
                      <button 
                        onClick={() => setIsVoiceOpen(true)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 text-white shadow-lg active:scale-90 transition-all"
                      >
                          <Mic size={18} strokeWidth={2.5} />
                      </button>

                      <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border transition-all active:scale-90 duration-300 ${isSearchOpen ? `${accentBg} text-white border-transparent` : 'bg-white text-slate-900 border-white/60'}`}
                      >
                          {isSearchOpen ? <X size={18} strokeWidth={2.5} /> : <Filter size={18} strokeWidth={2.5} />}
                      </button>
                  </div>
              </div>

              {!isSearchOpen && (searchFrom || searchTo) && (
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="mt-3 w-full flex items-center justify-between bg-white/60 p-1 pl-2 pr-3 rounded-xl border border-white/50 animate-in fade-in slide-in-from-top-1 active:bg-white transition-colors"
                  >
                      <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`shrink-0 h-6 w-6 rounded-lg flex items-center justify-center text-white ${accentBg}`}>
                              <Search size={12} strokeWidth={3} />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 truncate">
                              <span className="truncate max-w-[80px]">{searchFrom || '...'}</span>
                              <span className="text-slate-300">➝</span>
                              <span className="truncate max-w-[80px]">{searchTo || '...'}</span>
                          </div>
                      </div>
                      <ChevronDown size={14} className="text-slate-400" />
                  </button>
              )}
          </div>
          
          {/* Search Modal */}
          <div className={`absolute top-[110px] left-0 right-0 z-30 px-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSearchOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
              <div className={`relative p-1.5 rounded-[2rem] bg-white shadow-2xl ${shadowClass} border border-white/60 ring-2 ring-white/20`}>
                  <div className="flex flex-col gap-1 relative z-10 p-1">
                      <div className="relative group">
                          <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl ${isTruck ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'} flex items-center justify-center shadow-sm`}>
                             <MapPin size={16} strokeWidth={2.5} />
                          </div>
                          <input 
                              value={searchFrom} 
                              onChange={e => setSearchFrom(e.target.value)}
                              placeholder={t('placeholder_from')} 
                              className="w-full bg-slate-50/80 rounded-2xl pl-14 pr-16 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400/80 outline-none focus:bg-white transition-all"
                          />
                      </div>

                      <div className="relative group">
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm">
                             <Navigation size={16} strokeWidth={2.5} />
                          </div>
                          <input 
                              value={searchTo} 
                              onChange={e => setSearchTo(e.target.value)}
                              placeholder={t('placeholder_to')} 
                              className="w-full bg-slate-50/80 rounded-2xl pl-14 pr-16 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400/80 outline-none focus:bg-white transition-all"
                          />
                      </div>
                  </div>

                  <button 
                    onClick={handleSwap}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl z-20 active:rotate-180 transition-all duration-500 border-[4px] border-white ${accentBg}`}
                  >
                    <ArrowUpDown size={20} strokeWidth={3} />
                  </button>
              </div>
          </div>

          {/* Scrollable Results - Compact Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-32 pt-3 no-scrollbar scroll-smooth-off">
              {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-60">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-white/50">
                          <Search size={32} className="text-slate-200" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-black text-slate-900 text-lg mt-4">{t('nothing_found')}</h3>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                      {filtered.map((l: Listing, i) => (
                          <div key={l.id} className="animate-in slide-in-from-bottom-2 fade-in duration-300" style={{ animationDelay: `${i * 30}ms` }}>
                              <ListingCard listing={l} currentUserId={currentUser?.uid} onDelete={onDelete} />
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    );
};
