import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, RotateCcw, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_TIMELINE = [
  'pending', 'processing', 'packed', 'shipped', 'outForDelivery', 'delivered'
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  outForDelivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingInput, setTrackingInput] = useState({ courierName: '', trackingNumber: '', trackingUrl: '' });
  const [savingTracking, setSavingTracking] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
          if (data.data.tracking) {
            setTrackingInput({
              courierName: data.data.tracking.courierName || '',
              trackingNumber: data.data.tracking.trackingNumber || '',
              trackingUrl: data.data.tracking.trackingUrl || '',
            });
          }
        } else {
          setError(data.message || 'Order not found');
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOrder((prev: any) => ({ ...prev, orderStatus: status }));
        alert(`Order status updated to ${STATUS_LABELS[status]}`);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleSaveTracking = async () => {
    setSavingTracking(true);
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tracking: trackingInput })
      });
      const data = await res.json();
      if (data.success) {
        setOrder((prev: any) => ({ ...prev, tracking: trackingInput }));
        alert('Tracking info saved');
      } else {
        alert(data.message || 'Failed to save tracking');
      }
    } catch {
      alert('Network error');
    } finally {
      setSavingTracking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading order…</div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 rounded-xl text-red-700 flex items-center gap-3">
      <AlertCircle size={20} /> {error}
    </div>
  );

  if (!order) return null;

  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';
  const activeStep = STATUS_TIMELINE.indexOf(order.orderStatus);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <Link to="/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order.orderNumber}
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              isDelivered ? 'bg-green-100 text-green-700' :
              isCancelled ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {STATUS_LABELS[order.orderStatus] || order.orderStatus}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Calendar size={14} />
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        {/* Quick Status Update */}
        <div className="flex gap-2 flex-wrap">
          {!isCancelled && !isDelivered && (
            <>
              <select
                defaultValue=""
                onChange={e => e.target.value && handleStatusUpdate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
              >
                <option value="" disabled>Update Status…</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Order Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Order Progress</h3>
          <div className="flex items-center justify-between">
            {STATUS_TIMELINE.map((step, idx) => {
              const isDone = idx <= activeStep;
              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isDone ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-400'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider text-center max-w-[70px] ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${idx < activeStep ? 'bg-gray-900' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items + Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Package size={16} /> Order Items ({order.products?.length})
            </h3>
            <div className="space-y-3">
              {order.products?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-20 bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                    {item.product?.thumbnail?.url ? (
                      <img src={item.product.thumbnail.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Size: <span className="font-medium">{item.size}</span> &nbsp;•&nbsp;
                      Color: <span className="font-medium">{item.color || '—'}</span> &nbsp;•&nbsp;
                      SKU: <span className="font-medium">{item.sku || '—'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900">₹{item.subtotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Truck size={16} /> Tracking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Courier Name</label>
                <input
                  type="text"
                  value={trackingInput.courierName}
                  onChange={e => setTrackingInput(p => ({ ...p, courierName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  placeholder="e.g. BlueDart, Delhivery"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingInput.trackingNumber}
                  onChange={e => setTrackingInput(p => ({ ...p, trackingNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  placeholder="e.g. BD1234567890"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Tracking URL</label>
                <input
                  type="url"
                  value={trackingInput.trackingUrl}
                  onChange={e => setTrackingInput(p => ({ ...p, trackingUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  placeholder="https://track.bluedart.com/..."
                />
              </div>
            </div>
            <button
              onClick={handleSaveTracking}
              disabled={savingTracking}
              className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {savingTracking ? 'Saving…' : 'Save Tracking'}
            </button>
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Order Timeline</h3>
              <div className="space-y-3">
                {[...order.timeline].reverse().map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-900 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{STATUS_LABELS[event.status] || event.status}</p>
                      {event.note && <p className="text-xs text-gray-500">{event.note}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(event.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Customer + Payment + Invoice */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Customer</h3>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-gray-900">{order.customer?.fullName || 'N/A'}</p>
              <p className="text-gray-500">{order.customer?.email}</p>
              <p className="text-gray-500">{order.customer?.phone || '—'}</p>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <MapPin size={14} /> Shipping Address
            </h3>
            {order.shippingAddress ? (
              <address className="text-sm text-gray-600 not-italic space-y-1">
                <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.houseNumber}, {order.shippingAddress.street}</p>
                {order.shippingAddress.area && <p>{order.shippingAddress.area}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.landmark && <p className="text-gray-400">Near: {order.shippingAddress.landmark}</p>}
                <p className="mt-2 text-gray-500">📞 {order.shippingAddress.phone}</p>
              </address>
            ) : (
              <p className="text-sm text-gray-400">No address on file</p>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <CreditCard size={14} /> Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{(order.totals?.itemsTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {order.totals?.taxes > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Taxes (GST)</span>
                  <span>₹{order.totals.taxes.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{order.totals?.shippingCharges > 0 ? `₹${order.totals.shippingCharges.toLocaleString('en-IN')}` : 'Free'}</span>
              </div>
              {order.totals?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−₹{order.totals.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Grand Total</span>
                <span>₹{(order.totals?.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
                <p>Method: <span className="font-medium">{order.payment?.method || 'COD / Online'}</span></p>
                <p>Payment Status: <span className="font-medium capitalize">{order.paymentStatus || 'pending'}</span></p>
              </div>
            </div>
          </div>

          {/* Refund Placeholder */}
          {(isCancelled || order.orderStatus === 'returned') && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm font-bold text-orange-700 flex items-center gap-2">
                <RotateCcw size={16} /> Refund Management
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Refund integration will be available when the payment gateway is connected.
              </p>
              <button
                onClick={() => alert('Refund gateway not yet integrated.')}
                className="mt-3 px-3 py-1.5 text-xs font-bold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Initiate Refund (Placeholder)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
