import React from 'react';
import { TruckListing, CargoListing, Listing, ListingStatus } from '../types';
import { Phone, Send, Clock, ShieldCheck, Weight, Box, Trash2, Zap, Truck, ArrowDown, Archive } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface ListingCardProps {
  listing: Listing;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: ListingStatus) => void; 
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, currentUserId, onDelete, onStatusChange }) => {
  const { t } = useLanguage();
  const isTruck = listing.kind === 'truck';
  const isUrgent = listing.urgent;
  const isOwner = currentUserId && listing.creatorId === currentUserId;
  const isActive = listing.status === 'active';
  
  const truckData = isTruck ? (listing as TruckListing) : null;
  const cargoData = !isTruck ? (listing as CargoListing) : null;

  const getTranslatedType = (typeStr: string) => t(`type_${typeStr}` as any) || typeStr;

  const handleCardClick = () => {
    try {
        const stored = localStorage.getItem('gruzFura_recent');
        let recentIds: string[] = stored ? JSON.parse(stored) : [];
        recentIds = recentIds.filter(id => id !== listing.id);
        recentIds.unshift(listing.id);
        recentIds = recentIds.slice(0, 20);
        localStorage.setItem('gruzFura_recent', JSON.stringify(recentIds));
    } catch (e) { console.error(e); }
  };

  // 2026 Design Tokens (Compact)
  const theme = isTruck ? {
      accent: 'text-[#1565D8]',
      bgAccent: 'bg-[#1565D8]',
      lightBg: 'bg-blue-50',
      border: 'border-blue-100',
  } : {
      accent: 'text-[#FF7A59]',
      bgAccent: 'bg-[#FF7A59]',
      lightBg: 'bg-orange-50',
      border: 'border-orange-100',
  };

  const containerOpacity = isActive ? 'opacity-100' : 'opacity-60 grayscale-[0.8]';

  return (
    <div 
        onClick={handleCardClick}
        className={`group relative mb-2.5 isolate w-full transition-all duration-300 ${containerOpacity}`}
    >
        {/* Compact Card Surface */}
        <div className={`relative w-full bg-white rounded-[18px] shadow-sm border border-slate-100 p-3.5 transition-all duration-300 active:scale-[0.99] overflow-hidden`}>
            
            {/* Urgent Indicator Strip */}
            {isUrgent && isActive && (
                <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-red-500/10 to-transparent rounded-tr-[18px] pointer-events-none`}>
                     <div className="absolute top-2 right-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                     </div>
                </div>
            )}

            {/* Top Row: Route & Main Stat */}
            <div className="flex justify-between items-start mb-3">
                {/* Left: Route */}
                <div className="flex flex-col min-w-0 pr-2">
                     {/* Meta Badge Row */}
                     <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={`px-1.5 py-0.5 rounded-md ${theme.lightBg} border ${theme.border} flex items-center gap-1`}>
                             {isTruck ? <Truck size={10} className={theme.accent} /> : <Box size={10} className={theme.accent} />}
                             <span className={`text-[9px] font-black uppercase tracking-wider ${theme.accent}`}>
                                 {isTruck ? getTranslatedType(truckData?.truckType || '') : cargoData?.cargoType}
                             </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {listing.date}
                        </span>
                     </div>

                     {/* Cities */}
                     <div className="flex flex-col gap-0.5">
                        <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{listing.fromCity}</h3>
                        <div className="flex items-center gap-1 opacity-40 py-0.5">
                            <ArrowDown size={10} strokeWidth={3} className="text-slate-400" />
                        </div>
                        <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{listing.toCity}</h3>
                     </div>
                </div>

                {/* Right: Price/Capacity Box */}
                <div className={`shrink-0 rounded-xl ${theme.lightBg} border ${theme.border} p-2 text-right min-w-[70px]`}>
                    {isTruck ? (
                         <>
                             <div className={`text-lg font-black ${theme.accent} leading-none`}>{truckData?.capacity}</div>
                             <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">тонн</div>
                         </>
                    ) : (
                         <>
                             {cargoData?.price ? (
                                 <div className={`text-sm font-black ${theme.accent} leading-none whitespace-nowrap`}>
                                     {cargoData.price >= 10000 
                                        ? `${(cargoData.price / 1000).toFixed(0)}k` 
                                        : cargoData.price} 
                                     <span className="text-[9px] ml-0.5">{cargoData.currency}</span>
                                 </div>
                             ) : (
                                 <div className={`text-[10px] font-black ${theme.accent}`}>Договор</div>
                             )}
                             <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 flex justify-end items-center gap-1">
                                {cargoData?.weight}т <span className="opacity-50">/</span> {cargoData?.volume}м³
                             </div>
                         </>
                    )}
                </div>
            </div>

            {/* Bottom Row: User & Actions */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-50">
                {/* User */}
                <div className="flex items-center gap-1.5 overflow-hidden max-w-[50%]">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <ShieldCheck size={10} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 truncate">{listing.contactName}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-1.5">
                     {isOwner ? (
                        <>
                             {isActive && onStatusChange && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onStatusChange(listing.id, 'closed'); }}
                                    className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100 flex items-center justify-center"
                                >
                                    <Archive size={12} />
                                </button>
                             )}
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(listing.id); }}
                                className="h-7 w-7 rounded-lg bg-red-50 text-red-400 hover:text-red-500 border border-red-100 flex items-center justify-center"
                            >
                                <Trash2 size={12} />
                            </button>
                        </>
                     ) : (
                        <>
                            <a href={`tel:${listing.contactPhone}`} onClick={(e) => e.stopPropagation()} 
                               className={`h-8 px-3 rounded-lg bg-slate-900 text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform`}>
                                <Phone size={12} />
                                <span className="text-[10px] font-bold">{t('btn_call')}</span>
                            </a>

                            {listing.telegramHandle && (
                                <a href={`https://t.me/${listing.telegramHandle}`} target="_blank" onClick={(e) => e.stopPropagation()} 
                                   className="h-8 w-8 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                                    <Send size={14} className="-ml-0.5 mt-0.5" />
                                </a>
                            )}
                        </>
                     )}
                </div>
            </div>
        </div>
    </div>
  );
};