import { useState, useEffect } from 'react';
import { Package, ArrowDown, ChevronRight, ChevronDown, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminFetch } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function InventoryDashboard() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedSubCats, setExpandedSubCats] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      adminFetch(`${API_URL}/categories`).then(res => res.json()),
      adminFetch(`${API_URL}/products?limit=1000`).then(res => res.json())
    ]).then(([catData, prodData]) => {
      if (catData.success) {
        setCategories(catData.data || []);
      }
      if (prodData.success) {
        const prodList = Array.isArray(prodData.data) ? prodData.data : (prodData.data?.data || []);
        setProducts(prodList);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.location.href = `${API_URL}/dashboard/export/inventory`;
  };

  const toggleCategory = (id: string) => {
    const newSet = new Set(expandedCats);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCats(newSet);
  };

  const toggleSubCategory = (id: string) => {
    const newSet = new Set(expandedSubCats);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSubCats(newSet);
  };

  // Build Hierarchy Data
  const parentCats = categories.filter(c => !c.parentCategory);
  
  const getSubcats = (parentId: string) => 
    categories.filter(c => c.parentCategory?._id === parentId || c.parentCategory === parentId);

  const getProductsForCategory = (parent: any, sub?: any) => {
    return products.filter(p => {
      const pCatId = p.category?._id || p.category;
      const pCatName = (p.category?.name || (typeof p.category === 'string' ? p.category : '')).toLowerCase();
      const pSubCatId = p.subCategory?._id || p.subCategory;
      const pSubCatName = (p.subCategory?.name || (typeof p.subCategory === 'string' ? p.subCategory : '')).toLowerCase();
      
      const parentId = parent._id || parent;
      const parentName = (parent.name || '').toLowerCase();
      const parentSlug = (parent.slug || '').toLowerCase();

      if (sub) {
        const subId = sub._id || sub;
        const subName = (sub.name || '').toLowerCase();
        const subSlug = (sub.slug || '').toLowerCase();

        return (
          (pSubCatId && pSubCatId === subId) ||
          (pSubCatName && (pSubCatName === subName || pSubCatName === subSlug)) ||
          (pCatId === subId) ||
          (pCatName === subName || pCatName === subSlug)
        );
      }

      return (
        (pCatId === parentId || pCatName === parentName || pCatName === parentSlug) &&
        !pSubCatId
      );
    }).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const getAllProductsForParent = (parent: any) => {
    const parentId = parent._id || parent;
    const parentName = (parent.name || '').toLowerCase();
    const parentSlug = (parent.slug || '').toLowerCase();
    const subIds = getSubcats(parentId).map(s => s._id);
    const subNames = getSubcats(parentId).map(s => (s.name || '').toLowerCase());

    return products.filter(p => {
      const pCatId = p.category?._id || p.category;
      const pCatName = (p.category?.name || (typeof p.category === 'string' ? p.category : '')).toLowerCase();
      const pSubCatId = p.subCategory?._id || p.subCategory;
      const pSubCatName = (p.subCategory?.name || (typeof p.subCategory === 'string' ? p.subCategory : '')).toLowerCase();

      return (
        pCatId === parentId ||
        pCatName === parentName ||
        pCatName === parentSlug ||
        subIds.includes(pSubCatId) ||
        subNames.includes(pSubCatName) ||
        subIds.includes(pCatId) ||
        subNames.includes(pCatName)
      );
    });
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-gray-900">
            <Package className="text-amber-500" size={24} /> Inventory & Stock Synchronization
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time stock tracking by parent categories, subcollections, and product variants.
          </p>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500/20 w-full sm:w-64 bg-gray-50/50"
          />
          <button onClick={handleExport} className="px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm shrink-0">
            <ArrowDown size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-2" />
            Synchronizing inventory data...
          </div>
        ) : parentCats.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No categories found.</p>
        ) : (
          <div className="space-y-4">
            {parentCats.map(parent => {
              const subcats = getSubcats(parent._id);
              const parentDirectProducts = getProductsForCategory(parent);
              const allParentProds = getAllProductsForParent(parent);
              const totalStockUnits = allParentProds.reduce((sum, p) => sum + (p.inventory?.totalStock || (p.variants?.reduce((s: number, v: any) => s + (v.stock || 0), 0)) || 10), 0);
              const isCatExpanded = expandedCats.has(parent._id) || searchTerm !== '';

              return (
                <div key={parent._id} className="border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
                  <div 
                    className="bg-gray-50 px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/80 transition-colors"
                    onClick={() => toggleCategory(parent._id)}
                  >
                    <div className="flex items-center gap-3 font-bold text-gray-900 text-sm">
                      {isCatExpanded ? <ChevronDown size={18} className="text-amber-600" /> : <ChevronRight size={18} className="text-gray-400" />}
                      <span className="font-serif text-base">{parent.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200/60">
                        {allParentProds.length} products
                      </span>
                      <span className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                        📦 {totalStockUnits} units in stock
                      </span>
                    </div>
                  </div>

                  {isCatExpanded && (
                    <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                      {subcats.length === 0 && parentDirectProducts.length === 0 && (
                        <p className="text-xs text-gray-400 pl-6 py-4">No subcategories or products assigned to {parent.name}.</p>
                      )}
                      
                      {subcats.map(sub => {
                        const subProducts = getProductsForCategory(parent, sub);
                        const isSubExpanded = expandedSubCats.has(sub._id) || searchTerm !== '';
                        
                        return (
                          <div key={sub._id} className="ml-4 md:ml-6 border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                            <div 
                              className="bg-gray-50/60 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/60 transition-colors"
                              onClick={() => toggleSubCategory(sub._id)}
                            >
                              <div className="flex items-center gap-2 font-semibold text-gray-800 text-xs uppercase tracking-wider">
                                {isSubExpanded ? <ChevronDown size={14} className="text-black" /> : <ChevronRight size={14} className="text-gray-400" />}
                                {sub.name}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-gray-200">
                                  {subProducts.length} products
                                </span>
                              </div>
                            </div>
                            
                            {isSubExpanded && (
                              <div className="bg-white border-t border-gray-100 p-3">
                                {subProducts.length === 0 ? (
                                  <p className="text-xs text-gray-400 pl-4 py-3">No products in this subcategory.</p>
                                ) : (
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <th className="py-2 px-3">Product Name</th>
                                        <th className="py-2 px-3">Price</th>
                                        <th className="py-2 px-3">Stock Units</th>
                                        <th className="py-2 px-3 text-right">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {subProducts.map(p => (
                                        <tr key={p._id} className="hover:bg-amber-50/20 transition-colors">
                                          <td className="py-3 px-3 font-bold text-gray-900">
                                            <Link to={`/products/edit/${p._id}`} className="hover:underline hover:text-amber-700 flex items-center gap-2">
                                              {p.thumbnail?.url && <img src={p.thumbnail.url} alt="" className="w-6 h-6 rounded object-cover border" />}
                                              {p.name}
                                            </Link>
                                          </td>
                                          <td className="py-3 px-3 font-serif font-bold text-gray-800">
                                            ₹{(p.pricing?.basePrice || p.price || 0).toLocaleString()}
                                          </td>
                                          <td className="py-3 px-3 font-bold text-gray-600">
                                            <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                              <Box size={12} /> {p.inventory?.totalStock || (p.variants?.reduce((s: number, v: any) => s + (v.stock || 0), 0)) || 10} units
                                            </span>
                                          </td>
                                          <td className="py-3 px-3 text-right">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${p.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                              {p.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Products directly under Parent Category */}
                      {parentDirectProducts.length > 0 && (
                        <div className="ml-4 md:ml-6 pt-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2">Products directly in {parent.name}</h4>
                          <table className="w-full text-left text-xs bg-gray-50/40 rounded-xl overflow-hidden border border-gray-100">
                            <thead>
                              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="py-2 px-3">Product Name</th>
                                <th className="py-2 px-3">Price</th>
                                <th className="py-2 px-3">Stock Units</th>
                                <th className="py-2 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {parentDirectProducts.map(p => (
                                <tr key={p._id} className="hover:bg-amber-50/20 transition-colors">
                                  <td className="py-3 px-3 font-bold text-gray-900">
                                    <Link to={`/products/edit/${p._id}`} className="hover:underline hover:text-amber-700 flex items-center gap-2">
                                      {p.thumbnail?.url && <img src={p.thumbnail.url} alt="" className="w-6 h-6 rounded object-cover border" />}
                                      {p.name}
                                    </Link>
                                  </td>
                                  <td className="py-3 px-3 font-serif font-bold text-gray-800">
                                    ₹{(p.pricing?.basePrice || p.price || 0).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-3 font-bold text-gray-600">
                                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                      <Box size={12} /> {p.inventory?.totalStock || (p.variants?.reduce((s: number, v: any) => s + (v.stock || 0), 0)) || 10} units
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${p.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                      {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
