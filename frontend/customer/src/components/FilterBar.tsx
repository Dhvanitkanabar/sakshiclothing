import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, SlidersHorizontal, X, Check } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  highLevelFilter: string;
  setHighLevelFilter: (filter: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  highLevelFilter,
  setHighLevelFilter,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const highLevelFilters = [
    { id: 'all', label: 'All Pieces' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'trending', label: 'Trending' },
    { id: 'sale', label: 'Private Sale' },
    { id: 'bestsellers', label: 'Best Sellers' },
  ];

  const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'low-high', label: 'Price: Low to High' },
    { id: 'high-low', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest First' },
  ];

  return (
    <div className="space-y-12 mb-16">
      {/* High Level Filters */}
      <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide border-b border-gray-100">
        {highLevelFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setHighLevelFilter(filter.id)}
            className={`relative py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all whitespace-nowrap ${
              highLevelFilter === filter.id
                ? 'text-luxury-black'
                : 'text-gray-400 hover:text-luxury-black'
            }`}
          >
            {filter.label}
            {highLevelFilter === filter.id && (
              <motion.div
                layoutId="activeFilter"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Horizontal Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-8 py-8 border-b border-gray-100">
        <div className="flex items-center gap-12">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-black group"
            >
              <span className="text-gray-400">Category</span>
              <span className="group-hover:text-rose-600 transition-colors">{selectedCategory}</span>
              <ChevronDown size={14} className={`transition-transform duration-500 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'category' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-6 w-56 bg-white shadow-2xl rounded-2xl border border-gray-100 py-6 z-30"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-luxury-black hover:bg-gray-50 flex justify-between items-center transition-all"
                    >
                      {cat}
                      {selectedCategory === cat && <Check size={14} className="text-rose-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-black group"
            >
              <span className="text-gray-400">Price</span>
              <span className="group-hover:text-rose-600 transition-colors">Up to ₹{priceRange[1]}</span>
              <ChevronDown size={14} className={`transition-transform duration-500 ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'price' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-6 w-72 bg-white shadow-2xl rounded-2xl border border-gray-100 p-8 z-30"
                >
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Price Ceiling</h4>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-600 mb-6"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-luxury-black">
                    <span>₹0</span>
                    <span className="text-rose-600">₹{priceRange[1]}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-12">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-black group"
            >
              <span className="text-gray-400">Sort</span>
              <span className="group-hover:text-rose-600 transition-colors">{sortOptions.find(o => o.id === sortBy)?.label}</span>
              <ChevronDown size={14} className={`transition-transform duration-500 ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'sort' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-6 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 py-6 z-30"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-luxury-black hover:bg-gray-50 flex justify-between items-center transition-all"
                    >
                      {option.label}
                      {sortBy === option.id && <Check size={14} className="text-rose-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-black hover:text-rose-600 transition-colors">
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory !== 'All' || priceRange[1] < 10000 || highLevelFilter !== 'all') && (
        <div className="flex flex-wrap gap-4 pt-4">
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-3 px-5 py-2 bg-gray-50 text-luxury-black rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100">
              {selectedCategory} <X size={12} className="cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setSelectedCategory('All')} />
            </span>
          )}
          {priceRange[1] < 10000 && (
            <span className="inline-flex items-center gap-3 px-5 py-2 bg-gray-50 text-luxury-black rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100">
              Under ₹{priceRange[1]} <X size={12} className="cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setPriceRange([0, 10000])} />
            </span>
          )}
          {highLevelFilter !== 'all' && (
            <span className="inline-flex items-center gap-3 px-5 py-2 bg-gray-50 text-luxury-black rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100">
              {highLevelFilters.find(f => f.id === highLevelFilter)?.label} <X size={12} className="cursor-pointer hover:text-rose-600 transition-colors" onClick={() => setHighLevelFilter('all')} />
            </span>
          )}
          <button 
            onClick={() => {
              setSelectedCategory('All');
              setPriceRange([0, 10000]);
              setHighLevelFilter('all');
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-rose-600 transition-colors ml-4"
          >
            Reset All
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
