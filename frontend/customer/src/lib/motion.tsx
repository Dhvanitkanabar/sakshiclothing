/**
 * Sakshi Clothing — Unified Shared Motion System
 * 
 * Central motion configuration and reusable animation primitives powered by Motion (Framer Motion).
 * All variants, durations, easings, and distances are tuned in this file.
 * 
 * Rules Enforced:
 * 1. Only transform, opacity, and clip-path are animated (zero layout reflows).
 * 2. Side-slide animations enforce overflow-x: clip so horizontal scrolling is strictly prevented.
 * 3. Supports prefers-reduced-motion by rendering content immediately with 0s duration.
 * 4. Content is present in DOM for SEO and no-JS compatibility.
 */

import React, { useMemo } from 'react';
import { motion, useReducedMotion, type Variants, type Transition } from 'motion/react';

// =========================================================================
// 1. CENTRAL MOTION CONFIGURATION (TUNE EVERYTHING HERE)
// =========================================================================

export const MOTION_CONFIG = {
  // Durations in seconds (400ms to 700ms)
  durations: {
    fast: 0.4,
    default: 0.55,
    slow: 0.7,
    stagger: 0.08,
  },
  // Tuned gentle easings
  easings: {
    // Cubic bezier ease-out for natural editorial feel
    gentle: [0.16, 1, 0.3, 1] as const,
    // Smooth ease-in-out for ambient transitions
    smooth: [0.4, 0, 0.2, 1] as const,
    // Elastic spring physics for interactive elements
    spring: {
      type: 'spring' as const,
      damping: 26,
      stiffness: 220,
    },
  },
  // Distances in pixels (kept small to prevent horizontal overflow)
  distances: {
    desktop: {
      side: 50,
      bottom: 35,
    },
    mobile: {
      side: 24,
      bottom: 20,
    },
  },
  // Viewport trigger settings
  viewport: {
    once: true,
    amount: 0.2,
    margin: '-20px',
  },
};

export type MotionVariantType = 
  | 'fromLeft' 
  | 'fromRight' 
  | 'fromBottom' 
  | 'scaleIn' 
  | 'maskReveal' 
  | 'fadeOnly';

// =========================================================================
// 2. VARIANT FACTORY WITH REDUCED MOTION SAFEGUARDS
// =========================================================================

export const createVariants = (
  variant: MotionVariantType,
  isMobile: boolean = false,
  reduced: boolean = false,
  customDistance?: { side?: number; bottom?: number } | number
): Variants => {
  if (reduced) {
    return {
      hidden: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: 'none' },
      visible: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: 'none', transition: { duration: 0 } },
    };
  }

  const baseDist = isMobile ? MOTION_CONFIG.distances.mobile : MOTION_CONFIG.distances.desktop;
  const sideDist = typeof customDistance === 'number' ? customDistance : customDistance?.side ?? baseDist.side;
  const bottomDist = typeof customDistance === 'number' ? customDistance : customDistance?.bottom ?? baseDist.bottom;

  switch (variant) {
    case 'fromLeft':
      return {
        hidden: { opacity: 0, x: -sideDist },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: MOTION_CONFIG.durations.default, ease: MOTION_CONFIG.easings.gentle },
        },
      };

    case 'fromRight':
      return {
        hidden: { opacity: 0, x: sideDist },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: MOTION_CONFIG.durations.default, ease: MOTION_CONFIG.easings.gentle },
        },
      };

    case 'fromBottom':
      return {
        hidden: { opacity: 0, y: bottomDist },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: MOTION_CONFIG.durations.default, ease: MOTION_CONFIG.easings.gentle },
        },
      };

    case 'scaleIn':
      return {
        hidden: { opacity: 0, scale: 0.94 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: MOTION_CONFIG.durations.default, ease: MOTION_CONFIG.easings.gentle },
        },
      };

    case 'maskReveal':
      return {
        hidden: {
          opacity: 0,
          clipPath: 'inset(8% 0% 8% 0% round 12px)',
        },
        visible: {
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          transition: { duration: MOTION_CONFIG.durations.slow, ease: MOTION_CONFIG.easings.gentle },
        },
      };

    case 'fadeOnly':
    default:
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: MOTION_CONFIG.durations.fast, ease: MOTION_CONFIG.easings.gentle },
        },
      };
  }
};

// =========================================================================
// 3. REUSABLE PRIMITIVE: <Reveal>
// =========================================================================

export interface RevealProps {
  children: React.ReactNode;
  variant?: MotionVariantType;
  delay?: number;
  duration?: number;
  className?: string;
  amount?: number;
  once?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fromBottom',
  delay = 0,
  duration,
  className = '',
  amount = MOTION_CONFIG.viewport.amount,
  once = MOTION_CONFIG.viewport.once,
  style,
  id,
}) => {
  const prefersReduced = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const variants = useMemo(
    () => createVariants(variant, isMobile, prefersReduced || false),
    [variant, isMobile, prefersReduced]
  );

  const transition: Transition = {
    duration: prefersReduced ? 0 : (duration ?? MOTION_CONFIG.durations.default),
    delay: prefersReduced ? 0 : delay,
    ease: MOTION_CONFIG.easings.gentle,
  };

  return (
    <motion.div
      id={id}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: MOTION_CONFIG.viewport.margin }}
      transition={transition}
      style={style}
      className={`overflow-x-clip ${className}`}
    >
      {children}
    </motion.div>
  );
};

// =========================================================================
// 4. REUSABLE PRIMITIVE: <StaggerGroup> & <StaggerItem>
// =========================================================================

