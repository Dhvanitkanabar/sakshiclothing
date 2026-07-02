import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CartViewer() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/cart/all`, { withCredentials: true });
        if (data.success) {
          setCarts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch carts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarts();
  }, []);

  if (loading) return <div>Loading carts...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customer Carts (Read-Only)</h1>
      <div className="grid gap-6">
        {carts.length === 0 ? (
          <p>No active carts found.</p>
        ) : (
          carts.map((cart: any) => (
            <div key={cart._id} className="bg-white p-6 rounded shadow border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Cart Owner: {cart.user ? `${cart.user.firstName} ${cart.user.lastName} (${cart.user.email})` : `Guest (${cart.guestId})`}
                </h2>
                <span className="font-bold text-xl">Total: ${cart.totalAmount.toFixed(2)}</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Product</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2">{item.product?.name || 'Unknown Product'}</td>
                      <td className="py-2">${item.price.toFixed(2)}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
