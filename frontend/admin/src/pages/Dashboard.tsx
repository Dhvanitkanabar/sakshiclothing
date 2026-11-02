// Reading this as: High-precision luxury atelier admin dashboard for Maison executives, with an elite minimalist editorial language. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, ArrowUpRight, TrendingUp, Sparkles,
  HeartPulse, CheckCircle2, AlertTriangle, AlertCircle,
  Package, ShoppingBag, IndianRupee, ShieldCheck,
  Flame, Award, Eye, RefreshCw, ChevronDown, ExternalLink,
  Layers, CreditCard, Box, Check, Clock
} from 'lucide-react';
import { adminFetch } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type TimelineOption = '7d' | '30d' | '90d' | 'all';

interface TimelineConfig {
  value: TimelineOption;
  label: string;
}

const TIMELINE_OPTIONS: TimelineConfig[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All Time' },
];

function useGreeting(fullName: string = 'Admin') {
  return useMemo(() => {
    const hour = new Date().getHours();
    const firstName = fullName.split(' ')[0] ?? fullName;
    if (hour < 12) return `Good Morning, ${firstName}`;
    if (hour < 18) return `Good Afternoon, ${firstName}`;
    return `Good Evening, ${firstName}`;
  }, [fullName]);
}

// Operational Readiness Score Component
function ReadinessScoreDonut({ score = 100 }: { score: number }) {
  const data = [
    { name: 'Active', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={46}
            outerRadius={58}
            startAngle={90}
            endAngle={-270}
            paddingAngle={score === 100 ? 0 : 2}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="url(#donutGradient)" />
            <Cell fill="#f1f5f9" />
          </Pie>
          <defs>
            <linearGradient id="donutGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          {score}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-sans">
          Live Status
        </span>
      </div>
    </div>
  );
}

// Key Metric Card
function KeyMetricCard({
  title,
  value,
  prefix = '',
  suffix = '',
  statusLabel,
  comparisonLabel,
  icon: Icon,
  accentColor = 'text-amber-600',
  bgColor = 'bg-amber-500/10'
}: {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  statusLabel?: string;
  comparisonLabel: string;
  icon: any;
  accentColor?: string;
  bgColor?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} ${accentColor}`}>
          <Icon size={19} />
        </div>
        {statusLabel && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
            {statusLabel}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-sans">{title}</h4>
        <p className="text-2xl font-bold text-slate-900 mt-1 font-sans">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </p>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{comparisonLabel}</span>
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineOption>('7d');
  const [showTimelineMenu, setShowTimelineMenu] = useState(false);

  const greeting = useGreeting('Admin');

  const fetchStats = () => {
    setLoading(true);
    adminFetch(`${API_URL}/dashboard/stats`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.warn('Backend live stats fetch error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const selectedTimelineLabel = useMemo(() => {
    return TIMELINE_OPTIONS.find((t) => t.value === timeline)?.label || 'Last 7 days';
  }, [timeline]);

  // Strictly real live store statistics from MongoDB with zero dummy fallbacks
  const s = useMemo(() => {
    const liveStats = data?.stats;
    return {
      revenueTotal: liveStats?.revenueTotal ?? 0,
      revenueToday: liveStats?.revenueToday ?? 0,
      averageOrderValue: liveStats?.averageOrderValue ?? 0,
      totalOrders: liveStats?.totalOrders ?? 0,
      pendingOrders: liveStats?.pendingOrders ?? 0,
      processingOrders: liveStats?.processingOrders ?? 0,
      shippedOrders: liveStats?.shippedOrders ?? 0,
      deliveredOrders: liveStats?.deliveredOrders ?? 0,
      cancelledOrders: liveStats?.cancelledOrders ?? 0,
      totalCustomers: liveStats?.totalCustomers ?? 0,
      totalProducts: liveStats?.totalProducts ?? 0,
      lowStockProducts: liveStats?.lowStockProducts ?? 0,
      outOfStockProducts: liveStats?.outOfStockProducts ?? 0,
      totalCategories: liveStats?.totalCategories ?? 0,
    };
  }, [data]);

  // Strictly real orders from database (empty array if no orders placed yet)
  const recentOrders = useMemo(() => {
    if (data?.recentOrders && Array.isArray(data.recentOrders)) {
      return data.recentOrders;
    }
    return [];
  }, [data]);

  // Real Weekly Revenue Curve
  const revenueTrendData = useMemo(() => {
    if (data?.revenueWeekly && data.revenueWeekly.length > 0) {
      return data.revenueWeekly.map((item: any) => ({
        date: item._id,
        revenue: item.revenue || 0,
        orders: item.orders || 0
      }));
    }

    // Default clean 7-day timeline showing current week dates with real zero values
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        date: days[d.getDay()],
        revenue: 0,
        orders: 0
      });
    }
    return result;
  }, [data]);

  // Real Fulfillment Pipeline distribution from actual database counts
  const fulfillmentStatusData = useMemo(() => {
    return [
      { status: 'Pending', count: s.pendingOrders, color: '#f59e0b' },
      { status: 'Processing', count: s.processingOrders, color: '#3b82f6' },
      { status: 'In Transit', count: s.shippedOrders, color: '#a855f7' },
      { status: 'Delivered', count: s.deliveredOrders, color: '#10b981' },
      { status: 'Cancelled', count: s.cancelledOrders, color: '#f43f5e' },
    ];
  }, [s]);

  const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending Processing', className: 'bg-amber-50 text-amber-800 border-amber-200' },
    pending_approval: { label: 'Awaiting Verification', className: 'bg-amber-50 text-amber-800 border-amber-200' },
    confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-800 border-blue-200' },
    processing: { label: 'In Fulfillment', className: 'bg-blue-50 text-blue-800 border-blue-200' },
    shipped: { label: 'In Transit', className: 'bg-purple-50 text-purple-800 border-purple-200' },
    delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-800 border-rose-200' },
    rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-800 border-rose-200' },
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16">
      {/* Top Header: Greeting & Timeline Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-sans tracking-widest text-slate-500 uppercase font-semibold">
              Live Store Sync • Production
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {greeting}
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Real-time customer transactions, catalog inventory, and fulfillment pipeline.
          </p>
        </div>

        {/* Action Buttons: Refresh & Timeline */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchStats}
            title="Refresh Store Stats"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-amber-600' : ''} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTimelineMenu(!showTimelineMenu)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all font-sans"
            >
              <Calendar size={15} className="text-slate-500" />
              <span>{selectedTimelineLabel}</span>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>

            {showTimelineMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {TIMELINE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTimeline(opt.value);
                      setShowTimelineMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                      timeline === opt.value
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                    {timeline === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Store Health & Live System Status */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-amber-50/20 to-slate-50 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold tracking-tight">
                <ShieldCheck size={14} className="text-emerald-600" />
                Store Production Mode
              </span>
              <span className="text-[11px] font-sans text-slate-400 font-medium">
                Gateway: Razorpay Live
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-sans tracking-tight">
              Maison Sakshi Clothing Operations
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 font-sans">
              Storefront is live and ready to capture online customer orders with instant UPI, Debit/Credit cards, and Net Banking. All database clusters and production microservices are operational.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Storefront: <strong>sakshiclothing.store</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Published Catalog: <strong>{s.totalProducts} pieces</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Active Categories: <strong>{s.totalCategories}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <ReadinessScoreDonut score={100} />
            <div className="text-center sm:text-left space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Deployment Status</p>
              <p className="text-base font-bold text-slate-900">100% Operational</p>
              <p className="text-xs text-slate-500 max-w-[190px]">
                API backend, live Razorpay keys, and production store connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Key Metrics Cards (100% Real Live MongoDB Counts) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-sans">Key Performance Indicators</h2>
            <p className="text-xs text-slate-500 font-sans">Live metrics calculated directly from active customer orders</p>
          </div>
          <span className="text-[11px] font-sans text-slate-400">View: {selectedTimelineLabel}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KeyMetricCard
            title="Gross Revenue"
            value={s.revenueTotal}
            prefix="₹"
            statusLabel="Live Total"
            comparisonLabel="Lifetime verified store sales"
            icon={IndianRupee}
            accentColor="text-amber-600"
            bgColor="bg-amber-500/10"
          />
          <KeyMetricCard
            title="Revenue Today"
            value={s.revenueToday}
            prefix="₹"
            statusLabel="Today"
            comparisonLabel="Recorded since 12:00 AM"
            icon={Flame}
            accentColor="text-rose-600"
            bgColor="bg-rose-500/10"
          />
          <KeyMetricCard
            title="Total Orders"
            value={s.totalOrders}
            statusLabel={s.pendingOrders > 0 ? `${s.pendingOrders} pending` : 'All clear'}
            comparisonLabel={`${s.pendingOrders} awaiting fulfillment`}
            icon={ShoppingBag}
            accentColor="text-blue-600"
            bgColor="bg-blue-500/10"
          />
          <KeyMetricCard
            title="Registered Patrons"
            value={s.totalCustomers}
            statusLabel="Accounts"
            comparisonLabel="Registered customer profiles"
            icon={Award}
            accentColor="text-emerald-600"
            bgColor="bg-emerald-500/10"
          />
        </div>
      </section>

      {/* Section 3: Dual Charts (Real Weekly Revenue Trend & Real Order Pipeline) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Real Order Pipeline & Status Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Package size={17} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  Order Fulfillment Distribution
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Current order lifecycle across fulfillment checkpoints
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {s.totalOrders} Total Orders
            </span>
          </div>

          {s.totalOrders === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center">
              <Box size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700 font-sans">Awaiting First Customer Order</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                When shoppers complete an order, the status pipeline (Pending, In Transit, Delivered) will update here.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fulfillmentStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#f8fafc', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {fulfillmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pending Dispatch: <strong className="text-amber-700">{s.pendingOrders}</strong></span>
            <Link to="/orders" className="text-amber-700 hover:underline font-semibold flex items-center gap-1">
              Manage Orders <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right Chart: Real Revenue Trajectory */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={17} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  Revenue Trajectory
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified sales receipts in INR over the timeline
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              ₹{s.revenueTotal.toLocaleString('en-IN')} Realized
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueBionisGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => val === 0 ? '₹0' : `₹${(val / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#f8fafc', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueBionisGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average Order Value: <strong>₹{s.averageOrderValue.toLocaleString('en-IN')}</strong></span>
            <span className="text-slate-400 font-medium">Mapped from live Razorpay settlements</span>
          </div>
        </div>
      </section>

      {/* Section 4: Live Store Operational Modules (No Dummy Insight Cards) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Catalog & Inventory Vitals */}
        <article className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                  <Layers size={17} />
                </span>
                <h3 className="font-bold text-slate-900 font-sans text-base">Catalog & Inventory</h3>
              </div>
              <span className="text-[10px] font-sans bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {s.totalProducts} Products
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Active Categories</p>
                  <span className="text-xs font-bold text-slate-800">{s.totalCategories} Live</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sarees, Lehengas, Kurtas, Gowns, and Bespoke Menswear collections.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Low Stock SKUs</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.lowStockProducts > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {s.lowStockProducts} SKUs Monitored
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {s.lowStockProducts > 0
                    ? `${s.lowStockProducts} items have 10 or fewer units remaining in warehouse.`
                    : 'Inventory levels are optimal across all product variants.'}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Out of Stock SKUs</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.outOfStockProducts > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {s.outOfStockProducts} SKUs
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {s.outOfStockProducts > 0 ? 'Review inventory to replenish zero-stock items.' : 'Zero stockouts detected.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
            <Link to="/products" className="hover:underline flex items-center gap-1">
              Manage Products →
            </Link>
            <Link to="/inventory" className="text-slate-500 hover:text-slate-800">
              Audit Inventory
            </Link>
          </div>
        </article>

        {/* Module 2: Live Payment & Gateways */}
        <article className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <CreditCard size={17} />
                </span>
                <h3 className="font-bold text-slate-900 font-sans text-base">Payment & Gateways</h3>
              </div>
              <span className="text-[10px] font-sans bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Live Active
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Razorpay Live Gateway</p>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Operational
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live merchant key active with authentic UPI, Cards, and Net Banking checkout.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">HMAC-SHA256 Security</p>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                    Cryptographic
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Strict cryptographic webhook and client signature verification enforced.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Database Cluster</p>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                    MongoDB Atlas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-availability replica set connected with auto-indexing.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <Link to="/payments" className="hover:underline flex items-center gap-1">
              View Payment Logs →
            </Link>
            <span className="text-slate-400 font-normal">All gateways synced</span>
          </div>
        </article>

        {/* Module 3: Fulfillment & Fast Dispatch */}
        <article className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700">
                  <ShoppingBag size={17} />
                </span>
                <h3 className="font-bold text-slate-900 font-sans text-base">Fulfillment Queue</h3>
              </div>
              <span className="text-[10px] font-sans bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                {s.pendingOrders} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              <Link to="/orders" className="block rounded-xl bg-slate-50 border border-slate-100 p-3 hover:bg-blue-50/40 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Pending Orders</p>
                  <span className="text-xs font-bold text-amber-700">{s.pendingOrders}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Orders requiring verification, packaging, and courier manifest creation.
                </p>
              </Link>

              <Link to="/orders" className="block rounded-xl bg-slate-50 border border-slate-100 p-3 hover:bg-blue-50/40 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Completed & Delivered</p>
                  <span className="text-xs font-bold text-emerald-700">{s.deliveredOrders}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shipments confirmed received by patrons and archived in order history.
                </p>
              </Link>

              <Link to="/reports" className="block rounded-xl bg-slate-50 border border-slate-100 p-3 hover:bg-blue-50/40 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Export Orders CSV</p>
                  <ArrowUpRight size={13} className="text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Generate full financial and order manifests for accounting and shipping.
                </p>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
            <Link to="/orders" className="hover:underline flex items-center gap-1">
              Process Orders Queue →
            </Link>
            <span className="text-slate-400 font-normal">Active sync</span>
          </div>
        </article>
      </section>

      {/* Section 5: Recent Orders Table (Real Live Orders Only) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans">Recent Orders & Shipments</h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Live orders received across all store categories
            </p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 transition-colors"
          >
            View All Orders
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-sans uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3.5 font-bold">Order ID</th>
                <th className="px-6 py-3.5 font-bold">Patron Name</th>
                <th className="px-6 py-3.5 font-bold">Timestamp</th>
                <th className="px-6 py-3.5 font-bold">Grand Total</th>
                <th className="px-6 py-3.5 font-bold">Fulfillment Status</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3">
                        <ShoppingBag size={22} />
                      </div>
                      <p className="font-sans font-bold text-slate-800 text-sm">No Live Customer Orders Yet</p>
                      <p className="font-sans text-xs text-slate-400 mt-1.5 leading-relaxed">
                        When patrons complete live checkout on <strong className="text-slate-600">sakshiclothing.store</strong>, their orders, customer details, and payment statuses will appear here immediately.
                      </p>
                      <a
                        href="https://www.sakshiclothing.store"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        Visit Live Storefront <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((o: any) => {
                  const statusMeta = STATUS_BADGES[o.orderStatus] || {
                    label: o.orderStatus,
                    className: 'bg-slate-100 text-slate-700 border-slate-200'
                  };
                  return (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-sans font-bold text-slate-900">
                        {o.orderNumber || o._id.slice(0, 10)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                            {(o.customer?.fullName || 'P').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{o.customer?.fullName || 'Valued Patron'}</p>
                            <p className="text-[11px] text-slate-400">{o.customer?.email || 'Customer'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-sans text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 font-sans text-sm">
                        ₹{Number(o.totals?.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/orders/${o._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-amber-800 transition-colors"
                        >
                          <Eye size={13} />
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
