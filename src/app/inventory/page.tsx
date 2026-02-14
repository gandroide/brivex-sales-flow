'use client';

import ProductManager from '@/components/inventory/InventoryProductManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-luxury-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link 
            href="/dossier" 
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-luxury-gold"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-wider uppercase text-luxury-gold">
              Gestión de Inventario
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Agregar nuevos productos al catálogo global
            </p>
          </div>
        </div>

        <ProductManager />
      </div>
    </div>
  );
}
