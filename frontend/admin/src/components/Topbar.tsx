import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminFetch } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Topbar = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (search.length > 2) {
      adminFetch(`${API_URL}/search/admin?q=${search}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setResults(data.data);
            setShowResults(true);
          }
        })
        .catch(() => {});
    } else {
      setShowResults(false);
    }
  }, [search]);

  useEffect(() => {
    adminFetch(`${API_URL}/notifications/admin`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-3.5 flex justify-between items-center sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search products, orders, customers... (Ctrl + K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 py-2 rounded-xl border border-slate-200 w-80 lg:w-96 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs bg-slate-50/50 transition-all font-sans"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">⌘K</span>

          {showResults && results && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[400px] overflow-y-auto z-50 p-3">
              {results.products?.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">Products</h4>
                  {results.products.map((p: any) => (
                    <Link key={p._id} to={`/products/edit/${p._id}`} onClick={() => setShowResults(false)} className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors">
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
              {results.orders?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">Orders</h4>
                  {results.orders.map((o: any) => (
                    <Link key={o._id} to={`/orders/${o._id}`} onClick={() => setShowResults(false)} className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors font-mono">
                      {o.orderNumber}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Maison Live Sync Active
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative"
          >
            <Bell size={18} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[400px] overflow-y-auto z-50 p-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                Notifications
                <span className="text-[10px] text-amber-600 font-normal">Live feed</span>
              </h4>
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No new notifications</p>
              ) : notifications.map(n => (
                <div key={n._id} className={`p-3 mb-2 rounded-xl text-xs ${n.isRead ? 'text-slate-400 bg-slate-50' : 'bg-amber-50/60 text-slate-900 font-medium border border-amber-100'}`}>
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
