import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { nativeApp } from '../services/nativeService';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  pullDownThreshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDownThreshold = 70
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull to refresh if user is at the top of the page
    if (window.scrollY <= 0 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0 && window.scrollY <= 0) {
      // Apply rubber band resistance
      const distance = Math.min(diff * 0.45, pullDownThreshold * 1.5);
      setPullDistance(distance);

      if (distance >= pullDownThreshold && pullDistance < pullDownThreshold) {
        nativeApp.haptic('light');
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= pullDownThreshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(pullDownThreshold * 0.7);
      nativeApp.haptic('medium');

      try {
        await onRefresh();
      } catch (err) {
        console.warn('[PullToRefresh] Refresh error:', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen"
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{ height: `${pullDistance}px` }}
          className="w-full flex items-center justify-center overflow-hidden transition-all duration-150"
        >
          <div className="flex items-center gap-2 text-[#7E1D2D] py-2">
            <Loader2
              size={18}
              className={`text-[#7E1D2D] ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${Math.min(pullDistance * 4, 360)}deg)`
              }}
            />
            <span className="text-xs font-serif tracking-wider text-[#6B7280]">
              {isRefreshing ? 'Refreshing Collection...' : pullDistance >= pullDownThreshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;
