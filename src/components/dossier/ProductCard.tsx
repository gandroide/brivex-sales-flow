
import { Trash2 } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  image_url: string;
  discount?: number;
  note?: string;
  brand?: string;
  collection_name?: string;
  finish?: string;
  type?: string;
}

interface ProductCardProps {
  product: Product;
  onUpdate: (id: string, field: 'discount' | 'note', value: number | string) => void;
  onRemove: (id: string) => void;
}

export default function ProductCard({ product, onUpdate, onRemove }: ProductCardProps) {
  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="card flex flex-col md:flex-row gap-4 items-start relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={product.image_url} 
        alt={product.name} 
        className="w-full md:w-32 h-32 object-cover rounded-lg border border-white/10"
      />
      
      <div className="flex-grow w-full">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-luxury-gold uppercase tracking-wider">{product.sku}</span>
            <h3 className="font-bold text-lg">{product.name}</h3>
          </div>
          <button 
            onClick={() => onRemove(product.id)}
            className="text-white/30 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex items-end gap-2 mt-1 mb-3">
          <p className="text-xl font-bold text-luxury-gold">${finalPrice.toFixed(2)}</p>
          {product.discount && (
            <span className="text-sm line-through text-white/40 mb-1">${product.price}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/50 block mb-1">Descuento (%)</label>
            <input 
              type="number" 
              min="0" 
              max="100"
              className="input-field py-1 px-2 text-sm"
              placeholder="0"
              value={product.discount || ''}
              onChange={(e) => onUpdate(product.id, 'discount', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Nota</label>
            <input 
              type="text" 
              className="input-field py-1 px-2 text-sm"
              placeholder="Ej: Últimas unidades"
              value={product.note || ''}
              onChange={(e) => onUpdate(product.id, 'note', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
