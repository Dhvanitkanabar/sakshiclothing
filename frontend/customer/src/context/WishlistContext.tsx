import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../types';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/wishlist`, {
        credentials: 'true'
      });
      const data = await res.json();
      if (data.success && data.data && data.data.products) {
        const frontendProducts = data.data.products.map((p: any) => ({
          id: p._id || p.id,
          name: p.name || 'Product',
          price: p.pricing?.basePrice || 0,
          category: p.category?.name || 'Women',
          subCategory: '',
          sizes: p.variants?.map((v:any) => v.size) || ['S', 'M', 'L'],
          variants: p.variants || [],
          image: p.thumbnail?.url || p.images?.[0]?.url || 'https://via.placeholder.com/500',
          description: p.description || ''
        }));
        setWishlist(frontendProducts);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const toggleWishlist = async (product: Product) => {
    const exists = wishlist.find((p) => p.id === product.id);

    try {
      if (exists) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/wishlist/remove`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'true',
          body: JSON.stringify({ productId: product.id })
        });
        const data = await res.json();
        if (data.success) {
          toast.info(`Removed ${product.name} from wishlist`);
          fetchWishlist();
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/wishlist/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'true',
          body: JSON.stringify({ productId: product.id })
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Added ${product.name} to wishlist`);
          fetchWishlist();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update wishlist');
    }
  };

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {!loading && children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
