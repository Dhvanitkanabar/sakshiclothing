import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { toast } from 'sonner';

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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/cart`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.data && data.data.items) {
        // map backend cart items to frontend CartItem format
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
          selectedSize: item.product?.variants?.find((v:any) => v._id === item.variantId)?.size || 'S',
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
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product: Product, size: string, quantity: number) => {
    // find variant id for this size
    let variantId = product.variants?.find(v => v.size === size)?._id;
    if (!variantId && product.variants && product.variants.length > 0) {
      variantId = product.variants[0]._id; // fallback
    }

    if (!variantId) {
      toast.error('Cannot add product without valid variant');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id, variantId, quantity })
      });
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
    // Frontend item has variantId mapped. We need to find it in the current cart state.
    const item = cart.find(i => i.id === productId && i.selectedSize === size);
    if (!item) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/cart/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, variantId: (item as any).variantId })
      });
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
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    const item = cart.find(i => i.id === productId && i.selectedSize === size);
    if (!item) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/cart/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, variantId: (item as any).variantId, quantity })
      });
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
    // The backend doesn't expose a clear route explicitly unless we use buyNow or add a clear route.
    // Since buyNow clears it, for now we will just reset frontend state if needed.
    // Optionally create a clear endpoint. For now:
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
