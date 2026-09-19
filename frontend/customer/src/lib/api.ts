import { Product } from '../types';

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

export const mapBackendProductToFrontend = (backendProduct: any): Product => {
  const parseImageUrl = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img.url) return img.url;
    return '';
  };

  const imagesList: string[] = Array.isArray(backendProduct.images)
    ? backendProduct.images.map(parseImageUrl).filter(Boolean)
    : [];

  const mainImageUrl =
    parseImageUrl(backendProduct.thumbnail) ||
    parseImageUrl(backendProduct.image) ||
    imagesList[0] ||
    'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=1000&auto=format&fit=crop';

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
    rating: backendProduct.averageRating || 5
  };
};

export const fetchProducts = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/products?${params.toString()}`);
    const data = await response.json();
    if (data.success) {
      return data.data.data.map(mapBackendProductToFrontend);
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();
    if (data.success) {
      return mapBackendProductToFrontend(data.data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
};

export const fetchFeaturedProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products/featured`);
    const data = await response.json();
    if (data.success) {
      return data.data.map(mapBackendProductToFrontend);
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const fetchNewArrivals = async () => {
  try {
    const response = await fetch(`${API_URL}/products/new-arrivals`);
    const data = await response.json();
    if (data.success) {
      return data.data.map(mapBackendProductToFrontend);
    }
    return [];
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
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

export const placeOrder = async (shippingAddressId: string, isFromCart = true, clerkToken?: string | null, items?: any[]) => {
  try {
    const res = await authedFetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingAddressId, isFromCart, items })
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

