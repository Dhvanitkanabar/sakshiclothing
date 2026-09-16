import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [searchParams] = useSearchParams();
  const initialParent = searchParams.get('parent') || '';
  const isSubcategoryMode = searchParams.get('type') === 'sub';

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategory: initialParent,
    isActive: true
  });
  
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/categories`, { credentials: 'include' }).then(res => res.json()).then(data => {
      if (data.success) {
        // Only allow top-level categories to be parents
        const parentCats = data.data.filter((c: any) => c._id !== id && !c.parentCategory);
        setCategories(parentCats);
        
        if (!isEdit && !formData.parentCategory && searchParams.get('type') === 'sub' && parentCats.length > 0) {
          setFormData(prev => ({ ...prev, parentCategory: parentCats[0]._id }));
        }
      }
    });

    if (isEdit) {
      fetch(`${API_URL}/categories/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setFormData({
              name: data.data.name,
              slug: data.data.slug,
              description: data.data.description || '',
              parentCategory: data.data.parentCategory?._id || '',
              isActive: data.data.isActive
            });
          }
        });
    }
  }, [id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-generate slug when name or parentCategory changes, if creating new
      if ((name === 'name' || name === 'parentCategory') && !isEdit) {
        const currentName = name === 'name' ? value : updated.name;
        
        if (currentName) {
          let baseSlug = currentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          
          // If it's a subcategory, prefix with parent's slug for uniqueness
          if (updated.parentCategory) {
            const parent = categories.find((c: any) => c._id === updated.parentCategory);
            if (parent && parent.slug) {
              baseSlug = `${parent.slug}-${baseSlug}`;
            }
          }
          updated.slug = baseSlug;
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const url = isEdit ? `${API_URL}/categories/${id}` : `${API_URL}/categories`;
    const method = isEdit ? 'PUT' : 'POST';
    
    const payload: any = { ...formData };
    payload.parent = payload.parentCategory ? payload.parentCategory : null;
    delete payload.parentCategory;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/categories');
      } else {
        alert('Error: ' + JSON.stringify(data.message));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isSub = isSubcategoryMode || Boolean(formData.parentCategory);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? (isSub ? 'Edit Subcategory' : 'Edit Category') : (isSubcategoryMode ? 'Add Subcategory' : 'Add Category')}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm">{isSub ? 'Subcategory Name' : 'Category Name'}</label>
          <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm">Slug</label>
          <input name="slug" value={formData.slug} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Parent Category</label>
          <select name="parentCategory" value={formData.parentCategory} onChange={handleChange} className="w-full border p-2 rounded" required={searchParams.get('type') === 'sub'}>
            {searchParams.get('type') !== 'sub' && <option value="">None (Top Level)</option>}
            {categories.map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-24" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" />
          <label htmlFor="isActive" className="text-sm">Active</label>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate('/categories')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save {isSub ? 'Subcategory' : 'Category'}</button>
        </div>
      </form>
    </div>
  );
}
