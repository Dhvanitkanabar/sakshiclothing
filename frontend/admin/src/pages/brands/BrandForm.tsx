import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function BrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    isActive: true,
    isFeatured: false
  });

  useEffect(() => {
    if (isEdit) {
      fetch(`${API_URL}/brands/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setFormData({
              name: data.data.name,
              slug: data.data.slug,
              description: data.data.description || '',
              website: data.data.website || '',
              isActive: data.data.isActive,
              isFeatured: data.data.isFeatured
            });
          }
        });
    }
  }, [id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const url = isEdit ? `${API_URL}/brands/${id}` : `${API_URL}/brands`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/brands');
      } else {
        alert('Error: ' + JSON.stringify(data.message));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Brand' : 'Add Brand'}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm">Brand Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm">Slug</label>
          <input name="slug" value={formData.slug} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-24" />
        </div>
        <div>
          <label className="block text-sm">Website URL</label>
          <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div className="flex gap-6 pt-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} id="isFeatured" />
            <label htmlFor="isFeatured" className="text-sm">Featured</label>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate('/brands')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save Brand</button>
        </div>
      </form>
    </div>
  );
}
