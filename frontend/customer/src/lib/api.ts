import { Product } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const mapBackendProductToFrontend = (backendProduct: any): Product => {
  return {
    id: backendProduct._id || backendProduct.id,
    name: backendProduct.name,
    price: backendProduct.pricing?.basePrice || 0,
    category: backendProduct.category?.name || 'Women', // Assuming populated
    subCategory: backendProduct.tags?.[0] || '', // Mapping tags to subcategory for UI compatibility
    sizes: backendProduct.variants?.map((v: any) => v.size).filter(Boolean) || ['S', 'M', 'L'], // Fallback sizes
    image: backendProduct.thumbnail?.url || backendProduct.images?.[0]?.url || 'https://via.placeholder.com/500',
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
