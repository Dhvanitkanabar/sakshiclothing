import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductList = lazy(() => import('./pages/products/ProductList'));
const ProductForm = lazy(() => import('./pages/products/ProductForm'));
const CategoryList = lazy(() => import('./pages/categories/CategoryList'));
const CategoryForm = lazy(() => import('./pages/categories/CategoryForm'));
const BrandList = lazy(() => import('./pages/brands/BrandList'));
const BrandForm = lazy(() => import('./pages/brands/BrandForm'));
const HomepageManager = lazy(() => import('./pages/cms/HomepageManager'));
const CartViewer = lazy(() => import('./pages/customers/CartViewer'));
const WishlistViewer = lazy(() => import('./pages/customers/WishlistViewer'));
const CustomerList = lazy(() => import('./pages/customers/CustomerList'));
const InventoryDashboard = lazy(() => import('./pages/products/InventoryDashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Coupons = lazy(() => import('./pages/marketing/Coupons'));
const ReviewsModeration = lazy(() => import('./pages/marketing/ReviewsModeration'));
const NewsletterManager = lazy(() => import('./pages/marketing/NewsletterManager'));
const NotificationManager = lazy(() => import('./pages/marketing/NotificationManager'));
const LoyaltyDashboard = lazy(() => import('./pages/marketing/LoyaltyDashboard'));
const PaymentsManager = lazy(() => import('./pages/payments/PaymentsManager'));
const OrderList = lazy(() => import('./pages/orders/OrderList'));
const OrderDetails = lazy(() => import('./pages/orders/OrderDetails'));

function App() {
  return (
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
              <Route path="/payments" element={<PaymentsManager />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
