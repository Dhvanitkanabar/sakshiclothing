import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Layers, Tag,
  FileText, Package, CreditCard, BarChart2, Users,
  Ticket, Star, Sparkles, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navGroups = [
    {
      title: 'Core Management',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/products', label: 'Products', icon: ShoppingBag },
        { path: '/inventory', label: 'Inventory', icon: Layers },
        { path: '/categories', label: 'Categories', icon: Tag },
      ]
    },
    {
      title: 'Store Operations',
      items: [
        { path: '/orders', label: 'Orders', icon: Package },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/payments', label: 'Payments', icon: CreditCard },
        { path: '/reports', label: 'Analytics', icon: BarChart2 },
        { path: '/cms', label: 'Homepage CMS', icon: FileText },
      ]
    },
    {
      title: 'Marketing & Retention',
      items: [
        { path: '/marketing/coupons', label: 'Coupons', icon: Ticket },
        { path: '/marketing/reviews', label: 'Reviews', icon: Star },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-[#090D16] text-slate-300 min-h-screen flex flex-col border-r border-slate-800/60 sticky top-0 h-screen overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center font-bold font-serif text-xl shadow-lg shadow-amber-500/20">
            S
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              SAKSHI <Sparkles size={14} className="text-amber-400" />
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Maison Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 font-semibold border-l-2 border-amber-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon
                        size={17}
                        className={`transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060911]">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Maison Admin'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@sakshiclothing.com'}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
