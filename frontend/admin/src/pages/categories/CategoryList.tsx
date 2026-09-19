import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await adminFetch(`${API_URL}/categories`);
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
      await adminFetch(`${API_URL}/categories/${id}/${endpoint}`, { method: 'PATCH' });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Build tree
  const parentCategories = categories.filter(c => !c.parentCategory);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parentCategory?._id === parentId || c.parentCategory === parentId);

  const renderRow = (category: any, level: number = 0) => (
    <tr key={category._id} className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900" style={{ paddingLeft: `${1.5 + level * 2}rem` }}>
        {level > 0 && <span className="text-gray-300 mr-2">↳</span>}
        {category.name}
      </td>
      <td className="px-6 py-4">{category.slug}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-xs ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {category.isActive ? 'ACTIVE' : 'DISABLED'}
        </span>
      </td>
      <td className="px-6 py-4">
        <Link to={`/categories/edit/${category._id}`} className="text-blue-600 hover:underline mr-3 font-medium">Edit</Link>
        <button onClick={() => handleToggleStatus(category._id, category.isActive)} className="text-orange-600 hover:underline font-medium">
          {category.isActive ? 'Disable' : 'Restore'}
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex gap-4">
          <Link to="/categories/add?type=sub" className="bg-white border-2 border-black text-black font-bold px-4 py-2 rounded hover:bg-gray-50">
            Add Subcategory
          </Link>
          <Link to="/categories/add" className="bg-black border-2 border-black text-white font-bold px-4 py-2 rounded hover:bg-gray-900">
            Add Category
          </Link>
        </div>
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
              parentCategories.map(parent => (
                <Fragment key={parent._id}>
                  {renderRow(parent, 0)}
                  {getSubcategories(parent._id).map(sub => renderRow(sub, 1))}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
