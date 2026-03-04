'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ProductEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (updatedProduct: any) => void;
}

export default function ProductEditorDrawer({ isOpen, onClose, product, onSave }: ProductEditorDrawerProps) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Local form state
  const [form, setForm] = useState({
    name: '',
    sku: '',
    brand: '',
    price: 0,
    type: '',
    finish: '',
    collection_name: '',
    description: '',
    image_url: '',
    tech_drawing_url: '',
  });

  // Sync form when product changes
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        brand: product.brand || '',
        price: product.price || 0,
        type: product.type || '',
        finish: product.finish || '',
        collection_name: product.collection_name || '',
        description: product.description || '',
        image_url: product.image_url || '',
        tech_drawing_url: product.tech_drawing_url || '',
      });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'price' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update(form)
        .eq('id', product.id);

      if (error) throw error;

      success('Producto actualizado correctamente');
      onSave({ ...product, ...form });
      onClose();
    } catch (err) {
      const error = err as Error;
      console.error('Error updating product:', error);
      toastError(error.message || 'Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKGROUND SCROLL BLOCKER & BLUR */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* DRAWER PANEL */}
      <div 
        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right-full duration-300 flex flex-col"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0A0A0A]">
            <div>
                <h2 className="text-xl font-bold text-luxury-gold tracking-wide">Editar Producto</h2>
                <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">{form.sku}</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
            >
                <X size={20} />
            </button>
        </div>

        {/* SCROLLABLE FORM CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
            <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-white/50 font-bold">SKU</label>
                      <input 
                        type="text" name="sku" value={form.sku} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Precio</label>
                      <input 
                        type="number" name="price" value={form.price} onChange={handleChange} step="0.01"
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                      />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Nombre</label>
                    <input 
                      type="text" name="name" value={form.name} onChange={handleChange}
                      className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Marca</label>
                      <input 
                        type="text" name="brand" value={form.brand} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Colección</label>
                      <input 
                        type="text" name="collection_name" value={form.collection_name} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                      />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Categoría (Type)</label>
                      <input 
                        type="text" name="type" value={form.type} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Acabado (Finish)</label>
                      <input 
                        type="text" name="finish" value={form.finish} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                      />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Descripción</label>
                    <textarea 
                      name="description" value={form.description} onChange={handleChange} rows={4}
                      className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Image URL</label>
                    <input 
                      type="text" name="image_url" value={form.image_url} onChange={handleChange}
                      className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Tech Drawing URL</label>
                    <input 
                      type="text" name="tech_drawing_url" value={form.tech_drawing_url} onChange={handleChange}
                      className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-luxury-gold focus:outline-none text-white"
                    />
                </div>

            </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex gap-4">
            <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-white/10 text-white hover:bg-white/5 font-bold text-sm tracking-wider uppercase rounded-lg transition-colors"
                disabled={loading}
            >
                Cancelar
            </button>
            <button 
                type="submit"
                form="edit-product-form"
                className="flex-1 py-3 bg-luxury-gold text-black font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-[#D4B55D] shadow-lg shadow-luxury-gold/10 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Guardar</span>
            </button>
        </div>

      </div>
    </>
  );
}
