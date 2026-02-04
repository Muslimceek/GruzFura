

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Truck, Package, Phone, Send, MapPin, Navigation, 
  Sparkles, Loader2, Scale, 
  Box, CreditCard, Camera, Info, AlertCircle, ChevronRight, User,
  CheckCircle2, Zap, ShieldCheck, TrendingUp, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { analyzeWithSearch, analyzeLogisticImage, suggestCities } from '../lib/gemini';
import { TruckType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type ListingType = 'truck' | 'cargo';
type UrgencyLevel = 'urgent' | 'today' | 'tomorrow' | 'planned';
type LoadingMethod = 'top' | 'side' | 'back' | 'full';

interface CreateFormProps {
  initialType: ListingType;
  initialData?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

// --- Sub-components ---

const SmartField = ({ 
  label, 
  icon: Icon, 
  error, 
  children, 
  className,
  isOptional = false,
  isValid = false
}: { 
  label: string; 
  icon: any; 
  error?: string | null; 
  hint?: string | null; 
  children?: React.ReactNode; 
  className?: string;
  isOptional?: boolean;
  isValid?: boolean;
}) => (
  <div className={cn("space-y-1.5 w-full", className)}>
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5">
        <Icon size={14} className={cn("transition-colors", error ? "text-red-500" : isValid ? "text-emerald-500" : "text-slate-400")} />
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
        {isOptional && <span className="text-[9px] font-bold text-slate-300 lowercase">(opt)</span>}
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.span 
            initial={{ opacity: 0, x: 5 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -5 }}
            className="text-[10px] font-bold text-red-500 flex items-center gap-1"
          >
            <AlertCircle size={10} /> {error}
          </motion.span>
        ) : isValid && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="text-emerald-500"
          >
            <CheckCircle2 size={12} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
    <div className="relative group">
      {children}
    </div>
  </div>
);

const SuggestionBox = ({ 
  suggestions, 
  onSelect, 
  isLoading 
}: { 
  suggestions: string[], 
  onSelect: (val: string) => void,
  isLoading?: boolean 
}) => {
  if (!isLoading && suggestions.length === 0) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto"
    >
      {isLoading ? (
        <div className="p-4 flex items-center gap-3 text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">AI...</span>
        </div>
      ) : (
        suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(s)}
            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-2"
          >
            <MapPin size={12} className="text-slate-300" />
            {s}
          </button>
        ))
      )}
    </motion.div>
  );
};

