import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, ArrowUp, X, PhoneCall, Clock, CheckCircle } from 'lucide-react';

export function FloatingActionDock() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState('Bridal Couture');

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
      setShowScrollTop(currentScroll > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setIsConciergeOpen(false);
      setFormSubmitted(false);
      setClientName('');
      setClientPhone('');
    }, 2800);
  };

  return (
    <>
      {/* Floating Action Pill */}
      <div className="fixed bottom-24 md:bottom-8 right-5 md:right-8 z-40 flex items-center gap-2.5">
        {/* VIP Styling Concierge Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsConciergeOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/80 hover:bg-black text-white border border-amber-400/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span className="text-xs font-sans tracking-wider text-amber-200 hidden sm:inline">
            VIP Atelier Concierge
          </span>
          <span className="text-[11px] font-sans tracking-wider text-amber-200 sm:hidden">
            Concierge
          </span>
        </motion.button>

        {/* Scroll To Top with Circular Progress Indicator */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="relative w-10 h-10 rounded-full bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-lg transition-colors hover:border-amber-400"
              title="Return to runway summit"
            >
              {/* Circular SVG Progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray={106.8}
                  strokeDashoffset={106.8 - (106.8 * scrollProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-150"
                />
              </svg>
              <ArrowUp size={15} className="text-amber-300 relative z-10" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Concierge Modal */}
      <AnimatePresence>
        {isConciergeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-[#0c0d12] border border-amber-500/30 p-6 md:p-8 shadow-2xl text-white overflow-hidden"
            >
              {/* Gold gradient top highlight */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600" />

              <button
                onClick={() => setIsConciergeOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              {formSubmitted ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle size={28} />
                  </div>
                  <h3 className="text-xl font-sans text-white">Privileged Request Received</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Our Head Atelier Stylist will contact {clientName} within 30 minutes to curate your private fitting session.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-sans tracking-widest uppercase text-amber-400">
                        Sakshi Haute Concierge
                      </span>
                    </div>
                    <h3 className="text-2xl font-sans text-white">Bespoke Styling Session</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Schedule a private consultation for bridal trousseau, bespoke menswear, or heritage heirloom draping.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-sans uppercase text-zinc-400 mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alisha Singhania"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans uppercase text-zinc-400 mb-1.5">
                        WhatsApp / Contact Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans uppercase text-zinc-400 mb-1.5">
                        Couture Universe of Interest
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['Bridal Couture', 'Atelier Homme', 'Heirloom Saris', 'Fine Jewellery'].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setSelectedUniverse(u)}
                            className={`px-3 py-2 rounded-xl text-left font-medium transition-all ${
                              selectedUniverse === u
                                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                                : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:border-white/15'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black font-semibold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                      >
                        <PhoneCall size={14} />
                        Request VIP Styling Callback
                      </button>
                    </div>

                    <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1.5 pt-1">
                      <Clock size={11} className="text-amber-400" />
                      Priority response guaranteed within 30 minutes
                    </p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
