'use client';

import { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Loader2, Camera, Link as LinkIcon, Trash2, Search  } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductImageFallback from '../ui/ProductImageFallback';
// Importa o define ProductSearch si lo usas, si no, lo hemos reemplazado con lógica interna.

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
  tech_drawing_url?: string;
  related_ids?: string[];
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
  const [uploadingTech, setUploadingTech] = useState(false);
  
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchingLink, setSearchingLink] = useState(false);

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
      setShowSearch(false);
      setSearchTerm('');
      setSearchResults([]);
    } else {
      setSuggestions([]);
      setSelectedSuggestionIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  // --- IMAGE UPLOAD HANDLERS ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !product) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${product.sku}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', product.id);

      if (dbError) throw dbError;

      setProduct(prev => prev ? ({ ...prev, image_url: publicUrl }) : null);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error updating image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTechUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !product) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${product.sku}-tech-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingTech(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('products')
        .update({ tech_drawing_url: publicUrl })
        .eq('id', product.id);

      if (dbError) throw dbError;

      setProduct(prev => prev ? ({ ...prev, tech_drawing_url: publicUrl }) : null);

    } catch (error) {
      console.error('Error uploading tech drawing:', error);
      alert('Error updating tech drawing.');
    } finally {
      setUploadingTech(false);
    }
  };

  // --- SUGGESTIONS LOGIC ---
  const fetchSuggestions = async (currentProduct: Product) => {
    setLoadingSuggestions(true);
    try {
      let manualSuggestions: Product[] = [];
      
      // 1. Fetch Manual Overrides (Linked Products)
      if (currentProduct.related_ids && currentProduct.related_ids.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', currentProduct.related_ids);
        
        if (!error && data) {
            manualSuggestions = data;
        }
      }

      // 2. Fetch Algorithmic Suggestions
      let query = supabase.from('products').select('*');
      
      // Filter out current item
      query = query.neq('id', currentProduct.id);
      
      // Filter out same type (optional, but good practice)
      if (currentProduct.type) {
        query = query.neq('type', currentProduct.type);
      }

      const conditions = [];
      if (currentProduct.collection_name) {
        conditions.push(`collection_name.eq."${currentProduct.collection_name}"`);
      }
      if (currentProduct.brand && currentProduct.finish) {
         conditions.push(`and(brand.eq."${currentProduct.brand}",finish.eq."${currentProduct.finish}")`);
      }
      
      let autoSuggestions: Product[] = [];

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
        const { data, error } = await query.limit(10); // Fetch more to fill grid
        
        if (!error && data) {
            autoSuggestions = data;
        }
      }

      // 3. Merge: Manual suggestions first, then Auto (removing duplicates)
      const manualIds = new Set(manualSuggestions.map(p => p.id));
      const filteredAuto = autoSuggestions.filter(p => !manualIds.has(p.id));
      
      const merged = [...manualSuggestions, ...filteredAuto];

      setSuggestions(merged);
      // Select all by default
      setSelectedSuggestionIds(merged.map(p => p.id));
      
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // --- LINKING LOGIC (Look Manager) ---
  const searchProductsToLink = async (term: string) => {
    if (!term || term.length < 3) return;
    setSearchingLink(true);
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
            .limit(5);
        
        if (error) throw error;
        setSearchResults(data || []);
    } catch (err) {
        console.error(err);
    } finally {
        setSearchingLink(false);
    }
  };

  const linkProduct = async (productToLink: Product) => {
    if (!product) return;
    
    const currentRelated = product.related_ids || [];
    if (currentRelated.includes(productToLink.id)) return;

    const newRelatedIds = [...currentRelated, productToLink.id];

    // Update DB
    const { error } = await supabase
        .from('products')
        .update({ related_ids: newRelatedIds })
        .eq('id', product.id);

    if (error) {
        console.error('Error linking product:', error);
        alert('Failed to link product');
        return;
    }

    // Update Local State
    const updatedProduct = { ...product, related_ids: newRelatedIds };
    setProduct(updatedProduct);
    fetchSuggestions(updatedProduct); // Refresh grid
    setSearchTerm('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const unlinkProduct = async (idToRemove: string) => {
    if (!product) return;
     
    const newRelatedIds = (product.related_ids || []).filter(id => id !== idToRemove);

    const { error } = await supabase
        .from('products')
        .update({ related_ids: newRelatedIds })
        .eq('id', product.id);
    
    if (error) {
        console.error('Error unlinking product:', error);
        alert('Failed to unlink product');
        return;
    }

    const updatedProduct = { ...product, related_ids: newRelatedIds };
    setProduct(updatedProduct);
    fetchSuggestions(updatedProduct);
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
    // 1. OVERLAY (Fixed & Scrollable)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      
      {/* 2. MODAL PANEL (Constrained Height & Internal Scroll) */}
      <div 
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button (Mobile) */}
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-20 p-2 bg-gray-100 rounded-full"
        >
          <X size={20} className="text-black" />
        </button>

        {/* --- LEFT COLUMN: IMAGES (Scrollable on mobile, sticky on desktop) --- */}
        <div className="w-full md:w-5/12 bg-gray-50 flex flex-col border-r border-gray-200 overflow-y-auto">
           
           {/* MAIN IMAGE AREA */}
           <div className="relative w-full aspect-square p-8 flex items-center justify-center group bg-white border-b border-gray-100">
              <ProductImageFallback
                src={product.image_url}
                alt={product.name}
                brand={product.brand}
                className="w-full h-full bg-white"
                imageClassName={`object-contain transition-opacity ${uploadingImage ? 'opacity-50' : 'opacity-100'}`}
              />
               
              {/* Upload Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                 <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold transform hover:scale-105 transition-all border border-gray-200">
                   {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                   <span>Cambiar Foto</span>
                   <input 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     disabled={uploadingImage}
                     onChange={handleImageUpload}
                   />
                 </label>
              </div>

              <div className="absolute top-4 left-4 bg-gray-100 px-2 py-1 rounded text-xs text-gray-500 font-mono">
                 {product.sku}
              </div>
           </div>

           {/* TECH DRAWING AREA */}
           <div className="relative w-full aspect-[4/3] bg-gray-50 flex flex-col items-center justify-center p-4 group border-t border-gray-200">
              <span className="absolute top-2 left-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dibujo Técnico / Plano</span>
              
              {product.tech_drawing_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={product.tech_drawing_url} 
                    alt="Technical Drawing" 
                    className={`h-full w-full object-contain mix-blend-multiply p-4 transition-opacity ${uploadingTech ? 'opacity-50' : 'opacity-80'}`}
                  />
              ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <span className="text-2xl grayscale">📐</span>
                      </div>
                      <span className="text-xs">Sin plano disponible</span>
                  </div>
              )}

              {/* Upload Tech Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity ${product.tech_drawing_url ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                 <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-2 text-xs font-bold transform hover:scale-105 transition-all">
                   {uploadingTech ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
                   <span>{product.tech_drawing_url ? 'Actualizar Plano' : 'Subir Plano'}</span>
                   <input 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     disabled={uploadingTech}
                     onChange={handleTechUpload}
                   />
                 </label>
              </div>
           </div>
        </div>

        {/* --- RIGHT COLUMN: DETAILS & SUGGESTIONS (Scrollable) --- */}
        <div className="w-full md:w-7/12 flex flex-col bg-white overflow-y-auto">
          
          {/* Header & Close (Desktop) */}
          <div className="p-6 pb-2 flex justify-between items-start">
             <div>
                <span className="text-luxury-gold text-xs font-bold tracking-[0.2em] uppercase mb-1 block">
                  {product.brand}
                </span>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 leading-tight">{product.name}</h2>
             </div>
             <button onClick={onClose} className="hidden md:block p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <X size={24} />
             </button>
          </div>

          <div className="px-6 pb-6">
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.collection_name && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded uppercase tracking-wide font-medium">Col. {product.collection_name}</span>
              )}
              {product.finish && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded uppercase tracking-wide font-medium">{product.finish}</span>
              )}
            </div>
            
            <div className="flex items-baseline gap-4 mb-4">
                <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                <span className="text-xs text-gray-400">USD / Unidad</span>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {product.description || "No hay descripción disponible para este producto."}
            </p>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-8">
                <button 
                  onClick={handleAddSingle}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
                >
                  <Check size={16} /> Agregar Solo
                </button>
            </div>

            {/* --- COMPLETE THE LOOK SECTION --- */}
            <div className="border-t border-gray-100 pt-6">
               <div className="flex justify-between items-end mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-luxury-gold" /> Completa el Look
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Sugerencias basadas en colección y acabado</p>
                 </div>
                 
                 {/* Link Manager Toggle */}
                 <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowSearch(!showSearch)}
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-luxury-gold transition-colors"
                    >
                        {showSearch ? <X size={12} /> : <LinkIcon size={12} />}
                        {showSearch ? 'Cerrar Buscador' : 'Vincular Manualmente'}
                    </button>
                    {suggestions.length > 0 && (
                        <button 
                            onClick={() => {
                                if (selectedSuggestionIds.length === suggestions.length) {
                                    setSelectedSuggestionIds([]);
                                } else {
                                    setSelectedSuggestionIds(suggestions.map(s => s.id));
                                }
                            }}
                            className="text-xs font-bold text-luxury-gold hover:underline"
                        >
                            {selectedSuggestionIds.length === suggestions.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                        </button>
                    )}
                 </div>
               </div>

               {/* Manual Link Search Bar */}
               {showSearch && (
                  <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2 relative">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text"
                            placeholder="Buscar producto por nombre o SKU..."
                            className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                searchProductsToLink(e.target.value);
                            }}
                          />
                          {searchingLink && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />}
                      </div>
                      
                      {/* Search Results - FIX APPLIED HERE */}
                      {searchResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                              {searchResults.map(res => (
                                  <button
                                    key={res.id}
                                    onClick={() => linkProduct(res)}
                                    className="w-full text-left p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex items-center justify-between cursor-pointer group transition-colors"
                                  >
                                      <div>
                                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{res.name}</p>
                                          <p className="text-xs text-gray-500 mt-0.5">{res.sku} • {res.brand}</p>
                                      </div>
                                      <span className="text-xs text-white bg-luxury-gold px-2 py-1 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                                          VINCULAR +
                                      </span>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
               )}

               {/* Suggestions Grid */}
               {loadingSuggestions ? (
                 <div className="flex items-center justify-center py-12">
                   <Loader2 className="animate-spin text-luxury-gold" />
                 </div>
               ) : suggestions.length > 0 ? (
                <div className="space-y-4">
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                     {suggestions.map(sugg => {
                       const isSelected = selectedSuggestionIds.includes(sugg.id);
                       const isManual = product.related_ids?.includes(sugg.id);

                       return (
                       <div
                         key={sugg.id}
                         className={`relative group cursor-pointer border rounded-xl overflow-hidden transition-all ${isSelected ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                         onClick={() => toggleSuggestion(sugg.id)}
                       >
                         {/* Manual Link Indicator / Unlink */}
                         {isManual && (
                             <div className="absolute top-1 left-1 z-40">
                                 <div 
                                    className="bg-blue-50 text-blue-600 p-1 rounded-full shadow-sm group-hover:hidden border border-blue-100"
                                    title="Producto Vinculado Manualmente"
                                 >
                                    <LinkIcon size={12} />
                                 </div>
                                 <button
                                   onClick={(e) => {
                                       e.stopPropagation();
                                       if(confirm('¿Desvincular este producto del look?')) unlinkProduct(sugg.id);
                                   }}
                                   className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 p-1.5 rounded-full hidden group-hover:flex items-center justify-center transition-colors shadow-sm border border-gray-200"
                                   title="Desvincular"
                                 >
                                     <Trash2 size={12} />
                                 </button>
                             </div>
                         )}

                         {/* Selection Checkbox */}
                         <div className="absolute top-2 right-2 z-40">
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-luxury-gold border-luxury-gold text-white' : 'bg-white border-gray-300'}`}>
                              {isSelected && <Check size={12} />}
                           </div>
                         </div>

                         <div className="p-3">
                           <div className="aspect-square mb-2 bg-white rounded-lg flex items-center justify-center">
                             <ProductImageFallback
                                src={sugg.image_url}
                                alt={sugg.name}
                                brand={sugg.brand}
                                className="w-full h-full"
                                imageClassName="object-contain p-1"
                             />
                           </div>
                           <h4 className="font-bold text-xs text-gray-900 line-clamp-2 min-h-[2.5em]">{sugg.name}</h4>
                           <p className="text-[10px] text-gray-500 mt-1 truncate">{sugg.sku}</p>
                           <p className="text-xs font-bold text-gray-700 mt-1">${sugg.price.toFixed(2)}</p>
                        </div>
                       </div>
                       );
                     })}
                   </div>

                   {/* Add Selected Button */}
                   <button 
                      onClick={handleAddSelected}
                      disabled={selectedSuggestionIds.length === 0}
                      className="w-full py-4 bg-luxury-black hover:bg-black text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed sticky bottom-0 z-20"
                    >
                      <ShoppingBag size={18} />
                      {selectedSuggestionIds.length > 0 
                        ? `Agregar Selección (${selectedSuggestionIds.length + 1} items)` 
                        : 'Selecciona items para completar'}
                   </button>
                </div>
               ) : (
                   <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                       <p className="text-gray-400 text-sm">No se encontraron sugerencias automáticas.</p>
                       <button onClick={() => setShowSearch(true)} className="text-luxury-gold text-sm font-bold mt-2 hover:underline">
                           Vincular productos manualmente
                       </button>
                   </div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}