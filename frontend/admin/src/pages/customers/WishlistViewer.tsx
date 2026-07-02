import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function WishlistViewer() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/wishlist/all`, { withCredentials: true });
        if (data.success) {
          setWishlists(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch wishlists', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlists();
  }, []);

  if (loading) return <div>Loading wishlists...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customer Wishlists (Read-Only)</h1>
      <div className="grid gap-6">
        {wishlists.length === 0 ? (
          <p>No active wishlists found.</p>
        ) : (
          wishlists.map((wishlist: any) => (
            <div key={wishlist._id} className="bg-white p-6 rounded shadow border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Wishlist Owner: {wishlist.user ? `${wishlist.user.firstName} ${wishlist.user.lastName} (${wishlist.user.email})` : `Guest (${wishlist.guestId})`}
                </h2>
                <span className="text-gray-500">{wishlist.products.length} items</span>
              </div>
              <ul className="list-disc pl-5">
                {wishlist.products.map((product: any, idx: number) => (
                  <li key={idx} className="py-1">{product?.name || 'Unknown Product'}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
