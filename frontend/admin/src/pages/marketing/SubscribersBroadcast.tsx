import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  Sparkles, 
  Search, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Eye,
  Calendar,
  Check,
  Settings,
  Key,
  ShieldCheck,
  HelpCircle,
  X,
  Lock,
  ChevronRight,
  Server
} from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  source: string;
  createdAt: string;
}

interface SmtpConfig {
  isConfigured: boolean;
  provider: string;
  host: string;
  port: number;
  user: string;
  fromEmail: string;
  fromName: string;
  hasPassword: boolean;
  maskedPassword?: string;
}

export default function SubscribersBroadcast() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // SMTP Gateway State
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig | null>(null);
  const [loadingSmtp, setLoadingSmtp] = useState(true);
  const [showSmtpModal, setShowSmtpModal] = useState(false);

  // SMTP Settings Form
  const [smtpProvider, setSmtpProvider] = useState<'gmail' | 'custom'>('gmail');
  const [smtpUser, setSmtpUser] = useState('sakshiclothing2025@gmail.com');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('Sakshi Clothing Atelier');
  const [smtpFromEmail, setSmtpFromEmail] = useState('sakshiclothing2025@gmail.com');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [savingSmtp, setSavingSmtp] = useState(false);

  // Direct Test Email State
  const [testRecipient, setTestRecipient] = useState('sakshiclothing2025@gmail.com');
  const [testingEmail, setTestingEmail] = useState(false);

  // Broadcast Composer State
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [ctaText, setCtaText] = useState('Explore The Drop');
  const [broadcasting, setBroadcasting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/subscribers`);
      const data = await res.json();
      if (res.ok && data.data) {
        setSubscribers(data.data);
      } else {
        toast.error(data.message || 'Failed to load subscribers');
      }
    } catch (err: any) {
      toast.error('Network error loading subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSmtpConfig = async () => {
    setLoadingSmtp(true);
    try {
      const res = await adminFetch(`${API_URL}/subscribers/smtp`);
      const data = await res.json();
      if (res.ok && data.data) {
        setSmtpConfig(data.data);
        if (data.data.user) {
          setSmtpUser(data.data.user);
          setTestRecipient(data.data.user);
        }
        if (data.data.fromEmail) setSmtpFromEmail(data.data.fromEmail);
        if (data.data.fromName) setSmtpFromName(data.data.fromName);
        if (data.data.provider) setSmtpProvider(data.data.provider as any);
        if (data.data.host) setSmtpHost(data.data.host);
        if (data.data.port) setSmtpPort(data.data.port);
      }
    } catch (err) {
      console.warn('Could not fetch SMTP configuration', err);
    } finally {
      setLoadingSmtp(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchSmtpConfig();
  }, []);

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from subscribers?`)) return;

    try {
      const res = await adminFetch(`${API_URL}/subscribers/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Removed ${email} from subscriber roster`);
        setSubscribers(prev => prev.filter(s => s._id !== id));
      } else {
        toast.error(data.message || 'Failed to remove subscriber');
      }
    } catch (err) {
      toast.error('Error removing subscriber');
    }
  };

  const handleSaveSmtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!smtpUser.trim() || !smtpUser.includes('@')) {
      toast.error('Please enter a valid Gmail / sender email');
      return;
    }
    if (!smtpPassword.trim() && !smtpConfig?.hasPassword) {
      toast.error('Please enter your 16-character Google App Password');
      return;
    }

    setSavingSmtp(true);
    try {
      const res = await adminFetch(`${API_URL}/subscribers/smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: smtpProvider,
          host: smtpHost,
          port: Number(smtpPort),
          user: smtpUser.trim(),
          password: smtpPassword.trim(),
          fromEmail: smtpFromEmail.trim() || smtpUser.trim(),
          fromName: smtpFromName.trim() || 'Sakshi Clothing Atelier'
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'SMTP Gateway verified & connected successfully!');
        setShowSmtpModal(false);
        setSmtpPassword('');
        fetchSmtpConfig();
      } else {
        toast.error(data.message || 'Failed to verify SMTP credentials');
      }
    } catch (err: any) {
      toast.error('Failed to save SMTP configuration');
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async (overrideEmail?: string) => {
    const target = overrideEmail || testRecipient || smtpUser;
    if (!target || !target.includes('@')) {
      toast.error('Please enter a valid email address to receive the test email');
      return;
    }

    setTestingEmail(true);
    try {
      const res = await adminFetch(`${API_URL}/subscribers/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: target.trim(),
          user: smtpUser.trim(),
          password: smtpPassword.trim(),
          provider: smtpProvider,
          host: smtpHost,
          port: Number(smtpPort),
          fromEmail: smtpFromEmail.trim() || smtpUser.trim(),
          fromName: smtpFromName.trim() || 'Sakshi Clothing Atelier'
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Test email dispatched to ${target}!`);
      } else {
        toast.error(data.message || 'Failed to dispatch test email');
      }
    } catch (err: any) {
      toast.error('Error dispatching test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleBroadcast = async () => {
    if (!heading.trim()) {
      toast.error('Please enter an update heading');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter an update description');
      return;
    }

    if (!smtpConfig?.isConfigured) {
      toast.error('Email Gateway is not configured. Please enter your Gmail App Password first.');
      setShowConfirmModal(false);
      setShowSmtpModal(true);
      return;
    }

    setBroadcasting(true);
    setShowConfirmModal(false);

    try {
      const res = await adminFetch(`${API_URL}/subscribers/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: heading.trim(),
          description: description.trim(),
          ctaLink: ctaLink.trim(),
          ctaText: ctaText.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Update sent to all subscribed patrons!`);
        // Reset composer
        setHeading('');
        setDescription('');
      } else {
        toast.error(data.message || 'Failed to broadcast update');
        if (data.message?.toLowerCase().includes('smtp') || data.message?.toLowerCase().includes('gateway')) {
          setShowSmtpModal(true);
        }
      }
    } catch (err) {
      toast.error('Failed to send broadcast email');
    } finally {
      setBroadcasting(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => 
    (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sub.email && sub.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles size={13} />
            <span>Maison Patron Outreach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-slate-900">
            Subscribers & 1-Click Broadcast
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View all customers subscribed to the Atelier Circle and broadcast instant email updates to their inboxes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSmtpModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Settings size={14} />
            <span>Email Gateway Setup</span>
          </button>

          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* SMTP GATEWAY STATUS BANNER */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        smtpConfig?.isConfigured 
          ? 'bg-emerald-500/5 border-emerald-500/30' 
          : 'bg-amber-500/10 border-amber-500/40'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              smtpConfig?.isConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              {smtpConfig?.isConfigured ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  {smtpConfig?.isConfigured ? 'Live SMTP Email Gateway Connected' : 'Live Email Gateway Not Configured'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  smtpConfig?.isConfigured 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {smtpConfig?.isConfigured ? 'Active & Delivering' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {smtpConfig?.isConfigured 
                  ? `Authenticated through ${smtpConfig.user} (${smtpConfig.provider.toUpperCase()} SSL). Broadcasts will deliver directly to real patron inboxes.`
                  : 'To send real emails to your subscribers, connect your Gmail 16-character App Password (takes 1 minute).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {smtpConfig?.isConfigured && (
              <button
                type="button"
                onClick={() => handleSendTestEmail()}
                disabled={testingEmail}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send size={13} className={testingEmail ? 'animate-spin' : ''} />
                <span>{testingEmail ? 'Sending Test...' : 'Send Live Test Mail'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSmtpModal(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 ${
                smtpConfig?.isConfigured 
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <Key size={13} />
              <span>{smtpConfig?.isConfigured ? 'Edit Credentials' : 'Connect Gmail Password Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Total Subscribed Users
            </span>
            <span className="text-2xl font-bold font-sans text-slate-900">
              {subscribers.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Active Email Delivery
            </span>
            <span className="text-2xl font-bold font-sans text-emerald-600">
              {subscribers.filter(s => s.isActive).length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Mail size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Broadcast Dispatch Channel
            </span>
            <span className="text-sm font-bold font-sans text-purple-700 truncate block">
              {smtpConfig?.user || 'sakshiclothing2025@gmail.com'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: 1-CLICK BROADCAST EMAIL COMPOSER */}
      <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
              <Send size={13} />
              <span>Broadcast Composer</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Compose & Send Update to All Subscribed Users
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the headline and description. When you click the broadcast button, every subscriber receives a formatted email announcement immediately.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start md:self-auto"
          >
            <Eye size={14} />
            <span>Preview Email Design</span>
          </button>
        </div>

        <form onSubmit={(e) => { 
          e.preventDefault(); 
          if (!smtpConfig?.isConfigured) {
            toast.error('Email Gateway is not configured. Please connect your Gmail 16-character App Password first.');
            setShowSmtpModal(true);
            return;
          }
          setShowConfirmModal(true); 
        }} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Update Heading / Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Special Festive Collection Arrival: Exclusive Pure Brocade Sarees Now Available"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Update Description / Message Body <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the complete announcement details here. Mention new arrivals, special boutique highlights, or styling updates..."
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Action Button Link (CTA URL)
              </label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="/shop or /shop?category=Women"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Action Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. View Collection Drop"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <span>
                Will be delivered to <strong>{subscribers.filter(s => s.isActive).length} patrons</strong> from <strong>{smtpConfig?.user || 'sakshiclothing2025@gmail.com'}</strong>.
              </span>
            </div>

            <button
              type="submit"
              disabled={broadcasting || subscribers.length === 0}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-sans uppercase tracking-widest font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send size={15} />
              <span>{broadcasting ? 'Sending Mail Broadcast...' : 'Send Update to All Subscribed Users'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SUBSCRIBED PATRONS ROSTER TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Subscribed Patrons Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All website visitors and buyers who joined the Atelier Circle with their name and email address.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Patron Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Subscribed Date</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-amber-500" />
                    Loading subscriber records...
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No subscribers found matching your query.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {(sub.name || 'P')[0].toUpperCase()}
                        </div>
                        <span>{sub.name || 'Patron'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {sub.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>
                          {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                        {sub.source || 'Atelier Circle Footer'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete subscriber"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SMTP CONFIGURATION MODAL */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Live Email Gateway Setup
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure real email delivery for subscribers, orders & announcements.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSmtpModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {/* Instruction Guide */}
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-amber-800 flex items-center gap-1.5">
                <HelpCircle size={14} />
                <span>How to connect your Gmail in 1 Minute:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed pl-1">
                <li>Log in to <strong>Google Account</strong> for <code>sakshiclothing2025@gmail.com</code></li>
                <li>Ensure <strong>2-Step Verification</strong> is switched ON in Google Security settings</li>
                <li>Go directly to: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold inline-flex items-center gap-1">myaccount.google.com/apppasswords <ExternalLink size={11} /></a></li>
                <li>Create an App named <strong>"Sakshi Clothing"</strong> and click Generate</li>
                <li>Copy the <strong>16-letter App Password</strong> (e.g. <code>abcd efgh ijkl mnop</code>) and paste it below:</li>
              </ol>
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-4">
              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSmtpProvider('gmail');
                    setSmtpHost('smtp.gmail.com');
                    setSmtpPort(465);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    smtpProvider === 'gmail' 
                      ? 'border-amber-500 bg-amber-500/10 text-slate-900 font-bold' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-semibold">Gmail (Recommended)</span>
                  <span className="text-[11px] text-slate-500">smtp.gmail.com:465</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmtpProvider('custom')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    smtpProvider === 'custom' 
                      ? 'border-amber-500 bg-amber-500/10 text-slate-900 font-bold' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-semibold">Custom SMTP</span>
                  <span className="text-[11px] text-slate-500">Hostinger, SES, Zoho</span>
                </button>
              </div>

              {smtpProvider === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="e.g. smtp.hostinger.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Port
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      placeholder="465 or 587"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Gmail / Sender Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => {
                    setSmtpUser(e.target.value);
                    setSmtpFromEmail(e.target.value);
                  }}
                  placeholder="sakshiclothing2025@gmail.com"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Google 16-Character App Password <span className="text-red-500">*</span>
                  </label>
                  {smtpConfig?.hasPassword && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={12} /> Currently Saved ({smtpConfig.maskedPassword})
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder={smtpConfig?.hasPassword ? "Leave blank to keep existing password, or enter new" : "e.g. abcd efgh ijkl mnop"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono tracking-wider"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Spaces are removed automatically. Use Google App Password, NOT your regular Gmail account login password.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    placeholder="Sakshi Clothing Atelier"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    From Address
                  </label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    placeholder="sakshiclothing2025@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Direct Verification & Test Strip */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSendTestEmail(smtpUser)}
                  disabled={testingEmail || (!smtpPassword && !smtpConfig?.hasPassword)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send size={13} className={testingEmail ? 'animate-spin' : ''} />
                  <span>{testingEmail ? 'Dispatching Test Mail...' : 'Send Live Test Mail to ' + (smtpUser.split('@')[0] || 'User')}</span>
                </button>

                <button
                  type="submit"
                  disabled={savingSmtp}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Check size={14} />
                  <span>{savingSmtp ? 'Verifying & Saving...' : 'Save & Activate Gateway'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Send size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Confirm 1-Click Broadcast
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to broadcast this email to all <strong>{subscribers.filter(s => s.isActive).length} active subscribers</strong>?
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
              <p><strong>Heading:</strong> {heading}</p>
              <p className="line-clamp-2"><strong>Message:</strong> {description}</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcast}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                Confirm & Send Emails
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12100e] text-[#f5f2eb] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-amber-900/50 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-amber-400">
                Email Template Preview
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10"
              >
                Close ✕
              </button>
            </div>

            <div className="border border-stone-800 rounded-2xl p-6 bg-[#1a1714] space-y-4 text-center">
              <div className="font-sans text-2xl tracking-[0.3em] font-light text-white">SAKSHI</div>
              <div className="text-[9px] font-sans tracking-[0.3em] text-amber-400 uppercase -mt-2">
                ATELIER PRIVATE CIRCLE · SURAT
              </div>
              <div className="h-px bg-stone-800 my-3" />
              <div className="text-left space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[9px] uppercase tracking-wider">
                  Patron Circle Update
                </span>
                <h4 className="text-lg font-normal text-white">
                  {heading || "Special Festive Collection Arrival"}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Dear Valued Patron,
                </p>
                <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-line">
                  {description || "We are pleased to introduce our newest collection of handwoven pure mulberry silks and certified heirloom jewellery..."}
                </p>
                <div className="pt-3 text-center">
                  <span className="inline-block px-6 py-2.5 bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg">
                    {ctaText || 'View Collection Drop'} &rarr;
                  </span>
                </div>
              </div>
              <div className="border-t border-stone-800 pt-4 text-[10px] text-stone-500 text-center space-y-1">
                <p><strong>Sakshi Clothing Atelier</strong></p>
                <p>G-903 Sentosa Heights, Utran, Surat, Gujarat, India</p>
                <p>Helpline: +91 9316533660 &bull; sakshiclothing2025@gmail.com</p>
                <p>Strict No Return Policy on all bespoke handcrafted garments.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
