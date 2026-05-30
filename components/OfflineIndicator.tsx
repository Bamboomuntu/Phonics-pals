import React, { useState, useEffect } from 'react';
import { isOnline } from '../src/lib/cache-manager';

export const OfflineIndicator: React.FC = () => {
  const [online, setOnline] = useState(true);
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Initial check
    setOnline(navigator.onLine);

    // Listen for changes
    const handleOnline = () => {
      setOnline(true);
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setShow(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline status briefly on load if offline
    if (!navigator.onLine) {
      setShow(true);
    }

    setChecking(false);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (checking) return null;
  if (!show) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-2xl shadow-xl border-b-4 font-black text-sm transition-all duration-500 ${
        online
          ? 'bg-green-500 border-green-700 text-white'
          : 'bg-yellow-500 border-yellow-700 text-yellow-900'
      }`}
      onClick={() => setShow(false)}
    >
      {online ? '✅ Online' : '📴 Offline Mode'}
    </div>
  );
};
