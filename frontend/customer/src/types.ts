export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Women' | 'Men' | 'Kids' | 'Jewellery' | 'Bridal' | string;
  subCategory: string;
  sizes: string[];
  variants?: { _id?: string; size?: string; color?: string; stock?: number; status?: string; price?: number }[];
  image: string;
  images?: string[];
  description: string;
  featured?: boolean;
  rating?: number;
  craftAndFabric?: string[] | string;
}

export interface User {
  _id: string;
  clerkUserId: string;
  fullName: string;
  name?: string;      // alias used in some places
  email: string;
  phone?: string;
  avatar?: { url?: string };
  role: 'user' | 'admin' | 'superadmin';
  isActive?: boolean;
  isBlocked?: boolean;
  loyaltyPoints?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  variantId?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  address: string;
  phone: string;
  status: 'pending' | 'processing' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected' | string;
  createdAt: any;
}
