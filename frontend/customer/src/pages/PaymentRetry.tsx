import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const PaymentRetry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, amount, gateway } = location.state || {};
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/profile');
    }
    // Load Razorpay script if needed
    if (gateway === 'razorpay') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [orderId, gateway, navigate]);

  const handleRetry = async () => {
    setLoading(true);
    try {
      // Create Payment Intent
      const intentRes = await fetch(`${API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, gateway }),
        credentials: 'include'
      });
      const intentData = await intentRes.json();

      if (!intentData.success) {
        toast.error(intentData.message || 'Failed to initialize payment.');
        setLoading(false);
        return;
      }

      if (gateway === 'razorpay') {
        const options = {
          key: 'test_key', // Replace with real key
          amount: intentData.data.amount,
          currency: intentData.data.currency,
          name: 'Sakshi Clothing',
          description: `Retry Payment for Order`,
          order_id: intentData.data.gatewayOrderId,
          handler: function (response: any) {
            toast.success('Payment successful.');
            navigate('/profile');
          },
          theme: { color: '#000000' }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
           toast.error('Payment failed again. You can retry from your profile.');
           navigate('/profile'); 
        });
        rzp.open();
      } else {
        toast.info(`Redirecting to ${gateway}...`);
        setTimeout(() => {
           toast.success('Payment simulated successfully.');
           navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      toast.error('Error initiating retry');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-32 pb-20 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-serif mb-4">Retry Payment</h1>
        <p className="text-sm text-gray-500 mb-8">
          The payment for your order could not be completed. You can try again using your selected payment method.
        </p>
        <div className="bg-gray-50 p-6 rounded-2xl mb-8">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Amount Due</p>
          <p className="text-3xl font-serif font-medium">₹{amount?.toLocaleString()}</p>
        </div>
        <button
          onClick={handleRetry}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-all shadow-xl disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Retry Payment'}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-full mt-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentRetry;
