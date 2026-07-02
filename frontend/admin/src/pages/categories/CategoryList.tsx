import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, { credentials: 'omit' }); // adjust credentials if needed
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const endpoint = currentStatus ? 'status' : 'restore';
      await fetch(`${API_URL}/categories/${id}/${endpoint}`, { method: 'PATCH', credentials: 'omit' });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link to="/categories/add" className="bg-black text-white px-4 py-2 rounded">
          Add Category
        </Link>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
            <tr>
              <th className="px-6 py-3">Category Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No categories found.</td></tr>
            ) : (
              categories.map((category: any) => (
                <tr key={category._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {category.isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/categories/edit/${category._id}`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <button onClick={() => handleToggleStatus(category._id, category.isActive)} className="text-orange-600 hover:underline">
                      {category.isActive ? 'Disable' : 'Restore'}
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
