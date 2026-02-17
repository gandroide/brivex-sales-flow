
import { Trash2, Copy } from 'lucide-react';
import ProductImageFallback from '../ui/ProductImageFallback';

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
  warranty_type?: string;
  warranty_duration?: string;
}

interface ProductCardProps {
  product: Product;
  onUpdate: (id: string, field: 'discount' | 'note' | 'features' | 'warranty_type' | 'warranty_duration', value: number | string | string[]) => void;
  onRemove: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDuplicate: (product: any) => void;
  onMove?: (productId: string, newSectionId: string) => void;
  availableSections?: { id: string; name: string }[];
}

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function ProductCard({ product, onUpdate, onRemove, onDuplicate, onMove, availableSections = [] }: ProductCardProps) {
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const handleSmartFeatures = () => {
      if(!featureInput.trim()) return;
      
      // Split by newline, bullet, or dash
      const newLines = featureInput
        .split(/[\n•-]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      if (newLines.length > 0) {
          const currentFeatures = product.features || [];
          onUpdate(product.id, 'features', [...currentFeatures, ...newLines]);
          setFeatureInput('');
      }
  };

  return (
    <div className="card flex flex-col md:flex-row gap-4 items-start relative group">
      <ProductImageFallback
        src={product.image_url}
        alt={product.name}
        brand={product.brand}
        className="w-full md:w-32 h-32 rounded-lg border border-white/10"
        imageClassName="object-cover"
      />
      
      <div className="flex-grow w-full">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-luxury-gold uppercase tracking-wider">{product.sku}</span>
            <h3 className="font-bold text-lg">{product.name}</h3>
          </div>
          <div className="flex items-center gap-1">
             {/* --- MOVE DROPDOWN --- */}
             {onMove && availableSections.length > 0 && (
                <div className="relative">
                    <button 
                        onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                        className="text-white/30 hover:text-luxury-gold transition-colors p-1"
                        title="Mover a otra sección"
                    >
                        <ArrowRight size={18} />
                    </button>
                    {showMoveDropdown && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMoveDropdown(false)} />
                            <div className="absolute right-0 top-8 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 py-1 max-h-60 overflow-y-auto">
                                <div className="px-3 py-2 text-xs text-white/50 border-b border-white/5 uppercase font-bold">Mover a...</div>
                                {availableSections.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            onMove(product.id, section.id);
                                            setShowMoveDropdown(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 hover:text-luxury-gold transition-colors truncate"
                                    >
                                        {section.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

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
          <div></div> 
          
          <div className="flex flex-col gap-2 col-span-2 md:col-span-1 lg:col-span-2">
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

            {/* --- SMART FEATURES INPUT --- */}
            <div className="flex gap-1">
               <textarea 
                 rows={1}
                 className="input-field py-1 px-2 text-xs flex-grow min-h-[32px] resize-none overflow-hidden focus:min-h-[60px] transition-all"
                 placeholder="Pegar lista o escribir (Enter para guardar)"
                 value={featureInput}
                 onChange={(e) => setFeatureInput(e.target.value)}
                 onPointerDown={(e) => e.stopPropagation()}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSmartFeatures();
                   }
                 }}
               />
               <button 
                  onClick={handleSmartFeatures}
                  className="bg-white/10 hover:bg-white/20 px-3 rounded text-xs flex items-center justify-center"
                  title="Añadir (Smart Parse)"
               >
                 +
               </button>
            </div>


            {/* --- WARRANTY FIELDS --- */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
                <div>
                   <label className="text-xs text-white/50 block mb-1">Tipo de Garantía</label>
                   <input 
                     type="text"
                     className="input-field py-1 px-2 text-xs w-full"
                     placeholder="Ej: Fábrica"
                     value={product.warranty_type || ''}
                     onChange={(e) => onUpdate(product.id, 'warranty_type', e.target.value)}
                     onPointerDown={(e) => e.stopPropagation()}
                   />
                </div>
                <div>
                   <label className="text-xs text-white/50 block mb-1">Duración</label>
                   <input 
                     type="text"
                     className="input-field py-1 px-2 text-xs w-full"
                     placeholder="Ej: 5 Años"
                     value={product.warranty_duration || ''}
                     onChange={(e) => onUpdate(product.id, 'warranty_duration', e.target.value)}
                     onPointerDown={(e) => e.stopPropagation()}
                   />
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
