import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Database, Trash2, Save, ArrowLeft, Sparkles, Image as ImageIcon, Tag, IndianRupee } from 'lucide-react';
import { motion } from 'motion/react';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    category: 'Women',
    subCategory: 'Ethnic',
    sizes: 'S, M, L, XL',
    image: '',
    description: '',
    featured: true,
  });

  if (authLoading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...productData,
        price: Number(productData.price),
        sizes: productData.sizes.split(',').map(s => s.trim()),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'products'), data);
      toast.success('Product added successfully!');
      setProductData({
        name: '',
        price: 0,
        category: 'Women',
        subCategory: 'Topwear',
        sizes: 'S,M,L,XL',
        image: '',
        description: '',
        featured: false,
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setLoading(true);
    const products = [
      {
        name: "Floral Summer Dress",
        price: 2499,
        category: "Women",
        subCategory: "Dresses",
        sizes: ["S", "M", "L"],
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop",
        description: "A beautiful floral dress perfect for summer outings. Light, breathable, and stylish.",
        featured: true
      },
      {
        name: "Classic Denim Jacket",
        price: 3999,
        category: "Men",
        subCategory: "Outerwear",
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=1000&auto=format&fit=crop",
        description: "Timeless denim jacket that goes with everything. Durable and comfortable.",
        featured: true
      },
      {
        name: "Kids Cotton T-Shirt",
        price: 899,
        category: "Kids",
        subCategory: "Topwear",
        sizes: ["2Y", "4Y", "6Y"],
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000&auto=format&fit=crop",
        description: "Soft cotton t-shirt for kids. Gentle on skin and easy to wash.",
        featured: true
      },
      {
        name: "Silk Evening Gown",
        price: 8999,
        category: "Women",
        subCategory: "Dresses",
        sizes: ["S", "M"],
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop",
        description: "Elegant silk gown for special occasions. Luxurious feel and stunning drape.",
        featured: false
      },
      {
        name: "Slim Fit Chinos",
        price: 1999,
        category: "Men",
        subCategory: "Bottomwear",
        sizes: ["30", "32", "34"],
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000&auto=format&fit=crop",
        description: "Versatile chinos for a smart-casual look. Available in multiple colors.",
        featured: false
      }
    ];

    try {
      for (const p of products) {
        await addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() });
      }
      toast.success('Seeded 5 products successfully!');
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-accent mb-2">
              <Sparkles size={20} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Management Console</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tighter text-luxury-black">
              Admin <span className="italic text-gray-300">Panel</span>
            </h1>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={seedData}
            disabled={loading}
            className="flex items-center gap-3 bg-white border border-gray-100 text-luxury-black px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-luxury-black hover:text-white transition-all disabled:opacity-50 shadow-sm"
          >
            <Database size={16} /> Seed Sample Data
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-gray-100 border border-gray-50"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-medium text-luxury-black">Add New Product</h2>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Inventory Management</p>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Product Name</label>
                  <input
                    required
                    type="text"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-accent focus:bg-white transition-all font-medium text-luxury-black"
                    placeholder="e.g. Handcrafted Silk Saree"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Price (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      required
                      type="number"
                      value={productData.price || ''}
                      onChange={(e) => setProductData({ ...productData, price: Number(e.target.value) || 0 })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-accent focus:bg-white transition-all font-medium text-luxury-black"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Category</label>
                  <select
                    value={productData.category}
                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-accent focus:bg-white transition-all font-medium text-luxury-black appearance-none"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Subcategory</label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      required
                      type="text"
                      value={productData.subCategory}
                      onChange={(e) => setProductData({ ...productData, subCategory: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-accent focus:bg-white transition-all font-medium text-luxury-black"
                      placeholder="e.g. Ethnic Wear"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Sizes (comma separated)</label>
                  <input
                    required
                    type="text"
                    value={productData.sizes}
                    onChange={(e) => setProductData({ ...productData, sizes: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-accent focus:bg-white transition-all font-medium text-luxury-black"
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      required
                      type="url"
                      value={productData.image}
                      onChange={(e) => setProductData({ ...productData, image: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-accent focus:bg-white transition-all font-medium text-luxury-black"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-accent focus:bg-white transition-all font-medium text-luxury-black h-32 resize-none"
                    placeholder="Describe the craftsmanship and details..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="relative flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={productData.featured}
                        onChange={(e) => setProductData({ ...productData, featured: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${productData.featured ? 'bg-accent' : 'bg-gray-200'}`} />
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${productData.featured ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-bold text-luxury-black uppercase tracking-widest">Mark as New Arrival</span>
                  </label>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                type="submit"
                className="w-full bg-luxury-black text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-accent transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/10 disabled:opacity-50 mt-4"
              >
                <Save size={18} /> {loading ? 'Processing...' : 'Publish Product'}
              </motion.button>
            </form>
          </motion.div>

          {/* Preview Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">Live Preview</h3>
              
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 mb-6 relative group">
                {productData.image ? (
                  <img src={productData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                    <ImageIcon size={64} strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Image Preview</p>
                  </div>
                )}
                {productData.featured && (
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                    <span className="text-[8px] font-black uppercase tracking-widest text-luxury-black">New Arrival</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1">{productData.category} • {productData.subCategory}</p>
                    <h4 className="text-2xl font-serif font-medium text-luxury-black">{productData.name || 'Product Name'}</h4>
                  </div>
                  <p className="text-xl font-sans font-semibold text-luxury-black">₹{productData.price || '0'}</p>
                </div>
                <p className="text-sm text-gray-400 font-light line-clamp-3 leading-relaxed">
                  {productData.description || 'No description provided yet. Craft a compelling story for this piece.'}
                </p>
                <div className="flex gap-2 pt-2">
                  {productData.sizes.split(',').map((size, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                      {size.trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-accent/5 rounded-[2.5rem] p-10 border border-accent/10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-4">Quick Tips</h3>
              <ul className="space-y-4">
                {[
                  'Use high-resolution Unsplash images (1920x2560 recommended)',
                  'Keep product names concise and elegant',
                  'Detailed descriptions improve SEO and conversion',
                  'Featured products appear on the homepage "New Arrivals"'
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs text-luxury-black/70 font-medium leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
