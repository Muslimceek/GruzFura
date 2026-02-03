
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Settings, LogOut, ChevronRight, Star, 
  ShieldCheck, Package, Clock, Zap, CheckCircle2, 
  Lock, LogIn, Edit3, Wallet, Globe, Bell, Moon,
  TrendingUp, Truck, MapPin, CreditCard, ChevronLeft,
  LayoutGrid, Share2, Award
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, LayoutGroup } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { Listing, ListingStatus } from '../types';
import { ListingCard } from '../components/ListingCard';
import { updateProfile } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProfileViewProps {
    currentUser: any;
    listings: Listing[];
    onDelete: (id: string) => void;
    onEdit: (listing: Listing) => void;
    onStatusChange?: (id: string, status: ListingStatus) => void;
    onLogout: () => void;
    onLoginRequest: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
    currentUser, listings, onDelete, onEdit, onStatusChange, onLogout, onLoginRequest 
}) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'posts' | 'history' | 'settings'>('posts');
    const [recentListings, setRecentListings] = useState<Listing[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newName, setNewName] = useState(currentUser?.displayName || '');
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollRef });
    
    // Parallax & Fade Effects for Hero Content
    const heroContentY = useTransform(scrollY, [0, 200], [0, 50]);
    const heroContentOpacity = useTransform(scrollY, [0, 150], [1, 0]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('gruzFura_recent');
            const recentIds: string[] = stored ? JSON.parse(stored) : [];
            if (recentIds.length > 0 && listings.length > 0) {
                const found = recentIds
                    .map(id => listings.find((l: Listing) => l.id === id))
                    .filter((l: Listing | undefined): l is Listing => l !== undefined);
                setRecentListings(found);
            }
        } catch (e) {
            console.error("Error loading history", e);
        }
    }, [listings]);

    const myListings = listings.filter(l => l.creatorId === currentUser?.uid);
    const closedCount = myListings.filter(l => l.status === 'closed').length;

    const handleSave = async () => {
        if (!currentUser || !newName.trim()) return;
        setIsSaving(true);
        try {
            await updateProfile(currentUser, { displayName: newName });
            setIsEditingProfile(false);
        } catch (error) { console.error(error); } 
        finally { setIsSaving(false); }
    };

    // --- Sub-Components ---

    const BentoItem = ({ children, className, delay = 0 }: any) => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
            className={cn(
                "bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-[1.5rem] p-4 flex flex-col justify-between relative overflow-hidden group",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {children}
        </motion.div>
    );

    const SettingsRow = ({ icon: Icon, label, action, color = "text-slate-600" }: any) => (
        <button onClick={action} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors", color)}>
                    <Icon size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:text-slate-500 transition-colors">
                 <ChevronRight size={16} />
            </div>
        </button>
    );

    // --- Guard State ---
    if (!currentUser || currentUser.isAnonymous) {
        return (
            <div className="h-full flex flex-col relative overflow-hidden bg-[#F2F3F5]">
                <div className="absolute top-0 inset-x-0 h-[60vh] bg-[#0F172A] rounded-b-[3rem]" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-white/50 text-center"
                    >
                        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#CCF381] to-[#a3e635] rounded-3xl flex items-center justify-center shadow-lg shadow-lime-500/20 mb-6 rotate-3">
                            <Lock size={32} className="text-[#0F172A]" />
                        </div>
                        <h2 className="text-2xl font-black text-[#0F172A] mb-3">{t('profile_protected_title')}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{t('profile_protected_desc')}</p>
                        <button onClick={onLoginRequest} className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                            {t('profile_login_btn')} <LogIn size={20} />
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#F2F3F5] overflow-y-auto no-scrollbar relative" ref={scrollRef}>
            
            {/* --- Hero Section (Compact & Collapsible) --- */}
            <div className="relative z-0 bg-[#0F172A] rounded-b-[3rem] shadow-sm overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-[#CCF381]/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 pointer-events-none" />

                <motion.div 
                    style={{ y: heroContentY, opacity: heroContentOpacity }}
                    className="relative flex flex-col items-center px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-24"
                >
                    {/* Header Row */}
                    <div className="w-full flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase">ID: {currentUser.uid.slice(0, 6)}</span>
                            <div className="flex items-center gap-1.5 text-[#CCF381]">
                                <Award size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Pro Member</span>
                            </div>
                        </div>
                        <button onClick={onLogout} className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors active:scale-95">
                            <LogOut size={16} />
                        </button>
                    </div>

                    {/* Avatar & Name - Compact */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-[1.8rem] p-[3px] bg-gradient-to-br from-slate-700 to-slate-800 shadow-2xl">
                                <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-[#1E293B]">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-slate-500"/></div>
                                    )}
                                </div>
                            </div>
                             <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#CCF381] rounded-xl flex items-center justify-center text-[#0F172A] shadow-lg active:scale-90 transition-transform z-20 border border-[#0F172A]">
                                 <Edit3 size={14} />
                             </button>
                        </div>

                        <div className="text-center">
                             {isEditingProfile ? (
                                <div className="flex items-center gap-2">
                                    <input value={newName} onChange={e => setNewName(e.target.value)} className="bg-white/10 text-white text-lg font-bold text-center rounded-xl py-1 px-3 outline-none border border-white/20 focus:border-[#CCF381] w-40" autoFocus />
                                    <button onClick={handleSave} className="w-9 h-9 bg-[#CCF381] rounded-lg flex items-center justify-center text-[#0F172A]">{isSaving ? <Zap size={16} className="animate-spin" /> : <CheckCircle2 size={18}/>}</button>
                                </div>
                            ) : (
                                <h1 className="text-2xl font-black text-white tracking-tight mb-0.5">{currentUser.displayName || t('guest_user')}</h1>
                            )}
                            <p className="text-slate-400 font-medium text-xs">{currentUser.email}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- Overlapping Body (Stats + Tabs + Content) --- */}
            <div className="relative z-10 px-4 -mt-16 pb-32">
                 {/* Bento Stats Grid - Overlaps Hero */}
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Trust Score Card */}
                    <BentoItem className="bg-[#CCF381] border-none shadow-xl shadow-lime-900/10 h-32" delay={0.1}>
                         <div className="flex justify-between items-start">
                             <div className="p-2 bg-[#0F172A]/10 rounded-xl"><Star size={18} className="text-[#0F172A]"/></div>
                             <div className="text-right">
                                 <span className="block text-[#0F172A] font-black text-3xl leading-none">5.0</span>
                             </div>
                         </div>
                         <div className="mt-auto">
                            <p className="text-[#0F172A]/70 text-[9px] font-black uppercase tracking-widest mb-1">Trust Score</p>
                            <div className="w-full h-1.5 bg-[#0F172A]/10 rounded-full overflow-hidden"><div className="w-[98%] h-full bg-[#0F172A]" /></div>
                         </div>
                    </BentoItem>

                    {/* Active/Deals */}
                    <div className="flex flex-col gap-3 h-32">
                         <BentoItem className="flex-1 bg-white/90 border-white/50 py-0 px-4 flex-row items-center gap-3 shadow-lg shadow-slate-200/50" delay={0.2}>
                             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><LayoutGrid size={18}/></div>
                             <div>
                                 <span className="block text-lg font-black text-slate-900 leading-none">{myListings.length}</span>
                                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Active</span>
                             </div>
                         </BentoItem>
                         <BentoItem className="flex-1 bg-white/90 border-white/50 py-0 px-4 flex-row items-center gap-3 shadow-lg shadow-slate-200/50" delay={0.3}>
                             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 size={18}/></div>
                             <div>
                                 <span className="block text-lg font-black text-slate-900 leading-none">{closedCount}</span>
                                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Closed</span>
                             </div>
                         </BentoItem>
                    </div>
                 </div>

                 {/* Sticky Tabs */}
                 <div className="sticky top-4 z-30 mb-4">
                     <div className="bg-white/90 backdrop-blur-xl p-1 rounded-2xl shadow-lg shadow-slate-200/50 flex border border-white/50">
                        {['posts', 'history', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors duration-300",
                                    activeTab === tab ? "text-[#0F172A]" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab === 'posts' && t('profile_my_posts')}
                                {tab === 'history' && t('profile_recent_title')}
                                {tab === 'settings' && "Settings"}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100 -z-10" />
                                )}
                            </button>
                        ))}
                     </div>
                 </div>

                 {/* Tab Content */}
                 <AnimatePresence mode="wait">
                    {activeTab === 'posts' && (
                        <motion.div 
                            key="posts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {myListings.length === 0 ? (
                                <EmptyState icon={Package} text={t('profile_no_posts')} />
                            ) : (
                                myListings.map((l, i) => (
                                    <motion.div 
                                        key={l.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative group"
                                    >
                                        <ListingCard listing={l} currentUserId={currentUser.uid} onDelete={onDelete} onStatusChange={onStatusChange} />
                                        <div className="absolute top-4 right-4 z-10">
                                             <button onClick={(e) => { e.stopPropagation(); onEdit(l); }} className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Edit3 size={14} />
                                             </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div 
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {recentListings.length === 0 ? (
                                <EmptyState icon={Clock} text={t('profile_recent_empty')} />
                            ) : (
                                recentListings.map(l => <ListingCard key={`r-${l.id}`} listing={l} currentUserId={currentUser.uid} onDelete={onDelete} />)
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div 
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                             <div className="space-y-3">
                                <SectionLabel>Preferences</SectionLabel>
                                <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                                    <ToggleItem label={t('settings_notifications')} icon={Bell} active={notifications} onToggle={() => setNotifications(!notifications)} />
                                    <div className="h-[1px] bg-slate-100 mx-4" />
                                    <ToggleItem label={t('settings_dark_mode')} icon={Moon} active={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                                </div>
                             </div>

                             <div className="space-y-3">
                                <SectionLabel>Account</SectionLabel>
                                <div className="space-y-2">
                                    <SettingsRow icon={Wallet} label="Payment Methods" color="text-blue-500 bg-blue-50" />
                                    <SettingsRow icon={Globe} label="Language" color="text-indigo-500 bg-indigo-50" />
                                    <SettingsRow icon={Share2} label="Refer a Friend" color="text-[#0F172A] bg-[#CCF381]" />
                                </div>
                             </div>

                             <div className="pt-4">
                                 <button onClick={onLogout} className="w-full py-5 bg-red-50 text-red-500 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                     <LogOut size={18} /> {t('profile_logout')}
                                 </button>
                                 <p className="text-center text-[10px] text-slate-300 font-bold mt-6 uppercase tracking-[0.2em]">Logistics OS v2.4.0</p>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Helper Components for Cleanliness ---

const EmptyState = ({ icon: Icon, text }: any) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100">
            <Icon size={32} className="text-slate-300" />
        </div>
        <p className="font-bold text-slate-400 text-sm max-w-[200px]">{text}</p>
    </div>
);

const SectionLabel = ({ children }: any) => (
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">{children}</h3>
);

const ToggleItem = ({ label, icon: Icon, active, onToggle }: any) => (
    <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                <Icon size={20} />
            </div>
            <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <button 
            onClick={onToggle}
            className={cn("w-14 h-8 rounded-full p-1 transition-all duration-300", active ? "bg-[#CCF381]" : "bg-slate-200")}
        >
            <div className={cn("w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300", active ? "translate-x-6" : "translate-x-0")} />
        </button>
    </div>
);
