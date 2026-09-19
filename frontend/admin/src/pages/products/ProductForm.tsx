import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUpload from '../../components/ImageUpload';
import { Package, Layers, Image as ImageIcon, DollarSign, ArrowLeft } from 'lucide-react';
import { adminFetch } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '', // Will default to first category if available
    subCategory: '',
    tags: [] as string[],
    pricing: { basePrice: 0, discountPrice: '' as number | string },
    inventory: { totalStock: 0 },
    variants: [] as any[],
    status: 'published',
    images: [] as { url: string; publicId: string }[]
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Fetch categories
    adminFetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
          if (!isEdit && data.data.length > 0) {
            setFormData(prev => ({ ...prev, category: data.data[0]._id }));
          }
        }
      });
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      // Fetch existing
      adminFetch(`${API_URL}/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setFormData(prev => ({
              ...prev,
              ...data.data,
              category: data.data.category?._id || data.data.category || '',
              subCategory: data.data.subCategory?._id || data.data.subCategory || '',
            }));
          }
        });
    }
  }, [id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...(prev as any)[parent], [child]: value } }));
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (name === 'category') {
          newData.subCategory = ''; // Reset subCategory if category changes
        }
        return newData;
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleVariantChange = (index: number, e: any) => {
    const { name, value } = e.target;
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [name]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', price: 0, stock: 0, sku: '', status: 'published' }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const url = isEdit ? `${API_URL}/products/${id}` : `${API_URL}/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const payload = {
        ...formData,
        pricing: {
          ...formData.pricing,
          basePrice: Number(formData.pricing.basePrice),
          discountPrice: formData.pricing.discountPrice ? Number(formData.pricing.discountPrice) : undefined
        },
        inventory: {
          ...formData.inventory,
          totalStock: Number(formData.inventory.totalStock)
        },
        variants: formData.variants.map(v => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock),
        }))
      };

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/products');
      } else {
        let errorMsg = data.message;
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            errorMsg = data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
          } else if (typeof data.errors === 'object') {
            errorMsg = Object.values(data.errors).map((e: any) => e.message).join('\n');
          }
        }
        alert('Error:\n' + errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred. Please check the console.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? 'Update product details and variations.' : 'Create a new product in the catalog.'}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 pb-4">
            <Package size={20} /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
              <input name="slug" value={formData.slug} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none bg-gray-50" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none bg-white" required>
                <option value="" disabled>Select a Category</option>
                {categories.filter(c => !c.parentCategory).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subcategory</label>
              <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none bg-white">
                <option value="">Select a Subcategory (Optional)</option>
                {categories.filter(c => 
                  c.parentCategory && 
                  (c.parentCategory._id === formData.category || c.parentCategory === formData.category)
                ).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none min-h-[120px]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subcategories / Tags</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)} 
                className="flex-grow border p-2 rounded" 
                placeholder="e.g. Dresses, Ethnic" 
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <button type="button" onClick={addTag} className="bg-gray-200 px-4 py-2 rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {tag} <button type="button" onClick={() => removeTag(tag)} className="text-red-500 font-bold">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 pb-4">
            <DollarSign size={20} /> Pricing & Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (₹)</label>
              <input type="number" name="pricing.basePrice" value={formData.pricing.basePrice} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Stock</label>
              <input type="number" name="inventory.totalStock" value={formData.inventory.totalStock} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none" placeholder="Calculated from variants if used" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers size={20} /> Variants
            </h2>
            <button type="button" onClick={addVariant} className="bg-black hover:bg-gray-800 transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              + Add Variant
            </button>
          </div>
          
          {formData.variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded bg-gray-50 md:items-end">
              <div>
                <label className="block text-xs">Size / Value</label>
                <input name="size" value={variant.size} onChange={(e) => handleVariantChange(index, e)} className="w-full border p-1 rounded" placeholder="e.g. S, Free Size" required />
              </div>
              <div>
                <label className="block text-xs">SKU</label>
                <input name="sku" value={variant.sku || ''} onChange={(e) => handleVariantChange(index, e)} className="w-full border p-1 rounded" />
              </div>
              <div>
                <label className="block text-xs">Price</label>
                <input type="number" name="price" value={variant.price} onChange={(e) => handleVariantChange(index, e)} className="w-full border p-1 rounded" required />
              </div>
              <div>
                <label className="block text-xs">Stock</label>
                <input type="number" name="stock" value={variant.stock} onChange={(e) => handleVariantChange(index, e)} className="w-full border p-1 rounded" required />
              </div>
              <div>
                <button type="button" onClick={() => removeVariant(index)} className="w-full bg-red-100 text-red-600 px-2 py-1 rounded">Remove</button>
              </div>
            </div>
          ))}
          {formData.variants.length === 0 && (
            <p className="text-sm text-gray-500 italic">No variants added. Base price and stock will be used.</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 pb-4">
            <ImageIcon size={20} /> Product Images
          </h2>
          <ImageUpload
            folder="products"
            maxFiles={8}
            existingImages={formData.images.map(img => ({
              publicId: img.publicId,
              secureUrl: img.url,
              thumbnailUrl: img.url // fallback for older records without thumbnail
            }))}
            primaryImageId={formData.images[0]?.publicId}
            onUploadSuccess={(urls) => {
              setFormData(prev => ({
                ...prev,
                images: [
                  ...prev.images,
                  ...urls.map(u => ({ url: u.secureUrl, publicId: u.publicId }))
                ]
              }));
            }}
            onImageDelete={(publicId) => {
              setFormData(prev => ({
                ...prev,
                images: prev.images.filter(img => img.publicId !== publicId)
              }));
              // Optionally trigger backend delete here
            }}
            onSetPrimary={(publicId) => {
              setFormData(prev => {
                const newImages = [...prev.images];
                const primaryIndex = newImages.findIndex(img => img.publicId === publicId);
                if (primaryIndex > -1) {
                  const [primaryImg] = newImages.splice(primaryIndex, 1);
                  newImages.unshift(primaryImg);
                }
                return { ...prev, images: newImages };
              });
            }}
          />
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 sticky bottom-4 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-lg border">
          <button type="button" onClick={() => navigate('/products')} className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-8 py-2.5 bg-black text-white font-bold rounded-lg shadow-md hover:bg-gray-800 transition-colors">
            {isEdit ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
