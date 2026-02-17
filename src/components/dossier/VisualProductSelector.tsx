'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import FilterDrawer from './FilterDrawer';
import ActiveFilters from './ActiveFilters';
import ProductImageFallback from '../ui/ProductImageFallback';

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
  features?: string[];
  tech_drawing_url?: string;
}

interface VisualProductSelectorProps {
  onSelectProduct: (product: Product) => void;
}

// Helper to map finish names to hex colors


const PAGE_SIZE = 50;

export default function VisualProductSelector({ onSelectProduct }: VisualProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Filters
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeFinish, setActiveFinish] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Derived lists for filter options (fetched independently)
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);
  
  // --- INITIAL DATA LOAD (Filter Options) ---
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
        // STRATEGY 1: Try Supabase RPC functions (Most Efficient)
        // This requires the 'get_product_filters' function to be created in the DB.
        const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_product_filters');

        if (!rpcError && rpcData) {
            // Check if returned as string (sometimes RPC returns stringified JSON) or object
            const filters = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;
            
            if (filters.brands) setBrands(filters.brands.sort());
            if (filters.types) setTypes(filters.types.sort());
            if (filters.finishes) setFinishes(filters.finishes.sort());
            return;
        }

        // if RPC fails/doesn't exist, fall through to Strategy 2
        console.warn('RPC fetch failed, falling back to paginated client-side fetch:', rpcError?.message);
        throw new Error('RPC_FAILED');

    } catch (err) {
        console.error("RPC fetch error:", err);
        // STRATEGY 2: Robust Client-Side Pagination (Fallback)
        // We must fetch ALL rows to ensure we get every distinct value.
        // We use a dedicated recursive fetcher to bypass valid 1000 row limits.
        
        const fetchAllUnique = async (column: 'brand' | 'type' | 'finish') => {
            const allValues = new Set<string>();
            let from = 0;
            const size = 1000;
            let fetching = true;

            while (fetching) {
                const { data, error } = await supabase
                    .from('products')
                    .select(column)
                    .not(column, 'is', null)
                    .range(from, from + size - 1);
                
                if (error) {
                    console.error(`Error fetching ${column}:`, error);
                    break;
                }

                if (data) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.forEach((item: any) => {
                        if (item[column]) allValues.add(item[column]);
                    });

                    if (data.length < size) fetching = false;
                    else from += size;
                } else {
                    fetching = false;
                }
            }
            return Array.from(allValues).sort();
        };

        // Run fetches in parallel
        const [uniqueBrands, uniqueTypes, uniqueFinishes] = await Promise.all([
            fetchAllUnique('brand'),
            fetchAllUnique('type'),
            fetchAllUnique('finish')
        ]);

        setBrands(uniqueBrands);
        setTypes(uniqueTypes);
        setFinishes(uniqueFinishes);
    }
  };


  // --- PRODUCT FETCHING LOGIC ---
  
  // Reset products when filters change
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    fetchProducts(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrand, activeType, activeFinish, searchQuery]);

  const fetchProducts = async (pageToFetch: number, isReset: boolean = false) => {
    if (isReset) setLoading(true);
    else setLoadingMore(true);

    try {
        let query = supabase
            .from('products')
            .select('*')
            .order('name');

        // Apply Server-Side Filters
        if (activeBrand) query = query.eq('brand', activeBrand);
        if (activeType) query = query.eq('type', activeType);
        if (activeFinish) query = query.eq('finish', activeFinish);
        
        if (searchQuery) {
            // Using ilike for case-insensitive search
            // Search across multiple columns is tricky with simple OR syntax in chaining,
            // we use .or() with the filter syntax
            const term = `%${searchQuery}%`;
            query = query.or(`name.ilike.${term},sku.ilike.${term},collection_name.ilike.${term}`);
        }

        // Apply Pagination
        const from = pageToFetch * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
            if (data.length < PAGE_SIZE) {
                setHasMore(false);
            }
            
            if (isReset) {
                setProducts(data);
            } else {
                setProducts(prev => [...prev, ...data]);
            }
        }
    } catch (err) {
        console.error('Error fetching products:', err);
    } finally {
        setLoading(false);
        setLoadingMore(false);
    }
  };

  // --- INFINITE SCROLL HANDLER ---
  useEffect(() => {
    const handleScroll = () => {
        if (loading || loadingMore || !hasMore) return;
        
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        // Trigger fetch when scrolled 80% down
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            setPage(prev => {
                const nextPage = prev + 1;
                fetchProducts(nextPage, false);
                return nextPage;
            });
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingMore, hasMore]); // Dependencies are crucial here


  const activeFilterCount = [activeBrand, activeType, activeFinish].filter(Boolean).length;


  return (
    <div className="w-full">
      
      {/* --- NEW HEADER BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-96 group">
               <input 
                 type="text" 
                 placeholder="Buscar por SKU, Nombre o Colección..." 
                 className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-luxury-gold text-white/90 placeholder:text-white/30 transition-all shadow-sm group-hover:border-white/20"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 // Debounce could be added here for typing performance, but React state is fine for now
               />
               <Search className="absolute left-4 top-3.5 text-white/30 group-hover:text-luxury-gold transition-colors" size={18} />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <span className="text-xs text-white/30 uppercase tracking-widest hidden md:block">
                  {/* Total counts are harder with server-side filtering without extra count query. 
                      Accessing 'count' from query response is possible but requires changing fetch logic slightly.
                      For now we can hide it or show "Showing X products" */}
                  {products.length} Productos Mostrados
              </span>
              
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeFilterCount > 0 
                    ? 'bg-luxury-gold text-black hover:bg-[#D4B55D] shadow-lg shadow-luxury-gold/10' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                  <SlidersHorizontal size={16} />
                  <span>Filtros</span>
                  {activeFilterCount > 0 && (
                      <span className="bg-black text-luxury-gold w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">
                          {activeFilterCount}
                      </span>
                  )}
              </button>
          </div>
      </div>

      {/* --- ACTIVE FILTER CHIPS --- */}
      <ActiveFilters 
          activeBrand={activeBrand}
          activeType={activeType}
          activeFinish={activeFinish}
          onRemoveBrand={() => setActiveBrand(null)}
          onRemoveType={() => setActiveType(null)}
          onRemoveFinish={() => setActiveFinish(null)}
          onClearAll={() => {
              setActiveBrand(null);
              setActiveType(null);
              setActiveFinish(null);
              setSearchQuery('');
          }}
      />


      {/* --- PRODUCT GRID --- */}
      {loading ? (
         <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-luxury-gold" size={40} />
         </div>
      ) : products.length === 0 ? (
          <div className="text-center py-20 text-white/50">
              <p>No se encontraron productos con estos filtros.</p>
              <button 
                  onClick={() => {
                    setActiveBrand(null);
                    setActiveType(null);
                    setActiveFinish(null);
                    setSearchQuery('');
                  }}
                  className="text-luxury-gold hover:underline mt-2 text-sm"
              >
                  Limpiar filtros
              </button>
          </div>
      ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {products.map(product => (
               <div 
                 key={product.id}
                 onClick={() => onSelectProduct(product)}
                 className="group relative bg-[#0A0A0A] rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-luxury-gold/10 transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-luxury-gold/30"
               >
                  {/* IMAGE AREA */}
                  <div className="aspect-[4/5] bg-white flex items-center justify-center relative overflow-hidden">
                     <ProductImageFallback
                       src={product.image_url}
                       alt={product.name}
                       brand={product.brand}
                       className="w-full h-full"
                       imageClassName="p-6 object-contain transition-transform duration-700 group-hover:scale-110 will-change-transform"
                     />
                     
                     {/* Brand Badge */}
                     <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        {product.brand && (
                           <span className="text-[9px] font-bold text-black/60 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full uppercase tracking-wider border border-black/5 shadow-sm">
                               {product.brand}
                           </span>
                        )}
                     </div>

                     {/* Overlay on Hover */}
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-30" />
                  </div>

                  {/* INFO AREA */}
                  <div className="p-4 relative">
                     <p className="text-[10px] text-luxury-gold mb-1 font-mono opacity-80">{product.sku}</p>
                     
                     <h3 className="text-sm font-medium leading-tight mb-3 text-white/90 min-h-[2.5em] line-clamp-2 group-hover:text-white transition-colors">
                        {product.name}
                     </h3>
                     
                     <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                        <span className="text-lg font-bold text-white tracking-tight">${product.price}</span>
                        {product.collection_name && (
                           <span className="text-[10px] text-white/30 uppercase tracking-widest max-w-[80px] truncate text-right">
                               {product.collection_name}
                           </span>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* --- LOAD MORE INDICATOR --- */}
      {loadingMore && (
          <div className="flex justify-center items-center py-6">
             <Loader2 className="animate-spin text-white/30" size={24} />
          </div>
      )}

       {/* --- FILTER DRAWER --- */}
       <FilterDrawer 
            isOpen={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            brands={brands}
            types={types}
            finishes={finishes}
            activeBrand={activeBrand}
            activeType={activeType}
            activeFinish={activeFinish}
            onSelectBrand={setActiveBrand}
            onSelectType={setActiveType}
            onSelectFinish={setActiveFinish}
            onClearAll={() => {
                setActiveBrand(null);
                setActiveType(null);
                setActiveFinish(null);
            }}
            resultCount={products.length} // Note: This shows currently loaded count, not total possible matches. To show total matches we'd need a separate COUNT query.
       />

    </div>
  );
}
