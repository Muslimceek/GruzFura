
import React from 'react';
import { TruckListing, CargoListing, Listing, ListingStatus } from '../types';
// Added Truck icon to the lucide-react imports
import { Phone, Send, Clock, ShieldCheck, Box, Trash2, ArrowRight, Archive, MapPin, Zap, Truck } from 'lucide-react';
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

  // 2026 Design Tokens
  const theme = isTruck ? {
      accent: 'text-[#1565D8]',
      accentBg: 'bg-[#1565D8]',
      grad: 'from-[#1565D8] to-[#0B2136]',
      soft: 'bg-blue-50/50',
      border: 'border-blue-100/50',
  } : {
      accent: 'text-[#FF7A59]',
      accentBg: 'bg-[#FF7A59]',
      grad: 'from-[#FF7A59] to-[#0B2136]',
      soft: 'bg-orange-50/50',
      border: 'border-orange-100/50',
  };

  const containerOpacity = isActive ? 'opacity-100' : 'opacity-60 grayscale-[0.8]';

  return (
    <div 
        className={`group relative mb-4 isolate w-full transition-all duration-300 ${containerOpacity} tactile-active`}
    >
        {/* Modern Card Surface with Subtle Glassmorphism */}
        <div className={`relative w-full bg-white rounded-[24px] shadow-glass border border-slate-200/50 p-4 transition-all duration-500 hover:shadow-glow-blue overflow-hidden`}>
            
            {/* Urgent Badge - Floating Ribbon style */}
            {isUrgent && isActive && (
                <div className="absolute -right-8 top-4 rotate-45 bg-red-500 text-white px-10 py-1 text-[9px] font-black uppercase tracking-tighter shadow-lg z-10 flex items-center gap-1">
                   <Zap size={8} fill="white" /> {t('urgent_header')}
                </div>
            )}

            {/* HEADER: ID & Status */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-lg ${theme.accentBg}`}>
                        {isTruck ? <Truck size={16} /> : <Box size={16} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                            {isTruck ? t('app_title_2') : t('app_title_1')}
                        </span>
                        <span className={`text-[11px] font-bold ${theme.accent}`}>
                            {isTruck ? getTranslatedType(truckData?.truckType || '') : cargoData?.cargoType}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600">{listing.date}</span>
                </div>
            </div>

            {/* BODY: Route Visualization */}
            <div className="flex gap-4 mb-5">
                <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white shadow-sm ring-1 ring-slate-100" />
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-transparent rounded-full" />
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('label_from')}</span>
                        <h3 className="text-[17px] font-black text-[#0B2136] tracking-tight truncate">{listing.fromCity}</h3>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('label_to')}</span>
                        <h3 className="text-[17px] font-black text-[#0B2136] tracking-tight truncate">{listing.toCity}</h3>
                    </div>
                </div>
                
                {/* Secondary Info Box */}
                <div className={`shrink-0 self-center flex flex-col items-end justify-center px-4 py-3 rounded-2xl ${theme.soft} border ${theme.border} min-w-[90px]`}>
                    {isTruck ? (
                        <>
                            <div className="text-2xl font-black text-slate-900 leading-none">{truckData?.capacity}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">тонн</div>
                        </>
                    ) : (
                        <>
                            <div className="text-lg font-black text-slate-900 leading-none">
                                {cargoData?.price ? `${cargoData.price.toLocaleString()} ` : 'Договор'}
                                <span className="text-[10px]">{cargoData?.currency}</span>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase mt-1">
                                {cargoData?.weight}т <span className="opacity-30">/</span> {cargoData?.volume}м³
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* FOOTER: Owner & Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white ring-4 ring-slate-50">
                        <ShieldCheck size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 truncate max-w-[100px]">{listing.contactName}</span>
                        <div className="flex items-center gap-1">
                             <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Verified</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {isOwner ? (
                        <>
                             {isActive && onStatusChange && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onStatusChange(listing.id, 'closed'); }}
                                    className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center"
                                >
                                    <Archive size={16} />
                                </button>
                             )}
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(listing.id); }}
                                className="h-10 w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <a href={`tel:${listing.contactPhone}`} onClick={(e) => e.stopPropagation()} 
                               className="h-11 px-5 rounded-xl bg-[#0B2136] text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                                <Phone size={16} strokeWidth={2.5} />
                                <span className="text-xs font-black uppercase tracking-widest">{t('btn_call')}</span>
                            </a>
                            {listing.telegramHandle && (
                                <a href={`https://t.me/${listing.telegramHandle}`} target="_blank" onClick={(e) => e.stopPropagation()} 
                                   className="h-11 w-11 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                                    <Send size={18} className="-ml-0.5 mt-0.5" />
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
