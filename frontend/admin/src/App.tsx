import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import OrderList from './pages/orders/OrderList';

const HomepageManager = lazy(() => import('./pages/cms/HomepageManager'));
const CartViewer = lazy(() => import('./pages/customers/CartViewer'));
const WishlistViewer = lazy(() => import('./pages/customers/WishlistViewer'));
const CustomerList = lazy(() => import('./pages/customers/CustomerList'));
const InventoryDashboard = lazy(() => import('./pages/products/InventoryDashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Coupons = lazy(() => import('./pages/marketing/Coupons'));
const ReviewsModeration = lazy(() => import('./pages/marketing/ReviewsModeration'));
const SubscribersBroadcast = lazy(() => import('./pages/marketing/SubscribersBroadcast'));
const CustomerDetails = lazy(() => import('./pages/customers/CustomerDetails'));

const PaymentsManager = lazy(() => import('./pages/payments/PaymentsManager'));
const OrderDetails = lazy(() => import('./pages/orders/OrderDetails'));


import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

function App() {
  return (
      <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Admin...</div>}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<OrderList defaultSection="pending" />} />
              <Route path="/order-history" element={<OrderList defaultSection="history" />} />
              <Route path="/orders/history" element={<OrderList defaultSection="history" />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/add" element={<ProductForm />} />
              <Route path="/products/edit/:id" element={<ProductForm />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/add" element={<CategoryForm />} />
              <Route path="/categories/edit/:id" element={<CategoryForm />} />

              <Route path="/cms" element={<HomepageManager />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/carts" element={<CartViewer />} />
              <Route path="/wishlists" element={<WishlistViewer />} />
              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/marketing/coupons" element={<Coupons />} />
              <Route path="/marketing/reviews" element={<ReviewsModeration />} />
              <Route path="/marketing/subscribers" element={<SubscribersBroadcast />} />

              <Route path="/payments" element={<PaymentsManager />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
