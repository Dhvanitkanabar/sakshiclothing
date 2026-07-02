import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '64f1b2c3e4b0c1a2d3e4f5g6', // Placeholder ObjectId for Category until categories module is built
    pricing: { basePrice: 0 },
    inventory: { totalStock: 0 },
    status: 'draft',
    images: [] as { url: string; publicId: string }[]
  });

  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (isEdit) {
      // Fetch existing
      fetch(`${API_URL}/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setFormData(data.data);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...(prev as any)[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addImage = () => {
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: imageUrl, publicId: `img_${Date.now()}` }]
      }));
      if (!formData.thumbnail && prev.images.length === 0) {
        setFormData(p => ({ ...p, thumbnail: { url: imageUrl, publicId: `img_${Date.now()}` } }));
      }
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const url = isEdit ? `${API_URL}/products/${id}` : `${API_URL}/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/products');
      } else {
        alert('Error: ' + JSON.stringify(data.message));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Product Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm">Slug</label>
              <input name="slug" value={formData.slug} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-24" required />
          </div>
          <div>
            <label className="block text-sm">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Base Price (₹)</label>
              <input type="number" name="pricing.basePrice" value={formData.pricing.basePrice} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm">Stock</label>
              <input type="number" name="inventory.totalStock" value={formData.inventory.totalStock} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Images</h2>
          <div className="flex gap-2">
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL here" className="flex-1 border p-2 rounded" />
            <button type="button" onClick={addImage} className="bg-gray-200 px-4 py-2 rounded">Add</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {formData.images.map((img, i) => (
              <img key={i} src={img.url} alt="" className="w-24 h-24 object-cover border rounded" />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save Product</button>
        </div>
      </form>
    </div>
  );
}
