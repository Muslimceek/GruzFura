import React, { useState, useEffect } from 'react';
import { TruckType, Currency } from '../types';
import { X, Check, Truck, Package, Phone, Send, ChevronLeft, Zap, User, DollarSign, Sparkles, Loader2, MapPin, Navigation, Calendar, Box, Weight, Ruler } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { analyzeRouteWithAI } from '../lib/gemini';

interface CreateFormProps {
  initialType: 'truck' | 'cargo';
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CARGO_TRUCK_OPTIONS = ['Тент', 'Реф', 'Мега', 'Площадка', 'Контейнер', 'Бензовоз'];
const ADDITIONAL_TAGS = ['paravoz', 'tyagach', 'dogruz'];

const getPriceTemplates = (currency: Currency) => {
    switch (currency) {
        case 'UZS': return [1000000, 2000000, 5000000, 10000000];
        case 'RUB': return [10000, 30000, 50000, 100000];
        case 'USD': return [500, 1000, 2000, 5000];
        case 'EUR': return [500, 1000, 2000, 5000];
        default: return [100, 500, 1000, 5000];
    }
};

export const CreateForm: React.FC<CreateFormProps> = ({ initialType, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const [type, setType] = useState<'truck' | 'cargo'>(initialType);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  
  // Price Logic
  const [currency, setCurrency] = useState<Currency>('UZS');
  const [price, setPrice] = useState<string>('');
  
  // Telegram Logic
  const [telegram, setTelegram] = useState('');
  
  // New Cargo States
  const [selectedTruckTypes, setSelectedTruckTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasPrepayment, setHasPrepayment] = useState(false);

  // Form Fields State for AI Access
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [comment, setComment] = useState('');
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const applyPriceTemplate = (val: number) => setPrice(val.toString());
  
  const getTranslatedType = (typeStr: string) => {
    return t(`type_${typeStr}` as any) || typeStr;
  };

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      val = val.replace('https://t.me/', '').replace('@', '').replace('/', '');
      setTelegram(val);
  };

  const toggleTruckType = (tt: string) => {
    if (selectedTruckTypes.includes(tt)) setSelectedTruckTypes(prev => prev.filter(t => t !== tt));
    else setSelectedTruckTypes(prev => [...prev, tt]);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) setSelectedTags(prev => prev.filter(t => t !== tag));
    else setSelectedTags(prev => [...prev, tag]);
  };

  const handleAIAnalysis = async () => {
      if (!fromCity || !toCity) return;
      setIsAnalyzing(true);
      setAiAdvice(null);
      
      const details = type === 'cargo' ? `Груз: ${selectedTruckTypes.join(', ')}` : `Машина: ${selectedTruckTypes.join(', ')}`;
      const result = await analyzeRouteWithAI(fromCity, toCity, type, details);
      
      setAiAdvice(result ?? null);
      setIsAnalyzing(false);
      
      // Auto-append to comment if successful
      if (result) {
          setComment(prev => (prev ? prev + '\n\n' : '') + `🤖 AI Инфо: ${result}`);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());

    // Lifecycle defaults
    const now = Date.now();
    data.status = 'active';
    data.updatedAt = now;
    data.expiresAt = now + (3 * 24 * 60 * 60 * 1000); // 3 days expiry by default

    data.urgent = isUrgent;
    data.kind = type;
    data.telegramHandle = telegram || null;
    data.comment = comment; // Use controlled state
    
    if (type === 'truck') {
      data.isEmpty = isEmpty;
      data.capacity = Number(data.capacity);
    } else {
      data.weight = Number(data.weight);
      data.volume = data.volume ? Number(data.volume) : null;
      data.price = price ? Number(price) : null;
      data.currency = currency;
      data.neededTruckTypes = selectedTruckTypes;
      data.tags = selectedTags;
      data.hasPrepayment = hasPrepayment;
    }
    
    onSubmit(data);
  };

