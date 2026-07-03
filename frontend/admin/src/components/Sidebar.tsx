import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Sakshi Admin</h2>
      <nav>
        <ul className="space-y-2">
          <li><Link to="/dashboard" className="block p-2 hover:bg-gray-800 rounded">Dashboard</Link></li>
          <li><Link to="/products" className="block p-2 hover:bg-gray-800 rounded">Products</Link></li>
          <li><Link to="/inventory" className="block p-2 hover:bg-gray-800 rounded">Inventory</Link></li>
          <li><Link to="/categories" className="block p-2 hover:bg-gray-800 rounded">Categories</Link></li>
          <li><Link to="/brands" className="block p-2 hover:bg-gray-800 rounded">Brands</Link></li>
          <li><Link to="/cms" className="block p-2 hover:bg-gray-800 rounded">Homepage CMS</Link></li>
          <li><Link to="/orders" className="block p-2 hover:bg-gray-800 rounded">Orders</Link></li>
          <li><Link to="/payments" className="block p-2 hover:bg-gray-800 rounded">Payments</Link></li>
          <li><Link to="/reports" className="block p-2 hover:bg-gray-800 rounded">Reports</Link></li>
          <li><Link to="/customers" className="block p-2 hover:bg-gray-800 rounded">Customers</Link></li>
          <li className="pt-4 text-xs uppercase text-gray-500 font-bold px-2">Marketing</li>
          <li><Link to="/marketing/coupons" className="block p-2 hover:bg-gray-800 rounded">Coupons</Link></li>
          <li><Link to="/marketing/reviews" className="block p-2 hover:bg-gray-800 rounded">Reviews</Link></li>
          <li><Link to="/marketing/newsletter" className="block p-2 hover:bg-gray-800 rounded">Newsletter</Link></li>
          <li><Link to="/marketing/notifications" className="block p-2 hover:bg-gray-800 rounded">Notifications</Link></li>
          <li><Link to="/marketing/loyalty" className="block p-2 hover:bg-gray-800 rounded">Loyalty</Link></li>
          <li className="pt-4 text-xs uppercase text-gray-500 font-bold px-2">Data</li>
          <li><Link to="/carts" className="block p-2 hover:bg-gray-800 rounded">Carts</Link></li>
          <li><Link to="/wishlists" className="block p-2 hover:bg-gray-800 rounded">Wishlists</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
