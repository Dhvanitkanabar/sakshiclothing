import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ReviewsModeration() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    fetch(`${API_URL}/reviews/admin`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setReviews(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatus = (id: string, isApproved: boolean) => {
    fetch(`${API_URL}/reviews/admin/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved }),
      credentials: 'include'
    }).then(() => fetchReviews());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="text-gray-900" fill="currentColor" /> Reviews Moderation
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Product</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Customer</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Rating & Comment</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No reviews found</td></tr>
            ) : reviews.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 w-1/5">{r.product?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-500 w-1/5">{r.customer?.fullName || 'Unknown'}</td>
                <td className="px-6 py-4 w-2/5">
                  <div className="flex text-amber-500 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="font-bold text-gray-900 text-xs mb-1">{r.title}</p>
                  <p className="text-gray-600 text-xs">{r.comment}</p>
                </td>
                <td className="px-6 py-4">
                  {r.isApproved ? (
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 uppercase tracking-wider">Approved</span>
                  ) : (
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-700 uppercase tracking-wider">Rejected</span>
                  )}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {!r.isApproved ? (
                    <button onClick={() => handleStatus(r._id, true)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg" title="Approve">
                      <CheckCircle size={18} />
                    </button>
                  ) : (
                    <button onClick={() => handleStatus(r._id, false)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Reject">
                      <XCircle size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
