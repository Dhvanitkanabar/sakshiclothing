import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUpload from '../../components/ImageUpload';
import { Package, Layers, Image as ImageIcon, DollarSign, ArrowLeft, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
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
          if (!isEdit) {
            const firstTopLevel = data.data.find((c: any) => !c.parentCategory);
            if (firstTopLevel) {
              setFormData(prev => prev.category ? prev : ({ ...prev, category: firstTopLevel._id }));
            }
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
          if (data.success && data.data) {
            const raw = data.data;
            const parsedImages = (raw.images || []).map((img: any) => {
              if (typeof img === 'string') return { url: img, publicId: img };
              if (typeof img === 'object') return { url: img.url || img.secureUrl || '', publicId: img.publicId || img.url || '' };
              return null;
            }).filter(Boolean);

            if (parsedImages.length === 0 && raw.thumbnail) {
              const thumbUrl = typeof raw.thumbnail === 'string' ? raw.thumbnail : raw.thumbnail?.url;
              if (thumbUrl) parsedImages.push({ url: thumbUrl, publicId: raw.thumbnail?.publicId || thumbUrl });
            }

            setFormData(prev => ({
              ...prev,
              ...raw,
              category: raw.category?._id || raw.category || '',
              subCategory: raw.subCategory?._id || raw.subCategory || '',
              images: parsedImages
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
          // If changing category, check if current subcategory still belongs to it, else reset
          if (newData.subCategory) {
            const currentSub = categories.find(c => c._id === newData.subCategory);
            const parentId = currentSub?.parentCategory 
              ? (typeof currentSub.parentCategory === 'object' ? (currentSub.parentCategory._id || currentSub.parentCategory.id) : currentSub.parentCategory)
              : null;
            if (parentId && String(parentId) !== String(value)) {
              newData.subCategory = '';
            }
          }
        } else if (name === 'subCategory' && value) {
          // Auto-align parent category if a subcategory from another parent is picked
          const chosenSub = categories.find(c => c._id === value);
          if (chosenSub && chosenSub.parentCategory) {
            const parentId = typeof chosenSub.parentCategory === 'object' 
              ? (chosenSub.parentCategory._id || chosenSub.parentCategory.id) 
              : chosenSub.parentCategory;
            if (parentId) {
              newData.category = String(parentId);
            }
          }
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

    if (!formData.name || !formData.name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    if (!formData.category) {
      alert('Please select a Category before publishing.');
      return;
    }

    const url = isEdit ? `${API_URL}/products/${id}` : `${API_URL}/products`;
    const method = isEdit ? 'PUT' : 'POST';

    // Calculate basePrice from variants if basePrice is 0 or empty
    let basePrice = Number(formData.pricing.basePrice) || 0;
    if (basePrice <= 0 && formData.variants.length > 0) {
      basePrice = Number(formData.variants[0].price) || 0;
    }

    // STRICT VALIDATION: Total Stock must match the sum of variant stock!
    const hasVariants = formData.variants.length > 0;
    const variantStockSum = formData.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    const declaredStock = Number(formData.inventory.totalStock) || 0;

    if (hasVariants) {
      if (declaredStock !== variantStockSum) {
        alert(
          `⚠️ STOCK MISMATCH ERROR:\n\n` +
          `• Total Stock: ${declaredStock}\n` +
          `• Sum of Variant Stocks: ${variantStockSum}\n` +
          `• Difference: ${Math.abs(declaredStock - variantStockSum)}\n\n` +
          `The Total Stock must exactly equal the sum of all variant stocks before you can create or update this product.\n\n` +
          `Please update the Total Stock to ${variantStockSum} or adjust your variant stock quantities to match.`
        );
        return; // BLOCK PRODUCT CREATION!
      }
    }

    const totalStock = hasVariants ? variantStockSum : declaredStock;

    try {
      const cleanedVariants = formData.variants.map((v) => {
        const item: any = {
          size: v.size || 'Standard',
          price: Number(v.price) || basePrice || 0,
          stock: Number(v.stock) || 0,
        };
        if (v.sku && v.sku.trim()) {
          item.sku = v.sku.trim();
        }
        if (v.color && v.color.trim()) {
          item.color = v.color.trim();
        }
        return item;
      });

      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug ? formData.slug.trim().toLowerCase() : formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: formData.description.trim(),
        category: formData.category,
        subCategory: formData.subCategory && formData.subCategory.trim() ? formData.subCategory.trim() : undefined,
        status: formData.status || 'published',
        tags: formData.tags || [],
        pricing: {
          basePrice: basePrice,
          discountPrice: formData.pricing.discountPrice ? Number(formData.pricing.discountPrice) : undefined
        },
        inventory: {
          totalStock: totalStock,
          lowStockThreshold: 5
        },
        variants: cleanedVariants,
        images: formData.images.map((img, idx) => ({
          url: img.url,
          publicId: img.publicId || `img_${Date.now()}_${idx}`,
          isPrimary: idx === 0,
          displayOrder: idx
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
        let errorMsg = data.message || 'Failed to save product';
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMsg = data.errors.map((e: any) => `${e.field ? e.field + ': ' : ''}${e.message || e}`).join('\n');
        } else if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
          errorMsg = Object.values(data.errors).map((e: any) => e.message || e).join('\n');
        }
        alert('Product Error:\n\n' + errorMsg);
      }
    } catch (err: any) {
      console.error(err);
      alert('An unexpected error occurred while saving product: ' + (err.message || 'Check console.'));
    }
  };

  const hasVariants = formData.variants.length > 0;
  const variantStockSum = formData.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const currentTotalStock = Number(formData.inventory.totalStock) || 0;
  const isStockMatching = !hasVariants || variantStockSum === currentTotalStock;
  const stockDifference = Math.abs(currentTotalStock - variantStockSum);

  // Directly matched subcategories
  const directSubcategories = categories.filter(c => {
    if (!c.parentCategory) return false;
    const pId = typeof c.parentCategory === 'object' ? (c.parentCategory._id || c.parentCategory.id) : c.parentCategory;
    return pId && String(pId) === String(formData.category);
  });

  // Other available subcategories for smart auto-alignment
  const otherSubcategories = categories.filter(c => {
    if (!c.parentCategory) return false;
    const pId = typeof c.parentCategory === 'object' ? (c.parentCategory._id || c.parentCategory.id) : c.parentCategory;
    return pId && String(pId) !== String(formData.category);
  });

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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
                <a 
                  href="/categories/add?type=sub" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add Subcategory
                </a>
              </div>
              <select 
                name="subCategory" 
                value={formData.subCategory} 
                onChange={handleChange} 
                className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none bg-white"
              >
                <option value="">
                  {directSubcategories.length > 0 
                    ? `Select a Subcategory (${directSubcategories.length} available)` 
                    : 'Select a Subcategory (Optional)'}
                </option>
                {directSubcategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
                {otherSubcategories.length > 0 && (
                  <optgroup label="Other Available Subcategories (Auto-aligns Category)">
                    {otherSubcategories.map(c => {
                      const pName = typeof c.parentCategory === 'object' ? c.parentCategory.name : 'Other';
                      return (
                        <option key={c._id} value={c._id}>
                          {c.name} (under {pName})
                        </option>
                      );
                    })}
                  </optgroup>
                )}
              </select>
              {formData.category && directSubcategories.length === 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 mt-1.5 rounded-lg border border-amber-200">
                  Tip: No subcategories are linked directly under this category yet. You can pick from "Other Available Subcategories" or create a new one.
                </p>
              )}
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
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <DollarSign size={20} /> Pricing & Inventory
            </h2>
            {hasVariants && (
              <span className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                isStockMatching 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {isStockMatching ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                Variant Stock: {variantStockSum} / Total: {currentTotalStock}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (₹)</label>
              <input type="number" name="pricing.basePrice" value={formData.pricing.basePrice} onChange={handleChange} className="w-full border-gray-200 border p-3 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-700">Total Stock</label>
                {hasVariants && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, inventory: { ...prev.inventory, totalStock: variantStockSum } }))}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    title="Set Total Stock equal to the sum of variants"
                  >
                    <RefreshCw size={12} /> Auto-Sync ({variantStockSum})
                  </button>
                )}
              </div>
              <input 
                type="number" 
                name="inventory.totalStock" 
                value={formData.inventory.totalStock} 
                onChange={handleChange} 
                className={`w-full border p-3 rounded-lg focus:ring-2 transition-all outline-none ${
                  hasVariants && !isStockMatching 
                    ? 'border-red-400 bg-red-50/20 focus:ring-red-500 focus:border-red-500' 
                    : hasVariants && isStockMatching 
                      ? 'border-emerald-400 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500'
                      : 'border-gray-200 focus:ring-black focus:border-black'
                }`} 
                placeholder={hasVariants ? `Must equal variant sum (${variantStockSum})` : "Total stock quantity"} 
              />
              
              {/* Real-time Matching Indicator */}
              {hasVariants && (
                <div className="mt-2">
                  {isStockMatching ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                      <span>Stock Verified: Total Stock ({currentTotalStock}) equals variant sum ({variantStockSum})</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle size={14} className="shrink-0 text-red-600" />
                          <span>
                            Mismatch: Total is {currentTotalStock}, but Variants sum to {variantStockSum} (Diff: {stockDifference})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, inventory: { ...prev.inventory, totalStock: variantStockSum } }))}
                          className="ml-2 text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded font-medium transition-colors shrink-0"
                        >
                          Auto-Match ({variantStockSum})
                        </button>
                      </div>
                      <p className="text-[11px] text-red-600 font-medium">
                        ⚠️ Total stock and variant stock sum must match exactly before this product can be saved.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-4 gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers size={20} /> Variants
              </h2>
              {hasVariants && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1 ${
                  isStockMatching 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {isStockMatching ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  Variant Stock Total: {variantStockSum} / {currentTotalStock}
                </span>
              )}
            </div>
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

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200 sticky bottom-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-lg border z-30">
          <div>
            {hasVariants && !isStockMatching && (
              <span className="text-xs font-semibold text-red-600 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                <AlertTriangle size={14} className="shrink-0 text-red-600" />
                <span>Total Stock ({currentTotalStock}) and Variants ({variantStockSum}) must match to save.</span>
              </span>
            )}
            {hasVariants && isStockMatching && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                <span>Stock matching verified: {currentTotalStock} total units across {formData.variants.length} variants</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" onClick={() => navigate('/products')} className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-center">
              Cancel
            </button>
            <button 
              type="submit" 
              className={`w-full sm:w-auto px-8 py-2.5 font-bold rounded-lg shadow-md transition-colors text-center ${
                hasVariants && !isStockMatching 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isEdit ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
