import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products?limit=50`, { credentials: 'omit' }); // Omit for public admin endpoint or include if auth is active
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to soft delete this product?')) {
      try {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', credentials: 'omit' });
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/products/add" className="bg-black text-white px-4 py-2 rounded">
          Add Product
        </Link>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
            <tr>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Loading...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No products found.</td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    {product.thumbnail?.url && (
                      <img src={product.thumbnail.url} alt="" className="w-10 h-10 object-cover rounded" />
                    )}
                    {product.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.status === 'published' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">₹{product.pricing?.basePrice}</td>
                  <td className="px-6 py-4">{product.inventory?.totalStock || 0}</td>
                  <td className="px-6 py-4">
                    <Link to={`/products/edit/${product._id}`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
