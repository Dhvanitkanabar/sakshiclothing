import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import BrandList from './pages/brands/BrandList';
import BrandForm from './pages/brands/BrandForm';
import HomepageManager from './pages/cms/HomepageManager';
import CartViewer from './pages/customers/CartViewer';
import WishlistViewer from './pages/customers/WishlistViewer';
import CustomerList from './pages/customers/CustomerList';
import InventoryDashboard from './pages/products/InventoryDashboard';
import Reports from './pages/Reports';

// Marketing & Engagement
import Coupons from './pages/marketing/Coupons';
import ReviewsModeration from './pages/marketing/ReviewsModeration';
import NewsletterManager from './pages/marketing/NewsletterManager';
import NotificationManager from './pages/marketing/NotificationManager';
import LoyaltyDashboard from './pages/marketing/LoyaltyDashboard';

import ProtectedRoute from './components/ProtectedRoute';

import OrderList from './pages/orders/OrderList';
import OrderDetails from './pages/orders/OrderDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/add" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/add" element={<CategoryForm />} />
            <Route path="/categories/edit/:id" element={<CategoryForm />} />
            <Route path="/brands" element={<BrandList />} />
            <Route path="/brands/add" element={<BrandForm />} />
            <Route path="/brands/edit/:id" element={<BrandForm />} />
            <Route path="/cms" element={<HomepageManager />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/carts" element={<CartViewer />} />
            <Route path="/wishlists" element={<WishlistViewer />} />
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/marketing/coupons" element={<Coupons />} />
            <Route path="/marketing/reviews" element={<ReviewsModeration />} />
            <Route path="/marketing/newsletter" element={<NewsletterManager />} />
            <Route path="/marketing/notifications" element={<NotificationManager />} />
            <Route path="/marketing/loyalty" element={<LoyaltyDashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
