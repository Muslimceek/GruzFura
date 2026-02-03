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
        // Simple logic for MVP demo: split "A to B" string
        // In real app, Gemini would parse this
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
          <div className="pt-safe-top px-5 pb-4 bg-[#F3F4F6]/90 backdrop-blur-xl sticky top-0 z-40 border-b border-white/20 transition-all duration-300 shadow-sm">
              <div className="flex items-center justify-between mt-4">
                   <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                           {isTruck ? 'Transport' : 'Logistics'}
                       </span>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                          {isTruck ? t('all_trucks') : t('all_cargos')}
                          <span className={`${accentText} ml-1`}>.</span>
                      </h2>
                  </div>

                  <div className="flex gap-3">
                      {/* Voice Trigger */}
                      <button 
                        onClick={() => setIsVoiceOpen(true)}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 text-white shadow-lg active:scale-90 transition-all hover:bg-slate-800"
                      >
                          <Mic size={20} strokeWidth={2.5} />
                      </button>

                      {/* Filter Toggle */}
                      <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border transition-all active:scale-90 duration-300 ${isSearchOpen ? `${accentBg} text-white border-transparent` : 'bg-white text-slate-900 border-white/60'}`}
                      >
                          {isSearchOpen ? <X size={20} strokeWidth={2.5} /> : <Filter size={20} strokeWidth={2.5} />}
                      </button>
                  </div>
              </div>

              {/* Active Filter Pill (Visible when modal closed) */}
              {!isSearchOpen && (searchFrom || searchTo) && (
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="mt-4 w-full flex items-center justify-between bg-white/60 p-1.5 pl-2 pr-4 rounded-2xl border border-white/50 animate-in fade-in slide-in-from-top-2 active:bg-white transition-colors"
                  >
                      <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-white ${accentBg}`}>
                              <Search size={14} strokeWidth={3} />
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 truncate">
                              <span className="truncate max-w-[100px]">{searchFrom || '...'}</span>
                              <span className="text-slate-300">➝</span>
                              <span className="truncate max-w-[100px]">{searchTo || '...'}</span>
                          </div>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                  </button>
              )}
          </div>
          
          {/* Search Modal (Absolute Overlay) */}
          <div className={`absolute top-[140px] left-0 right-0 z-30 px-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSearchOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
              <div className={`relative p-2 rounded-[2.5rem] bg-white shadow-2xl ${shadowClass} border border-white/60 ring-4 ring-white/30`}>
                  <div className="flex flex-col gap-2 relative z-10 p-2">
                      
                      {/* From Input */}
                      <div className="relative group">
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl ${isTruck ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'} flex items-center justify-center transition-colors shadow-sm`}>
                             <MapPin size={18} strokeWidth={2.5} />
                          </div>
                          <input 
                              value={searchFrom} 
                              onChange={e => setSearchFrom(e.target.value)}
                              placeholder={t('placeholder_from')} 
                              className="w-full bg-slate-50/80 rounded-[1.5rem] pl-16 pr-20 py-5 text-[16px] font-bold text-slate-900 placeholder:text-slate-400/80 outline-none focus:bg-white focus:shadow-inner focus:ring-2 focus:ring-inset focus:ring-black/5 transition-all"
                          />
                      </div>

                      <div className="h-px w-full bg-slate-100 mx-2"></div>

                      {/* To Input */}
                      <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm">
                             <Navigation size={18} strokeWidth={2.5} />
                          </div>
                          <input 
                              value={searchTo} 
                              onChange={e => setSearchTo(e.target.value)}
                              placeholder={t('placeholder_to')} 
                              className="w-full bg-slate-50/80 rounded-[1.5rem] pl-16 pr-20 py-5 text-[16px] font-bold text-slate-900 placeholder:text-slate-400/80 outline-none focus:bg-white focus:shadow-inner focus:ring-2 focus:ring-inset focus:ring-black/5 transition-all"
                          />
                      </div>
                  </div>

                  {/* Swap Button */}
                  <button 
                    onClick={handleSwap}
                    className={`absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl z-20 active:rotate-180 transition-all duration-500 hover:scale-110 active:scale-95 border-[5px] border-white ${accentBg}`}
                  >
                    <ArrowUpDown size={24} strokeWidth={3} />
                  </button>
              </div>
              
              {/* Modal Backdrop Click Area */}
              {isSearchOpen && (
                  <div className="fixed inset-0 top-[280px] z-[-1] bg-black/20 backdrop-blur-[2px] transition-opacity duration-500" onClick={() => setIsSearchOpen(false)}></div>
              )}
          </div>

          {/* Scrollable Results */}
          <div className="flex-1 overflow-y-auto px-5 pb-32 pt-2 no-scrollbar scroll-smooth">
              {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-60 animate-in fade-in zoom-in-95 duration-700">
                      <div className="relative mb-6">
                          <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${accentBg}`}></div>
                          <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-slate-200 relative z-10 border border-white/50">
                              <Search size={48} className="text-slate-300" strokeWidth={1.5} />
                          </div>
                      </div>
                      <h3 className="font-black text-slate-900 text-xl mb-1">{t('nothing_found')}</h3>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Try another route</p>
                  </div>
              ) : (
                  <div className="space-y-4 pt-2">
                      {filtered.map((l: Listing, i) => (
                          <div key={l.id} className="animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationDelay: `${i * 50}ms` }}>
                              <ListingCard listing={l} currentUserId={currentUser?.uid} onDelete={onDelete} />
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    );
};