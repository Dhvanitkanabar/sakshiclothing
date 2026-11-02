import { motion } from 'motion/react';

interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface SpringTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SpringTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md'
}: SpringTabsProps) {
  const sizeStyles = {
    sm: 'text-[11px] py-1.5 px-3',
    md: 'text-xs py-2 px-4',
    lg: 'text-sm py-2.5 px-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative rounded-full font-medium transition-colors select-none duration-200 outline-none flex items-center gap-2 ${sizeStyles[size]} ${
              isActive ? 'text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="spring-tab-active-indicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 shadow-[0_2px_12px_rgba(245,158,11,0.25)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 font-sans tracking-wide">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`relative z-10 text-[9px] font-sans px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-black/20 text-black font-bold'
                    : 'bg-white/10 text-zinc-300'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
