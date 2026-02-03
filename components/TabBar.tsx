import React, { useState, useEffect } from 'react';
import { LayoutGrid, Truck, Package, User, Plus, X, Search } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { ViewState } from '../types';

interface TabBarProps {
    view: ViewState;
    setView: (view: ViewState) => void;
    onStartCreate: (type: 'truck' | 'cargo') => void;
}

export const TabBar: React.FC<TabBarProps> = ({ view, setView, onStartCreate }) => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-close menu on view change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [view]);

  // Satellite Button Component
  const SatelliteAction = ({ 
    type, 
    icon: Icon, 
    label, 
    colorClass, 
    delay 
  }: { 
    type: 'truck' | 'cargo'; 
    icon: any; 
    label: string; 
    colorClass: string;
    delay: string;
  }) => (
    <div 
        className={`flex flex-col items-center gap-2 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`} 
        style={{ transitionDelay: isMenuOpen ? delay : '0ms' }}
    >
        <button 
            onClick={() => { onStartCreate(type); setIsMenuOpen(false); }}
            className={`w-16 h-16 rounded-[1.25rem] ${colorClass} text-white shadow-xl flex items-center justify-center border border-white/20 relative group overflow-hidden active:scale-90 transition-transform duration-200`}
        >
            {/* Inner Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon size={28} strokeWidth={2} className="relative z-10" />
        </button>
        <span className="text-xs font-bold text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/50">
            {label}
        </span>
    </div>
  );

  // Nav Item Component
  const NavItem = ({ target, icon: Icon, label }: { target: ViewState; icon: any; label?: string }) => {
      const isActive = view === target;
      return (
        <button 
            onClick={() => { setView(target); setIsMenuOpen(false); }} 
            className="group relative flex flex-col items-center justify-center w-full h-full"
        >
            {/* Active Light Pill Background */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-10 rounded-xl transition-all duration-500 ease-out 
                ${isActive ? 'bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
            />
            
            <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : 'group-active:scale-90'}`}>
                <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} 
                />
            </div>
            
            {/* Active Dot Indicator */}
            <div className={`absolute bottom-3 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-500 
                ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-0'}`} 
            />
        </button>
      );
  };

  return (
    <>
        {/* === BACKDROP BLUR === */}
        <div 
            className={`fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-md transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
            onClick={() => setIsMenuOpen(false)}
        />

        {/* === SATELLITE ACTIONS (Pop-up Menu) === */}
        <div className="fixed bottom-28 left-0 right-0 z-[85] flex justify-center gap-8 pointer-events-none">
             <div className="pointer-events-auto flex gap-6">
                 <SatelliteAction 
                    type="truck" 
                    icon={Truck} 
                    label={t('app_title_2')} 
                    colorClass="bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/30"
                    delay="0ms"
                 />
                 <SatelliteAction 
                    type="cargo" 
                    icon={Package} 
                    label={t('app_title_1')} 
                    colorClass="bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30"
                    delay="50ms"
                 />
             </div>
        </div>

        {/* === LEVITATING DOCK === */}
        <div className="fixed bottom-6 left-4 right-4 z-[90] h-[4.5rem]">
            {/* Main Glass Capsule */}
            <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-2xl rounded-[1.75rem] border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center px-1 overflow-hidden">
                
                {/* Internal Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

                {/* Left Group */}
                <div className="flex-1 grid grid-cols-2 h-full">
                    <NavItem target="HOME" icon={LayoutGrid} />
                    <NavItem target="SEARCH_TRUCK" icon={Truck} />
                </div>

                {/* Spacer for Center Button */}
                <div className="w-[4.5rem]" />

                {/* Right Group */}
                <div className="flex-1 grid grid-cols-2 h-full">
                    <NavItem target="SEARCH_CARGO" icon={Package} />
                    <NavItem target="PROFILE" icon={User} />
                </div>
            </div>

            {/* === CENTRAL ACTION BUTTON (Floating) === */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`relative w-[3.75rem] h-[3.75rem] rounded-[1.25rem] flex items-center justify-center transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_8px_20px_rgba(0,0,0,0.4)]
                        ${isMenuOpen 
                            ? 'bg-slate-800 rotate-90 scale-90' 
                            : 'bg-gradient-to-br from-[#2F54EB] to-[#722ED1] hover:scale-110 active:scale-95'}`
                    }
                >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 rounded-[1.25rem] bg-inherit blur-lg opacity-40 transition-opacity duration-500 ${isMenuOpen ? 'opacity-0' : 'opacity-60'}`} />
                    
                    {/* Icon Transition */}
                    <div className="relative z-10 text-white">
                        {isMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Plus size={28} strokeWidth={3} />}
                    </div>
                </button>
            </div>
        </div>
    </>
  );
};