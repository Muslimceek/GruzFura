import React, { useState, useEffect } from 'react';
import { TruckType, Currency } from '../types';
import { X, Check, Truck, Package, Phone, Send, ChevronLeft, Zap, User, DollarSign, Sparkles, Loader2, MapPin, Navigation, Calendar, Box, BrainCircuit, ExternalLink } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { analyzeRouteWithAI, getDeepLogisticsAnalysis } from '../lib/gemini';

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
  const [isDeepMode, setIsDeepMode] = useState(false);
  
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
  const [citations, setCitations] = useState<string | null>(null);
  
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
      setCitations(null);
      
      let result;
      const details = type === 'cargo' ? `Груз: ${selectedTruckTypes.join(', ')}` : `Машина: ${selectedTruckTypes.join(', ')}`;
      
      if (isDeepMode) {
          const query = `Проведи глубокий логистический анализ маршрута из ${fromCity} в ${toCity} для ${type === 'truck' ? 'фуры' : 'груза'}. Учти текущие очереди на границах, стоимость дизеля и возможные обратки.`;
          const deepResult = await getDeepLogisticsAnalysis(query);
          result = { text: deepResult, citations: null };
      } else {
          result = await analyzeRouteWithAI(fromCity, toCity, type, details);
      }
      
      setAiAdvice(result.text || null);
      if (result.citations) setCitations(result.citations);
      
      setIsAnalyzing(false);
      
      if (result.text) {
          setComment(prev => (prev ? prev + '\n\n' : '') + `🤖 AI Info: ${result.text}`);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());

    const now = Date.now();
    data.status = 'active';
    data.updatedAt = now;
    data.expiresAt = now + (3 * 24 * 60 * 60 * 1000); 

    data.urgent = isUrgent;
    data.kind = type;
    data.telegramHandle = telegram || null;
    data.comment = comment; 
    
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

  const gradientBg = type === 'truck' ? 'from-[#1565D8] to-[#0B2136]' : 'from-[#FF7A59] to-[#0B2136]';
  const ringColor = type === 'truck' ? 'focus:ring-blue-200' : 'focus:ring-orange-200';

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center transition-all duration-500 ${isVisible ? 'bg-[#0B2136]/60 backdrop-blur-xl' : 'bg-transparent pointer-events-none'}`}>
      
      <div className={`w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-[2.5rem] bg-[#FAFAFA] flex flex-col relative overflow-hidden shadow-2xl transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 sm:translate-y-12 sm:scale-95'}`}>
        
        {/* === HEADER === */}
        <div className="shrink-0 px-6 pt-safe-top pb-4 bg-white/80 backdrop-blur-xl z-20 flex flex-col gap-4 border-b border-slate-200/50 sticky top-0">
            <div className="flex items-center justify-between pt-4">
                <button onClick={handleClose} type="button" className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <ChevronLeft size={24} className="sm:hidden" />
                    <X size={20} className="hidden sm:block" />
                </button>
                
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
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0B2136] text-white text-[10px] font-bold">1</span>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_route')}</h4>
                         </div>
                    </div>
                    
                    <div className="bg-white p-2 rounded-[2.5rem] shadow-glass border border-slate-100 relative overflow-hidden">
                        <div className="absolute left-[2.25rem] top-12 bottom-12 w-[2px] bg-gradient-to-b from-[#1565D8]/20 to-[#FF7A59]/20 rounded-full" />
                        <div className="relative p-2">
                             <input 
                                name="fromCity" 
                                value={fromCity} 
                                onChange={(e) => setFromCity(e.target.value)} 
                                required type="text" placeholder={t('placeholder_from_form')} 
                                className="w-full pl-16 pr-4 py-5 bg-transparent text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none rounded-xl focus:bg-slate-50 transition-colors" 
                             />
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                <MapPin size={18} />
                             </div>
                        </div>
                        <div className="h-[1px] bg-slate-100 mx-16" />
                        <div className="relative p-2">
                             <input 
                                name="toCity" 
                                value={toCity} 
                                onChange={(e) => setToCity(e.target.value)}
                                required type="text" placeholder={t('placeholder_to_form')} 
                                className="w-full pl-16 pr-4 py-5 bg-transparent text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none rounded-xl focus:bg-slate-50 transition-colors" 
                             />
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                                <Navigation size={18} />
                             </div>
                        </div>
                    </div>

                    {/* AI Logic Container */}
                    <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                             <button 
                                type="button" 
                                onClick={() => setIsDeepMode(!isDeepMode)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${isDeepMode ? 'bg-[#0B2136] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                             >
                                <BrainCircuit size={14} />
                                {isDeepMode ? 'Глубокий анализ (Thinking Mode)' : 'Стандартный анализ'}
                             </button>
                             
                             <button 
                                type="button" 
                                onClick={handleAIAnalysis}
                                disabled={isAnalyzing || !fromCity || !toCity}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-xs font-black shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                <span>{t('btn_ai_analyze')}</span>
                            </button>
                        </div>

                        {aiAdvice && (
                            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm font-bold text-indigo-900 leading-relaxed whitespace-pre-wrap">{aiAdvice}</p>
                                {citations && (
                                    <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center gap-2">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Источники:</span>
                                        <div className="text-[10px] text-indigo-500 flex items-center gap-1" dangerouslySetInnerHTML={{ __html: citations }} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Date Picker */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                         {['Сегодня', 'Завтра', 'В ближайшее время'].map((d) => (
                             <label key={d} className="relative cursor-pointer group shrink-0">
                                 <input type="radio" name="date" value={d} defaultChecked={d === 'Сегодня'} className="peer sr-only" />
                                 <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-bold text-sm transition-all duration-300 peer-checked:bg-[#0B2136] peer-checked:text-white peer-checked:border-[#0B2136] peer-checked:shadow-lg group-hover:border-slate-300">
                                     <div className="flex items-center gap-2">
                                        <Calendar size={14} className="opacity-70" />
                                        {d === 'Сегодня' ? t('date_today') : d === 'Завтра' ? t('date_tomorrow') : t('date_soon')}
                                     </div>
                                 </div>
                             </label>
                         ))}
                         <button 
                            type="button"
                            onClick={() => setIsUrgent(!isUrgent)}
                            className={`ml-auto shrink-0 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all border ${isUrgent ? 'bg-red-500 text-white border-red-500 shadow-lg' : 'bg-white text-slate-400 border-slate-200'}`}
                         >
                            <Zap size={16} fill={isUrgent ? "currentColor" : "none"} />
                            <span>{t('urgent_header')}</span>
                         </button>
                    </div>
               </section>

               {/* 2. Specific Details */}
               {type === 'cargo' ? (
                   <section className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0B2136] text-white text-[10px] font-bold">2</span>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_cargo')}</h4>
                        </div>
                        <div className="bg-white rounded-[2rem] p-6 shadow-glass border border-slate-100 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Что везем?</label>
                                <input name="cargoType" type="text" required placeholder={t('placeholder_what_cargo')} className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="weight" type="number" step="0.1" required placeholder={t('label_weight_input')} className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all" />
                                <input name="volume" type="number" step="0.1" placeholder={t('label_volume_input')} className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all" />
                            </div>
                        </div>
                   </section>
               ) : (
                   <section className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0B2136] text-white text-[10px] font-bold">2</span>
                             <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_transport')}</h4>
                        </div>
                        <div className="bg-white rounded-[2rem] p-6 shadow-glass border border-slate-100 space-y-4">
                             <select name="truckType" className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200">
                                {Object.values(TruckType).map(t => <option key={t} value={t}>{getTranslatedType(t)}</option>)}
                             </select>
                             <input name="capacity" type="number" step="0.5" required placeholder={t('label_capacity')} className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200" />
                        </div>
                   </section>
               )}

               {/* Final Publish */}
               <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
                   <textarea name="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder={t('placeholder_comment')} className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none resize-none p-2" />
               </div>
           </form>
        </div>

        {/* === FOOTER === */}
        <div className="shrink-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 pb-safe-bottom z-20">
             <button form="create-form" type="submit" 
                className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 bg-gradient-to-r ${gradientBg}`}>
                {t('btn_publish')}
             </button>
        </div>
      </div>
    </div>
  );
};