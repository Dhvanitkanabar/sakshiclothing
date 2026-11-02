import React, { useEffect, useState } from 'react';

export const InteractiveCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop with fine pointer
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer');
        setIsPointer(Boolean(isClickable));
      }
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer ring */}
      <div
        className="fixed rounded-full transition-transform duration-150 ease-out border border-amber-500/40"
        style={{
          width: isPointer ? 44 : 26,
          height: isPointer ? 44 : 26,
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          backgroundColor: isPointer ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
          boxShadow: isPointer ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
        }}
      />
      {/* Inner tiny dot */}
      <div
        className="fixed rounded-full bg-amber-500"
        style={{
          width: 4,
          height: 4,
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};

export default InteractiveCursor;
