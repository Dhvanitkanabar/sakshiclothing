import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every navigation transition immediately and reliably resets
 * the window and document scroll position to (0, 0), preventing lingering
 * scroll offsets from previous pages or long-scroll feeds.
 */
export const ScrollToTop = () => {
  const { pathname, search, key } = useLocation();

  useEffect(() => {
    // Disable native automatic scroll restoration to ensure route changes always start at top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // 1. Immediate reset on route change
    resetScroll();

    // 2. Reset on next animation frame after paint
    const rafId = requestAnimationFrame(resetScroll);

    // 3. Fallback timer for component mount and transition completion
    const timerId = setTimeout(resetScroll, 50);
    const transitionTimerId = setTimeout(resetScroll, 420);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      clearTimeout(transitionTimerId);
    };
  }, [pathname, search, key]);

  return null;
};

export default ScrollToTop;
