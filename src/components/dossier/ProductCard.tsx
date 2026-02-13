
import { Trash2, Copy } from 'lucide-react';

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
  features?: string[];
}

interface ProductCardProps {
  product: Product;
  onUpdate: (id: string, field: 'discount' | 'note' | 'features', value: number | string | string[]) => void;
  onRemove: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDuplicate: (product: any) => void;
}

export default function ProductCard({ product, onUpdate, onRemove, onDuplicate }: ProductCardProps) {
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
          <div className="flex items-center gap-1">
            <button 
                onClick={() => onDuplicate(product)}
                className="text-white/30 hover:text-blue-400 transition-colors p-1"
                title="Duplicar Item"
            >
                <Copy size={18} />
            </button>
            <button 
                onClick={() => onRemove(product.id)}
                className="text-white/30 hover:text-red-500 transition-colors p-1"
            >
                <Trash2 size={20} />
            </button>
          </div>
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
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
          <div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <label className="text-xs text-white/50 block">Características</label>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
               {product.features?.map((feat, idx) => (
                 <span key={idx} className="bg-white/10 text-[10px] px-2 py-1 rounded text-white flex items-center gap-1">
                   {feat}
                   <button onClick={() => {
                      const newFeatures = product.features?.filter((_, i) => i !== idx) || [];
                      onUpdate(product.id, 'features', newFeatures);
                   }} className="hover:text-red-400"><Trash2 size={10} /></button>
                 </span>
               ))}
            </div>

            <div className="flex gap-1">
               <input 
                 type="text" 
                 id={`feature-input-${product.id}`}
                 className="input-field py-1 px-2 text-xs flex-grow"
                 placeholder="Add feature (e.g. SoftClose)"
                 onPointerDown={(e) => e.stopPropagation()}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     const val = e.currentTarget.value.trim();
                     if (val) {
                       const newFeatures = [...(product.features || []), val];
                       onUpdate(product.id, 'features', newFeatures);
                       e.currentTarget.value = '';
                     }
                   }
                 }}
               />
               <button 
                  onClick={() => {
                    const input = document.getElementById(`feature-input-${product.id}`) as HTMLInputElement;
                    const val = input.value.trim();
                     if (val) {
                       const newFeatures = [...(product.features || []), val];
                       onUpdate(product.id, 'features', newFeatures);
                       input.value = '';
                     }
                  }}
                  className="bg-white/10 hover:bg-white/20 px-2 rounded text-xs"
               >
                 +
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
