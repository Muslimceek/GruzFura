
import React from 'react';
import { TruckListing, CargoListing, Listing, ListingStatus } from '../types';
import { Phone, Send, Clock, ShieldCheck, Box, Trash2, Archive, Zap, Truck } from 'lucide-react';
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

  const theme = isTruck ? {
      accent: 'text-blue-600',
      accentBg: 'bg-blue-600',
      soft: 'bg-blue-50/50',
      border: 'border-blue-100/40',
  } : {
      accent: 'text-orange-600',
      accentBg: 'bg-orange-600',
      soft: 'bg-orange-50/50',
      border: 'border-orange-100/40',
  };

  const containerOpacity = isActive ? 'opacity-100' : 'opacity-60 grayscale-[0.8]';

  return (
    <div className={`group relative w-full transition-all duration-300 ${containerOpacity} tactile-active h-full`}>
        <div className={`relative w-full h-full bg-white rounded-[24px] shadow-sm border border-slate-200/50 p-4 transition-all duration-300 hover:shadow-lg overflow-hidden flex flex-col`}>
            
            {/* Urgent Tag */}
            {isUrgent && isActive && (
                <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white pl-3 pr-2 py-1 rounded-bl-2xl text-[8px] font-black uppercase flex items-center gap-1 shadow-md z-20">
                       <Zap size={8} fill="white" /> {t('urgent_header')}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${theme.accentBg}`}>
                        {isTruck ? <Truck size={16} /> : <Box size={16} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            {isTruck ? t('app_title_2') : t('app_title_1')}
                        </span>
                        <span className={`text-[11px] font-bold ${theme.accent} truncate leading-none`}>
                            {isTruck ? getTranslatedType(truckData?.truckType || '') : cargoData?.cargoType}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 tabular-nums">{listing.date}</span>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex items-center gap-4 mb-4">
                <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shrink-0" />
                        <h3 className="text-sm font-black text-slate-800 tracking-tight truncate leading-tight">{listing.fromCity}</h3>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shrink-0" />
                        <h3 className="text-sm font-black text-slate-800 tracking-tight truncate leading-tight">{listing.toCity}</h3>
                    </div>
                </div>
                
                <div className={`shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-2xl ${theme.soft} border ${theme.border} min-w-[70px] shadow-sm`}>
                    {isTruck ? (
                        <>
                            <span className="text-xl font-black text-slate-900 leading-none mb-0.5">{truckData?.capacity}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">TONS</span>
                        </>
                    ) : (
                        <>
                            <span className="text-[12px] font-black text-slate-900 leading-tight text-center">
                                {cargoData?.price ? `${cargoData.price.toLocaleString()}` : t('price_negotiable')}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-tighter">
                                {cargoData?.currency || ''} • {cargoData?.weight}T
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                        <ShieldCheck size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-slate-900 truncate">{listing.contactName}</span>
                        <span className="text-[8px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t('verified_badge')}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {isOwner ? (
                        <div className="flex gap-1.5">
                             {isActive && onStatusChange && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onStatusChange(listing.id, 'closed'); }}
                                    className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center transition-all active:scale-90"
                                >
                                    <Archive size={18} />
                                </button>
                             )}
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(listing.id); }}
                                className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center transition-all active:scale-90"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <a href={`tel:${listing.contactPhone}`} onClick={(e) => e.stopPropagation()} 
                               className="h-10 px-4 rounded-xl bg-slate-950 text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                                <Phone size={14} strokeWidth={3} />
                                <span className="text-[11px] font-black uppercase tracking-wider">{t('btn_call')}</span>
                            </a>
                            {listing.telegramHandle && (
                                <a href={`https://t.me/${listing.telegramHandle}`} target="_blank" onClick={(e) => e.stopPropagation()} 
                                   className="h-10 w-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                                    <Send size={16} className="-ml-0.5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
