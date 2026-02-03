import React, { useState, useEffect } from 'react';
import { User, Zap, History, Bell, Moon, Shield, Star, Award, Settings, ChevronRight, LogOut } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { Listing, ListingStatus } from '../types';
import { ListingCard } from '../components/ListingCard';

interface ProfileViewProps {
    currentUser: any;
    listings: Listing[];
    onDelete: (id: string) => void;
    onStatusChange?: (id: string, status: ListingStatus) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, listings, onDelete, onStatusChange }) => {
    const { t } = useLanguage();
    const [recentListings, setRecentListings] = useState<Listing[]>([]);
    
    // Mock settings state for visual interaction
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

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

    // Derived: My Active Listings
    const myListings = listings.filter(l => l.creatorId === currentUser?.uid);

    const StatItem = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            <Icon size={20} className={`mb-1.5 ${color.replace('from-', 'text-').replace('/20', '')} opacity-90`} />
            <span className="text-lg font-black text-white tracking-tight">{value}</span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</span>
        </div>
    );

    const SettingToggle = ({ label, icon: Icon, color, active, onToggle }: { label: string, icon: any, color: string, active: boolean, onToggle: () => void }) => (
        <button onClick={onToggle} className="w-full flex items-center justify-between p-4 group active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-300 ${color}`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                <span className="font-bold text-slate-900 text-sm group-hover:text-slate-700 transition-colors">{label}</span>
            </div>
            <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${active ? 'bg-slate-900' : 'bg-slate-200'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${active ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
        </button>
    );

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-[#F3F4F6] relative">
            
            {/* === IMMERSIVE HEADER === */}
            <div className="relative pt-safe-top px-6 pb-20 overflow-hidden bg-[#0B1120]">
                {/* Animated Background Mesh */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                     <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-br from-blue-600/20 via-[#0B1120] to-transparent opacity-50 blur-3xl animate-pulse" />
                     <div className="absolute bottom-[-30%] right-[-20%] w-[120%] h-[150%] bg-gradient-to-tl from-orange-500/10 via-transparent to-transparent opacity-40 blur-3xl" />
                </div>

                {/* Profile Card */}
                <div className="relative z-10 flex flex-col items-center mt-6 animate-in slide-in-from-top-4 fade-in duration-700">
                    {/* Avatar with Glow */}
                    <div className="relative mb-6 group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 scale-110" />
                        <div className="w-28 h-28 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-[3px] border-white/10 flex items-center justify-center relative shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                             <User size={48} className="text-white/80" strokeWidth={1.5} />
                             
                             {/* Shine Effect */}
                             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent opacity-50 pointer-events-none" />
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full border-[4px] border-[#0B1120] flex items-center justify-center text-white shadow-lg animate-in zoom-in delay-200">
                            <Zap size={14} fill="currentColor" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">{t('guest_user')}</h2>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('id_prefix')}</span>
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                            {currentUser?.uid ? currentUser.uid.slice(0, 8).toUpperCase() : 'OFFLINE'}
                        </span>
                    </div>
                </div>

                {/* Gamified Stats Grid */}
                <div className="relative z-10 grid grid-cols-3 gap-3 mt-8 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
                    <StatItem label="Views" value="1.2k" icon={Star} color="from-yellow-400/20 text-yellow-400" />
                    <StatItem label="Posts" value={myListings.length.toString()} icon={Award} color="from-blue-500/20 text-blue-500" />
                    <StatItem label="Trust" value="100%" icon={Shield} color="from-emerald-400/20 text-emerald-400" />
                </div>
            </div>

            {/* === SCROLLABLE CONTENT === */}
            <div className="relative -mt-10 rounded-t-[2.5rem] bg-[#F3F4F6] min-h-[60vh] px-6 py-8 space-y-8 z-20 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
                
                {/* Decorative Pill at top */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full opacity-50" />

                {/* My Active Listings (New Section) */}
                {myListings.length > 0 && (
                    <section>
                         <div className="flex items-center gap-3 mb-5 px-2">
                             <div className="w-10 h-10 rounded-2xl bg-slate-900 shadow-sm border border-slate-700 flex items-center justify-center text-white">
                                <Award size={20} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-xl font-black text-slate-900 tracking-tight">My Listings</h3>
                        </div>
                        <div className="space-y-4">
                             {myListings.map((l, i) => (
                                <div key={l.id} className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                                    <ListingCard 
                                        listing={l} 
                                        currentUserId={currentUser?.uid} 
                                        onDelete={onDelete} 
                                        onStatusChange={onStatusChange}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Control Center */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Control Center</h3>
                    </div>
                    <div className="bg-white rounded-[2rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                         <SettingToggle 
                            active={notifications} 
                            onToggle={() => setNotifications(!notifications)} 
                            icon={Bell} 
                            label={t('settings_notifications')} 
                            color="bg-gradient-to-br from-orange-400 to-red-500" 
                         />
                         <div className="h-px bg-slate-50 mx-20" />
                         <SettingToggle 
                            active={darkMode} 
                            onToggle={() => setDarkMode(!darkMode)} 
                            icon={Moon} 
                            label={t('settings_dark_mode')} 
                            color="bg-gradient-to-br from-indigo-500 to-purple-600" 
                         />
                    </div>
                </section>

                {/* Recent History */}
                <section>
                    <div className="flex items-center gap-3 mb-5 px-2">
                         <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                            <History size={20} strokeWidth={2.5} />
                         </div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('profile_recent_title')}</h3>
                    </div>
                    
                    <div className="space-y-4 min-h-[100px]">
                        {recentListings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 bg-white rounded-[2rem] border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <History size={24} className="text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">{t('profile_recent_empty')}</p>
                            </div>
                        ) : (
                            recentListings.map((l, i) => (
                                <div key={`recent-${l.id}`} className="animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <ListingCard listing={l} currentUserId={currentUser?.uid} onDelete={onDelete} />
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Actions */}
                <div className="pt-4 pb-24 space-y-3">
                    <button className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold text-sm shadow-sm active:scale-[0.98] transition-all hover:bg-slate-50 flex items-center justify-center gap-2">
                        <Settings size={18} />
                        Account Settings
                    </button>
                    <button className="w-full py-4 rounded-2xl text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};