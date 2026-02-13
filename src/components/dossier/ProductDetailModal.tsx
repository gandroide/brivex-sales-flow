'use client';

import { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Loader2, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToDossier: (products: Product[]) => void;
}

export default function ProductDetailModal({ product: initialProduct, isOpen, onClose, onAddToDossier }: ProductDetailModalProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);

  // Update local product state when initialProduct changes
  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens with a new product
  useEffect(() => {
    if (isOpen && product) {
      fetchSuggestions(product);
    } else {
      setSuggestions([]);
      setSelectedSuggestionIds([]);
    }
  }, [isOpen, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !product) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${product.sku}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // 3. Update Product in Database
      const { error: dbError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', product.id);

      if (dbError) throw dbError;

      // 4. Update UI State immediately
      setProduct(prev => prev ? ({ ...prev, image_url: publicUrl }) : null);
      alert('Imagen actualizada correctamente');

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error updating image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchSuggestions = async (currentProduct: Product) => {
    setLoadingSuggestions(true);
    try {
      // Logic: Same Collection OR (Same Brand AND Same Finish)
      // AND Type is different (don't suggest another toilet if I selected a toilet)
      
      let query = supabase.from('products').select('*');
      
      // We want items that are NOT the current item
      query = query.neq('id', currentProduct.id);
      
      // And are NOT the same type (if type exists)
      if (currentProduct.type) {
        query = query.neq('type', currentProduct.type);
      }

      // Construct the OR condition for matching
      // (collection_name.eq.X) OR (brand.eq.Y,finish.eq.Z)
      
      const conditions = [];
      
      if (currentProduct.collection_name) {
        conditions.push(`collection_name.eq."${currentProduct.collection_name}"`);
      }
      
      if (currentProduct.brand && currentProduct.finish) {
         conditions.push(`and(brand.eq."${currentProduct.brand}",finish.eq."${currentProduct.finish}")`);
      }
      
      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
        
        const { data, error } = await query.limit(3); // Limit to 3 suggestions
        
        if (error) throw error;
        setSuggestions(data || []);
        // By default select all suggestions
        setSelectedSuggestionIds(data?.map(p => p.id) || []);
      } else {
         // Fallback: If no collection/finish data, maybe suggest same brand?
         // For now, if no match criteria, no suggestions.
         setSuggestions([]);
         setSelectedSuggestionIds([]);
      }
      
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestionIds(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleAddSelected = () => {
    if (product) {
      const selectedSuggestions = suggestions.filter(s => selectedSuggestionIds.includes(s.id));
      onAddToDossier([product, ...selectedSuggestions]);
      onClose();
    }
  };
  
  const handleAddSingle = () => {
    if (product) {
      onAddToDossier([product]);
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-luxury-black border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 z-10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left Column: Main Image */}
        <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center relative group">
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.image_url} 
            alt={product.name} 
            className={`max-h-[60vh] object-contain drop-shadow-xl transition-opacity ${uploadingImage ? 'opacity-50' : 'opacity-100'}`}
          />
           
           {/* Image Upload Overlay */}
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
              <label className="cursor-pointer bg-white/90 hover:bg-white text-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold transform hover:scale-105 transition-all">
                {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                <span>{uploadingImage ? 'Uploading...' : 'Change Photo'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                />
              </label>
           </div>

           <div className="absolute bottom-4 left-4 bg-black/5 px-3 py-1 rounded text-xs text-black/50 font-mono">
              {product.sku}
           </div>
        </div>

        {/* Right Column: Details & Suggestions */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          
          {/* Main Product Info */}
          <div className="mb-6">
            <span className="text-luxury-gold text-xs font-bold tracking-[0.2em] uppercase mb-2 block">
              {product.brand}
            </span>
            <h2 className="text-3xl font-light mb-2">{product.name}</h2>
            <div className="flex gap-3 text-sm text-white/50 mb-4">
              {product.collection_name && (
                <span className="px-2 py-1 bg-white/5 rounded">Col. {product.collection_name}</span>
              )}
              {product.finish && (
                <span className="px-2 py-1 bg-white/5 rounded">{product.finish}</span>
              )}
            </div>
            
            <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
            
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              {product.description || "Description not available for this product."}
            </p>

            <button 
              onClick={handleAddSingle}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-all mb-8"
            >
              <Check size={18} /> Agregar solo este producto
            </button>
          </div>

          {/* Smart Suggestions */}
          {loadingSuggestions ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="animate-spin opacity-50" />
             </div>
          ) : suggestions.length > 0 && (
            <div className="bg-gradient-to-br from-luxury-gold/20 to-transparent p-5 rounded-xl border border-luxury-gold/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                 <ShoppingBag size={80} />
               </div>
               
               <h3 className="text-luxury-gold font-bold mb-3 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-luxury-gold animate-pulse"></span>
                 Completa el Look
               </h3>
               
               <div className="grid grid-cols-3 gap-3 mb-4">
                 {suggestions.map(sugg => {
                   const isSelected = selectedSuggestionIds.includes(sugg.id);
                   return (
                   <div 
                     key={sugg.id} 
                     className={`group relative cursor-pointer ${isSelected ? '' : 'opacity-60 grayscale'}`}
                     onClick={() => toggleSuggestion(sugg.id)}
                   >
                     <div className="absolute top-1 right-1 z-10">
                       <div className={`w-4 h-4 rounded-full border border-black/20 flex items-center justify-center ${isSelected ? 'bg-luxury-gold' : 'bg-white'}`}>
                          {isSelected && <Check size={10} className="text-black" />}
                       </div>
                     </div>

                     <div className={`aspect-square bg-white rounded-lg p-2 flex items-center justify-center mb-1 overflow-hidden transition-all ${isSelected ? 'ring-2 ring-luxury-gold' : ''}`}>
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img 
                        src={sugg.image_url} 
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                        alt={sugg.name}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-luxury-gold transition-colors">{sugg.name}</h4>
                      <p className="text-xs text-white/50">{sugg.brand} • {sugg.collection_name}</p>
                   </div>
                   </div>
                   );
                 })}
               </div>

               <button 
                  onClick={handleAddSelected}
                  className="w-full py-3 bg-luxury-gold/90 hover:bg-luxury-gold text-white font-bold rounded-lg shadow-lg shadow-luxury-gold/20 flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag size={18} />
                  Add Selected ({selectedSuggestionIds.length + 1})
               </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