  // Dynamic Theme Colors based on Type
  const themeColor = type === 'truck' ? 'blue' : 'orange';
  const gradientText = type === 'truck' ? 'text-blue-600' : 'text-orange-600';
  const gradientBg = type === 'truck' ? 'from-blue-600 to-indigo-600' : 'from-orange-500 to-red-500';
  const ringColor = type === 'truck' ? 'focus:ring-blue-200' : 'focus:ring-orange-200';

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center transition-all duration-500 ${isVisible ? 'bg-[#0f172a]/40 backdrop-blur-md' : 'bg-transparent pointer-events-none'}`}>
      
      <div className={`w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-[2.5rem] bg-[#FAFAFA] flex flex-col relative overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 sm:translate-y-12 sm:scale-95'}`}>
        
        {/* === HEADER === */}
        <div className="shrink-0 px-6 pt-safe-top pb-4 bg-white/80 backdrop-blur-xl z-20 flex flex-col gap-4 border-b border-slate-200/50 sticky top-0">
            {/* Nav Bar */}
            <div className="flex items-center justify-between pt-4">
                <button onClick={handleClose} type="button" className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 active:scale-90 transition-all hover:bg-slate-100">
                    <ChevronLeft size={24} className="sm:hidden" strokeWidth={2.5} />
                    <X size={20} className="hidden sm:block" strokeWidth={2.5} />
                </button>
                
                {/* Modern Switcher */}
                <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50 relative">
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-slate-200/50 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${type === 'truck' ? 'left-1' : 'left-[calc(50%+0px)]'}`} />
                    <button onClick={() => setType('truck')} className={`relative z-10 px-6 py-2 text-sm font-bold transition-colors duration-300 ${type === 'truck' ? 'text-slate-900' : 'text-slate-400'}`}>
                        {t('app_title_2')}
                    </button>
                    <button onClick={() => setType('cargo')} className={`relative z-10 px-6 py-2 text-sm font-bold transition-colors duration-300 ${type === 'cargo' ? 'text-slate-900' : 'text-slate-400'}`}>
                        {t('app_title_1')}
                    </button>
                </div>

                <div className="w-11"></div> 
            </div>
        </div>

        {/* === SCROLL CONTENT === */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 space-y-8 bg-[#FAFAFA]">
           <form id="create-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
               
               {/* 1. Route Section */}
               <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                         <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">1</span>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_route')}</h4>
                         </div>
                         {/* AI Logic */}
                         {fromCity && toCity && (
                            <button 
                                type="button" 
                                onClick={handleAIAnalysis}
                                disabled={isAnalyzing}
                                className="group flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full text-white text-[11px] font-bold shadow-lg shadow-fuchsia-500/30 active:scale-95 transition-all hover:shadow-fuchsia-500/50"
                            >
                                {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />}
                                <span>{t('btn_ai_analyze')}</span>
                            </button>
                        )}
                    </div>
                    
                    <div className="bg-white p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group-hover:border-slate-200 transition-colors">
                        {/* Decorative Line */}
                        <div className="absolute left-[2.25rem] top-12 bottom-12 w-[2px] bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-full pointer-events-none" />

                        <div className="relative group/input p-2">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm ring-4 ring-white transition-transform group-focus-within/input:scale-110 group-focus-within/input:bg-blue-600 group-focus-within/input:text-white">
                                 <MapPin size={18} strokeWidth={2.5} />
                             </div>
                             <input 
                                name="fromCity" 
                                value={fromCity} 
                                onChange={(e) => setFromCity(e.target.value)} 
                                required type="text" placeholder={t('placeholder_from_form')} 
                                className="w-full pl-16 pr-4 py-5 bg-transparent text-lg font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium outline-none rounded-xl transition-all focus:bg-slate-50" 
                             />
                        </div>

                        <div className="h-[1px] bg-slate-100 mx-16" />

                        <div className="relative group/input p-2">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm ring-4 ring-white transition-transform group-focus-within/input:scale-110 group-focus-within/input:bg-purple-600 group-focus-within/input:text-white">
                                 <Navigation size={18} strokeWidth={2.5} />
                             </div>
                             <input 
                                name="toCity" 
                                value={toCity} 
                                onChange={(e) => setToCity(e.target.value)}
                                required type="text" placeholder={t('placeholder_to_form')} 
                                className="w-full pl-16 pr-4 py-5 bg-transparent text-lg font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium outline-none rounded-xl transition-all focus:bg-slate-50" 
                             />
                        </div>
                    </div>

                    {/* AI Result Card */}
                    {aiAdvice && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 rounded-[1.5rem] border border-violet-100 animate-in fade-in slide-in-from-top-4">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/40 to-transparent rounded-bl-full pointer-events-none" />
                             <div className="flex items-start gap-3 relative z-10">
                                 <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-violet-600 shrink-0">
                                     <Sparkles size={16} />
                                 </div>
                                 <div>
                                     <h5 className="font-bold text-violet-900 text-sm mb-1">AI Logistics Insight</h5>
                                     <p className="text-sm font-medium text-violet-800/80 leading-relaxed whitespace-pre-wrap">{aiAdvice}</p>
                                 </div>
                             </div>
                        </div>
                    )}
                    
                    {/* Date Picker (Horizontal) */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                         {['Сегодня', 'Завтра', 'В ближайшее время'].map((d) => (
                             <label key={d} className="relative cursor-pointer group shrink-0">
                                 <input type="radio" name="date" value={d} defaultChecked={d === 'Сегодня'} className="peer sr-only" />
                                 <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-bold text-sm transition-all duration-300 
                                    peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 peer-checked:shadow-lg
                                    group-hover:border-slate-300
                                 ">
                                     <div className="flex items-center gap-2">
                                        <Calendar size={14} className="opacity-70" />
                                        {d === 'Сегодня' ? t('date_today') : d === 'Завтра' ? t('date_tomorrow') : t('date_soon')}
                                     </div>
                                 </div>
                             </label>
                         ))}
                         {/* Urgent Toggle in Line */}
                         <button 
                            type="button"
                            onClick={() => setIsUrgent(!isUrgent)}
                            className={`ml-auto shrink-0 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all duration-300 active:scale-95 border
                                ${isUrgent 
                                    ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-red-200 hover:text-red-400'}`}
                         >
                            <Zap size={16} fill={isUrgent ? "currentColor" : "none"} />
                            <span>{t('urgent_header')}</span>
                         </button>
                    </div>
               </section>

               {/* 2. Type Specific Details */}
               {type === 'cargo' ? (
                   <>
                       <section className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">2</span>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_cargo')}</h4>
                            </div>
                            
                            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Что везем?</label>
                                    <div className="relative">
                                        <input name="cargoType" type="text" required placeholder={t('placeholder_what_cargo')} 
                                            className={`w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 ${ringColor} transition-all`} />
                                        <Package className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">{t('label_weight_input')}</label>
                                        <div className="relative group">
                                            <input name="weight" type="number" step="0.1" required placeholder="0" 
                                                className={`w-full bg-slate-50 rounded-2xl pl-5 pr-12 py-4 font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 ${ringColor} transition-all`} />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm">т</span>
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">{t('label_volume_input')}</label>
                                        <div className="relative group">
                                            <input name="volume" type="number" step="0.1" placeholder="0" 
                                                className={`w-full bg-slate-50 rounded-2xl pl-5 pr-12 py-4 font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 ${ringColor} transition-all`} />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm">м³</span>
                                        </div>
                                     </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">{t('block_transport')}</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {CARGO_TRUCK_OPTIONS.map((opt) => (
                                        <button key={opt} type="button" onClick={() => toggleTruckType(opt)}
                                            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 active:scale-95 border
                                                ${selectedTruckTypes.includes(opt) 
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                                            {getTranslatedType(opt)}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                     {ADDITIONAL_TAGS.map((tag) => (
                                        <button key={tag} type="button" onClick={() => toggleTag(tag)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border
                                                ${selectedTags.includes(tag) 
                                                ? 'bg-amber-100 text-amber-900 border-amber-200' 
                                                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-white hover:border-slate-200'}`}>
                                            {selectedTags.includes(tag) && <Check size={12} strokeWidth={3} />}
                                            {t(`tag_${tag}` as any)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                       </section>

                       <section className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">3</span>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_conditions')}</h4>
                            </div>

                            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 relative group">
                                        <div className={`absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-slate-50 border-r border-slate-100 text-lg font-bold ${gradientText} group-focus-within:bg-white group-focus-within:shadow-sm transition-all`}>
                                            {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : 'UZS'}
                                        </div>
                                        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="0" 
                                            className={`w-full bg-slate-50 rounded-2xl pl-16 pr-4 py-5 text-2xl font-black text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 ${ringColor} transition-all`} />
                                    </div>
                                    <div className="relative h-full w-24">
                                        <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} 
                                            className="w-full h-full bg-slate-50 rounded-2xl px-3 py-5 font-bold text-sm text-slate-600 outline-none focus:ring-2 focus:ring-slate-200 appearance-none text-center cursor-pointer hover:bg-slate-100 transition-colors">
                                            <option value="UZS">UZS</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="RUB">RUB</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
                                     {getPriceTemplates(currency).map((val) => (
                                         <button key={val} type="button" onClick={() => applyPriceTemplate(val)} 
                                            className="shrink-0 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all">
                                             {val.toLocaleString()}
                                         </button>
                                     ))}
                                </div>
                                <button type="button" onClick={() => setHasPrepayment(!hasPrepayment)} 
                                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${hasPrepayment ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${hasPrepayment ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                                            <DollarSign size={20} strokeWidth={3} />
                                        </div>
                                        <span className={`text-sm font-bold ${hasPrepayment ? 'text-emerald-900' : 'text-slate-500'}`}>{t('label_prepayment')}</span>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${hasPrepayment ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                         <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${hasPrepayment ? 'translate-x-5' : ''}`} />
                                    </div>
                                </button>
                            </div>
                       </section>
                   </>
               ) : (
                   <section className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">2</span>
                             <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_transport')}</h4>
                        </div>

                        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Тип кузова</label>
                                   <div className="relative">
                                      <select name="truckType" className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 appearance-none transition-all">
                                            {Object.values(TruckType).map(t => (
                                                <option key={t} value={t}>{getTranslatedType(t)}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <Truck size={16} />
                                        </div>
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">{t('label_capacity')}</label>
                                   <div className="relative">
                                       <input name="capacity" type="number" step="0.5" required placeholder="0" 
                                           className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
                                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm">т</span>
                                   </div>
                                </div>
                            </div>
                            
                            <button type="button" onClick={() => setIsEmpty(!isEmpty)} 
                                className={`w-full py-4 px-5 rounded-2xl flex items-center justify-between border transition-all duration-300 active:scale-[0.99] group ${isEmpty ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' : 'border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isEmpty ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 border border-slate-200'}`}>
                                        <Check size={24} strokeWidth={3} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold text-sm ${isEmpty ? 'text-emerald-900' : 'text-slate-600'}`}>{t('toggle_empty')}</div>
                                        <div className="text-[10px] font-medium text-slate-400">Готов к загрузке</div>
                                    </div>
                                </div>
                                {isEmpty && <span className="text-[10px] font-black text-emerald-600 bg-white px-2 py-1 rounded-md shadow-sm uppercase tracking-widest">ON</span>}
                            </button>
                        </div>
                   </section>
               )}

               {/* 4. Contact Section */}
               <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">{type === 'cargo' ? '4' : '3'}</span>
                         <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_contact')}</h4>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative group">
                                 <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-slate-50 border-r border-slate-100 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 transition-colors">
                                     <Phone size={20} />
                                 </div>
                                 <input name="contactPhone" required type="tel" placeholder={t('placeholder_phone')} 
                                    className="w-full pl-16 pr-4 py-4 bg-slate-50/50 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" />
                            </div>
                            <div className="relative group">
                                 <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-slate-50 border-r border-slate-100 group-focus-within:bg-sky-50 group-focus-within:text-sky-500 transition-colors">
                                     <Send size={20} />
                                 </div>
                                 <input value={telegram} onChange={handleTelegramChange} type="text" placeholder={t('placeholder_telegram')} 
                                    className="w-full pl-16 pr-4 py-4 bg-slate-50/50 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all" />
                            </div>
                            <div className="relative group">
                                 <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl bg-slate-50 border-r border-slate-100 group-focus-within:bg-slate-100 group-focus-within:text-slate-900 transition-colors">
                                     <User size={20} />
                                 </div>
                                 <input name="contactName" required type="text" placeholder={t('placeholder_name')} 
                                    className="w-full pl-16 pr-4 py-4 bg-slate-50/50 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" />
                            </div>
                        </div>
                    </div>
               </section>
               
               {/* 5. Comment */}
               <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                   <textarea 
                        name="comment" 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3} 
                        placeholder={t('placeholder_comment')} 
                        className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none resize-none p-2" 
                   />
               </div>

               <div className="h-12"></div>
           </form>
        </div>

        {/* === FOOTER === */}
        <div className="shrink-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 pb-safe-bottom z-20">
             <button form="create-form" type="submit" 
                className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group bg-gradient-to-r ${gradientBg}`}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center gap-3">
                    {type === 'truck' ? <Truck size={24} /> : <Package size={24} />}
                    {t('btn_publish')}
                </div>
             </button>
        </div>

      </div>
    </div>
  );
};