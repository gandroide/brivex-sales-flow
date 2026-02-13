
'use client';
import { useState } from 'react';

import VoiceDealCreator from '@/components/pipedrive/VoiceDealCreator';
import ProductCard from '@/components/dossier/ProductCard';
import DossierConfigModal from '@/components/dossier/DossierConfigModal';
import VisualProductSelector from '@/components/dossier/VisualProductSelector';
import ProductDetailModal from '@/components/dossier/ProductDetailModal';
import { FileText, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// Unified Product Interface
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
  discount?: number;
  note?: string;
}

export default function DossierPage() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [generating, setGenerating] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  // New State for Visual Selection
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const addProduct = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) return;
    setSelectedProducts(prev => [...prev, { ...product, discount: 0 }]);
  };

  const handleAddMultiple = (productsToAdd: Product[]) => {
    const newProducts = productsToAdd.filter(p => !selectedProducts.find(sp => sp.id === p.id));
    
    if (newProducts.length > 0) {
      const productsWithDiscount = newProducts.map(p => ({ ...p, discount: 0 }));
      setSelectedProducts(prev => [...prev, ...productsWithDiscount]);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: 'discount' | 'note', value: number | string) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleGenerateClick = () => {
    if (selectedProducts.length === 0) return;
    setIsConfigModalOpen(true);
  };

  const generateDossier = async (data: { clientName: string; projectName: string; date: string }) => {
    setGenerating(true);

    try {
      const response = await fetch('/api/dossier/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          products: selectedProducts,
          clientName: data.clientName,
          projectName: data.projectName,
          date: data.date
        }),
      });

      if (!response.ok) throw new Error('Error generando PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Brivex_Propuesta_${data.clientName || 'Cliente'}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsConfigModalOpen(false); // Close modal on success
      
    } catch (error) {
      console.error(error);
      alert('Error al generar el dossier. Intente nuevamente.');
    } finally {
      setGenerating(false);
    }
  };

  const openProductDetail = (product: Product) => {
    setViewProduct(product);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-32 bg-luxury-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-black/50 to-transparent pt-8 pb-4 px-4 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Generador de Dossier</h1>
              <p className="text-white/50 text-xs">Colección Premium & Arquitectura</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="bg-luxury-gold/10 px-4 py-2 rounded-full border border-luxury-gold/20 flex items-center gap-2">
                <ShoppingBag size={16} className="text-luxury-gold" />
                <span className="text-luxury-gold font-bold">{selectedProducts.length} Items</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        {/* --- SELECTED PRODUCTS SUMMARY (If any) --- */}
        {selectedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-white/40 text-sm uppercase tracking-wider font-bold mb-4">Productos Seleccionados</h2>
            <div className="space-y-4">
              {selectedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onUpdate={updateProduct} 
                  onRemove={removeProduct} 
                />
              ))}
            </div>
          </div>
        )}

       {/* --- MAIN SHOPPING AREA --- */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-light text-white">Catálogo Digital</h2>
           </div>
           
           {/* Visual Grid */}
           <VisualProductSelector onSelectProduct={openProductDetail} />
        </div>

      </div>

      {/* --- FLOATING ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-luxury-black/95 backdrop-blur-lg border-t border-white/10 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-white/50 text-xs uppercase tracking-wider">Total Dossier</span>
            <p className="text-2xl font-bold text-white">
               ${selectedProducts.reduce((sum, p) => sum + (p.price * (1 - (p.discount || 0)/100)), 0).toFixed(2)}
            </p>
          </div>
          
          <button 
            disabled={selectedProducts.length === 0 || generating}
            onClick={handleGenerateClick}
            className="btn-primary px-8 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all text-black font-bold"
            style={{background: 'linear-gradient(135deg, #C9A84C 0%, #F5D061 100%)'}}
          >
            <FileText size={20} /> 
            {generating ? 'Generando...' : 'Generar PDF'}
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      <DossierConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfirm={generateDossier}
        isGenerating={generating}
      />

      <ProductDetailModal 
        isOpen={isDetailModalOpen}
        product={viewProduct}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToDossier={handleAddMultiple}
      />

      <VoiceDealCreator />
    </div>
  );
}
