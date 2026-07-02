import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_URL}/brands`, { credentials: 'omit' });
      const data = await res.json();
      if (data.success) {
        setBrands(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleToggleFeature = async (id: string) => {
    try {
      await fetch(`${API_URL}/brands/${id}/feature`, { method: 'PATCH', credentials: 'omit' });
      fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete brand permanently?')) {
      try {
        await fetch(`${API_URL}/brands/${id}`, { method: 'DELETE', credentials: 'omit' });
        fetchBrands();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Link to="/brands/add" className="bg-black text-white px-4 py-2 rounded">
          Add Brand
        </Link>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
            <tr>
              <th className="px-6 py-3">Brand Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Featured</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No brands found.</td></tr>
            ) : (
              brands.map((brand: any) => (
                <tr key={brand._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{brand.name}</td>
                  <td className="px-6 py-4">{brand.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${brand.isFeatured ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                      {brand.isFeatured ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/brands/edit/${brand._id}`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <button onClick={() => handleToggleFeature(brand._id)} className="text-indigo-600 hover:underline mr-3">
                      {brand.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => handleDelete(brand._id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
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
