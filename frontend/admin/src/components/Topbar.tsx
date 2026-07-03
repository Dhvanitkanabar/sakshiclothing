import { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Topbar = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (search.length > 2) {
      fetch(`${API_URL}/search/admin?q=${search}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setResults(data.data);
            setShowResults(true);
          }
        });
    } else {
      setShowResults(false);
    }
  }, [search]);

  useEffect(() => {
    fetch(`${API_URL}/notifications/admin`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.data);
        }
      });
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-gray-500 hover:text-gray-900">
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Global search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm bg-gray-50"
          />
          {showResults && results && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[400px] overflow-y-auto z-50">
              {results.products.length > 0 && (
                <div className="p-2 border-b border-gray-50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Products</h4>
                  {results.products.map((p: any) => (
                    <Link key={p._id} to={`/products/edit/${p._id}`} className="block px-2 py-1.5 text-sm hover:bg-gray-50 rounded-lg">{p.name}</Link>
                  ))}
                </div>
              )}
              {results.orders.length > 0 && (
                <div className="p-2 border-b border-gray-50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Orders</h4>
                  {results.orders.map((o: any) => (
                    <Link key={o._id} to={`/orders/${o._id}`} className="block px-2 py-1.5 text-sm hover:bg-gray-50 rounded-lg">{o.orderNumber}</Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-500 hover:text-gray-900 relative p-2">
            <Bell size={20} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {showNotifications && (
            <div className="absolute top-full right-0 w-80 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[400px] overflow-y-auto z-50 p-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider px-2 mb-2 py-2 border-b">Notifications</h4>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 px-2 py-4 text-center">No notifications</p>
              ) : notifications.map(n => (
                <div key={n._id} className={`p-2 mb-1 rounded-lg text-sm ${n.isRead ? 'opacity-50' : 'bg-gray-50 font-medium'}`}>
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
};

export default Topbar;
