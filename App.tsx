import React, { useState, useMemo, useEffect } from 'react';
import { Listing, ViewState, ListingStatus } from './types';
import { CreateForm } from './components/CreateForm';
import { useLanguage } from './lib/LanguageContext';
import { MOCK_LISTINGS } from './services/mockData';

import { collection, addDoc, query, orderBy, limit, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './lib/firebase';

import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { ProfileView } from './views/ProfileView';
import { TabBar } from './components/TabBar';
import { TelegramModal } from './components/TelegramModal';

// --- MAIN APP ---
const App = () => {
  const { t, language, setLanguage } = useLanguage();

  const [firestoreListings, setFirestoreListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [view, setView] = useState<ViewState>('HOME');
  const [createModalType, setCreateModalType] = useState<'truck' | 'cargo' | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [pendingModalType, setPendingModalType] = useState<'truck' | 'cargo' | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  useEffect(() => {
    // Auth Listener with Fallback
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            setCurrentUser(user);
        } else {
            signInAnonymously(auth).catch((err) => {
                console.warn("Auth failed (offline mode):", err);
                // Fallback to a mock guest user if auth fails
                setCurrentUser({ uid: 'guest_' + Math.random().toString(36).slice(2), isAnonymous: true });
            });
        }
    });

    // Firestore Listener with Fallback
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, 
        (snapshot) => {
            setFirestoreListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[]);
            setLoading(false);
        }, 
        (err) => {
            console.warn("Firestore failed (offline mode):", err);
            setLoading(false);
        }
    );

    return () => { unsubscribe(); authUnsubscribe(); };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isVerifying && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (isVerifying && countdown === 0) {
      setIsVerifying(false);
      setCanConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [isVerifying, countdown]);

  const allListings = useMemo(() => {
    const combined = [...firestoreListings, ...MOCK_LISTINGS];
    // De-duplicate by ID
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique.sort((a, b) => b.createdAt - a.createdAt);
  }, [firestoreListings]);

  // Derived state for the feed: Only show active and non-expired listings
  const activeListings = useMemo(() => {
      const now = Date.now();
      return allListings.filter(l => 
          l.status === 'active' && 
          (l.expiresAt ? l.expiresAt > now : true) // Legacy compatibility if expiresAt missing
      );
  }, [allListings]);

  const handleStartCreate = (type: 'truck' | 'cargo') => {
      const isSubscribed = localStorage.getItem('gruzFura_isSubscribed') === 'true';
      if (isSubscribed) {
          setCreateModalType(type);
          return;
      }
      setPendingModalType(type);
      setCanConfirm(false);
      setIsVerifying(false);
      setShowTelegramModal(true);
  };

  const handleSubscribeClick = () => {
      window.open('https://t.me/designer_pro_muslim', '_blank');
      setIsVerifying(true);
      setCountdown(8);
  };

  const handleTelegramConfirm = () => {
      if (!canConfirm) return;
      localStorage.setItem('gruzFura_isSubscribed', 'true');
      setShowTelegramModal(false);
      if (pendingModalType) {
          setCreateModalType(pendingModalType);
          setPendingModalType(null);
      }
  };

  const handleCreateListing = async (data: any) => {
    try {
      // Try to get valid auth, fallback to existing currentUser (which might be mock)
      if (!auth.currentUser && !currentUser) {
           try {
             await signInAnonymously(auth);
           } catch (e) {
             console.warn("Could not sign in for creation, using offline user");
           }
      }
      
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined && v !== '')
      );

      const effectiveUser = auth.currentUser || currentUser || { uid: 'offline_user' };

      const newListingData = {
        ...cleanData,
        creatorId: effectiveUser.uid,
        createdAt: Date.now()
      };

      try {
        await addDoc(collection(db, "listings"), newListingData);
      } catch (dbError) {
        console.warn("Firestore write failed, updating local state only", dbError);
        // Fallback: update local state to reflect the new listing immediately
        const localListing = { id: 'local_' + Date.now(), ...newListingData } as Listing;
        setFirestoreListings(prev => [localListing, ...prev]);
      }

      setCreateModalType(null);
      setView(data.kind === 'truck' ? 'SEARCH_TRUCK' : 'SEARCH_CARGO');
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
  };

  const handleDeleteListing = async (id: string) => {
    try { 
        await deleteDoc(doc(db, "listings", id)); 
    } catch (e) { 
        console.error(e);
        // If local delete fails (e.g. offline), remove from local state
        setFirestoreListings(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: ListingStatus) => {
    try {
        await updateDoc(doc(db, "listings", id), { 
            status: newStatus,
            updatedAt: Date.now()
        });
    } catch (e) {
        console.error(e);
        // Local fallback
        setFirestoreListings(prev => prev.map(l => 
            l.id === id ? { ...l, status: newStatus, updatedAt: Date.now() } : l
        ));
    }
  };

  return (
    <div className="h-full w-full bg-[#F7F8FA] text-[#0B2136] font-sans selection:bg-[#1565D8] selection:text-white flex flex-col overflow-hidden relative isolate">
      
      {/* Global Ambient Background - Fixed 2026 Style */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          {/* Primary Blue Aura */}
          <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-[#1565D8] opacity-[0.04] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          {/* Accent Orange Aura */}
          <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-[#FF7A59] opacity-[0.04] blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <main className="flex-1 relative overflow-hidden z-0 w-full">
        {view === 'HOME' && (
            <HomeView 
                setView={setView} 
                setLanguage={setLanguage} 
                language={language} 
                listings={activeListings} 
            />
        )}
        {view === 'SEARCH_TRUCK' && (
            <ListView 
                type="truck" 
                listings={activeListings} 
                searchFrom={searchFrom} 
                searchTo={searchTo} 
                setSearchFrom={setSearchFrom} 
                setSearchTo={setSearchTo} 
                setView={setView} 
                currentUser={currentUser} 
                onDelete={handleDeleteListing}
            />
        )}
        {view === 'SEARCH_CARGO' && (
            <ListView 
                type="cargo" 
                listings={activeListings}
                searchFrom={searchFrom} 
                searchTo={searchTo} 
                setSearchFrom={setSearchFrom} 
                setSearchTo={setSearchTo}
                setView={setView}
                currentUser={currentUser}
                onDelete={handleDeleteListing}
            />
        )}
        {view === 'PROFILE' && (
            <ProfileView 
              currentUser={currentUser} 
              listings={allListings} // Pass ALL listings (history included)
              onDelete={handleDeleteListing}
              onStatusChange={handleStatusChange}
            />
        )}
      </main>

      <TabBar view={view} setView={setView} onStartCreate={handleStartCreate} />

      {showTelegramModal && (
          <TelegramModal 
            isVerifying={isVerifying} 
            countdown={countdown} 
            canConfirm={canConfirm} 
            onSubscribe={handleSubscribeClick} 
            onConfirm={handleTelegramConfirm}
          />
      )}

      {createModalType && (
        <CreateForm 
            initialType={createModalType}
            onClose={() => setCreateModalType(null)}
            onSubmit={handleCreateListing}
        />
      )}
    </div>
  );
};

export default App;