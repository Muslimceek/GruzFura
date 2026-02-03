
import React, { useState, useMemo, useEffect } from 'react';
import { Listing, ViewState, ListingStatus } from './types';
import { CreateForm } from './components/CreateForm';
import { AuthModal } from './components/AuthModal';
import { Onboarding } from './components/Onboarding';
import { useLanguage } from './lib/LanguageContext';

import { collection, addDoc, query, orderBy, limit, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './lib/firebase';

import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { ProfileView } from './views/ProfileView';
import { TabBar } from './components/TabBar';
import { TelegramModal } from './components/TelegramModal';

const App = () => {
  const { t, language, setLanguage } = useLanguage();

  const [firestoreListings, setFirestoreListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [view, setView] = useState<ViewState>('HOME');
  const [createModalType, setCreateModalType] = useState<'truck' | 'cargo' | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingModalType, setPendingModalType] = useState<'truck' | 'cargo' | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  useEffect(() => {
    // Check onboarding status
    const hasSeenOnboarding = localStorage.getItem('gruzFura_onboarding_v2');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
    });

    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, 
        (snapshot) => {
            setFirestoreListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[]);
            setLoading(false);
        }, 
        (err) => {
            console.warn("Firestore failed:", err);
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
    // Use only Firestore data, sorted by date
    return [...firestoreListings].sort((a, b) => b.createdAt - a.createdAt);
  }, [firestoreListings]);

  const activeListings = useMemo(() => {
      const now = Date.now();
      return allListings.filter(l => 
          l.status === 'active' && 
          (l.expiresAt ? l.expiresAt > now : true)
      );
  }, [allListings]);

  const handleStartCreate = (type: 'truck' | 'cargo') => {
      // Step 1: Force Authentication
      if (!currentUser || currentUser.isAnonymous) {
          setShowAuthModal(true);
          return;
      }

      // Step 2: Check one-time Subscription
      // We check local storage, but in a production app this could also be a field on the user doc
      const isSubscribed = localStorage.getItem(`gruzFura_isSubscribed_${currentUser.uid}`) === 'true';
      
      if (isSubscribed) {
          setCreateModalType(type);
          return;
      }

      // Step 3: Trigger Subscription Flow
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
      if (!canConfirm || !currentUser) return;
      
      // Save subscription status for this specific user
      localStorage.setItem(`gruzFura_isSubscribed_${currentUser.uid}`, 'true');
      setShowTelegramModal(false);
      
      if (pendingModalType) {
          setCreateModalType(pendingModalType);
          setPendingModalType(null);
      }
  };

  const handleCreateListing = async (data: any) => {
    try {
      if (!currentUser) {
           setShowAuthModal(true);
           return;
      }
      
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined && v !== '')
      );

      const isEdit = !!data.id;
      const listingData = {
        ...cleanData,
        creatorId: currentUser.uid,
        updatedAt: Date.now()
      };

      if (isEdit) {
        await updateDoc(doc(db, "listings", data.id), listingData);
      } else {
        await addDoc(collection(db, "listings"), {
          ...listingData,
          createdAt: Date.now(),
          expiresAt: Date.now() + (72 * 60 * 60 * 1000) // Default 3 days expiry
        });
      }

      setCreateModalType(null);
      setEditingListing(null);
      setView(data.kind === 'truck' ? 'SEARCH_TRUCK' : 'SEARCH_CARGO');
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить публикацию?")) return;
    try { 
        await deleteDoc(doc(db, "listings", id)); 
    } catch (e) { 
        console.error(e);
    }
  };

  const handleEditListing = (listing: Listing) => {
      setEditingListing(listing);
      setCreateModalType(listing.kind);
  };

  const handleStatusChange = async (id: string, newStatus: ListingStatus) => {
    try {
        await updateDoc(doc(db, "listings", id), { 
            status: newStatus,
            updatedAt: Date.now()
        });
    } catch (e) {
        console.error(e);
    }
  };

  const handleLogout = async () => {
      await signOut(auth);
      setView('HOME');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('gruzFura_onboarding_v2', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="h-full w-full bg-[#F7F8FA] text-[#0B2136] font-sans selection:bg-[#1565D8] selection:text-white flex flex-col overflow-hidden relative isolate">
      
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-[#1565D8] opacity-[0.04] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
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
              listings={allListings}
              onDelete={handleDeleteListing}
              onEdit={handleEditListing}
              onStatusChange={handleStatusChange}
              onLogout={handleLogout}
              onLoginRequest={() => setShowAuthModal(true)}
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

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}

      {createModalType && (
        <CreateForm 
            initialType={createModalType}
            initialData={editingListing || undefined}
            onClose={() => { setCreateModalType(null); setEditingListing(null); }}
            onSubmit={handleCreateListing}
        />
      )}
    </div>
  );
};

export default App;
