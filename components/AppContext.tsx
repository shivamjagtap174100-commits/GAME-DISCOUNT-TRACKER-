'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  region: string;
  setRegion: (r: string) => void;
  currency: string;
  wishlistIds: Set<string>;
  toggleWishlist: (gameId: string) => Promise<boolean>;
  unreadCount: number;
  refreshUserData: () => Promise<void>;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<string>('IN');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const currency = region === 'IN' ? 'INR' : region === 'US' ? 'USD' : region === 'EU' ? 'EUR' : 'GBP';

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setRegion = (newRegion: string) => {
    setRegionState(newRegion);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gdt_region', newRegion);
    }
    showToast(`Region updated to ${newRegion} (${newRegion === 'IN' ? 'INR ₹' : 'USD $'})`, 'info');
  };

  const refreshUserData = async () => {
    try {
      // Wishlist
      const wRes = await fetch('/api/wishlist');
      if (wRes.ok) {
        const data = await wRes.json();
        if (data.wishlist) {
          const ids = new Set<string>(data.wishlist.map((item: any) => item.id));
          setWishlistIds(ids);
        }
      }

      // Notifications
      const nRes = await fetch('/api/notifications');
      if (nRes.ok) {
        const data = await nRes.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Silent error during initialization
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRegion = localStorage.getItem('gdt_region');
      if (savedRegion) setRegionState(savedRegion);
    }
    refreshUserData();
  }, []);

  const toggleWishlist = async (gameId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });
      if (res.ok) {
        const data = await res.json();
        const nextSet = new Set(wishlistIds);
        if (data.isWishlisted) {
          nextSet.add(gameId);
          showToast('Added to your Wishlist', 'success');
        } else {
          nextSet.delete(gameId);
          showToast('Removed from your Wishlist', 'info');
        }
        setWishlistIds(nextSet);
        return data.isWishlisted;
      }
      return false;
    } catch {
      showToast('Failed to update wishlist', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        region,
        setRegion,
        currency,
        wishlistIds,
        toggleWishlist,
        unreadCount,
        refreshUserData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
      {/* Toast notifications container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-md text-sm font-medium shadow-xl flex items-center gap-3 border transition-all duration-200 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-[#17231E] border-[#35B779] text-[#E0F8EC]'
                : toast.type === 'error'
                ? 'bg-[#291717] border-[#E45B5B] text-[#FDE8E8]'
                : 'bg-[#1D2226] border-[#343C43] text-[#F4F5F6]'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
