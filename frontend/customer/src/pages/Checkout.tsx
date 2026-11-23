// Reading this as: Single-Flow Checkout Page for Sakshi Clothing, with verified backend order initiation, Razorpay test mode integration, and mobile touch ergonomics. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, CreditCard, ArrowLeft, Lock, Tag, Award, MapPin, Edit3,
  Smartphone, Navigation, Banknote, CheckCircle2
} from 'lucide-react';
import MapPicker from '../components/MapPicker';
import { fetchAddresses, addAddress, placeOrder, initiateOrderCheckout, fetchCartQuote, CartQuote } from '../lib/api';
import { Button } from '../components/ui/Button';
import SEOHead from '../components/SEOHead';
import { BUSINESS_CONFIG } from '../config/business';
import { formatPrice } from '../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const Checkout: React.FC = () => {
  const { cart, cartQuote, totalPrice, clearCart, loading: cartLoading } = useCart();
  const { user, getClerkToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [liveQuote, setLiveQuote] = useState<CartQuote | null>(cartQuote);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addressInputMode, setAddressInputMode] = useState<'manual' | 'map'>('manual');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getFreshClerkToken = async (): Promise<string | null> => {
    try {
      const fresh = await getClerkToken();
      if (fresh) {
        setClerkToken(fresh);
        return fresh;
      }
    } catch (err) {
      console.warn('Could not refresh Clerk token:', err);
    }
    return clerkToken;
  };

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: user?.phone || '',
    country: 'India'
  });

  const [couponCode, setCouponCode] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'cod'>('razorpay');

  // Exact Delivery GPS Coordinates State
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [noReturnPolicyAcknowledged, setNoReturnPolicyAcknowledged] = useState(false);

  // Authoritative server-side quote calculation
  const fetchAuthoritativeQuote = async (codeToApply?: string, gatewayToUse?: string): Promise<CartQuote | null> => {
    if (cart.length === 0) return null;
    try {
      setQuoteLoading(true);
      const token = await getFreshClerkToken();
      const code = codeToApply !== undefined ? codeToApply : couponCode;
      const gateway = gatewayToUse !== undefined ? gatewayToUse : paymentGateway;
      const res = await fetchCartQuote(
        cart.map(i => ({ productId: i.id, variantId: (i as any).variantId, quantity: i.quantity, originalCartPrice: i.price })),
        code.trim() || undefined,
        gateway,
        token
      );
      if (res.success && res.data) {
        setLiveQuote(res.data);
        if (res.data.warnings && res.data.warnings.length > 0) {
          res.data.warnings.forEach(w => toast.info(w));
        }
        return res.data;
      }
    } catch (e) {
      console.error('Error fetching authoritative checkout quote:', e);
    } finally {
      setQuoteLoading(false);
    }
    return null;
  };

  useEffect(() => {
    if (cart.length > 0) {
      fetchAuthoritativeQuote();
    }
  }, [cart, paymentGateway]);

  const quoteTotals = liveQuote?.totals;
  const baseTotal = quoteTotals ? quoteTotals.itemsTotal : totalPrice;
  const quoteDiscount = quoteTotals ? quoteTotals.discount : 0;
  const loyaltyDiscount = useLoyalty ? Math.min(loyaltyPoints, baseTotal - quoteDiscount) : 0;
  const subtotalAfterDiscount = quoteTotals
    ? Math.max(0, quoteTotals.subtotalAfterDiscount - loyaltyDiscount)
    : Math.max(0, baseTotal - quoteDiscount - loyaltyDiscount);
  const freeThreshold = quoteTotals?.freeShippingThreshold || BUSINESS_CONFIG.policies.freeShippingThreshold || 300;
  const isFreeShipping = quoteTotals ? quoteTotals.isFreeShipping : (subtotalAfterDiscount >= freeThreshold);
  const shippingFee = quoteTotals ? quoteTotals.shippingCharges : (isFreeShipping ? 0 : 49);
  const codFee = quoteTotals ? quoteTotals.codCharges : (paymentGateway === 'cod' ? (BUSINESS_CONFIG.policies.codHandlingFee || 0) : 0);
  const finalTotal = quoteTotals
    ? Math.max(0, quoteTotals.grandTotal - loyaltyDiscount)
    : Math.max(0, subtotalAfterDiscount + shippingFee + codFee);

  useEffect(() => {
    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!cartLoading && cart.length === 0) {
      navigate('/cart');
    }
  }, [cartLoading, cart.length, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
      getClerkToken().then(token => {
        setClerkToken(token);
        fetchAddresses(token).then(data => {
          setAddresses(data);
          if (data.length > 0) {
            const def = data.find((a: any) => a.isDefault) || data[0];
            setSelectedAddressId(def._id || def.id);
            setIsAddingNew(false);
          } else {
            setIsAddingNew(true);
          }
        });
      });
    }
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    try {
      const q = await fetchAuthoritativeQuote(couponCode.trim(), paymentGateway);
      if (q && q.totals.discount > 0) {
        toast.success(`Coupon "${couponCode.trim().toUpperCase()}" applied! Saved ${formatPrice(q.totals.discount)}`);
      } else {
        toast.error('Invalid or expired coupon code, or minimum order requirement not met.');
      }
    } catch (e) {
      toast.error('Error applying coupon');
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setDetectedCoords({ lat: latitude, lng: longitude });
        toast.success(`Exact GPS pin captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const streetParts = [];
            if (addr.house_number) streetParts.push(addr.house_number);
            if (addr.road) streetParts.push(addr.road);
            if (addr.suburb) streetParts.push(addr.suburb);
            const street = streetParts.join(', ') || data.display_name.split(',')[0];

            setFormData(prev => ({
              ...prev,
              address: prev.address || street,
              city: prev.city || addr.city || addr.town || addr.village || addr.county || '',
              state: prev.state || addr.state || '',
              zip: prev.zip || addr.postcode || ''
            }));
          }
        } catch {}
        setDetectingLocation(false);
      },
      (err) => {
        toast.error(`Location detection failed: ${err.message}`);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePaymentRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !clerkToken) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if ((isAddingNew || addresses.length === 0) && (!formData.address || !formData.city || !formData.zip || !formData.phone)) {
      toast.error('Please fill in all address fields');
      return;
    }

    if (!noReturnPolicyAcknowledged) {
      toast.error('Please accept the No Return Policy agreement before placing your order.');
      return;
    }

    setShowConfirmation(true);
  };

  const openRazorpayModal = (
    razorpayOrder: { order_id: string; amount: number; currency: string; key_id?: string },
    initiatedOrder: any,
    finalAddressId: string,
    activeToken: string | null
  ) => {
    const razorpayKey = razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey || razorpayKey.includes('REPLACE_WITH')) {
      toast.error('Razorpay key is not configured. Please check your environment configuration.');
      setLoading(false);
      return;
    }

    if (typeof (window as any).Razorpay === 'undefined') {
      toast.error('Payment gateway SDK is still initializing. Please tap Confirm & Pay again.');
      setLoading(false);
      return;
    }

    const options: any = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      name: 'Sakshi Clothing',
      description: `Order #${initiatedOrder.orderNumber}`,
      order_id: razorpayOrder.order_id,
      config: {
        display: {
          hide: BUSINESS_CONFIG.payment?.razorpayHiddenMethods || [
            { method: 'card' },
            { method: 'netbanking' },
            { method: 'wallet' },
            { method: 'emi' },
            { method: 'cardless_emi' },
            { method: 'paylater' }
          ],
          preferences: { show_default_blocks: true }
        }
      },
      handler: async function (response: any) {
        setLoading(true);
        const toastId = toast.loading('Payment successful! Verifying and finalizing your order...');
        try {
          const freshToken = await getFreshClerkToken() || activeToken;

          const orderRes = await placeOrder(
            finalAddressId,
            true,
            freshToken,
            cart.map(item => ({
              productId: item.id,
              variantId: item.variantId,
              quantity: item.quantity
            })),
            'razorpay',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            },
            couponCode.trim() || undefined,
            true
          );

          toast.dismiss(toastId);

          if (orderRes && orderRes.success) {
            try {
              const bc = new BroadcastChannel('sakshi_order_sync');
              bc.postMessage({ type: 'ORDER_PLACED', orderId: orderRes.data.orderNumber });
              bc.close();
            } catch {}
            toast.success(`Payment verified! Your order #${orderRes.data.orderNumber} is confirmed.`);
            clearCart();
            navigate('/order-success', {
              state: {
                orderId: orderRes.data.orderNumber,
                orderDbId: orderRes.data._id,
                total: orderRes.data.totals?.grandTotal ?? finalTotal,
                isPending: false
              }
            });
          } else {
            toast.info('Payment received! Finalizing order via confirmation webhook...');
            clearCart();
            navigate('/order-success', {
              state: {
                orderId: initiatedOrder.orderNumber,
                orderDbId: initiatedOrder._id,
                total: initiatedOrder.totals?.grandTotal ?? finalTotal,
                isPending: true,
                isPolling: true
              }
            });
          }
        } catch (verifErr: any) {
          toast.dismiss(toastId);
          console.error('Order placement verification network error:', verifErr);
          clearCart();
          toast.info('Payment received! Finalizing order confirmation...');
          navigate('/order-success', {
            state: {
              orderId: initiatedOrder.orderNumber,
              orderDbId: initiatedOrder._id,
              total: initiatedOrder.totals?.grandTotal ?? finalTotal,
              isPending: true,
              isPolling: true
            }
          });
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: user?.fullName || user?.name || formData.fullName || 'Customer',
        email: user?.email || 'customer@sakshiclothing.com',
        contact: formData.phone || user?.phone || ''
      },
      modal: {
        ondismiss: function () {
          toast.info(`Payment window closed. Order #${initiatedOrder.orderNumber} is preserved in pending payment.`);
          setLoading(false);
          setShowConfirmation(false);
        }
      },
      notes: {
        selected_mode: 'upi',
        orderNumber: initiatedOrder.orderNumber
      },
      theme: { color: '#7B1E2B' }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response?.error?.description || 'Payment failed or declined. Please retry with another method.');
        setLoading(false);
        setShowConfirmation(false);
      });
      rzp.open();
    } catch (e: any) {
      console.error('Razorpay initialization exception:', e);
      toast.error('Unable to open payment modal. Please refresh and retry.');
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const executePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const activeToken = await getFreshClerkToken();
      let finalAddressId = selectedAddressId;
      if (isAddingNew || addresses.length === 0) {
        const res = await addAddress({
          fullName: formData.fullName || user?.name || 'User',
          phone: formData.phone,
          houseNumber: formData.address.split(',')[0] || '1',
          street: formData.address,
          area: formData.city,
          city: formData.city,
          state: formData.state || formData.city,
          country: formData.country,
          pincode: formData.zip,
          coordinates: detectedCoords || undefined,
          isDefault: true
        }, activeToken);
        if (res.success) {
          finalAddressId = res.data._id || res.data.id;
        } else {
          toast.error('Failed to save address');
          setLoading(false);
          return;
        }
      }

      // Online Payment via Razorpay
      if (paymentGateway === 'razorpay') {
        toast.loading('Securing order & initializing payment...');

        const initiateRes = await initiateOrderCheckout(
          finalAddressId,
          cart.map(item => ({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.quantity
          })),
          couponCode.trim() || undefined,
          true,
          activeToken,
          true
        );
        toast.dismiss();

        if (!initiateRes.success || !initiateRes.data?.razorpayOrder) {
          toast.error(initiateRes.message || 'Failed to initialize order on server.');
          setLoading(false);
          return;
        }

        const initiatedOrder = initiateRes.data.order;
        const razorpayOrder = initiateRes.data.razorpayOrder;

        setShowConfirmation(false);
        openRazorpayModal(
          razorpayOrder,
          initiatedOrder,
          finalAddressId,
          activeToken
        );
        return;
      }

      // Cash on Delivery Order Flow
      if (paymentGateway === 'cod') {
        toast.loading('Securing order & finalizing Cash on Delivery...');

        const orderRes = await placeOrder(
          finalAddressId,
          true,
          activeToken,
          cart.map(item => ({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.quantity
          })),
          'cod',
          undefined,
          couponCode.trim() || undefined,
          true
        );
        toast.dismiss();

        if (orderRes && orderRes.success) {
          try {
            const bc = new BroadcastChannel('sakshi_order_sync');
            bc.postMessage({ type: 'ORDER_PLACED', orderId: orderRes.data.orderNumber });
            bc.close();
          } catch {}
          toast.success(`Order placed successfully! Order #${orderRes.data.orderNumber}`);
          clearCart();
          setShowConfirmation(false);
          navigate('/order-success', {
            state: {
              orderId: orderRes.data.orderNumber,
              orderDbId: orderRes.data._id,
              total: orderRes.data.totals?.grandTotal ?? finalTotal,
              isPending: false
            }
          });
          return;
        } else {
          toast.error(orderRes.message || 'Failed to place Cash on Delivery order');
          setLoading(false);
          return;
        }
      }

    } catch (error) {
      toast.dismiss();
      console.error('Error placing order:', error);
      toast.error('Transaction could not be completed.');
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7B1E2B] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] pt-8 sm:pt-14 pb-28 lg:pb-16 text-[#1A1A1A]">
      <SEOHead title="Secure Checkout | Sakshi Clothing" noIndex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] hover:text-[#7B1E2B] transition-colors min-h-[44px]"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to Shopping Bag</span>
          </button>
        </div>

        <header className="mb-8 sm:mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#1A1A1A] mb-2">
            Secure Checkout
          </h1>
          <p className="text-[#6B7280] text-xs sm:text-sm">
            Free Express Shipping on ₹{BUSINESS_CONFIG.policies.freeShippingThreshold}+ · Cash on Delivery & Online UPI/Cards · No Returns (Damaged/Defective covered within 48h).
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handlePaymentRequest} className="space-y-8">
              
              {/* 1. Shipping Section */}
              <section className="bg-white p-5 sm:p-8 rounded-3xl shadow-xs border border-[#E8E5DF]">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#7B1E2B] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h2 className="font-serif text-lg sm:text-xl font-medium text-[#1A1A1A]">Shipping Address</h2>
                </div>

                {addresses.length > 0 && (
                  <div className="mb-8 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Select Saved Address</p>
                    {addresses
                      .filter((addr, index, self) =>
                        index === self.findIndex((a) => (a._id || a.id) === (addr._id || addr.id) ||
                          (`${a.street}-${a.pincode}`.toLowerCase() === `${addr.street}-${addr.pincode}`.toLowerCase()))
                      )
                      .map((addr) => (
                        <label 
                          key={addr._id || addr.id} 
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                            selectedAddressId === (addr._id || addr.id) && !isAddingNew 
                              ? 'border-[#7B1E2B] bg-[#FDF4F5]/60 shadow-xs' 
                              : 'border-[#E8E5DF] hover:border-[#7B1E2B]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressSelection"
                            checked={selectedAddressId === (addr._id || addr.id) && !isAddingNew}
                            onChange={() => { setSelectedAddressId(addr._id || addr.id); setIsAddingNew(false); }}
                            className="mt-1 accent-[#7B1E2B]"
                          />
                          <div className="flex-1 text-xs">
                            <p className="font-semibold text-sm text-[#1A1A1A]">{addr.fullName && addr.fullName !== 'User' ? addr.fullName : (user?.fullName || user?.name || 'Customer')}</p>
                            <p className="text-[#6B7280] mt-1 leading-relaxed">{addr.fullAddress || `${addr.houseNumber || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`}</p>
                            {addr.phone && <p className="text-[#6B7280] mt-1">Phone: {addr.phone}</p>}
                          </div>
                        </label>
                      ))}
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(true)}
                      className="text-xs font-semibold uppercase tracking-wider text-[#7B1E2B] border-b border-[#7B1E2B] pb-0.5 hover:text-[#621721] transition-colors min-h-[44px] inline-flex items-center"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {(isAddingNew || addresses.length === 0) && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <div className="flex bg-[#FAF8F5] p-1 rounded-xl w-full max-w-sm border border-[#E8E5DF]">
                        <button type="button" onClick={() => setAddressInputMode('manual')} className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all min-h-[40px] ${addressInputMode === 'manual' ? 'bg-white shadow-xs text-[#1A1A1A]' : 'text-[#6B7280] hover:text-[#1A1A1A]'}`}>Enter Manually</button>
                        <button type="button" onClick={() => setAddressInputMode('map')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all min-h-[40px] ${addressInputMode === 'map' ? 'bg-white shadow-xs text-[#1A1A1A]' : 'text-[#6B7280] hover:text-[#1A1A1A]'}`}><MapPin size={14} /> Map Pin</button>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E5DF] text-[#1A1A1A] text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors min-h-[44px]"
                      >
                        <Navigation size={14} className={`text-[#7B1E2B] ${detectingLocation ? 'animate-spin' : ''}`} />
                        <span>{detectingLocation ? 'Locating…' : detectedCoords ? `GPS: ${detectedCoords.lat.toFixed(4)}, ${detectedCoords.lng.toFixed(4)}` : 'Use Device Location'}</span>
                      </button>
                    </div>

                    {addressInputMode === 'map' && (
                      <div className="mb-6">
                        <MapPicker onLocationSelect={(data) => {
                          setFormData(prev => ({ ...prev, ...data }));
                          if (data.coordinates) {
                            setDetectedCoords(data.coordinates);
                          }
                        }} />
                        <p className="text-[11px] text-[#6B7280] mt-2 text-center">Pin drop auto-fills fields below and locks your exact delivery coordinates.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Full Name</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E5DF] focus:border-[#7B1E2B] focus:ring-1 focus:ring-[#7B1E2B] outline-none text-base text-[#1A1A1A] bg-white font-sans"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Street Address</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E5DF] focus:border-[#7B1E2B] focus:ring-1 focus:ring-[#7B1E2B] outline-none text-base text-[#1A1A1A] bg-white font-sans"
                          placeholder="e.g. 123, Luxury Lane, Apartment 4B"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">City</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E5DF] focus:border-[#7B1E2B] focus:ring-1 focus:ring-[#7B1E2B] outline-none text-base text-[#1A1A1A] bg-white font-sans"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Postal Code</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E5DF] focus:border-[#7B1E2B] focus:ring-1 focus:ring-[#7B1E2B] outline-none text-base text-[#1A1A1A] bg-white font-sans"
                          placeholder="400001"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Phone Number</label>
                        <input
                          required={isAddingNew}
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E5DF] focus:border-[#7B1E2B] focus:ring-1 focus:ring-[#7B1E2B] outline-none text-base text-[#1A1A1A] bg-white font-sans"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* 2. Payment Section: UPI Only + Cash On Delivery */}
              <section className="bg-white p-5 sm:p-8 rounded-3xl shadow-xs border border-[#E8E5DF]">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#7B1E2B] text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h2 className="font-serif text-lg sm:text-xl font-medium text-[#1A1A1A]">Payment Method</h2>
                </div>

                <div className="space-y-3.5">
                  {/* Option 1: UPI Online (Razorpay) */}
                  <div
                    onClick={() => setPaymentGateway('razorpay')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentGateway === 'razorpay' 
                        ? 'border-[#7B1E2B] bg-[#FDF4F5]/60 shadow-xs' 
                        : 'border-[#E8E5DF] bg-white hover:border-[#7B1E2B]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-[#7B1E2B] text-white rounded-xl flex items-center justify-center shadow-xs">
                          <span className="font-bold text-xs uppercase tracking-wider">UPI</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#1A1A1A]">Pay Online with UPI</p>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] uppercase tracking-wider">Instant</span>
                          </div>
                          <p className="text-xs text-[#6B7280] mt-0.5">Google Pay, PhonePe, Paytm, BHIM & Instant QR Code</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentGateway === 'razorpay' ? 'border-[#7B1E2B]' : 'border-[#9CA3AF]'
                      }`}>
                        {paymentGateway === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-[#7B1E2B]" />}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Cash on Delivery (COD) */}
                  {BUSINESS_CONFIG.policies.codAvailable && (
                    <div
                      onClick={() => setPaymentGateway('cod')}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentGateway === 'cod' 
                          ? 'border-[#7B1E2B] bg-[#FDF4F5]/60 shadow-xs' 
                          : 'border-[#E8E5DF] bg-white hover:border-[#7B1E2B]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 bg-[#FAF8F5] text-[#1A1A1A] border border-[#E8E5DF] rounded-xl flex items-center justify-center shadow-xs">
                            <Banknote size={20} className="text-[#7B1E2B]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1A1A1A]">Cash on Delivery (COD)</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">Pay in cash when order is delivered to your doorstep</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentGateway === 'cod' ? 'border-[#7B1E2B]' : 'border-[#9CA3AF]'
                        }`}>
                          {paymentGateway === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#7B1E2B]" />}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#6B7280] flex items-center gap-2">
                  <Lock size={14} className="text-[#7B1E2B] shrink-0" />
                  <span>256-bit Encrypted SSL & PCI-DSS compliant secure UPI payment gateway via Razorpay.</span>
                </div>
              </section>

              {/* Mandatory No-Return Policy Agreement Checkbox */}
              <div className="p-4 rounded-2xl bg-[#FDF4F5] border border-[#7B1E2B]/20 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noReturnPolicyAcknowledged}
                    onChange={(e) => setNoReturnPolicyAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#E8E5DF] text-[#7B1E2B] focus:ring-[#7B1E2B] shrink-0"
                  />
                  <span className="text-xs text-[#1A1A1A] leading-relaxed">
                    I understand and agree to the <strong>No Return / No Exchange Policy</strong>. All sales are final. Only damaged, defective, or incorrect items reported within 48 hours with an unboxing video are eligible for replacement or refund. <Link to="/refund-policy" target="_blank" className="text-[#7B1E2B] underline font-medium">Read Policy</Link>
                  </span>
                </label>
              </div>

              {/* Mobile Place Order Button */}
              <div className="lg:hidden pt-2 space-y-2">
                <button
                  disabled={loading || quoteLoading}
                  type="submit"
                  className="w-full min-h-[50px] bg-[#7B1E2B] hover:bg-[#621721] text-white py-4 rounded-full font-semibold uppercase tracking-wider text-xs shadow-md disabled:opacity-50 transition-all active:scale-98"
                >
                  {loading ? 'Processing...' : (paymentGateway === 'cod' ? `Place Order (COD) — ${formatPrice(finalTotal)}` : `Confirm & Pay with UPI — ${formatPrice(finalTotal)}`)}
                </button>
                <p className="text-[11px] text-[#6B7280] text-center px-1 leading-relaxed">
                  By placing your order, you agree to our{' '}
                  <Link to="/terms" target="_blank" className="text-[#7B1E2B] underline font-medium">Terms</Link>,{' '}
                  <Link to="/privacy" target="_blank" className="text-[#7B1E2B] underline font-medium">Privacy Policy</Link>, and{' '}
                  <Link to="/refund-policy" target="_blank" className="text-[#7B1E2B] underline font-medium">Refund Policy</Link>.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <aside className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-xs border border-[#E8E5DF] p-6 sm:p-8 sticky top-20 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-medium text-[#1A1A1A]">Order Summary</h2>
                {quoteLoading && (
                  <span className="text-[10px] text-[#C6A15B] font-semibold animate-pulse uppercase tracking-wider">Verifying quote...</span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const quotedLine = liveQuote?.lineItems?.find(
                    li => li.productId.toString() === item.id.toString() && (!li.variantId || li.variantId.toString() === (item as any).variantId?.toString())
                  );
                  const effectivePrice = quotedLine ? quotedLine.price : item.price;
                  const itemSubtotal = quotedLine ? quotedLine.subtotal : (effectivePrice * item.quantity);
                  const priceChanged = quotedLine?.priceChanged;

                  return (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3.5">
                      <div className="w-16 aspect-[3/4] bg-[#FAF8F5] rounded-xl overflow-hidden shrink-0 border border-[#E8E5DF]">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="flex-1 py-0.5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif text-sm font-medium text-[#1A1A1A] truncate">{item.name}</h4>
                            {priceChanged && (
                              <span className="text-[9px] font-bold text-[#C6A15B] bg-[#FDF4F5] px-1 py-0.2 rounded border border-[#C6A15B]/40 shrink-0">Updated</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">
                            Size: <strong className="text-[#1A1A1A]">{item.selectedSize}</strong> · Qty: {item.quantity} · {formatPrice(effectivePrice)}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{formatPrice(itemSubtotal)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-[#E8E5DF] space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatPrice(baseTotal)}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Shipping</span>
                  {isFreeShipping ? (
                    <span className="text-[#15803D] font-semibold">FREE</span>
                  ) : (
                    <span className="font-semibold text-[#1A1A1A]">{formatPrice(shippingFee)}</span>
                  )}
                </div>
                {!isFreeShipping && (
                  <p className="text-[11px] text-[#7B1E2B] bg-[#FDF4F5] p-2 rounded-lg border border-[#7B1E2B]/10">
                    Add <strong className="font-bold">{formatPrice(freeThreshold - subtotalAfterDiscount)}</strong> more for <span className="font-bold text-[#15803D]">FREE Delivery</span> (orders over {formatPrice(freeThreshold)}).
                  </p>
                )}
                {quoteDiscount > 0 && (
                  <div className="flex justify-between text-[#B43E2B] font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(quoteDiscount)}</span>
                  </div>
                )}
                {codFee > 0 && (
                  <div className="flex justify-between text-[#6B7280]">
                    <span>COD Handling Fee</span>
                    <span className="font-semibold text-[#1A1A1A]">{formatPrice(codFee)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#E8E5DF] flex justify-between items-baseline text-base sm:text-lg font-bold text-[#1A1A1A]">
                  <div>
                    <span>Total Amount</span>
                    <p className="text-[10px] text-[#6B7280] font-normal">All taxes included</p>
                  </div>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="pt-4 border-t border-[#E8E5DF] space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
                  <Tag size={14} className="text-[#7B1E2B]" />
                  <span>Apply Promotional Coupon</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER CODE (e.g. SAKSHI10)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8E5DF] focus:border-[#7B1E2B] outline-none text-xs font-semibold uppercase tracking-wider min-h-[44px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={quoteLoading}
                    onClick={handleApplyCoupon}
                    className="shrink-0 min-h-[44px]"
                  >
                    {quoteLoading ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
                {quoteDiscount > 0 && (
                  <p className="text-xs text-[#15803D] font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Coupon applied! Saved {formatPrice(quoteDiscount)}</span>
                  </p>
                )}
              </div>

              {/* Desktop Place Order Button */}
              <div className="hidden lg:block pt-2 space-y-2">
                <button
                  disabled={loading || quoteLoading}
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) {
                      if (typeof form.requestSubmit === 'function') {
                        form.requestSubmit();
                      } else {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }
                    }
                  }}
                  className="w-full min-h-[50px] bg-[#7B1E2B] hover:bg-[#621721] text-white py-4 rounded-full font-semibold uppercase tracking-wider text-xs shadow-md disabled:opacity-50 transition-all active:scale-98 select-none"
                >
                  {loading ? 'Processing...' : (paymentGateway === 'cod' ? `Place Order (COD) — ${formatPrice(finalTotal)}` : `Confirm & Pay with UPI — ${formatPrice(finalTotal)}`)}
                </button>
                <p className="text-[11px] text-[#6B7280] text-center px-1 leading-relaxed">
                  By placing your order, you agree to our{' '}
                  <Link to="/terms" target="_blank" className="text-[#7B1E2B] underline font-medium">Terms of Service</Link>,{' '}
                  <Link to="/privacy" target="_blank" className="text-[#7B1E2B] underline font-medium">Privacy Policy</Link>, and{' '}
                  <Link to="/refund-policy" target="_blank" className="text-[#7B1E2B] underline font-medium">Refund Policy</Link>.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B7280] pt-1">
                <ShieldCheck size={14} className="text-[#C6A15B]" />
                <span>No Returns (Transit Breakage/Defects Guaranteed) · COD Available</span>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowConfirmation(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E5DF]">
              <h3 className="font-serif text-2xl font-medium mb-6 text-center text-[#1A1A1A]">
                Confirm Your Details
              </h3>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E5DF] space-y-3.5 mb-6 text-xs">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-0.5">Delivering To</p>
                  <p className="font-semibold text-sm text-[#1A1A1A]">
                    {(() => {
                      const selectedAddr = addresses.find(a => (a._id || a.id) === selectedAddressId);
                      const nameFromAddr = selectedAddr?.fullName;
                      if (nameFromAddr && nameFromAddr !== 'User') return nameFromAddr;
                      if (formData.fullName && formData.fullName !== 'User') return formData.fullName;
                      return user?.fullName || user?.name || 'Customer';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-0.5">Shipping Address</p>
                  <p className="text-[#4B5563] leading-relaxed">
                    {isAddingNew || addresses.length === 0 ?
                      `${formData.address}, ${formData.city}, ${formData.state ? formData.state + ', ' : ''}${formData.country} - ${formData.zip}` :
                      (addresses.find(a => (a._id || a.id) === selectedAddressId)?.fullAddress || `${addresses.find(a => (a._id || a.id) === selectedAddressId)?.houseNumber}, ${addresses.find(a => (a._id || a.id) === selectedAddressId)?.street}, ${addresses.find(a => (a._id || a.id) === selectedAddressId)?.city} - ${addresses.find(a => (a._id || a.id) === selectedAddressId)?.pincode}`)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-0.5">Payment Method</p>
                  <p className="font-medium text-[#1A1A1A] flex items-center gap-2">
                    {paymentGateway === 'razorpay' ? (
                      <>
                        <Smartphone size={15} className="text-[#7B1E2B]" />
                        <span>UPI (Google Pay, PhonePe, Paytm, QR)</span>
                      </>
                    ) : (
                      <>
                        <Banknote size={15} className="text-[#7B1E2B]" />
                        <span>Cash on Delivery (COD)</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E8E5DF] flex justify-between items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Total Amount</span>
                  <span className="font-bold text-base text-[#1A1A1A]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={loading} 
                  onClick={() => setShowConfirmation(false)} 
                  className="flex-1 min-h-[44px]"
                  leftIcon={<Edit3 size={15} />}
                >
                  Edit Details
                </Button>
                <Button 
                  type="button" 
                  variant="primary"
                  disabled={loading} 
                  onClick={executePayment} 
                  className="flex-1 min-h-[44px]"
                >
                  {loading ? 'Processing...' : (paymentGateway === 'cod' ? 'Confirm & Place Order' : `Confirm & Pay ${formatPrice(finalTotal)}`)}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Checkout;
