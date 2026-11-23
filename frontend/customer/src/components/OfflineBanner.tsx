import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { nativeApp } from '../services/nativeService';
import { toast } from 'sonner';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Initial check
    nativeApp.getNetworkStatus().then(status => {
      setIsOffline(!status.connected);
    });

    // Subscribe to status changes
    const cleanup = nativeApp.onNetworkChange(status => {
      const offline = !status.connected;
      setIsOffline(offline);
      if (!offline) {
        toast.success('Internet connection restored. Synchronizing catalog...', { duration: 3000 });
      }
    });

    return () => {
      cleanup();
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    const status = await nativeApp.getNetworkStatus();
    setIsRetrying(false);
    if (status.connected) {
      setIsOffline(false);
      toast.success('Connected successfully!');
      window.location.reload();
    } else {
      toast.error('Still offline. Please check your data or Wi-Fi connection.');
    }
  };

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-[#7E1D2D] text-white px-4 py-2.5 shadow-md flex items-center justify-between transition-transform duration-300">
      <div className="flex items-center gap-2.5">
        <WifiOff size={16} className="text-[#D4AF37] animate-pulse flex-shrink-0" />
        <span className="text-xs md:text-sm font-medium tracking-wide">
          You are currently offline. Showing cached atelier pieces.
        </span>
      </div>
      <button
        onClick={handleRetry}
        disabled={isRetrying}
        className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20 transition-colors"
      >
        <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
        {isRetrying ? 'Checking...' : 'Retry'}
      </button>
    </div>
  );
};

export default OfflineBanner;
