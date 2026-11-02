import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SectionInfo {
  id: string;
  name: string;
  label: string;
}

const SECTIONS: SectionInfo[] = [
  { id: 'hero-section', name: '01', label: 'Couture Hero' },
  { id: 'manifesto-section', name: '02', label: 'Philosophy' },
  { id: 'runway-section', name: '03', label: 'Living Runway' },
  { id: 'universes-section', name: '04', label: 'Universes' },
  { id: 'catalog-section', name: '05', label: 'Curated Catalog' },
  { id: 'anatomy-section', name: '06', label: 'Craft Anatomy' },
  { id: 'privilege-section', name: '07', label: 'Privilege Club' },
  { id: 'pillars-section', name: '08', label: 'Four Pillars' },
  { id: 'testimonials-section', name: '09', label: 'Patron Voices' },
];

export const ScrollSectionTracker: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside 
      aria-label="Section Navigation Rail" 
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3.5 bg-white/70 backdrop-blur-md p-2 rounded-full border border-stone-200/80 shadow-lg"
    >
      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        const isHovered = hoveredSection === sec.id;

        return (
          <div key={sec.id} className="relative flex items-center justify-end">
            {/* Tooltip Label */}
            <AnimatePresence>
              {(isHovered || isActive) && (
                <motion.div
                  initial={{ opacity: 0, x: 8, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-7 pointer-events-none whitespace-nowrap bg-stone-900 text-white px-2.5 py-1 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5"
                >
                  <span className="text-amber-400">{sec.name}</span>
                  <span className="text-stone-300">•</span>
                  <span>{sec.label}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicator Dot */}
            <button
              onClick={() => scrollToSection(sec.id)}
              onMouseEnter={() => setHoveredSection(sec.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative p-1 rounded-full focus:outline-none group cursor-pointer"
              aria-label={`Scroll to ${sec.label}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-2.5 h-6 bg-gradient-to-b from-amber-500 to-amber-600 shadow-xs'
                    : 'w-2 h-2 bg-stone-300 group-hover:bg-amber-400 group-hover:scale-125'
                }`}
              />
            </button>
          </div>
        );
      })}
    </aside>
  );
};

export default ScrollSectionTracker;
