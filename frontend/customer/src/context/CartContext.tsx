import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { toast } from 'sonner';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Build fetch options with Clerk Bearer token if available,
 * so authenticated cart operations work for Clerk users.
 */
const buildOptions = (clerkToken: string | null, extra: RequestInit = {}): RequestInit => {
  const headers: Record<string, string> = {
    ...(extra.headers as Record<string, string> || {}),
  };
  if (clerkToken) {
    headers['Authorization'] = `Bearer ${clerkToken}`;
  }
  return { ...extra, credentials: 'include', headers };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, isSignedIn } = useClerkAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getClerkToken = useCallback(async (): Promise<string | null> => {
    try { return await getToken(); } catch { return null; }
  }, [getToken]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getClerkToken();
      const res = await fetch(`${API_URL}/cart`, buildOptions(token));
      const data = await res.json();
      if (data.success && data.data && data.data.items) {
        const frontendCartItems = data.data.items.map((item: any) => ({
          id: item.product?._id || item.product,
          name: item.product?.name || 'Product',
          price: item.price,
          category: item.product?.category?.name || 'Women',
          subCategory: '',
          sizes: [],
          image: item.product?.thumbnail?.url || item.product?.images?.[0]?.url || 'https://via.placeholder.com/500',
          description: '',
          quantity: item.quantity,
          selectedSize: item.product?.variants?.find((v: any) => v._id?.toString() === item.variantId?.toString())?.size || 'S',
          variantId: item.variantId
        }));
        setCart(frontendCartItems);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getClerkToken]);

  // Fetch cart when auth state changes
  useEffect(() => {
    fetchCart();
  }, [isSignedIn, fetchCart]);

  const addToCart = async (product: Product, size: string, quantity: number) => {
    let variantId = product.variants?.find(v => v.size === size)?._id;
    if (!variantId && product.variants && product.variants.length > 0) {
      variantId = product.variants[0]._id;
    }
    // Fallback to product ID if no explicit sub-variants exist
    if (!variantId) {
      variantId = product.id;
    }

    try {
      const token = await getClerkToken();
      const res = await fetch(`${API_URL}/cart/add`, buildOptions(token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, variantId, quantity })
      }));
      const data = await res.json();
      if (data.success) {
        toast.success(`Added ${product.name} to cart`);
        setIsCartOpen(true);
        fetchCart();
      } else {
        toast.error(data.message || 'Error adding to cart');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    const item = cart.find(i => i.id === productId && i.selectedSize === size);
    if (!item) return;

    try {
      const token = await getClerkToken();
      const res = await fetch(`${API_URL}/cart/remove`, buildOptions(token, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId: (item as any).variantId })
      }));
      const data = await res.json();
      if (data.success) {
        toast.info('Item removed from cart');
        fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId, size); return; }

    const item = cart.find(i => i.id === productId && i.selectedSize === size);
    if (!item) return;

    try {
      const token = await getClerkToken();
      const res = await fetch(`${API_URL}/cart/update`, buildOptions(token, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId: (item as any).variantId, quantity })
      }));
      const data = await res.json();
      if (data.success) {
        fetchCart();
      } else {
        toast.error(data.message || 'Error updating quantity');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      const token = await getClerkToken();
      await fetch(`${API_URL}/cart/clear`, buildOptions(token, { method: 'DELETE' }));
    } catch { /* silent */ }
    setCart([]);
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, isCartOpen, setIsCartOpen }}>
      {!loading && children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
