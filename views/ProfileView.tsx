
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Settings, LogOut, ChevronRight, Star, 
  ShieldCheck, Package, Clock, Zap, CheckCircle2, 
  Lock, LogIn, Edit3, Wallet, Globe, Bell, Moon,
  LayoutGrid, Share2, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { Listing, ListingStatus } from '../types';
import { ListingCard } from '../components/ListingCard';
import { updateProfile } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
        <div className="h-full bg-[#F3F4F6] overflow-y-auto no-scrollbar relative flex flex-col">
            
            {/* --- Compact Hero Section --- */}
            <div className="relative z-0 bg-[#0F172A] pt-[calc(env(safe-area-inset-top)+10px)] pb-16 px-6 rounded-b-[2.5rem] shadow-lg shrink-0">
                <div className="flex justify-between items-start mb-4">
                     <div className="flex flex-col">
                        <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase">ID: {currentUser.uid.slice(0, 6)}</span>
                        <div className="flex items-center gap-1.5 text-[#CCF381]">
                            <Award size={10} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Pro</span>
                        </div>
                     </div>
                     <button onClick={onLogout} className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors">
                        <LogOut size={16} />
                     </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-[1.2rem] p-[2px] bg-gradient-to-br from-slate-600 to-slate-700 shadow-xl">
                            <div className="w-full h-full rounded-[1rem] overflow-hidden bg-[#1E293B]">
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><User size={24} className="text-slate-500"/></div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#CCF381] rounded-lg flex items-center justify-center text-[#0F172A] shadow-md z-20 border border-[#0F172A]">
                             <Edit3 size={12} />
                        </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        {isEditingProfile ? (
                            <div className="flex items-center gap-2">
                                <input value={newName} onChange={e => setNewName(e.target.value)} className="bg-white/10 text-white text-sm font-bold rounded-lg py-1 px-2 outline-none border border-white/20 w-full" autoFocus />
                                <button onClick={handleSave} className="w-8 h-8 bg-[#CCF381] rounded-lg flex items-center justify-center text-[#0F172A] shrink-0">{isSaving ? <Zap size={14} className="animate-spin" /> : <CheckCircle2 size={16}/>}</button>
                            </div>
                        ) : (
                            <h1 className="text-xl font-black text-white tracking-tight truncate">{currentUser.displayName || t('guest_user')}</h1>
                        )}
                        <p className="text-slate-400 font-medium text-[10px] truncate">{currentUser.email}</p>
                    </div>
                </div>
            </div>

            {/* --- Stats Overlap --- */}
            <div className="px-4 -mt-10 relative z-10 mb-4">
                <div className="flex gap-2">
                     <div className="flex-1 bg-white p-3 rounded-2xl shadow-lg shadow-slate-200/50 flex flex-col items-center border border-white/50 backdrop-blur">
                         <span className="text-lg font-black text-slate-900 leading-none mb-1">{myListings.length}</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
                     </div>
                     <div className="flex-1 bg-white p-3 rounded-2xl shadow-lg shadow-slate-200/50 flex flex-col items-center border border-white/50 backdrop-blur">
                         <span className="text-lg font-black text-slate-900 leading-none mb-1">{closedCount}</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Closed</span>
                     </div>
                     <div className="flex-1 bg-[#CCF381] p-3 rounded-2xl shadow-lg shadow-lime-500/20 flex flex-col items-center border border-[#CCF381]">
                         <span className="text-lg font-black text-[#0F172A] leading-none mb-1">5.0</span>
                         <span className="text-[9px] text-[#0F172A]/70 font-bold uppercase tracking-wider">Trust</span>
                     </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-1 px-4 pb-32">
                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-sm overflow-hidden min-h-[400px]">
                    {/* Sticky Tabs Header */}
                    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex p-1">
                        {['posts', 'history', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-all duration-300 rounded-xl",
                                    activeTab === tab ? "bg-[#0F172A] text-white shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {tab === 'posts' && t('profile_my_posts')}
                                {tab === 'history' && t('profile_recent_title')}
                                {tab === 'settings' && "Config"}
                            </button>
                        ))}
                    </div>

                    <div className="p-4">
                        <AnimatePresence mode="wait">
                            {activeTab === 'posts' && (
                                <motion.div 
                                    key="posts"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-3"
                                >
                                    {myListings.length === 0 ? (
                                        <EmptyState icon={Package} text={t('profile_no_posts')} />
                                    ) : (
                                        myListings.map(l => (
                                            <div key={l.id} className="relative group">
                                                <ListingCard listing={l} currentUserId={currentUser.uid} onDelete={onDelete} onStatusChange={onStatusChange} />
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(l); }} className="absolute top-2 right-2 w-8 h-8 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <Edit3 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'history' && (
                                <motion.div 
                                    key="history"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-3"
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
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6 pt-2"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">App</h3>
                                        <ToggleItem label={t('settings_notifications')} icon={Bell} active={notifications} onToggle={() => setNotifications(!notifications)} />
                                        <ToggleItem label={t('settings_dark_mode')} icon={Moon} active={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Account</h3>
                                        <SettingsRow icon={Wallet} label="Methods" />
                                        <SettingsRow icon={Globe} label="Language" />
                                        <SettingsRow icon={Share2} label="Referrals" />
                                    </div>

                                    <button onClick={onLogout} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4">
                                        <LogOut size={16} /> {t('profile_logout')}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ icon: Icon, text }: any) => (
    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
        <Icon size={24} className="text-slate-300 mb-3" />
        <p className="font-bold text-slate-400 text-xs max-w-[150px]">{text}</p>
    </div>
);

const SettingsRow = ({ icon: Icon, label }: any) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm active:scale-95 transition-transform">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500"><Icon size={16} /></div>
            <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <ChevronRight size={14} className="text-slate-300" />
    </div>
);

const ToggleItem = ({ label, icon: Icon, active, onToggle }: any) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500"><Icon size={16} /></div>
            <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <button onClick={onToggle} className={cn("w-10 h-6 rounded-full p-1 transition-all duration-300", active ? "bg-slate-900" : "bg-slate-200")}>
            <div className={cn("w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300", active ? "translate-x-4" : "translate-x-0")} />
        </button>
    </div>
);
