import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Layers, Tag,
  FileText, CreditCard, BarChart2, Users,
  Ticket, Star, Sparkles, LogOut, History, Clock,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminFetch } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen = false, setMobileMenuOpen }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLinkHover = (path: string) => {
    if (path === '/products') {
      adminFetch(`${API_URL}/products?limit=50`).catch(() => {});
      adminFetch(`${API_URL}/categories`).catch(() => {});
    } else if (path === '/categories') {
      adminFetch(`${API_URL}/categories`).catch(() => {});
    } else if (path === '/orders') {
      adminFetch(`${API_URL}/orders?limit=50`).catch(() => {});
    }
  };

  const navGroups = [
    {
      title: 'Store Management',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },

        { path: '/products', label: 'Products', icon: ShoppingBag },
        { path: '/inventory', label: 'Inventory', icon: Layers },
        { path: '/categories', label: 'Categories', icon: Tag },
      ]
    },
    {
      title: 'Orders & Customers',
      items: [
        { path: '/orders', label: 'All Orders', icon: Clock },
        { path: '/order-history', label: 'Order History', icon: History },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/payments', label: 'Payments', icon: CreditCard },
        { path: '/reports', label: 'Analytics & Reports', icon: BarChart2 },
        { path: '/cms', label: 'Store CMS', icon: FileText },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { path: '/marketing/coupons', label: 'Coupons & Discounts', icon: Ticket },
        { path: '/marketing/reviews', label: 'Customer Reviews', icon: Star },
      ]
    }
  ];

  const handleLinkClick = () => {
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const renderNavContent = (isMobileView: boolean = false) => {
    const isExpanded = isMobileView || !collapsed;

    return (
      <div className="flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center font-bold font-sans text-xl shadow-lg shadow-amber-500/20 shrink-0">
              S
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <h2 className="font-sans text-lg font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                  SAKSHI <Sparkles size={13} className="text-amber-400 shrink-0" />
                </h2>
                <p className="text-[10px] font-sans tracking-widest text-slate-400 uppercase truncate">
                  Admin Control Suite
                </p>
              </div>
            )}
          </Link>

          {isMobileView ? (
            <button
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Menu"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              {isExpanded && (
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        onMouseEnter={() => handleLinkHover(item.path)}
                        title={!isExpanded ? item.label : undefined}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${

                          isActive
                            ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent text-amber-300 font-semibold border-l-2 border-amber-400 shadow-xs'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                        }`}
                      >
                        <Icon
                          size={17}
                          className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                            isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        {isExpanded && <span className="truncate">{item.label}</span>}
                        {isActive && (
                          <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Admin User Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#050811] shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 font-sans">
              {user?.name?.charAt(0) || 'S'}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Sakshi Admin'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-sans">Executive Access</span>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign out of Console"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer (Sliding Overlay) */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#080d19] text-slate-300 z-50 lg:hidden shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-800/80 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent(true)}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex bg-[#080d19] text-slate-300 min-h-screen flex-col border-r border-slate-800/60 sticky top-0 h-screen overflow-y-auto select-none transition-all duration-300 z-40 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {renderNavContent(false)}
      </aside>
    </>
  );
}
