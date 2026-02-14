'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { Upload, X, Save, Image as ImageIcon, Loader2, Search, Pencil, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

// Types
interface ProductForm {
  sku: string;
  name: string;
  brand: string;
  price: string;
  type: string;
  collection_name: string;
  finish: string;
  description: string;
}

interface Product extends Omit<ProductForm, 'price'> {
  id: string;
  price: number;
  image_url: string;
  tech_drawing_url?: string;
}

const INITIAL_FORM: ProductForm = {
  sku: '',
  name: '',
  brand: '',
  price: '',
  type: 'Grifería',
  collection_name: '',
  finish: '',
  description: '',
};

const BRANDS = ['Axor', 'Hansgrohe', 'Gedy', 'Duravit', 'Geberit', 'Vola', 'Other'];
const TYPES = ['Grifería', 'Sanitario', 'Accesorio', 'Componente', 'Mobiliario', 'Iluminación'];

export default function InventoryProductManager() {
  const { success, error: toastError } = useToast();
  
  // States
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Image State
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  
  const [techImage, setTechImage] = useState<File | null>(null);
  const [techImagePreview, setTechImagePreview] = useState<string | null>(null);

  // Refs
  const mainInputRef = useRef<HTMLInputElement>(null);
  const techInputRef = useRef<HTMLInputElement>(null);

  // --- INIT ---
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching products:', error);
    } else {
        // Map any to Product type roughly
        setProducts(data as Product[] || []);
    }
    setLoadingList(false);
  };

  // --- HANDLERS ---
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'tech') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      if (type === 'main') {
        setMainImage(file);
        setMainImagePreview(previewUrl);
      } else {
        setTechImage(file);
        setTechImagePreview(previewUrl);
      }
    }
  };

  const removeImage = (type: 'main' | 'tech') => {
    if (type === 'main') {
      setMainImage(null);
      setMainImagePreview(null);
      if (mainInputRef.current) mainInputRef.current.value = '';
    } else {
      setTechImage(null);
      setTechImagePreview(null);
      if (techInputRef.current) techInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name || !form.price || !form.brand) {
      toastError('Por favor complete los campos obligatorios (*)');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = editingId ? (mainImagePreview?.startsWith('blob') ? '' : mainImagePreview) : '';
      let techUrl = editingId ? (techImagePreview?.startsWith('blob') ? '' : techImagePreview) : '';

      // 1. Upload New Images if present
      if (mainImage) {
        const url = await uploadImage(mainImage, 'products');
        if (url) imageUrl = url;
      }
      
      if (techImage) {
        const url = await uploadImage(techImage, 'tech-drawings');
        if (url) techUrl = url;
      }

      const productData = {
          sku: form.sku,
          name: form.name,
          brand: form.brand,
          price: parseFloat(form.price),
          type: form.type,
          collection_name: form.collection_name,
          finish: form.finish,
          description: form.description,
          ...(imageUrl && { image_url: imageUrl }),
          ...(techUrl && { tech_drawing_url: techUrl }),
      };

      if (editingId) {
          // UPDATE
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingId);
            
          if (error) throw error;
          success('Producto actualizado correctamente');
      } else {
          // INSERT
          // Ensure image_url is set for new products if we uploaded one, or empty string
          // Note: If spread above didn't set it (because imageUrl was empty), we need to set it if it's mandatory.
          // In DB schema usually nullable or default. 
          const { error } = await supabase
            .from('products')
            .insert([{
                ...productData,
                image_url: imageUrl || '',
                tech_drawing_url: techUrl || '',
            }]);
            
          if (error) throw error;
          success('Producto agregado exitosamente');
      }

      resetForm();
      fetchProducts(); // Refresh list

    } catch (err) {
      console.error(err);
      toastError('Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setMainImage(null);
    setMainImagePreview(null);
    setTechImage(null);
    setTechImagePreview(null);
    if (mainInputRef.current) mainInputRef.current.value = '';
    if (techInputRef.current) techInputRef.current.value = '';
  };

  const handleEdit = (product: Product) => {
      setEditingId(product.id);
      setForm({
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          price: product.price.toString(),
          type: product.type || 'Grifería',
          collection_name: product.collection_name || '',
          finish: product.finish || '',
          description: product.description || '',
      });
      setMainImagePreview(product.image_url);
      setTechImagePreview(product.tech_drawing_url || null);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
      setDeleteId(id);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!deleteId) return;
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteId);
        
      if (error) {
          toastError('Error al eliminar el producto');
          console.error(error);
      } else {
          success('Producto eliminado correctamente');
          setProducts(prev => prev.filter(p => p.id !== deleteId));
      }
  };

  // --- FILTERED LIST ---
  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: IMAGES --- */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Main Image Upload */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4">
            <h3 className="text-luxury-gold uppercase tracking-wider text-xs font-bold w-full text-left">
                {editingId ? 'Editar Imagen Principal' : 'Imagen Principal'}
            </h3>
            
            <div 
                className={`w-full aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all ${mainImagePreview ? 'border-luxury-gold/50 bg-black/20' : 'border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer'}`}
                onClick={() => !mainImagePreview && mainInputRef.current?.click()}
            >
                {mainImagePreview ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mainImagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button 
                    onClick={(e) => { e.stopPropagation(); removeImage('main'); }}
                    className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                    <X size={14} className="text-white" />
                    </button>
                    {!mainImage && editingId && <span className="absolute bottom-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">Imagen Actual</span>}
                </>
                ) : (
                <>
                    <ImageIcon size={40} className="text-white/20 mb-2" />
                    <span className="text-xs text-white/40">Click to Upload Image</span>
                </>
                )}
                <input 
                type="file" 
                ref={mainInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'main')} 
                />
            </div>
            </div>

            {/* Tech Drawing Upload */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4">
            <h3 className="text-luxury-gold uppercase tracking-wider text-xs font-bold w-full text-left">
                {editingId ? 'Editar Dibujo Técnico' : 'Dibujo Técnico (Opcional)'}
            </h3>
            
            <div 
                className={`w-full aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all ${techImagePreview ? 'border-luxury-gold/50 bg-black/20' : 'border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer'}`}
                onClick={() => !techImagePreview && techInputRef.current?.click()}
            >
                {techImagePreview ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={techImagePreview} alt="Tech Preview" className="w-full h-full object-contain p-2" />
                    <button 
                    onClick={(e) => { e.stopPropagation(); removeImage('tech'); }}
                    className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                    <X size={14} className="text-white" />
                    </button>
                </>
                ) : (
                <>
                    <Upload size={30} className="text-white/20 mb-2" />
                    <span className="text-xs text-white/40">Upload Tech Drawing</span>
                </>
                )}
                <input 
                type="file" 
                ref={techInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'tech')} 
                />
            </div>
            </div>

        </div>

        {/* --- RIGHT COLUMN: FORM --- */}
        <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6 relative">
            
            {editingId && (
                <div className="absolute top-4 right-4 bg-luxury-gold/20 text-luxury-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-2">
                    <Pencil size={12} /> Editing Mode
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SKU */}
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">SKU *</label>
                    <input 
                    type="text" 
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. 12345678"
                    className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white placeholder:text-white/20"
                    />
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Precio (USD) *</label>
                    <input 
                    type="number" 
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Nombre del Producto *</label>
                    <input 
                    type="text" 
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Mezclador Monomando de Lavabo"
                    className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white placeholder:text-white/20"
                    />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Brand */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Marca *</label>
                        <div className="relative">
                            <input 
                                list="brands" 
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white"
                                placeholder="Select or Type..."
                            />
                            <datalist id="brands">
                                {BRANDS.map(b => <option key={b} value={b} />)}
                            </datalist>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Tipo</label>
                        <select 
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white appearance-none cursor-pointer"
                        >
                            {TYPES.map(t => <option key={t} value={t} className="bg-black text-white">{t}</option>)}
                        </select>
                    </div>

                    {/* Collection */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Colección</label>
                        <input 
                            type="text" 
                            name="collection_name"
                            value={form.collection_name}
                            onChange={handleChange}
                            placeholder="e.g. Citterio E"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white placeholder:text-white/20"
                        />
                    </div>
            </div>

            {/* Finish */}
            <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Acabado / Color</label>
                    <input 
                    type="text" 
                    name="finish"
                    value={form.finish}
                    onChange={handleChange}
                    placeholder="e.g. Polished Gold Optic"
                    className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white placeholder:text-white/20"
                    />
            </div>

            {/* Description */}
            <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-bold">Descripción</label>
                    <textarea 
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Detalles técnicos y características..."
                    className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:border-luxury-gold focus:outline-none transition-colors text-white placeholder:text-white/20 resize-none"
                    />
            </div>

            {/* ACTIONS */}
            <div className="pt-6 flex justify-end gap-4 border-t border-white/10">
                <button 
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm uppercase tracking-wider"
                >
                    {editingId ? 'Cancelar Edición' : 'Limpiar'}
                </button>
                
                <button 
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 rounded-full bg-luxury-gold text-black font-bold hover:bg-white transition-all text-sm uppercase tracking-wider shadow-lg shadow-luxury-gold/20 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {loading ? 'Guardando...' : (editingId ? 'Actualizar Producto' : 'Guardar Producto')}
                </button>
            </div>

            </form>
        </div>
        </div>
        
        {/* --- PRODUCT LIST TABLE --- */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
             
             {/* Header */}
             <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-white tracking-wide">Inventario Actual ({products.length})</h3>
                
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o SKU..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:border-luxury-gold focus:outline-none text-white placeholder:text-white/30"
                    />
                    <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
                </div>
             </div>

             {/* Table */}
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                             <th className="p-4 font-bold border-b border-white/10">Imagen</th>
                             <th className="p-4 font-bold border-b border-white/10">SKU</th>
                             <th className="p-4 font-bold border-b border-white/10">Nombre</th>
                             <th className="p-4 font-bold border-b border-white/10">Marca</th>
                             <th className="p-4 font-bold border-b border-white/10">Precio</th>
                             <th className="p-4 font-bold border-b border-white/10 text-right">Acciones</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {loadingList ? (
                             <tr>
                                 <td colSpan={6} className="p-8 text-center text-white/40">
                                     <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                     Cargando productos...
                                 </td>
                             </tr>
                         ) : filteredProducts.length === 0 ? (
                             <tr>
                                 <td colSpan={6} className="p-8 text-center text-white/40">
                                     No se encontraron productos.
                                 </td>
                             </tr>
                         ) : (
                             filteredProducts.map(product => (
                                 <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                     <td className="p-4">
                                         <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                             {product.image_url ? (
                                                 // eslint-disable-next-line @next/next/no-img-element
                                                 <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                                             ) : (
                                                 <ImageIcon size={20} className="text-gray-300" />
                                             )}
                                         </div>
                                     </td>
                                     <td className="p-4 text-sm text-white/70">{product.sku}</td>
                                     <td className="p-4 text-sm font-medium text-white group-hover:text-luxury-gold transition-colors">{product.name}</td>
                                     <td className="p-4 text-sm text-white/60">
                                         <span className="bg-white/10 px-2 py-1 rounded text-xs">{product.brand}</span>
                                     </td>
                                     <td className="p-4 text-sm font-bold text-luxury-gold">${product.price.toFixed(2)}</td>
                                     <td className="p-4 text-right">
                                         <div className="flex justify-end gap-2">
                                             <button 
                                                onClick={() => handleEdit(product)}
                                                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                                title="Editar"
                                             >
                                                 <Pencil size={16} />
                                             </button>
                                             <button 
                                                onClick={() => handleDeleteClick(product.id)}
                                                className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                                title="Eliminar"
                                             >
                                                 <Trash2 size={16} />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        <ConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Eliminar Producto"
            message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer y lo eliminará del catálogo permanentemente."
            isDestructive={true}
            confirmText="Eliminar"
        />

    </div>
  );
}
