import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CreditCard, ArrowLeft, ChevronRight, Lock } from 'lucide-react';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zip: '',
    phone: '',
  });

  const finalTotal = totalPrice > 2000 ? totalPrice : totalPrice + 100;

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);

    // Mock Razorpay Integration
    toast.loading('Securing your transaction...');

    setTimeout(async () => {
      try {
        const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
        const orderData = {
          id: orderId,
          userId: user.uid,
          items: cart,
          total: finalTotal,
          address: `${formData.address}, ${formData.city} - ${formData.zip}`,
          phone: formData.phone,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        // Save to localStorage for orders
        const orders = JSON.parse(localStorage.getItem('sakshi_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('sakshi_orders', JSON.stringify(orders));

        toast.dismiss();
        toast.success('Order confirmed. Welcome to the Maison.');
        clearCart();
        navigate('/order-success', { state: { orderId: orderId, total: finalTotal } });
      } catch (error) {
        console.error('Error placing order:', error);
        toast.error('Transaction could not be completed.');
      } finally {
        setLoading(false);
      }
    }, 2500);
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
            <form onSubmit={handlePayment} className="space-y-10">
              {/* Shipping Section */}
              <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h2 className="text-xl font-serif font-medium">Shipping Address</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted ml-1">Street Address</label>
                    <input
                      required
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
                      required
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
                      required
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
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 font-sans"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h2 className="text-xl font-serif font-medium">Payment Method</h2>
                </div>
                
                <div className="p-6 rounded-2xl border-2 border-black bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Secure Online Payment</p>
                      <p className="text-[10px] text-muted uppercase tracking-widest">Cards, UPI, Netbanking</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-black" />
                  </div>
                </div>
                
                <p className="mt-6 text-xs text-muted flex items-center gap-2">
                  <Lock size={12} /> Your transaction is secured with industry-standard encryption.
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
                  <span className={totalPrice > 2000 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {totalPrice > 2000 ? 'Free' : '₹100'}
                  </span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Total</span>
                    <p className="text-[10px] text-muted mt-1">Inclusive of all taxes</p>
                  </div>
                  <span className="text-3xl font-serif font-medium">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Desktop Action Button */}
              <div className="hidden lg:block mt-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={(e) => {
                    const form = document.querySelector('form');
                    if (form) form.requestSubmit();
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
    </div>
  );
};

export default Checkout;
