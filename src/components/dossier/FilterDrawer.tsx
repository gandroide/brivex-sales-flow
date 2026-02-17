'use client';

import { X, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Data
  brands: string[];
  types: string[];
  finishes: string[];
  
  // Selection
  activeBrand: string | null;
  activeType: string | null;
  activeFinish: string | null;
  
  // Handlers
  onSelectBrand: (brand: string | null) => void;
  onSelectType: (type: string | null) => void;
  onSelectFinish: (finish: string | null) => void;
  onClearAll: () => void;

  resultCount: number;
}

// Helper for Finish Colors
const getFinishColor = (finishName: string) => {
    if (!finishName) return '#888888';
    const lower = finishName.toLowerCase();
    
    if (lower.includes('black') || lower.includes('negro') || lower.includes('dark') || lower.includes('grafito')) return '#1a1a1a';
    if (lower.includes('white') || lower.includes('blanco')) return '#FFFFFF';
    if (lower.includes('gold') || lower.includes('oro') || lower.includes('dorado') || lower.includes('bronze')) return '#C9A84C';
    if (lower.includes('chrome') || lower.includes('cromo') || lower.includes('silver') || lower.includes('plata') || lower.includes('acero') || lower.includes('inox') || lower.includes('stainless')) return '#E3E3E3';
    if (lower.includes('nickel') || lower.includes('niquel') || lower.includes('brushed')) return '#A9A9A9';
    if (lower.includes('red') || lower.includes('rojo')) return '#8B0000';
    if (lower.includes('brass') || lower.includes('laton')) return '#B5A642';
    if (lower.includes('green') || lower.includes('verde')) return '#2E8B57';
    if (lower.includes('blue') || lower.includes('azul')) return '#4682B4';
    return '#888888'; // Default grey
};

export default function FilterDrawer({
  isOpen,
  onClose,
  brands,
  types,
  finishes,
  activeBrand,
  activeType,
  activeFinish,
  onSelectBrand,
  onSelectType,
  onSelectFinish,
  onClearAll,
  resultCount
}: FilterDrawerProps) {
  
  // Accordion State (all open by default for visibility)
  const [openSections, setOpenSections] = useState({
    brand: true,
    type: true,
    finish: true
  });

  const toggleSection = (section: 'brand' | 'type' | 'finish') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* --- BACKDROP --- */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* --- DRAWER PANEL --- */}
      <div 
        className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right-full duration-300 flex flex-col"
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0A0A0A]">
            <div>
                <h2 className="text-xl font-light text-white tracking-wide">Filtros</h2>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{resultCount} Resultados</p>
            </div>
            
            <button 
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
            >
                <X size={20} />
            </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* BRAND SECTION */}
            <div className="space-y-4">
                <button 
                    onClick={() => toggleSection('brand')}
                    className="w-full flex items-center justify-between text-white/90 hover:text-luxury-gold transition-colors group"
                >
                    <span className="text-sm font-bold uppercase tracking-widest text-luxury-gold/80">Marca</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.brand ? 'rotate-180' : ''}`} />
                </button>
                
                {openSections.brand && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {brands.sort().map(brand => (
                            <button
                                key={brand}
                                onClick={() => onSelectBrand(activeBrand === brand ? null : brand)}
                                className={`px-4 py-2 text-xs rounded-full border transition-all duration-200 ${
                                    activeBrand === brand 
                                    ? 'bg-luxury-gold text-black border-luxury-gold font-bold shadow-lg shadow-luxury-gold/20' 
                                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="h-px bg-white/5 w-full" />

            {/* TYPE SECTION */}
            <div className="space-y-4">
                <button 
                    onClick={() => toggleSection('type')}
                    className="w-full flex items-center justify-between text-white/90 hover:text-luxury-gold transition-colors group"
                >
                    <span className="text-sm font-bold uppercase tracking-widest text-luxury-gold/80">Categoría</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.type ? 'rotate-180' : ''}`} />
                </button>
                
                {openSections.type && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {types.sort().map(type => (
                            <button
                                key={type}
                                onClick={() => onSelectType(activeType === type ? null : type)}
                                className={`px-4 py-2 text-xs rounded-full border transition-all duration-200 ${
                                    activeType === type 
                                    ? 'bg-white text-black border-white font-bold shadow-lg' 
                                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* FINISH SECTION */}
            <div className="space-y-4">
                <button 
                    onClick={() => toggleSection('finish')}
                    className="w-full flex items-center justify-between text-white/90 hover:text-luxury-gold transition-colors group"
                >
                    <span className="text-sm font-bold uppercase tracking-widest text-luxury-gold/80">Acabado</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.finish ? 'rotate-180' : ''}`} />
                </button>
                
                {openSections.finish && (
                    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {finishes.sort().map(finish => {
                             const color = getFinishColor(finish);
                             const isActive = activeFinish === finish;
                             
                             return (
                                <button
                                    key={finish}
                                    onClick={() => onSelectFinish(isActive ? null : finish)}
                                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 text-left ${
                                        isActive 
                                        ? 'bg-white/10 border-luxury-gold/50 ring-1 ring-luxury-gold/50' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                    }`}
                                >
                                    <span 
                                        className="w-6 h-6 rounded-full border border-white/10 shadow-sm flex items-center justify-center shrink-0" 
                                        style={{ backgroundColor: color }}
                                    >
                                        {isActive && <Check size={12} className={color === '#FFFFFF' || color === '#E3E3E3' ? 'text-black' : 'text-white'} />}
                                    </span>
                                    <span className={`text-xs ${isActive ? 'text-white font-bold' : 'text-white/60'}`}>{finish}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-white/10 bg-[#0A0A0A] space-y-3">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-luxury-gold text-black font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-[#D4B55D] transition-colors shadow-lg shadow-luxury-gold/10"
            >
                Ver {resultCount} Resultados
            </button>
            
            {(activeBrand || activeType || activeFinish) && (
                <button 
                    onClick={onClearAll}
                    className="w-full py-2 text-white/40 hover:text-white text-xs tracking-wider uppercase transition-colors"
                >
                    Limpiar Todos los Filtros
                </button>
            )}
        </div>

      </div>
    </>
  );
}
