import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CreditCard, ArrowLeft, ChevronRight, Lock, Tag, Award, MapPin, Edit3 } from 'lucide-react';
import MapPicker from '../components/MapPicker';

import { fetchAddresses, addAddress, placeOrder, authedFetch } from '../lib/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, getClerkToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [clerkToken, setClerkToken] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addressInputMode, setAddressInputMode] = useState<'manual' | 'map'>('manual');
  const [showConfirmation, setShowConfirmation] = useState(false);

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
  const [discount, setDiscount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState('razorpay'); // 'razorpay', 'stripe', 'cod'
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'upi' | 'cards_all' | 'cod'>('upi');

  const baseTotal = totalPrice;
  const loyaltyDiscount = useLoyalty ? Math.min(loyaltyPoints, baseTotal - discount) : 0;
  const finalTotal = Math.max(0, baseTotal - discount - loyaltyDiscount);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
      // Get Clerk token once user is known
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
    if (!couponCode) return;
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: totalPrice }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.data.discount);
        toast.success(`Coupon applied! Saved ₹${data.data.discount}`);
      } else {
        setDiscount(0);
        toast.error(data.message || 'Invalid coupon');
      }
    } catch (e) {
      toast.error('Error applying coupon');
    }
  };

  const handlePaymentRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // User is authenticated via Clerk — just check the session is loaded
    if (!user && !clerkToken) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if ((isAddingNew || addresses.length === 0) && (!formData.address || !formData.city || !formData.zip || !formData.phone)) {
      toast.error('Please fill in all address fields');
      return;
    }

    setShowConfirmation(true);
  };

  const executePayment = async () => {
    setLoading(true);

    try {
      let finalAddressId = selectedAddressId;
      if (isAddingNew || addresses.length === 0) {
        // Create new address
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
          isDefault: true
        }, clerkToken);
        if (res.success) {
          finalAddressId = res.data._id || res.data.id;
        } else {
          toast.error('Failed to save address');
          setLoading(false);
          return;
        }
      }

      toast.loading('Securing your transaction...');
      const orderRes = await placeOrder(finalAddressId, true, clerkToken, cart.map(item => ({
        productId: item.id,
        variantId: item.variantId,
        quantity: item.quantity
      })));

      toast.dismiss();
      if (!orderRes.success) {
        toast.error(orderRes.message || 'Transaction could not be completed.');
        setLoading(false);
        return;
      }

      if (paymentGateway === 'cod') {
        toast.success('Order confirmed. Welcome to the Maison.');
        clearCart(); // Local clear
        navigate('/order-success', { state: { orderId: orderRes.data.orderNumber, total: finalTotal } });
        return;
      }

      // Create Payment Intent with Clerk Token auth
      const intentRes = await authedFetch(`${API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderRes.data._id || orderRes.data.id, gateway: paymentGateway })
      }, clerkToken);
      const intentData = await intentRes.json();

      if (!intentData.success) {
        toast.error(intentData.message || 'Failed to initialize payment.');
        setLoading(false);
        return;
      }

      if (paymentGateway === 'razorpay') {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TcbUFZUs36mOw8';
        const options: any = {
          key: razorpayKey,
          amount: intentData.data.amount,
          currency: intentData.data.currency || 'INR',
          name: 'Sakshi Clothing',
          description: `Order ${orderRes.data.orderNumber}`,
          handler: function (response: any) {
            toast.success('Payment successful!');
            clearCart();
            navigate('/order-success', { state: { orderId: orderRes.data.orderNumber, total: finalTotal } });
          },
          prefill: {
            name: user?.fullName || user?.name || formData.fullName || 'Customer',
            email: user?.email || 'customer@example.com',
            contact: formData.phone || user?.phone || '9876543210'
          },
          config: selectedPaymentMode === 'upi' ? {
            display: {
              blocks: {
                upi: {
                  name: "Pay via UPI",
                  instruments: [
                    {
                      method: "upi"
                    }
                  ]
                }
              },
              sequence: ["block.upi"]
            }
          } : undefined,
          notes: {
            order_id: orderRes.data.orderNumber,
            payment_mode: selectedPaymentMode
          },
          theme: { color: '#000000' }
        };

        // Only attach order_id if it's a real Razorpay API order ID
        if (intentData.data.gatewayOrderId && !intentData.data.gatewayOrderId.startsWith('order_1')) {
          options.order_id = intentData.data.gatewayOrderId;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error(response?.error?.description || 'Payment was not completed.');
        });
        rzp.open();
      } else if (paymentGateway === 'stripe') {
        // Normally redirect to Stripe Checkout or use Elements.
        // For this implementation plan, we will mock redirect
        toast.info('Redirecting to Stripe...');
        setTimeout(() => {
          toast.success('Payment simulated successfully.');
          clearCart();
          navigate('/order-success', { state: { orderId: orderRes.data.orderNumber, total: finalTotal } });
        }, 1500);
      }

    } catch (error) {
      toast.dismiss();
      console.error('Error placing order:', error);
      toast.error('Transaction could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Back */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/cart')}
            className="group flex items-center gap-2 text-xs font-medium text-muted hover:text-black transition-colors"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Bag
          </button>
        </div>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-black mb-2">
            Checkout
          </h1>
          <p className="text-muted font-sans">Complete your order to bring home the Maison's latest pieces.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-10">
            <form onSubmit={handlePaymentRequest} className="space-y-10">
              {/* Shipping Section */}
              <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h2 className="text-xl font-serif font-medium">Shipping Address</h2>
                </div>

                {addresses.length > 0 && (
                  <div className="mb-8 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Select Address</p>
                    {addresses
                      .filter((addr, index, self) =>
                        index === self.findIndex((a) => (a._id || a.id) === (addr._id || addr.id) ||
                          (`${a.street}-${a.pincode}`.toLowerCase() === `${addr.street}-${addr.pincode}`.toLowerCase()))
                      )
                      .map((addr) => (
                        <label key={addr._id || addr.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === (addr._id || addr.id) && !isAddingNew ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}>
                          <input
                            type="radio"
                            name="addressSelection"
                            checked={selectedAddressId === (addr._id || addr.id) && !isAddingNew}
                            onChange={() => { setSelectedAddressId(addr._id || addr.id); setIsAddingNew(false); }}
                            className="mt-1 accent-black"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold">{addr.fullName && addr.fullName !== 'User' ? addr.fullName : (user?.fullName || user?.name || 'Customer')}</p>
                            <p className="text-xs text-muted mt-1">{addr.fullAddress || `${addr.houseNumber || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`}</p>
                            {addr.phone && <p className="text-xs text-muted mt-1">Phone: {addr.phone}</p>}
                          </div>
                        </label>
                      ))}
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(true)}
                      className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-1 hover:text-muted hover:border-muted transition-colors"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {(isAddingNew || addresses.length === 0) && (
                  <div className="space-y-6">
                    <div className="flex bg-gray-100 p-1 rounded-xl w-full max-w-sm mb-6">
                      <button type="button" onClick={() => setAddressInputMode('manual')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${addressInputMode === 'manual' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Enter Manually</button>
                      <button type="button" onClick={() => setAddressInputMode('map')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${addressInputMode === 'map' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}><MapPin size={14} /> Select on Map</button>
                    </div>

                    {addressInputMode === 'map' && (
                      <div className="mb-6">
                        <MapPicker onLocationSelect={(data) => setFormData(prev => ({ ...prev, ...data }))} />
                        <p className="text-[10px] text-muted mt-2 uppercase tracking-widest text-center">Pin drop will auto-fill the fields below. You can edit them if needed.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted ml-1">Full Name</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 font-sans"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted ml-1">Street Address</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 font-sans"
                          placeholder="e.g. 123, Luxury Lane, Apartment 4B"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted ml-1">City</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 font-sans"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted ml-1">Postal Code</label>
                        <input
                          required={isAddingNew}
                          type="text"
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 font-sans"
                          placeholder="400001"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted ml-1">Phone Number</label>
                        <input
                          required={isAddingNew}
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 font-sans"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Payment Section */}
              <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h2 className="text-xl font-serif font-medium">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* Option 1: UPI */}
                  <div
                    onClick={() => setSelectedPaymentMode('upi')}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPaymentMode === 'upi' ? 'border-black bg-gray-50/80 shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-xs">
                          <span className="font-bold text-xs uppercase tracking-wider">UPI</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">UPI (Google Pay, PhonePe, Paytm, BHIM, QR)</p>
                          <p className="text-[11px] text-muted mt-0.5">Pay seamlessly using any UPI App or QR Code via Razorpay</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMode === 'upi' ? 'border-black' : 'border-gray-300'
                        }`}>
                        {selectedPaymentMode === 'upi' && <div className="w-3 h-3 rounded-full bg-black" />}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Cards & Netbanking */}
                  <div
                    onClick={() => setSelectedPaymentMode('cards_all')}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPaymentMode === 'cards_all' ? 'border-black bg-gray-50/80 shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 text-black rounded-xl flex items-center justify-center shadow-xs">
                          <CreditCard size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">Cards, Netbanking & Wallets</p>
                          <p className="text-[11px] text-muted mt-0.5">Credit/Debit Cards, Netbanking (All Banks), Wallets</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMode === 'cards_all' ? 'border-black' : 'border-gray-300'
                        }`}>
                        {selectedPaymentMode === 'cards_all' && <div className="w-3 h-3 rounded-full bg-black" />}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-xs text-muted flex items-center gap-2">
                  <Lock size={12} /> Encrypted & Secured by Razorpay PCI-DSS standards.
                </p>
              </section>

              {/* Action Button for Mobile (Hidden on Desktop) */}
              <div className="lg:hidden pt-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Place Order — ₹${finalTotal.toLocaleString()}`}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 md:p-10 sticky top-32">
              <h2 className="text-xl font-serif font-medium mb-8">Order Summary</h2>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow py-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-black line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                          Size: {item.selectedSize} • Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Total</span>
                    <p className="text-[10px] text-muted mt-1">Inclusive of all taxes</p>
                  </div>
                  <span className="text-3xl font-serif font-medium">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupons & Loyalty */}
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2">
                    <Tag size={16} /> Apply Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="ENTER CODE"
                      className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none font-bold uppercase tracking-widest text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-6 py-3 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-900"
                    >
                      Apply
                    </button>
                  </div>
                  {discount > 0 && <p className="text-green-600 text-xs mt-2 font-bold">Discount applied: -₹{discount.toLocaleString()}</p>}
                </div>

                {loyaltyPoints > 0 && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLoyalty}
                        onChange={e => setUseLoyalty(e.target.checked)}
                        className="w-4 h-4 accent-black"
                      />
                      <div>
                        <p className="text-sm font-bold flex items-center gap-1"><Award size={14} className="text-amber-600" /> Use Loyalty Points</p>
                        <p className="text-xs text-muted mt-1">You have {loyaltyPoints} points available</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Desktop Action Button */}
              <div className="hidden lg:block mt-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={(e) => {
                    const form = document.querySelector('form');
                    if (form) {
                      if (typeof form.requestSubmit === 'function') {
                        form.requestSubmit();
                      } else {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }
                    }
                  }}
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Place Order — ₹${finalTotal.toLocaleString()}`}
                </motion.button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4 text-muted">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-serif font-medium mb-6 text-center">Confirm Your Details</h3>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 mb-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Delivering To</p>
                  <p className="font-medium">
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Shipping Address</p>
                  <p className="font-medium text-sm leading-relaxed">
                    {isAddingNew || addresses.length === 0 ?
                      `${formData.address}, ${formData.city}, ${formData.state ? formData.state + ', ' : ''}${formData.country} - ${formData.zip}` :
                      (addresses.find(a => (a._id || a.id) === selectedAddressId)?.fullAddress || `${addresses.find(a => (a._id || a.id) === selectedAddressId)?.houseNumber}, ${addresses.find(a => (a._id || a.id) === selectedAddressId)?.street}, ${addresses.find(a => (a._id || a.id) === selectedAddressId)?.city} - ${addresses.find(a => (a._id || a.id) === selectedAddressId)?.pincode}`)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Payment Method</p>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard size={16} /> Razorpay (Card / UPI ID / Netbanking)
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Total Amount</span>
                  <span className="font-serif font-bold text-lg">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowConfirmation(false)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Edit3 size={16} /> Edit Details
                </button>
                <button type="button" onClick={executePayment} className="flex-1 py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors shadow-lg">
                  Confirm & Pay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
