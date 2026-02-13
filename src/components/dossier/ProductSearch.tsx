
'use client';
import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';


interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_status: string;
  brand: string;
  collection_name?: string;
  finish?: string;
  type?: string;
}

interface ProductSearchProps {
  onSelect: (product: Product) => void;
}

// Simple debounce hook implementation inline for now
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function ProductSearch({ onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    async function searchProducts() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${debouncedQuery}%,sku.ilike.%${debouncedQuery}%`)
        .limit(5);

      if (error) {
        console.error('Error searching products:', error);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    }

    searchProducts();
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por SKU o nombre..."
          className="input-field pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute left-3 top-3 text-luxury-gold">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </div>
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-luxury-dark-gray border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {results.map((product) => (
            <div
              key={product.id}
              className="p-3 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
              onClick={() => {
                onSelect(product);
                setQuery('');
                setResults([]);
              }}
            >
              <div>
                <p className="font-semibold text-sm">{product.name}</p>
                <p className="text-xs text-white/50">{product.sku}</p>
              </div>
              <p className="text-luxury-gold font-bold">${product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
