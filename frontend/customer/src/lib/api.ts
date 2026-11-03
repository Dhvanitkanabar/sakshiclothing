import { Product } from '../types';
import { PRODUCTS } from '../data/products';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Authenticated fetch: sends the Clerk Bearer token in the Authorization header.
 * This is needed because Clerk users don't get a local accessToken cookie.
 */
export const authedFetch = async (url: string, options: RequestInit = {}, clerkToken?: string | null): Promise<Response> => {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (clerkToken) {
    headers['Authorization'] = `Bearer ${clerkToken}`;
  }
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
};

export const normalizeImageUrl = (url: string): string => {
  if (!url) return '';
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : 'https://sakshi-clothing-backend.onrender.com';

  if (url.startsWith('http://localhost:5000/')) {
    return url.replace('http://localhost:5000', backendBase);
  }
  if (url.startsWith('/uploads/')) {
    return `${backendBase}${url}`;
  }
  return url;
};

export const mapBackendProductToFrontend = (backendProduct: any): Product => {
  const DEAD_IMAGES = ['image-1793650768360-508253073.jpeg'];
  const parseImageUrl = (img: any): string => {
    if (!img) return '';
    let raw = '';
    if (typeof img === 'string') raw = img;
    else if (typeof img === 'object' && img.url) raw = img.url;
    if (DEAD_IMAGES.some(d => raw.includes(d))) return '';
    return normalizeImageUrl(raw);
  };

  const imagesList: string[] = Array.isArray(backendProduct.images)
    ? backendProduct.images.map(parseImageUrl).filter(Boolean)
    : [];

  const mainImageUrl =
    imagesList[0] ||
    parseImageUrl(backendProduct.thumbnail) ||
    parseImageUrl(backendProduct.image) ||
    '';

  return {
    id: backendProduct._id || backendProduct.id,
    name: backendProduct.name,
    price: backendProduct.pricing?.basePrice ?? backendProduct.price ?? 0,
    category: backendProduct.category?.name || backendProduct.category || '',
    subCategory: backendProduct.tags?.[0] || '', // Mapping tags to subcategory for UI compatibility
    sizes: backendProduct.variants?.map((v: any) => v.size).filter(Boolean) || [],
    variants: backendProduct.variants || [],
    image: mainImageUrl,
    images: imagesList.length > 0 ? imagesList : [mainImageUrl],
    description: backendProduct.description || backendProduct.shortDescription || '',
    featured: backendProduct.isFeatured || false,
    rating: backendProduct.averageRating || 5,
    craftAndFabric: backendProduct.craftAndFabric || []
  };
};

export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 3800): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const getCachedProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem('sakshi_cached_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return PRODUCTS;
};

export const getCachedFeatured = (): Product[] => {
  try {
    const saved = localStorage.getItem('sakshi_cached_featured');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return PRODUCTS.filter(p => p.featured);
};

export const getCachedNewArrivals = (): Product[] => {
  try {
    const saved = localStorage.getItem('sakshi_cached_arrivals');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return PRODUCTS.slice(0, 8);
};

export const fetchProducts = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetchWithTimeout(`${API_URL}/products?${params.toString()}`, {}, 3800);
    const data = await response.json();
    if (data.success && Array.isArray(data.data?.data)) {
      const mapped = data.data.data.map(mapBackendProductToFrontend);
      if (mapped.length > 0 && Object.keys(filters).length === 0) {
        try {
          localStorage.setItem('sakshi_cached_products', JSON.stringify(mapped));
        } catch {}
      }
      return mapped;
    }
    return getCachedProducts();
  } catch {
    return getCachedProducts();
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/products/${id}`, {}, 3800);
    const data = await response.json();
    if (data.success && data.data) {
      return mapBackendProductToFrontend(data.data);
    }
    return getCachedProducts().find(p => p.id === id) || PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  } catch {
    return getCachedProducts().find(p => p.id === id) || PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  }
};

export const fetchFeaturedProducts = async () => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/products/featured`, {}, 3800);
    const data = await response.json();
    if (data.success && data.data?.length > 0) {
      const mapped = data.data.map(mapBackendProductToFrontend);
      try {
        localStorage.setItem('sakshi_cached_featured', JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
    return getCachedFeatured();
  } catch {
    return getCachedFeatured();
  }
};

export const fetchNewArrivals = async () => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/products/new-arrivals`, {}, 3800);
    const data = await response.json();
    if (data.success && data.data?.length > 0) {
      const mapped = data.data.map(mapBackendProductToFrontend);
      try {
        localStorage.setItem('sakshi_cached_arrivals', JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
    return getCachedNewArrivals();
  } catch {
    return getCachedNewArrivals();
  }
};

export const fetchAddresses = async (clerkToken?: string | null): Promise<any[]> => {
  try {
    const res = await authedFetch(`${API_URL}/addresses`, {}, clerkToken);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addAddress = async (addressData: any, clerkToken?: string | null) => {
  try {
    const res = await authedFetch(`${API_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addressData)
    }, clerkToken);
    return await res.json();
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const updateAddress = async (id: string, addressData: any) => {
  try {
    const res = await fetch(`${API_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(addressData)
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const deleteAddress = async (id: string, clerkToken?: string | null) => {
  try {
    const res = await authedFetch(`${API_URL}/addresses/${id}`, { method: 'DELETE' }, clerkToken);
    return await res.json();
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const setDefaultAddress = async (id: string, clerkToken?: string | null) => {
  try {
    const res = await authedFetch(`${API_URL}/addresses/${id}/default`, { method: 'PATCH' }, clerkToken);
    return await res.json();
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const placeOrder = async (
  shippingAddressId: string,
  isFromCart = true,
  clerkToken?: string | null,
  items?: any[],
  paymentMethod: string = 'cod',
  payment?: any
) => {
  try {
    const res = await authedFetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingAddressId, isFromCart, items, paymentMethod, payment })
    }, clerkToken);
    return await res.json();
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const buyNowOrder = async (productId: string, variantId: string, quantity: number, shippingAddressId: string) => {
  try {
    const res = await fetch(`${API_URL}/orders/buy-now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, variantId, quantity, shippingAddressId })
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const fetchOrders = async (clerkToken?: string | null): Promise<any[]> => {
  try {
    const res = await authedFetch(`${API_URL}/orders`, {}, clerkToken);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchOrderById = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const cancelOrder = async (id: string, clerkToken?: string | null) => {
  try {
    const res = await authedFetch(`${API_URL}/orders/${id}/cancel`, { method: 'PATCH' }, clerkToken);
    return await res.json();
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const getInvoiceUrl = (orderId: string) =>
  `${API_URL}/orders/${orderId}/invoice`;