const SegmentedControl = ({ 
  selected, 
  onChange 
}: { 
  selected: ListingType; 
  onChange: (val: ListingType) => void 
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-slate-100/60 p-1.5 rounded-[1.5rem] flex relative isolate">
      {(['cargo', 'truck'] as const).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            "relative flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-500 z-10 flex items-center justify-center gap-2",
            selected === type ? "text-[#0B2136]" : "text-slate-400 hover:text-slate-500"
          )}
        >
          {type === 'cargo' ? <Package size={16} /> : <Truck size={16} />}
          {type === 'cargo' ? t('app_title_1') : t('app_title_2')}
          {selected === type && (
            <motion.div
              layoutId="segment-bg"
              className="absolute inset-0 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-200/50 -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

// --- Main Form Component ---

export const CreateForm: React.FC<CreateFormProps> = ({ initialType, initialData, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [type, setType] = useState<ListingType>(initialType);
  const [urgency, setUrgency] = useState<UrgencyLevel>(initialData?.urgency || 'today');
  
  // Form Values
  const [fromCity, setFromCity] = useState(initialData?.fromCity || '');
  const [toCity, setToCity] = useState(initialData?.toCity || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  
  const [cargoType, setCargoType] = useState(initialData?.cargoType || '');
  const [weight, setWeight] = useState(initialData?.weight?.toString() || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [currency] = useState(initialData?.currency || 'UZS');
  const [hasPrepayment] = useState(initialData?.hasPrepayment || false);

  const [truckType, setTruckType] = useState<TruckType>(initialData?.truckType || TruckType.TENT);
  const [capacity, setCapacity] = useState(initialData?.capacity?.toString() || '');
  const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>(initialData?.loadingMethod || 'back');
  
  const [contactName, setContactName] = useState(initialData?.contactName || '');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '');
  const [telegram, setTelegram] = useState(initialData?.telegramHandle || '');

  const [hasAdr] = useState(initialData?.hasAdr || false);
  const [hasTir] = useState(initialData?.hasTir || false);
  const [tempRegime] = useState(initialData?.tempRegime || '');

  // Validation & Suggestions
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(false);

  // AI State
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // AI Hint mapping
  const smartHint = useMemo(() => {
    if (!focusedField) return null;
    if (focusedField === 'fromCity' || focusedField === 'toCity') return t('placeholder_from_form');
    if (focusedField === 'weight') return "Standard load: 20-22t";
    if (focusedField === 'price') return "Enter market rate for faster matching";
    return null;
  }, [focusedField, t]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if ((focusedField === 'fromCity' && fromCity.length >= 2) || (focusedField === 'toCity' && toCity.length >= 2)) {
        setIsCityLoading(true);
        const input = focusedField === 'fromCity' ? fromCity : toCity;
        const suggested = await suggestCities(input);
        setCitySuggestions(suggested);
        setIsCityLoading(false);
      } else {
        setCitySuggestions([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [fromCity, toCity, focusedField]);

  const handleAIAnalysis = async () => {
    if (!fromCity || !toCity) return;
    try {
      const prompt = `Logistics analysis for ${fromCity} to ${toCity}, type: ${type}. Brief advice on pricing and border conditions in ${t('app_title_1') === 'Yuk' ? 'Uzbek' : 'Russian'}.`;
      const result = await analyzeWithSearch(prompt);
      setAiAdvice(result.text);
    } catch (e) { console.error(e); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const text = await analyzeLogisticImage(base64, file.type);
        setComment((prev: string) => prev + '\n[AI SCAN]: ' + text);
      } catch (err) { console.error(err); }
      finally { setIsScanning(false); }
    };
    reader.readAsDataURL(file);
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      fromCity, toCity, date, kind: type,
      urgency, urgencyText: t(`urgency_${urgency}` as any),
      comment, contactName, contactPhone, telegramHandle: telegram,
      updatedAt: Date.now(),
      status: 'active',
      loadingMethod, hasAdr, hasTir, tempRegime
    };
    if (type === 'truck') {
      data.truckType = truckType;
      data.capacity = Number(capacity);
    } else {
      data.cargoType = cargoType;
      data.weight = Number(weight);
      data.price = Number(price);
      data.currency = currency;
      data.hasPrepayment = hasPrepayment;
    }
    onSubmit(data);
  };

  const inputBaseClasses = "w-full bg-slate-100/50 border border-slate-200/80 focus:bg-white focus:border-slate-900 focus:shadow-[0_8px_16px_rgba(0,0,0,0.03)] rounded-2xl px-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none transition-all duration-300";

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#0B2136]/70 backdrop-blur-xl p-0 sm:p-4"
    >
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#FAFAFA] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-[max(env(safe-area-inset-top),20px)] pb-5 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100"><X size={22} /></button>
            <div className="text-center">
              <h2 className="text-xl font-black text-[#0B2136] tracking-tight leading-none">{initialData ? t('form_edit_title') : t('form_new_title')}</h2>
              <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">Live Logistics OS</p>
            </div>
            <div className="w-11" />
          </div>
          <SegmentedControl selected={type} onChange={setType} />
        </div>

        {/* AI Bar */}
        <AnimatePresence>
          {smartHint && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#0B2136] overflow-hidden">
              <div className="px-6 py-2.5 flex items-center gap-3">
                <Zap size={14} className="text-blue-400 animate-pulse" />
                <p className="text-[11px] font-bold text-white/70 tracking-tight">{smartHint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-36">
          <form id="listing-form" onSubmit={validateAndSubmit} className="p-6 space-y-8">
            
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">1</div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_route')}</h3>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative space-y-6">
                <SmartField label={t('label_from')} icon={MapPin} isValid={fromCity.length > 2}>
                  <input value={fromCity} onChange={e => setFromCity(e.target.value)} onFocus={() => setFocusedField('fromCity')} onBlur={() => setTimeout(() => setFocusedField(null), 200)} className={cn(inputBaseClasses, "pl-12")} placeholder={t('placeholder_from_form')} required />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 opacity-40" size={18} />
                  {focusedField === 'fromCity' && <SuggestionBox suggestions={citySuggestions} onSelect={setFromCity} isLoading={isCityLoading} />}
                </SmartField>
                <SmartField label={t('label_to')} icon={Navigation} isValid={toCity.length > 2}>
                  <input value={toCity} onChange={e => setToCity(e.target.value)} onFocus={() => setFocusedField('toCity')} onBlur={() => setTimeout(() => setFocusedField(null), 200)} className={cn(inputBaseClasses, "pl-12")} placeholder={t('placeholder_to_form')} required />
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 opacity-40" size={18} />
                  {focusedField === 'toCity' && <SuggestionBox suggestions={citySuggestions} onSelect={setToCity} isLoading={isCityLoading} />}
                </SmartField>

                <div className="space-y-4">
                  <SmartField label={t('label_urgency_level')} icon={Scale}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['urgent', 'today', 'tomorrow', 'planned'] as UrgencyLevel[]).map(level => (
                        <button key={level} type="button" onClick={() => setUrgency(level)} className={cn("py-3 rounded-xl border text-[10px] font-black uppercase transition-all", urgency === level ? "bg-slate-950 text-white border-slate-950 shadow-md" : "bg-white border-slate-200 text-slate-400")}>
                          {t(`urgency_${level}` as any)}
                        </button>
                      ))}
                    </div>
                  </SmartField>
                </div>
              </div>
            </section>

            {/* AI Controls Restored */}
            <div className="flex gap-3 px-1 overflow-x-auto no-scrollbar">
              <button type="button" onClick={handleAIAnalysis} className="flex items-center gap-2 px-6 py-4 bg-slate-900 rounded-2xl text-white shadow-lg active:scale-95 transition-all whitespace-nowrap">
                <Sparkles size={16} className="text-blue-400" /> <span className="text-xs font-black uppercase tracking-wider">{t('btn_ai_analyze')}</span>
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 shadow-sm active:scale-95 transition-all whitespace-nowrap">
                <Camera size={16} className="text-slate-400" /> <span className="text-xs font-black uppercase tracking-wider">{t('ai_scan_doc')}</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <AnimatePresence>
              {aiAdvice && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 border-dashed">
                  <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={12}/> {t('ai_insight')}</h4>
                  <p className="text-xs text-blue-800 font-bold leading-relaxed italic">"{aiAdvice}"</p>
                </motion.div>
              )}
            </AnimatePresence>

            <section className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">2</div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{type === 'cargo' ? t('block_cargo') : t('block_transport')}</h3>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                {type === 'cargo' ? (
                  <>
                    <SmartField label={t('placeholder_what_cargo')} icon={Box}><input value={cargoType} onChange={e => setCargoType(e.target.value)} className={inputBaseClasses} placeholder={t('placeholder_what_cargo')} /></SmartField>
                    <div className="grid grid-cols-2 gap-4">
                      <SmartField label={t('label_weight_input')} icon={Scale}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputBaseClasses} placeholder="22" /></SmartField>
                      <SmartField label={t('price_rate')} icon={CreditCard}><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputBaseClasses} placeholder="1000" /></SmartField>
                    </div>
                  </>
                ) : (
                  <>
                    <SmartField label={t('block_transport')} icon={Truck}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.values(TruckType).map(tt => (
                          <button key={tt} type="button" onClick={() => setTruckType(tt)} className={cn("py-3 rounded-xl border text-[10px] font-black uppercase transition-all", truckType === tt ? "bg-slate-950 text-white border-slate-950" : "bg-white border-slate-200 text-slate-400")}>
                            {t(`type_${tt}` as any)}
                          </button>
                        ))}
                      </div>
                    </SmartField>
                    <div className="grid grid-cols-2 gap-4">
                      <SmartField label={t('label_capacity')} icon={Scale}><input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} className={inputBaseClasses} placeholder="22" /></SmartField>
                      <SmartField label={t('label_loading_method')} icon={Layers}>
                        <select value={loadingMethod} onChange={e => setLoadingMethod(e.target.value as LoadingMethod)} className={inputBaseClasses}>
                          {(['back', 'side', 'top', 'full'] as LoadingMethod[]).map(m => <option key={m} value={m}>{t(`loading_${m}` as any)}</option>)}
                        </select>
                      </SmartField>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">3</div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('block_contact')}</h3>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SmartField label={t('placeholder_name')} icon={User}><input value={contactName} onChange={e => setContactName(e.target.value)} className={inputBaseClasses} placeholder={t('placeholder_name')} /></SmartField>
                  <SmartField label={t('placeholder_phone')} icon={Phone}><input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className={inputBaseClasses} placeholder={t('placeholder_phone')} /></SmartField>
                </div>
                <SmartField label={t('placeholder_telegram')} icon={Send} isOptional>
                  <input value={telegram} onChange={e => setTelegram(e.target.value.replace('@',''))} className={cn(inputBaseClasses, "text-blue-500")} placeholder={t('placeholder_telegram')} />
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 opacity-50" size={18} fill="currentColor" />
                </SmartField>
              </div>
              <SmartField label={t('placeholder_comment')} icon={Info} isOptional>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={t('placeholder_comment')} rows={3} className={cn(inputBaseClasses, "resize-none h-24")} />
              </SmartField>
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-6 bg-white border-t border-slate-100">
           <div className="flex items-center gap-3 mb-4 opacity-60">
              <ShieldCheck size={16} /> <p className="text-[10px] font-bold leading-tight">{t('legal_confirm')}</p>
           </div>
           <button form="listing-form" type="submit" className={cn("w-full h-16 rounded-3xl font-black text-lg text-white shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all", type === 'truck' ? "bg-blue-600" : "bg-orange-600")}>
             {initialData ? t('btn_save') : t('btn_publish')} <ChevronRight size={20} />
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateForm;
