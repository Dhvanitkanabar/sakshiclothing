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
  Check
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

export default function SubscribersBroadcast() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    fetchSubscribers();
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

  const handleBroadcast = async () => {
    if (!heading.trim()) {
      toast.error('Please enter an update heading');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter an update description');
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
            onClick={fetchSubscribers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Roster</span>
          </button>
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
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Broadcast Dispatch Channel
            </span>
            <span className="text-sm font-bold font-sans text-purple-700 truncate block">
              sakshiclothing2025@gmail.com
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

        <form onSubmit={(e) => { e.preventDefault(); setShowConfirmModal(true); }} className="space-y-5">
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
                Will be delivered to <strong>{subscribers.filter(s => s.isActive).length} patrons</strong> from <strong>sakshiclothing2025@gmail.com</strong>.
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
