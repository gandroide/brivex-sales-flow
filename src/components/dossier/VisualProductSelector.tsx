'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  brand: string;
  collection_name?: string;
  finish?: string;
  type?: string;
}

interface VisualProductSelectorProps {
  onSelectProduct: (product: Product) => void;
}

// Helper to map finish names to hex colors
const getFinishColor = (finishName: string) => {
  const lower = finishName.toLowerCase();
  if (lower.includes('black') || lower.includes('negro') || lower.includes('dark')) return '#1a1a1a';
  if (lower.includes('white') || lower.includes('blanco')) return '#FFFFFF';
  if (lower.includes('gold') || lower.includes('oro') || lower.includes('dorado') || lower.includes('bronze')) return '#C9A84C';
  if (lower.includes('chrome') || lower.includes('cromo') || lower.includes('silver') || lower.includes('plata') || lower.includes('acero')) return '#E3E3E3';
  if (lower.includes('nickel') || lower.includes('niquel') || lower.includes('brushed')) return '#A9A9A9';
  if (lower.includes('red') || lower.includes('rojo')) return '#8B0000';
  if (lower.includes('brass') || lower.includes('laton')) return '#B5A642';
  return null; // No color mapping found
};

export default function VisualProductSelector({ onSelectProduct }: VisualProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeFinish, setActiveFinish] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Derived lists for filter options
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    // Fetch products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('name'); // Just limit for performance if many products
      
    if (productsData) {
       setProducts(productsData);
       
       // Extract unique filter values
       const uniqueBrands = Array.from(new Set(productsData.map(p => p.brand).filter(Boolean)));
       const uniqueTypes = Array.from(new Set(productsData.map(p => p.type).filter(Boolean)));
       const uniqueFinishes = Array.from(new Set(productsData.map(p => p.finish).filter(Boolean)));
       
       setBrands(uniqueBrands);
       setTypes(uniqueTypes);
       setFinishes(uniqueFinishes);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(product => {
     if (activeBrand && product.brand !== activeBrand) return false;
     if (activeType && product.type !== activeType) return false;
     if (activeFinish && product.finish !== activeFinish) return false;
     if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
           product.name.toLowerCase().includes(query) || 
           product.sku.toLowerCase().includes(query) ||
           (product.collection_name && product.collection_name.toLowerCase().includes(query))
        );
     }
     return true;
  });


  return (
    <div className="w-full">
      {/* --- FILTER BAR --- */}
      <div className="bg-white/5 border-b border-white/10 p-4 sticky top-0 z-30 backdrop-blur-md">
         
         <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            <div className="relative w-full md:w-64">
               <input 
                 type="text" 
                 placeholder="Search products..." 
                 className="w-full bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-luxury-gold"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
            </div>
            
            <div className="flex gap-2 text-xs text-white/50">
               <span>{filteredProducts.length} Products Found</span>
            </div>
         </div>

         {/* Filter Chips */}
         <div className="flex flex-wrap gap-6 items-start">
            
            {/* Brand Filter */}
            <div className="space-y-2">
               <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Brand</span>
               <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setActiveBrand(null)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${!activeBrand ? 'bg-luxury-gold text-black border-luxury-gold' : 'border-white/10 hover:border-white/30'}`}
                  >All</button>
                  {brands.map(brand => (
                    <button 
                      key={brand}
                      onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${activeBrand === brand ? 'bg-luxury-gold text-black border-luxury-gold' : 'border-white/10 hover:border-white/30'}`}
                    >
                       {brand}
                    </button>
                  ))}
               </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
               <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Type</span>
               <div className="flex flex-wrap gap-2">
                  {types.map(type => (
                    <button 
                      key={type}
                      onClick={() => setActiveType(activeType === type ? null : type)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${activeType === type ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/30'}`}
                    >
                       {type}
                    </button>
                  ))}
               </div>
            </div>


  
            {/* Finish Filter */}
            <div className="space-y-2">
               <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Finish</span>
               <div className="flex flex-wrap gap-2">
                  {finishes.map(finish => {
                    const color = getFinishColor(finish);
                    return (
                    <button 
                      key={finish}
                      onClick={() => setActiveFinish(activeFinish === finish ? null : finish)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all flex items-center gap-2 ${activeFinish === finish ? 'bg-white/20 border-white' : 'border-white/10 hover:border-white/30'}`}
                    >
                       {color && (
                         <span 
                           className="w-3 h-3 rounded-full border border-white/20" 
                           style={{ backgroundColor: color }}
                         />
                       )}
                       {finish}
                    </button>
                    );
                  })}
               </div>
            </div>

         </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      {loading ? (
         <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-luxury-gold" size={40} />
         </div>
      ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredProducts.map(product => (
               <div 
                 key={product.id}
                 onClick={() => onSelectProduct(product)}
                 className="group relative bg-white/5 rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-luxury-gold/20 transition-all hover:-translate-y-1 border border-white/5 hover:border-luxury-gold/50"
               >
                  <div className="aspect-[4/5] p-6 bg-white flex items-center justify-center relative">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                       src={product.image_url} 
                       alt={product.name}
                       className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                     />
                     
                     <div className="absolute top-3 left-3">
                        {product.brand && (
                           <span className="text-[10px] font-bold text-black/50 bg-black/5 px-2 py-1 rounded-full">{product.brand}</span>
                        )}
                     </div>
                  </div>

                  <div className="p-4">
                     <p className="text-xs text-luxury-gold mb-1">{product.sku}</p>
                     <h3 className="text-sm font-medium leading-tight mb-2 min-h-[2.5em]">{product.name}</h3>
                     
                     <div className="flex justify-between items-end">
                        <span className="text-lg font-bold">${product.price}</span>
                        {product.collection_name && (
                           <span className="text-[10px] text-white/30">{product.collection_name}</span>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
