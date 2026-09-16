import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReviews = () => {
    fetch(`${API_URL}/reviews/product/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setReviews(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to review');
      return;
    }
    setError('');
    setSuccess('');

    fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, title, comment }),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess('Review submitted successfully!');
          setTitle('');
          setComment('');
          setRating(5);
          fetchReviews();
        } else {
          setError(data.message || 'Error submitting review');
        }
      })
      .catch(() => setError('Error submitting review'));
  };

  return (
    <div className="mt-24 pt-16 border-t border-black/5">
      <h2 className="text-3xl font-serif font-bold tracking-tight mb-12">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <h3 className="text-xl font-serif font-bold mb-6">Write a Review</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                      <Star size={24} fill={star <= rating ? "#eab308" : "none"} color={star <= rating ? "#eab308" : "#d1d5db"} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Review Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none bg-white transition-shadow shadow-sm text-sm"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Tell us what you think..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none bg-white transition-shadow shadow-sm text-sm"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm shadow-md hover:shadow-xl">
                <Send size={16} /> Submit Review
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-12 text-center">
              <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this piece!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={14} fill={star <= review.rating ? "#eab308" : "none"} color={star <= review.rating ? "#eab308" : "#d1d5db"} />
                      ))}
                    </div>
                    <h4 className="font-bold text-xl">{review.title}</h4>
                  </div>
                  <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <p className="text-gray-600 font-light leading-relaxed mb-6">{review.comment}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                    {(review.customer?.fullName || 'A')[0]}
                  </div>
                  <div>
                    <span className="font-medium text-black block text-sm">{review.customer?.fullName || 'Anonymous'}</span>
                    {review.isVerifiedPurchase && <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Verified Buyer</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
