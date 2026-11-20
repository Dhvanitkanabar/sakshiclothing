import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X, Calendar, Percent, IndianRupee, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    expiryDate: ''
  });

  const fetchCoupons = () => {
    setLoading(true);
    adminFetch(`${API_URL}/coupons/admin`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCoupons(data.data);
        } else {
          setCoupons([]);
        }
      })
      .catch(err => {
        console.error('Error fetching coupons:', err);
        toast.error('Failed to load coupons');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      adminFetch(`${API_URL}/coupons/admin/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast.success(`Coupon "${code}" deleted`);
            fetchCoupons();
          } else {
            toast.error(data.message || 'Failed to delete coupon');
          }
        })
        .catch(() => toast.error('Error deleting coupon'));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscount: '',
      usageLimit: '',
      expiryDate: ''
    });
    setFormError(null);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Coupon code is required.');
      return;
    }

    const discountVal = Number(formData.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      setFormError('Discount value must be a positive number.');
      return;
    }

    if (formData.discountType === 'percentage' && discountVal > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    if (!formData.expiryDate) {
      setFormError('Expiration date is required.');
      return;
    }

    const expiryTime = new Date(formData.expiryDate).getTime();
    if (expiryTime <= Date.now()) {
      setFormError('Expiration date must be in the future.');
      return;
    }

    const payload: any = {
      code: cleanCode,
      discountType: formData.discountType,
      discountValue: discountVal,
      expiryDate: new Date(formData.expiryDate).toISOString()
    };

    if (formData.minimumOrderAmount && Number(formData.minimumOrderAmount) > 0) {
      payload.minimumOrderAmount = Number(formData.minimumOrderAmount);
    }

    if (formData.discountType === 'percentage' && formData.maximumDiscount && Number(formData.maximumDiscount) > 0) {
      payload.maximumDiscount = Number(formData.maximumDiscount);
    }

    if (formData.usageLimit && Number(formData.usageLimit) > 0) {
      payload.usageLimit = Math.floor(Number(formData.usageLimit));
    }

    setSubmitting(true);
    try {
      const res = await adminFetch(`${API_URL}/coupons/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Coupon "${cleanCode}" created successfully!`);
        setIsCreateOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        setFormError(data.message || 'Failed to create coupon.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error while creating coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Tag className="text-amber-500" /> Coupons & Promotions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage checkout promotional codes, percentage discounts and usage caps.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 bg-black text-white rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-all self-start sm:self-auto min-h-[44px]"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Mobile Responsive Cards (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No promotional coupons active. Create one to begin.
            </div>
          ) : (
            coupons.map(c => {
              const isExpired = new Date(c.expiryDate) <= new Date();
              const isEffectiveActive = c.isActive && !isExpired;

              return (
                <div key={c._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
                      {c.code}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      isEffectiveActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isEffectiveActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Discount</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Usage</span>
                      <span className="font-medium text-slate-800">
                        {c.usedCount || 0} / {c.usageLimit || '∞'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                    <span className="text-slate-400">
                      Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => handleDelete(c._id, c.code)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Delete coupon"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Usage Limit</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No promotional coupons active. Create one to begin.
                  </td>
                </tr>
              ) : (
                coupons.map(c => {
                  const isExpired = new Date(c.expiryDate) <= new Date();
                  const isEffectiveActive = c.isActive && !isExpired;

                  return (
                    <tr key={c._id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 uppercase font-mono tracking-wider">
                        {c.code}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                        {c.minimumOrderAmount > 0 && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            Min: ₹{c.minimumOrderAmount}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="font-bold text-slate-900">{c.usedCount || 0}</span> / {c.usageLimit || '∞'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          isEffectiveActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isEffectiveActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => !submitting && setIsCreateOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 sm:p-8 space-y-6 z-10 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Tag size={18} className="text-amber-500" /> Create New Coupon
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={submitting}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAKSHI20"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-bold uppercase text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                      value={formData.discountValue}
                      onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-4 py-2.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      {formData.discountType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional (e.g. 1999)"
                    value={formData.minimumOrderAmount}
                    onChange={e => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Usage Cap (Total times)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited if empty"
                    value={formData.usageLimit}
                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
