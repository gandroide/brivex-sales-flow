'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react'; // Changed Box to Package for better icon

interface ProductImageFallbackProps {
  src?: string | null;
  alt: string;
  brand?: string;
  className?: string; // Container classes
  imageClassName?: string; // Image specific classes
}

export default function ProductImageFallback({ 
  src, 
  alt, 
  brand, 
  className = '',
  imageClassName = 'object-contain'
}: ProductImageFallbackProps) {
  const [imageState, setImageState] = useState<'loading' | 'error' | 'success'>('loading');
  
  // Reset state when src changes
  useEffect(() => {
    if (!src) {
        setImageState('error');
    } else {
        setImageState('loading');
        // Preload image to check validity
        const img = new Image();
        img.src = src;
        img.onload = () => setImageState('success');
        img.onerror = () => setImageState('error');
    }
  }, [src]);

  // --- FALLBACK CONTENT GENERATOR ---
  const renderFallbackContent = () => {
     if (brand && brand.length >= 2) {
         // Option A: Brand Initials (Premium Look)
         return (
             <span className="text-4xl font-bold text-black/10 tracking-widest uppercase select-none font-serif">
                 {brand.substring(0, 2)}
             </span>
         );
     } else {
         // Option B: Minimal Icon
         return (
             <div className="flex flex-col items-center gap-2 opacity-20">
                 <Package size={32} className="text-black" />
                 <span className="text-[10px] uppercase tracking-widest font-medium text-black">
                     No Image
                 </span>
             </div>
         );
     }
  };

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
        
        {/* 1. REAL IMAGE (Only if successful) */}
        {imageState === 'success' && src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
                src={src} 
                alt={alt}
                className={`w-full h-full animate-in fade-in duration-700 relative z-20 ${imageClassName}`}
            />
        )}


        {/* 2. SKELETON LOADING (Pulse overlay while loading) */}
        {imageState === 'loading' && src && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse z-30 flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />
            </div>
        )}

        {/* 3. FALLBACK BACKGROUND (Always rendered behind, visible on error or loading) */}
        {/* We keep this rendered but hidden if success to avoid layout shifts if image fails later, or just simple conditional */}
        {imageState !== 'success' && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center z-10">
                {renderFallbackContent()}
            </div>
        )}

    </div>
  );
}
