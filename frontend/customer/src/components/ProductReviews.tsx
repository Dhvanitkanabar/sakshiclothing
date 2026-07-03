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
      <h2 className="heading-md mb-12">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="caption mb-6">Write a Review</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block caption mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)}>
                      <Star size={20} fill={star <= rating ? "black" : "none"} />
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
                  className="w-full p-3 border-b border-black/20 focus:border-black outline-none bg-transparent"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Review"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full p-3 border-b border-black/20 focus:border-black outline-none bg-transparent"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button type="submit" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium">
                <Send size={16} /> Submit
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="border-b border-black/5 pb-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={12} fill={star <= review.rating ? "black" : "none"} />
                      ))}
                    </div>
                    <h4 className="font-bold text-lg">{review.title}</h4>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 font-light leading-relaxed mb-4">{review.comment}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-black">{review.customer?.fullName || 'Anonymous'}</span>
                  {review.isVerifiedPurchase && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified Buyer</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
