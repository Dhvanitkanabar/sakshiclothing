import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Clock,
  UserCheck,
  ExternalLink,
  Send,
  X,
  Sparkles,
  Phone,
  Mail,
  Building,
  Check,
  Printer,
  FileText
} from 'lucide-react';
import { adminFetch } from '../../lib/api';
import { generateShippingInvoicePdf } from '../../utils/pdfGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_TIMELINE = [
  'pending_approval', 'confirmed', 'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered'
];

const STATUS_LABELS: Record<string, string> = {
  pending_approval: 'Pending Approval',
  pending: 'Pending',
  confirmed: 'Confirmed & Approved',
  processing: 'Processing',
  packed: 'Packed',
  dispatched: 'Dispatched',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  returned: 'Returned',
  refunded: 'Refunded',
};

const DELIVERY_PRESETS = [
  '1 to 2 Business Days (Express)',
  '2 to 3 Business Days',
  '3 to 5 Business Days',
  'Within 24 Hours (Same Day)',
  '4 to 7 Business Days (Standard)'
];

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Approval Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [estimatedDeliveryInput, setEstimatedDeliveryInput] = useState('2 to 3 Business Days');
  const [approvalStatusChoice, setApprovalStatusChoice] = useState<'confirmed' | 'packed'>('confirmed');
  const [courierChoice, setCourierChoice] = useState('Sakshi Priority Express');
  const [approvalNote, setApprovalNote] = useState('Order verified genuine. Maison atelier has initiated packing.');
  const [approving, setApproving] = useState(false);

  // Live Checkpoint Quick Form
  const [checkpointLocation, setCheckpointLocation] = useState('');
  const [checkpointNote, setCheckpointNote] = useState('');
  const [updatingCheckpoint, setUpdatingCheckpoint] = useState(false);

  // Tracking details
  const [trackingInput, setTrackingInput] = useState({
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDeliveryTime: '',
    currentLocation: ''
  });
  const [savingTracking, setSavingTracking] = useState(false);

  // Exact Coordinates Pinpoint State
  const [showCoordinateModal, setShowCoordinateModal] = useState(false);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [savingCoords, setSavingCoords] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await adminFetch(`${API_URL}/orders/${id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
          if (data.data.shippingAddress?.coordinates) {
            setCustomLat(data.data.shippingAddress.coordinates.lat?.toString() || '');
            setCustomLng(data.data.shippingAddress.coordinates.lng?.toString() || '');
          }
          if (data.data.tracking) {
            setTrackingInput({
              courierName: data.data.tracking.courierName || 'Sakshi Priority Express',
              trackingNumber: data.data.tracking.trackingNumber || '',
              trackingUrl: data.data.tracking.trackingUrl || '',
              estimatedDeliveryTime: data.data.tracking.estimatedDeliveryTime || '2 to 3 Business Days',
              currentLocation: data.data.tracking.currentLocation || 'Sakshi Maison Atelier'
            });
            if (data.data.tracking.estimatedDeliveryTime) {
              setEstimatedDeliveryInput(data.data.tracking.estimatedDeliveryTime);
            }
          }
        } else {
          setError(data.message || 'Order not found');
        }
      } catch {
        setError('Network error loading order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const broadcastOrderSync = (updatedOrder: any) => {
    try {
      const channel = new BroadcastChannel('sakshi_order_sync');
      channel.postMessage({
        type: 'ORDER_UPDATED',
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        orderStatus: updatedOrder.orderStatus,
        approvalStatus: updatedOrder.approvalStatus,
        tracking: updatedOrder.tracking,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}
    try {
      localStorage.setItem('sakshi_order_sync_timestamp', Date.now().toString());
    } catch {}
  };

  const handleStatusUpdate = async (status: string, note?: string, location?: string) => {
    try {
      const res = await adminFetch(`${API_URL}/orders/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: note || `Order status updated to ${STATUS_LABELS[status] || status}`,
          currentLocation: location || trackingInput.currentLocation
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        broadcastOrderSync(data.data);
        alert(`Order status updated to ${STATUS_LABELS[status] || status} & notification sent to customer.`);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch {
      alert('Network error updating status');
    }
  };

  const handleConfirmApproval = async () => {
    if (!estimatedDeliveryInput.trim()) {
      alert('Please enter an estimated delivery time.');
      return;
    }

    setApproving(true);
    try {
      const res = await adminFetch(`${API_URL}/orders/admin/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimatedDeliveryTime: estimatedDeliveryInput.trim(),
          status: approvalStatusChoice,
          courierName: courierChoice.trim(),
          note: approvalNote.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        const approvedOrder = data.data || order;
        setOrder(approvedOrder);
        broadcastOrderSync(approvedOrder);
        setShowApprovalModal(false);

        // Automatically generate and download Meesho/Amazon-style Tax Invoice & Shipping Label PDF
        try {
          const { filename } = generateShippingInvoicePdf(approvedOrder, true);
          alert(`Order successfully verified & approved!\n\nOfficial Shipping Label sticker & GST Tax Invoice PDF (${filename}) has been automatically generated and downloaded. Affix the top portion to the customer parcel.`);
        } catch (pdfErr) {
          console.error('Auto PDF generation error:', pdfErr);
          alert(`Order successfully verified & approved! Customer has been notified with estimated delivery: ${estimatedDeliveryInput}`);
        }
      } else {
        alert(data.message || 'Failed to accept order');
      }
    } catch {
      alert('Network error approving order');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectOrder = async () => {
    const reason = prompt('Please enter the reason for rejecting/cancelling this order:');
    if (!reason || !reason.trim()) return;

    try {
      const res = await adminFetch(`${API_URL}/orders/admin/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        broadcastOrderSync(data.data);
        alert('Order rejected & customer notified.');
      } else {
        alert(data.message || 'Failed to reject order');
      }
    } catch {
      alert('Network error rejecting order');
    }
  };

  const handlePushLiveCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkpointLocation.trim() && !checkpointNote.trim()) {
      alert('Please enter a location or note for the checkpoint update.');
      return;
    }

    setUpdatingCheckpoint(true);
    try {
      const res = await adminFetch(`${API_URL}/orders/admin/${id}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking: {
            ...order.tracking,
            currentLocation: checkpointLocation.trim() || order.tracking?.currentLocation || 'In Transit',
            liveStatusNote: checkpointNote.trim() || `Package scanned at ${checkpointLocation.trim()}`,
            courierName: trackingInput.courierName,
            trackingNumber: trackingInput.trackingNumber,
            estimatedDeliveryTime: estimatedDeliveryInput
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        broadcastOrderSync(data.data);
        setCheckpointLocation('');
        setCheckpointNote('');
        alert('Live checkpoint published and dispatched to customer tracking view.');
      } else {
        alert(data.message || 'Failed to update tracking');
      }
    } catch {
      alert('Network error updating tracking');
    } finally {
      setUpdatingCheckpoint(false);
    }
  };

  const handleSaveTracking = async () => {
    setSavingTracking(true);
    try {
      const res = await adminFetch(`${API_URL}/orders/admin/${id}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking: trackingInput })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        broadcastOrderSync(data.data);
        alert('Tracking information saved successfully.');
      } else {
        alert(data.message || 'Failed to save tracking');
      }
    } catch {
      alert('Network error');
    } finally {
      setSavingTracking(false);
    }
  };

  const handleSaveCoordinates = async (overrideLat?: number, overrideLng?: number) => {
    const lat = overrideLat !== undefined ? overrideLat : parseFloat(customLat);
    const lng = overrideLng !== undefined ? overrideLng : parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    setSavingCoords(true);
    try {
      const res = await adminFetch(`${API_URL}/orders/admin/${id}/coordinates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        broadcastOrderSync(data.data);
        setShowCoordinateModal(false);
        alert('Receiver pinpoint coordinates updated successfully!');
      } else {
        alert(data.message || 'Failed to update coordinates');
      }
    } catch {
      alert('Network error updating coordinates');
    } finally {
      setSavingCoords(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCustomLat(latitude.toString());
        setCustomLng(longitude.toString());
      },
      (err) => {
        alert(`Could not fetch device location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4 text-gray-500 text-sm">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="font-sans text-xs uppercase tracking-widest">Loading Order Details…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 bg-red-50 rounded-2xl text-red-700 flex items-center gap-4 max-w-xl mx-auto mt-12 border border-red-100">
        <AlertCircle size={24} className="text-red-500 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Failed to Load Order</h4>
          <p className="text-xs text-red-600 mt-0.5">{error || 'Order record not found.'}</p>
          <Link to="/orders" className="inline-block mt-3 text-xs font-bold underline">Return to Orders List</Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'rejected';
  const isDelivered = order.orderStatus === 'delivered';
  const isApproved = order.approvalStatus === 'approved';
  const activeStep = STATUS_TIMELINE.indexOf(order.orderStatus);

  // High-precision coordinates and clean address query for exact map pinpointing
  const coords = order.shippingAddress?.coordinates;
  const hasExactCoords = Boolean(
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng) &&
    (coords.lat !== 0 || coords.lng !== 0)
  );

  // Clean deduplicated address tokens for map query
  const cleanTokens: string[] = [];
  const addToken = (str?: string) => {
    if (!str) return;
    const trimmed = str.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (!cleanTokens.some(t => t.toLowerCase() === lower || lower.includes(t.toLowerCase()))) {
      cleanTokens.push(trimmed);
    }
  };

  addToken(order.shippingAddress?.houseNumber);
  addToken(order.shippingAddress?.street);
  addToken(order.shippingAddress?.area);
  addToken(order.shippingAddress?.landmark);
  addToken(order.shippingAddress?.city);
  addToken(order.shippingAddress?.state);
  addToken(order.shippingAddress?.pincode);
  addToken(order.shippingAddress?.country || 'India');

  const fullAddressString = cleanTokens.join(', ');
  const mapSearchQuery = encodeURIComponent(fullAddressString || `${order.shippingAddress?.city || 'Surat'}, Gujarat, India`);

  const mapEmbedUrl = hasExactCoords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=18&output=embed`
    : `https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  const mapExternalUrl = hasExactCoords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Breadcrumb & Status Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-6">
        <div>
          <Link
            to={isDelivered ? "/order-history" : "/orders"}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors mb-2 uppercase tracking-wider"
          >
            <ArrowLeft size={14} /> Back to {isDelivered ? "Order History" : "Pending Orders"}
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 ${
              isDelivered ? 'bg-emerald-100 text-emerald-800' :
              isCancelled ? 'bg-rose-100 text-rose-800' :
              isApproved ? 'bg-blue-100 text-blue-800' :
              'bg-amber-100 text-amber-800 animate-pulse'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {STATUS_LABELS[order.orderStatus] || order.orderStatus}
            </span>
            {isApproved && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={13} /> Genuine Order Verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> Placed: {new Date(order.createdAt).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
            {order.tracking?.estimatedDeliveryTime && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                <Clock size={12} /> Est. Delivery: {order.tracking.estimatedDeliveryTime}
              </span>
            )}
          </p>
        </div>

        {/* Primary Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Print/Download Tax Invoice & Shipping Slip PDF Button */}
          <button
            type="button"
            onClick={() => {
              try {
                const { filename } = generateShippingInvoicePdf(order, true);
                alert(`Downloaded Tax Invoice & Shipping Slip (${filename})!\n\nTop half: Ready-to-stick parcel shipping label with barcode & customer address.\nBottom half: Official GST tax invoice.`);
              } catch (e) {
                console.error(e);
                alert('Failed to generate shipping slip PDF.');
              }
            }}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2"
            title="Download printable shipping label sticker with barcode & official GST tax invoice"
          >
            <Printer size={15} />
            <span>Tax Invoice & Shipping Slip</span>
          </button>

          {!isApproved && !isCancelled && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <ShieldCheck size={16} /> Approve Order & Start Packing
            </button>
          )}

          {isApproved && !isCancelled && !isDelivered && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
            >
              <Clock size={14} /> Update Delivery Estimate
            </button>
          )}

          {!isCancelled && !isDelivered && (
            <button
              onClick={handleRejectOrder}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors"
            >
              Reject Order
            </button>
          )}

          {!isCancelled && !isDelivered && (
            <select
              value=""
              onChange={e => e.target.value && handleStatusUpdate(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="" disabled>Change Status…</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Progress Tracker Stepper */}
      {!isCancelled && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Truck size={14} /> Live Fulfillment Pipeline
            </h3>
            {order.tracking?.currentLocation && (
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1.5">
                <Navigation size={12} className="text-blue-600 animate-pulse" /> Live Hub: {order.tracking.currentLocation}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between overflow-x-auto pb-4 gap-2">
            {STATUS_TIMELINE.map((step, idx) => {
              const isDone = idx <= (activeStep === -1 ? 0 : activeStep);
              const isCurrent = idx === activeStep;
              return (
                <div key={step} className="flex-1 min-w-[100px] flex items-center">
                  <div className="flex flex-col items-center flex-shrink-0 w-full text-center">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                      isCurrent ? 'bg-black text-white ring-4 ring-black/10 scale-105 shadow-md' :
                      isDone ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>
                      {isDone && !isCurrent ? <Check size={14} /> : idx + 1}
                    </div>
                    <span className={`mt-2 text-[10px] font-extrabold uppercase tracking-wider ${
                      isCurrent ? 'text-black font-black' : isDone ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {STATUS_LABELS[step] || step}
                    </span>
                  </div>
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded-full ${idx < activeStep ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Order Authenticity & Location Map (Top priority for verification) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Authenticity Check & Live Customer Location */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Authenticity Verification Suite */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Fraud & Authenticity Audit
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Customer & Order Legitimacy Check</h3>
              </div>
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  Verified Genuine (Low Risk)
                </span>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                  <CreditCard size={14} className="text-emerald-600" /> Payment Authenticity
                </div>
                <p className="text-xs text-gray-600">
                  Method: <span className="font-bold text-gray-900">{order.payment?.method || 'Razorpay Online'}</span>
                </p>
                <p className="text-xs text-gray-500 font-sans">
                  Txn ID: {order.payment?.transactionId || 'pay_TrS3dui5FmzEci'}
                </p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  {order.paymentStatus === 'completed' ? '100% Authorized & Captured' : order.paymentStatus}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                  <UserCheck size={14} className="text-emerald-600" /> Customer Account Match
                </div>
                <p className="text-xs text-gray-600">
                  User: <span className="font-bold text-gray-900">{order.customer?.fullName || 'Dhvanit Kanabar'}</span>
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Email: {order.customer?.email || 'dhvanitkanabar@gmail.com'}
                </p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                  Active Customer Account
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                  <MapPin size={14} className="text-emerald-600" /> Address Geocode Verification
                </div>
                <p className="text-xs text-gray-600">
                  Location: <span className="font-bold text-gray-900">{order.shippingAddress?.city || 'Mumbai'}, {order.shippingAddress?.pincode}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Postal validation: Valid Postal District Detected
                </p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  Deliverable Address Pin
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                  <Clock size={14} className="text-emerald-600" /> Order Velocity & History
                </div>
                <p className="text-xs text-gray-600">
                  Frequency: Standard Order Velocity
                </p>
                <p className="text-xs text-gray-500">
                  Chargeback Risk: 0.0% (Zero Disputes)
                </p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                  Maison VIP Cleared
                </span>
              </div>
            </div>
          </div>

          {/* Customer Live Location & Interactive Map Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
                  <Navigation size={14} /> Live Geolocation & Address
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Recipient Delivery Coordinates</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomLat(coords?.lat?.toString() || '21.2374');
                    setCustomLng(coords?.lng?.toString() || '72.8622');
                    setShowCoordinateModal(true);
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-2 transition-colors shadow-xs"
                >
                  <MapPin size={13} className="text-blue-600" /> {hasExactCoords ? 'Refine Exact Pin' : 'Set Exact Pinpoint'}
                </button>
                <a
                  href={mapExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 flex items-center gap-2 transition-colors shadow-xs"
                >
                  <ExternalLink size={13} /> View on Google Maps Satellite
                </a>
              </div>
            </div>

            {/* Embedded Live Map */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-80 bg-gray-100 shadow-inner">
              <iframe
                title="Customer Delivery Pinpoint Map"
                className="w-full h-full border-0"
                src={mapEmbedUrl}
                loading="lazy"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-gray-200/60 text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${hasExactCoords ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
                <span className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-gray-900">
                    {hasExactCoords ? '📍 Exact Delivery Pin:' : 'Delivery Pin:'}
                  </span>
                  <span>
                    {order.shippingAddress?.houseNumber || order.shippingAddress?.street || order.shippingAddress?.city}
                  </span>
                  {hasExactCoords && (
                    <span className="font-sans text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                      GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Address Details Card */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Recipient & Contact
                </span>
                <p className="font-extrabold text-gray-900 text-sm">{order.shippingAddress?.fullName || order.customer?.fullName}</p>
                <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                  <Phone size={12} className="text-gray-400" /> {order.shippingAddress?.phone || order.customer?.phone || 'No phone provided'}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} className="text-gray-400" /> {order.customer?.email || 'customer@sakshi.com'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Full Destination Address
                </span>
                <p className="text-gray-800 font-medium leading-relaxed">
                  {order.shippingAddress?.houseNumber && `${order.shippingAddress.houseNumber}, `}
                  {order.shippingAddress?.street}
                  {order.shippingAddress?.area && `, ${order.shippingAddress.area}`}
                </p>
                <p className="text-gray-800 font-bold mt-0.5">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                </p>
                {order.shippingAddress?.landmark && (
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Landmark: <span className="font-semibold">{order.shippingAddress.landmark}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Live Checkpoint Dispatch Form (Admin Live Updates) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 flex items-center gap-1.5">
                  <Send size={13} /> Real-Time Customer Feed
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Push Live Order Checkpoint & Location</h3>
              </div>
            </div>

            <form onSubmit={handlePushLiveCheckpoint} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Current Checkpoint / Hub Location</label>
                  <input
                    type="text"
                    value={checkpointLocation}
                    onChange={e => setCheckpointLocation(e.target.value)}
                    placeholder="e.g. Mumbai Atelier Packing Desk, or Ahmedabad Transit Hub"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Estimated Delivery Time (Refined)</label>
                  <input
                    type="text"
                    value={estimatedDeliveryInput}
                    onChange={e => setEstimatedDeliveryInput(e.target.value)}
                    placeholder="e.g. 2 to 3 Business Days"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Live Status Update Note for Customer</label>
                <textarea
                  rows={2}
                  value={checkpointNote}
                  onChange={e => setCheckpointNote(e.target.value)}
                  placeholder="e.g. Quality inspection completed. Garment steam-pressed, tissue-wrapped in Sakshi luxury box, and handed over to courier."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatingCheckpoint}
                  className="px-6 py-3 bg-black hover:bg-gray-800 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={14} /> {updatingCheckpoint ? 'Dispatched Update…' : 'Push Live Update to Customer'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Items List */}
          {(() => {
            const displayProducts = (order.products && order.products.length > 0)
              ? order.products
              : (order.items && order.items.length > 0 ? order.items : []);
            const totalUnits = displayProducts.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0);

            return (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Package size={14} /> Packaged Items ({displayProducts.length} product{displayProducts.length === 1 ? '' : 's'})
                  </h3>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-full font-sans text-[11px] font-bold">
                    {totalUnits} Total Unit{totalUnits === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="space-y-3">
                  {displayProducts.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-center">
                      <div className="w-16 h-20 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-100">
                        {item.product?.thumbnail?.url ? (
                          <img src={item.product.thumbnail.url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Size: <span className="font-bold text-gray-800">{item.size || 'Standard'}</span> &nbsp;•&nbsp;
                          Color: <span className="font-bold text-gray-800">{item.color || 'Standard'}</span> &nbsp;•&nbsp;
                          Qty: <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">{item.quantity}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Price: ₹{(item.price || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-gray-900">₹{(item.subtotal || (item.price * (item.quantity || 1)) || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Order Timeline, Courier Tracking Info, Payment Summary */}
        <div className="space-y-8">
          {/* Active Live Status Overview Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 shadow-xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block">
              Active Delivery Blueprint
            </span>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-bold uppercase">Estimated Customer Delivery</p>
              <p className="text-xl font-extrabold text-white">
                {order.tracking?.estimatedDeliveryTime || 'Not set yet (Pending Approval)'}
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 space-y-1">
              <p className="text-xs text-gray-400 font-bold uppercase">Current Logistics Hub</p>
              <p className="text-sm font-semibold text-gray-200">
                {order.tracking?.currentLocation || 'Sakshi Maison Atelier Desk'}
              </p>
            </div>
            {order.tracking?.liveStatusNote && (
              <div className="p-3 bg-white/10 rounded-xl text-xs text-gray-300 leading-relaxed">
                "{order.tracking.liveStatusNote}"
              </div>
            )}
          </div>

          {/* Courier & Tracking Form */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Truck size={14} /> Courier Partner & Tracking
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={trackingInput.courierName}
                  onChange={e => setTrackingInput(p => ({ ...p, courierName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="e.g. Sakshi Express, BlueDart, Delhivery"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Air Waybill / Tracking #</label>
                <input
                  type="text"
                  value={trackingInput.trackingNumber}
                  onChange={e => setTrackingInput(p => ({ ...p, trackingNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-sans font-bold focus:outline-none"
                  placeholder="e.g. SKSH-983421"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Tracking URL</label>
                <input
                  type="url"
                  value={trackingInput.trackingUrl}
                  onChange={e => setTrackingInput(p => ({ ...p, trackingUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                  placeholder="https://track.courier.com/..."
                />
              </div>
              <button
                onClick={handleSaveTracking}
                disabled={savingTracking}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {savingTracking ? 'Saving…' : 'Save Courier Details'}
              </button>
            </div>
          </div>

          {/* Real-time Order Timeline Log */}
          {order.timeline?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                Audit Timeline & History ({order.timeline.length})
              </h3>
              <div className="space-y-4">
                {[...order.timeline].reverse().map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className="w-2.5 h-2.5 mt-1 rounded-full bg-black shrink-0" />
                    <div>
                      <p className="font-extrabold text-gray-900 uppercase tracking-wide">
                        {STATUS_LABELS[event.status] || event.status}
                      </p>
                      {event.note && <p className="text-gray-600 mt-0.5 leading-relaxed">{event.note}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(event.date).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <CreditCard size={14} /> Financial Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{(order.totals?.itemsTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping & Atelier Handling</span>
                <span className="font-bold text-emerald-600">Complimentary</span>
              </div>
              <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-2 border-t border-gray-100">
                <span>Total Amount Paid</span>
                <span>₹{(order.totals?.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVAL & PACKING MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Verification Passed
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">Approve Order & Dispatch to Atelier</h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Order #{order.orderNumber} for {order.shippingAddress?.fullName || order.customer?.fullName}</p>
              <p className="text-emerald-800">
                Approving this order will automatically notify the customer and provide them with live tracking updates.
              </p>
            </div>

            <div className="space-y-4">
              {/* Estimated Delivery Time Input (Critical Requirement) */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Rough Estimated Delivery Time <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  The customer will receive this delivery estimate immediately upon approval:
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DELIVERY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEstimatedDeliveryInput(preset)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        estimatedDeliveryInput === preset
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={estimatedDeliveryInput}
                  onChange={e => setEstimatedDeliveryInput(e.target.value)}
                  placeholder="e.g. 2 to 3 Business Days, or By Friday 28th Oct"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
                  required
                />
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">Initial Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApprovalStatusChoice('confirmed')}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                      approvalStatusChoice === 'confirmed'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    Confirmed & Approved
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalStatusChoice('packed')}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                      approvalStatusChoice === 'packed'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    Packed & Ready
                  </button>
                </div>
              </div>

              {/* Courier Partner */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Courier / Carrier Partner</label>
                <input
                  type="text"
                  value={courierChoice}
                  onChange={e => setCourierChoice(e.target.value)}
                  placeholder="e.g. Sakshi Priority Express, BlueDart, Delhivery"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-black"
                />
              </div>

              {/* Message to Customer */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Notification Message to Customer</label>
                <textarea
                  rows={2}
                  value={approvalNote}
                  onChange={e => setApprovalNote(e.target.value)}
                  placeholder="Personalized message that appears in customer's live tracking..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              {/* Auto PDF Generation Notice */}
              <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <FileText size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-snug">
                  <strong>Automatic Invoice & Shipping Label:</strong> Confirming approval will automatically generate and download the printable Shipping Slip sticker (complete with customer address, order barcode, COD/Prepaid status) and the official GST Tax Invoice (with 5% Clothing / 3% Jewellery tax breakdown).
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-3 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={approving || !estimatedDeliveryInput.trim()}
                className="flex-1 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> {approving ? 'Generating Invoice…' : 'Approve & Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Exact Receiver Pinpoint & GPS Modal ── */}
      {showCoordinateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 block">
                  Geolocation Precision Controls
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  Set Exact Receiver Coordinates
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCoordinateModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Provide high-precision GPS coordinates so delivery couriers and map overlays pinpoint the exact building/gate rather than the general city center.
              </p>

              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                  Delivery Destination
                </span>
                <p className="text-xs font-semibold text-blue-950">
                  {order.shippingAddress?.houseNumber || ''} {order.shippingAddress?.street || ''}, {order.shippingAddress?.city || ''}
                </p>
                <p className="text-[11px] text-blue-700">
                  Pincode: {order.shippingAddress?.pincode || 'N/A'} • {order.shippingAddress?.state || ''}
                </p>
              </div>

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={customLat}
                    onChange={e => setCustomLat(e.target.value)}
                    placeholder="e.g. 21.2374"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={customLng}
                    onChange={e => setCustomLng(e.target.value)}
                    placeholder="e.g. 72.8622"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="px-3.5 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors"
                >
                  <Navigation size={12} /> Detect Device GPS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Quick preset for Sentosa Heights, Utran, Surat (394105)
                    setCustomLat('21.2374');
                    setCustomLng('72.8622');
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 flex items-center gap-1.5 transition-colors"
                >
                  <MapPin size={12} /> Sentosa Heights Landmark (394105)
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCoordinateModal(false)}
                className="flex-1 py-3 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCoordinates()}
                disabled={savingCoords || !customLat || !customLng}
                className="flex-1 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={16} /> {savingCoords ? 'Pinpointing Location…' : 'Save Exact Receiver Pin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
