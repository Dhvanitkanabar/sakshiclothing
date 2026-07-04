export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Women' | 'Men' | 'Kids';
  subCategory: string;
  sizes: string[];
  variants?: { _id: string; size: string; color: string; stock: number }[];
  image: string;
  description: string;
  featured?: boolean;
  rating?: number;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'client' | 'admin';
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  address: string;
  phone: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: any;
}