export interface StaggerGroupProps {
  children: React.ReactNode;
  stagger?: number;
  delayChildren?: number;
  className?: string;
  amount?: number;
  once?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const StaggerGroup: React.FC<StaggerGroupProps> = ({
  children,
  stagger = MOTION_CONFIG.durations.stagger,
  delayChildren = 0.05,
  className = '',
  amount = MOTION_CONFIG.viewport.amount,
  once = MOTION_CONFIG.viewport.once,
  style,
  id,
}) => {
  const prefersReduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReduced ? 0 : stagger,
        delayChildren: prefersReduced ? 0 : delayChildren,
      },
    },
  };

  return (
    <motion.div
      id={id}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: MOTION_CONFIG.viewport.margin }}
      style={style}
      className={`overflow-x-clip ${className}`}
    >
      {children}
    </motion.div>
  );
};

export interface StaggerItemProps {
  children: React.ReactNode;
  variant?: MotionVariantType;
  className?: string;
  style?: React.CSSProperties;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  variant = 'fromBottom',
  className = '',
  style,
}) => {
  const prefersReduced = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const variants = useMemo(
    () => createVariants(variant, isMobile, prefersReduced || false),
    [variant, isMobile, prefersReduced]
  );

  return (
    <motion.div variants={variants} style={style} className={`overflow-x-clip ${className}`}>
      {children}
    </motion.div>
  );
};

// =========================================================================
// 5. REUSABLE SECTION DIVIDERS: <SectionTransition>
// =========================================================================

export type TransitionDividerType = 'goldLine' | 'scallop' | 'curve' | 'diagonal' | 'marqueeRibbon';

export interface SectionTransitionProps {
  type?: TransitionDividerType;
  fillFrom?: string; // background color above
  fillTo?: string;   // background color below
  className?: string;
  marqueeText?: string;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  type = 'goldLine',
  fillFrom = '#FAF8F5',
  fillTo = '#FAF8F5',
  className = '',
  marqueeText = 'HANDCRAFTED IN SURAT · 100% QUALITY INSPECTED · PAN-INDIA COURIER DISPATCH',
}) => {
  const prefersReduced = useReducedMotion();

  if (type === 'goldLine') {
    return (
      <div className={`relative w-full max-w-7xl mx-auto px-5 sm:px-8 py-6 overflow-hidden flex items-center justify-center select-none ${className}`}>
        {/* Animated self-drawing gold line */}
        <div className="relative w-full flex items-center justify-center">
          <svg className="w-full h-4 overflow-visible" viewBox="0 0 1000 16" fill="none">
            <motion.path
              d="M0 8 H475 M525 8 H1000"
              stroke="#C6A15B"
              strokeWidth="1.25"
              strokeOpacity="0.5"
              strokeDasharray="4 4"
              initial={{ pathLength: prefersReduced ? 1 : 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, ease: MOTION_CONFIG.easings.gentle }}
            />
          </svg>
          {/* Centered ornamental emblem */}
          <motion.div
            initial={{ scale: prefersReduced ? 1 : 0, rotate: prefersReduced ? 0 : -45, opacity: 0 }}
            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3, ease: MOTION_CONFIG.easings.gentle }}
            className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-[#C6A15B]/60 shadow-xs flex items-center justify-center"
          >
            <span className="text-[#C6A15B] text-[10px]">✦</span>
          </motion.div>
        </div>
      </div>
    );
  }

  if (type === 'scallop') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`} style={{ backgroundColor: fillFrom }}>
        <svg 
          className="block w-full h-4 sm:h-6" 
          viewBox="0 0 1200 24" 
          preserveAspectRatio="none" 
          fill={fillTo}
        >
          <path d="M0,0 C150,24 350,24 500,0 C650,24 850,24 1000,0 C1100,16 1150,20 1200,24 L1200,24 L0,24 Z" />
        </svg>
      </div>
    );
  }

  if (type === 'curve') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`} style={{ backgroundColor: fillFrom }}>
        <svg 
          className="block w-full h-6 sm:h-10" 
          viewBox="0 0 1200 40" 
          preserveAspectRatio="none" 
          fill={fillTo}
        >
          <path d="M0,0 C300,40 900,40 1200,0 L1200,40 L0,40 Z" />
        </svg>
      </div>
    );
  }

  if (type === 'diagonal') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`} style={{ backgroundColor: fillFrom }}>
        <svg 
          className="block w-full h-5 sm:h-8" 
          viewBox="0 0 1200 32" 
          preserveAspectRatio="none" 
          fill={fillTo}
        >
          <polygon points="0,32 1200,0 1200,32" />
        </svg>
      </div>
    );
  }

  if (type === 'marqueeRibbon') {
    return (
      <div className={`w-full bg-[#7B1E2B] text-white py-2 sm:py-2.5 overflow-hidden select-none border-y border-[#C6A15B]/30 ${className}`}>
        <div className="animate-marquee flex items-center gap-8 text-[11px] sm:text-xs tracking-[0.2em] uppercase font-semibold text-[#E5E0D8]">
          {Array.from({ length: 4 }).map((_, idx) => (
            <React.Fragment key={idx}>
              <span>{marqueeText}</span>
              <span className="text-[#C6A15B]">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// =========================================================================
// 6. CURTAIN EFFECT CONTAINER: <CurtainSection>
// =========================================================================

export interface CurtainSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const CurtainSection: React.FC<CurtainSectionProps> = ({
  children,
  className = '',
  id,
}) => {
  const prefersReduced = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // On low-end mobile or reduced motion, render without intense 3D transform to preserve 60fps & battery
  if (prefersReduced || isMobile) {
    return (
      <section id={id} className={`relative z-20 ${className}`}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{ y: 35, opacity: 0.95 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15, margin: '-40px' }}
      transition={{ duration: 0.65, ease: MOTION_CONFIG.easings.gentle }}
      className={`relative z-20 shadow-2xl ${className}`}
    >
      {children}
    </motion.section>
  );
};
