'use client';

import { X } from 'lucide-react';

interface ActiveFiltersProps {
  activeBrand: string | null;
  activeType: string | null;
  activeFinish: string | null;
  
  onRemoveBrand: () => void;
  onRemoveType: () => void;
  onRemoveFinish: () => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  activeBrand,
  activeType,
  activeFinish,
  onRemoveBrand,
  onRemoveType,
  onRemoveFinish,
  onClearAll
}: ActiveFiltersProps) {

  if (!activeBrand && !activeType && !activeFinish) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
        
        {/* Brand Chip */}
        {activeBrand && (
            <div className="bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 px-3 py-1 rounded-full text-xs flex items-center gap-2 group hover:bg-luxury-gold/20 transition-colors">
                <span className="font-bold">{activeBrand}</span>
                <button 
                    onClick={onRemoveBrand}
                    className="p-0.5 rounded-full hover:bg-black/20 focus:outline-none"
                    aria-label="Remove Brand Filter"
                >
                    <X size={12} />
                </button>
            </div>
        )}

        {/* Type Chip */}
        {activeType && (
            <div className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs flex items-center gap-2 group hover:bg-white/15 transition-colors">
                <span>{activeType}</span>
                <button 
                    onClick={onRemoveType}
                    className="p-0.5 rounded-full hover:bg-white/20 focus:outline-none"
                    aria-label="Remove Type Filter"
                >
                    <X size={12} />
                </button>
            </div>
        )}

        {/* Finish Chip */}
        {activeFinish && (
            <div className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs flex items-center gap-2 group hover:bg-white/15 transition-colors">
                <span className="opacity-60">Acabado:</span>
                <span>{activeFinish}</span>
                <button 
                    onClick={onRemoveFinish}
                    className="p-0.5 rounded-full hover:bg-white/20 focus:outline-none"
                    aria-label="Remove Finish Filter"
                >
                    <X size={12} />
                </button>
            </div>
        )}

        {/* Clear All Button */}
        <button 
            onClick={onClearAll}
            className="text-[10px] text-white/40 hover:text-white uppercase tracking-wider ml-2 transition-colors border-b border-transparent hover:border-white"
        >
            Limpiar filtros
        </button>

    </div>
  );
}
