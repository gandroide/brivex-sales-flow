
'use client';
import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
} from '@dnd-kit/sortable';

import VoiceDealCreator from '@/components/pipedrive/VoiceDealCreator';
import ProductCard from '@/components/dossier/ProductCard'; // Keep for Overlay
import DroppableSection from '@/components/dossier/DroppableSection';
import DossierConfigModal from '@/components/dossier/DossierConfigModal';
import HistoryModal from '../../components/dossier/HistoryModal'; // Relative Import Fix
import VisualProductSelector from '@/components/dossier/VisualProductSelector';
import ProductDetailModal from '@/components/dossier/ProductDetailModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { FileText, ArrowLeft, ShoppingBag, Plus, User, Edit2, X, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext'; // Import Toast

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
  features?: string[];
  tech_drawing_url?: string;
  origin?: string;
  warranty_type?: string;
  warranty_duration?: string;
}

interface Section {
  id: string;
  name: string;
  items: Product[];
}

export default function DossierPage() {
  // --- STATE ---
  const [sections, setSections] = useState<Section[]>([
    { id: 'unassigned', name: 'Sin Asignar', items: [] },
  ]);
  const [salesperson, setSalesperson] = useState('Johalis Montilla');
  const [activeId, setActiveId] = useState<string | null>(null); // For DragOverlay
  const { success, error: toastError } = useToast(); // Use Toast

  const [generating, setGenerating] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // New
  const [isLoaded, setIsLoaded] = useState(false); // Prevent save before load
  
  // Confirmation State
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    type: 'reset' | 'load';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }>({ isOpen: false, type: 'reset' });

  // New State for Visual Selection
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Custom Add Section State
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [hidePrices, setHidePrices] = useState(false);

  // --- AUTO-SAVE LOGIC ---
  // 1. Load from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem('dossier_draft_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sections) setSections(parsed.sections);
        if (parsed.salesperson) setSalesperson(parsed.salesperson);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Save to LocalStorage on Change
  useEffect(() => {
    if (!isLoaded) return; // Don't save until loaded

    const draft = {
      sections,
      salesperson,
      lastModified: Date.now()
    };
    localStorage.setItem('dossier_draft_v1', JSON.stringify(draft));
  }, [sections, salesperson, isLoaded]);


  // --- DND SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  // --- ACTIONS ---

  const handleAddMultiple = (productsToAdd: Product[]) => {
    // Filter out duplicates globally
    const allExistingIds = sections.flatMap(s => s.items.map(i => i.id));
    const newProducts = productsToAdd.filter(p => !allExistingIds.includes(p.id));
    
    if (newProducts.length > 0) {
      const productsWithDiscount = newProducts.map(p => ({ ...p, discount: 0 }));
      
      setSections(prev => prev.map(section => {
        if (section.id === 'unassigned') {
          return { ...section, items: [...section.items, ...productsWithDiscount] };
        }
        return section;
      }));
    }
  };

  const removeProduct = (id: string) => {
    setSections(prev => prev.map(section => ({
      ...section,
      items: section.items.filter(p => p.id !== id)
    })));
  };

  const updateProduct = (id: string, field: 'discount' | 'note' | 'features' | 'warranty_type' | 'warranty_duration', value: number | string | string[]) => {
    setSections(prev => prev.map(section => ({
      ...section,
      items: section.items.map(p => p.id === id ? { ...p, [field]: value } : p)
    })));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDuplicate = (product: any) => {
    const newId = crypto.randomUUID();
    const newProduct = { ...product, id: newId };
    
    setSections(prev => prev.map(section => {
        const index = section.items.findIndex(p => p.id === product.id);
        if (index !== -1) {
            const newItems = [...section.items];
            newItems.splice(index + 1, 0, newProduct);
            return { ...section, items: newItems };
        }
        return section;
    }));
    
    success('Item duplicado correctamente');
  };

  // --- SECTION MANAGEMENT ---

  const confirmAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: Section = {
        id: `section-${Date.now()}`,
        name: newSectionName.trim(),
        items: []
      };
      setSections(prev => [...prev, newSection]);
      setNewSectionName('');
      setIsAddingSection(false);
    }
  };

  const cancelAddSection = () => {
    setIsAddingSection(false);
    setNewSectionName('');
  };

  const removeSection = (id: string) => {
    // Confirmation is now handled in the DroppableSection component
    setSections(prev => {
      const sectionToRemove = prev.find(s => s.id === id);
      if (!sectionToRemove) return prev;

      const remainingSections = prev.filter(s => s.id !== id);
      // Move items to unassigned
      return remainingSections.map(s => {
        if (s.id === 'unassigned') {
          return { ...s, items: [...s.items, ...sectionToRemove.items] };
        }
        return s;
      });
    });
  };

  const renameSection = (id: string, newName: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };


  // --- DRAG AND DROP HANDLERS ---

  const findSectionContainer = (id: string): string | undefined => {
    if (sections.find(s => s.id === id)) return id; // It's a section
    return sections.find(s => s.items.find(i => i.id === id))?.id; // It's an item
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findSectionContainer(String(active.id));
    const overContainer = findSectionContainer(String(overId));

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setSections((prev) => {
      const activeItems = prev.find(s => s.id === activeContainer)?.items || [];
      const overItems = prev.find(s => s.id === overContainer)?.items || [];
      
      const activeIndex = activeItems.findIndex(i => i.id === active.id);
      const overIndex = overItems.findIndex(i => i.id === overId);

      let newIndex;
      if (sections.find(s => s.id === overId)) {
        // We're over a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map(section => {
        if (section.id === activeContainer) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== active.id)
          };
        }
        if (section.id === overContainer) {
           const newItems = [...section.items];
           // Effectively moving the item to the new container at calculated index
           // Note: In dragOver we just move it to the list. 
           // Real reordering happens in dragEnd for same container, or here for different.
           // Simplified: Just add to target, remove from source.
           // However, to permit accurate "insertion" preview, we need arrayMove logic if we were using a single flat list.
           // Since we have multiple lists, we manually splice.
           
           const itemToMove = activeItems[activeIndex];
           newItems.splice(newIndex, 0, itemToMove);
           
           return {
             ...section,
             items: newItems
           };
        }
        return section;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findSectionContainer(String(active.id));
    const overContainer = over ? findSectionContainer(String(over.id)) : undefined;

    if (
      activeContainer &&
      overContainer &&
      activeContainer === overContainer
    ) {
      const sectionIndex = sections.findIndex(s => s.id === activeContainer);
      const items = sections[sectionIndex].items;
      const activeIndex = items.findIndex(i => i.id === active.id);
      const overIndex = items.findIndex(i => i.id === over!.id);

      if (activeIndex !== overIndex) {
        setSections((prev) => {
           const newSections = [...prev];
           newSections[sectionIndex] = {
             ...newSections[sectionIndex],
             items: arrayMove(items, activeIndex, overIndex)
           };
           return newSections;
        });
      }
    }

    setActiveId(null);
  };

  const moveProductToSection = (productId: string, newSectionId: string) => {
    setSections(prevSections => {
        let productToMove: Product | undefined;
        let sourceSectionId = '';

        // Remove from source
        const newSections = prevSections.map(section => {
            const productIndex = section.items.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                productToMove = section.items[productIndex];
                sourceSectionId = section.id;
                return {
                    ...section,
                    items: section.items.filter(p => p.id !== productId)
                };
            }
            return section;
        });

        if (!productToMove || sourceSectionId === newSectionId) return prevSections;

        // Add to destination
        return newSections.map(section => {
            if (section.id === newSectionId) {
                return {
                    ...section,
                    items: [...section.items, productToMove!]
                };
            }
            return section;
        });
    });
    success('Producto movido exitosamente');
  };


  const handleGenerateClick = () => {
    // Check if any section has items
    const hasItems = sections.some(s => s.items.length > 0);
    if (!hasItems) return;
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
          sections, 
          salesperson, 
          clientName: data.clientName,
          projectName: data.projectName,
          date: data.date,
          hidePrices // Use local state
        }),
      });

      if (!response.ok) throw new Error('Error generando PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Baccessory_Propuesta_${data.clientName || 'Cliente'}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsConfigModalOpen(false); // Close modal on success
      
    } catch (error) {
      console.error(error);
      toastError('Error al generar el dossier. Intente nuevamente.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setConfirmationState({
        isOpen: true,
        type: 'reset'
    });
  };

  const confirmReset = () => {
      setSections([{ id: 'unassigned', name: 'Sin Asignar', items: [] }]);
      setSalesperson('Johalis Montilla');
      localStorage.removeItem('dossier_draft_v1');
      success('Proyecto reiniciado');
  };

  const openProductDetail = (product: Product) => {
    setViewProduct(product);
    setIsDetailModalOpen(true);
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadProject = (data: any) => {
     setConfirmationState({
        isOpen: true,
        type: 'load',
        payload: data
     });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confirmLoad = (data: any) => {
    setSections(data.sections || []);
    setSalesperson(data.salesperson || 'Johalis Montilla');
    setIsHistoryModalOpen(false);
    success('Proyecto cargado exitosamente');
  };

  // Add Toast Provider inside is tricky if Page is client but Layout has it.
  // Layout has it, so we can just use hook.

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
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <span>Vendedor:</span>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors">
                    <User size={10} />
                    <input 
                        className="bg-transparent border-none outline-none text-white w-24" 
                        value={salesperson}
                        onChange={(e) => setSalesperson(e.target.value)}
                    />
                    <Edit2 size={8} className="opacity-50" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={handleReset}
                className="p-2 text-white/40 hover:text-red-500 transition-colors"
                title="Nuevo Proyecto (Borrar Borrador)"
             >
                <Trash2 size={18} />
             </button>
             
             <Link 
                href="/inventory"
                className="p-2 text-white/40 hover:text-luxury-gold transition-colors"
                title="Gestión de Inventario"
             >
                <ShoppingBag size={18} />
             </Link>
             
             <button 
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/60 text-xs hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
             >
                <Clock size={14} /> Historial
             </button>

             <div className="bg-luxury-gold/10 px-4 py-2 rounded-full border border-luxury-gold/20 flex items-center gap-2">
                <ShoppingBag size={16} className="text-luxury-gold" />
                <span className="text-luxury-gold font-bold">
                    {sections.reduce((acc, s) => acc + s.items.length, 0)} Items
                </span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        {/* --- DND ZONES (SECTIONS) --- */}
        <div className="mb-12">
            <div className="flex justify-between items-end mb-6 min-h-[40px]">
                <h2 className="text-white/40 text-sm uppercase tracking-wider font-bold">Organización por Ambientes</h2>
                
                {isAddingSection ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Nombre del Área (ej: Baño Visitas)"
                      className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-luxury-gold w-64"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmAddSection();
                        if (e.key === 'Escape') cancelAddSection();
                      }}
                    />
                    <button 
                      onClick={confirmAddSection}
                      className="p-1 bg-luxury-gold text-black rounded hover:bg-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    <button 
                      onClick={cancelAddSection}
                      className="p-1 text-white/50 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                      onClick={() => setIsAddingSection(true)}
                      className="flex items-center gap-2 text-luxury-gold hover:text-white transition-colors text-sm group"
                  >
                      <span className="w-5 h-5 rounded-full border border-luxury-gold flex items-center justify-center group-hover:bg-luxury-gold group-hover:text-black transition-colors">
                        <Plus size={12} />
                      </span>
                      Add Area
                  </button>
                )}
            </div>

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {sections.map(section => (
                    <DroppableSection 
                        key={section.id} 
                        section={section}
                        onRename={renameSection}
                        onRemoveSection={removeSection}
                        onUpdateProduct={updateProduct}
                        onRemoveProduct={removeProduct}
                        onDuplicateProduct={handleDuplicate}
                        onMoveProduct={moveProductToSection}
                        availableSections={sections.map(s => ({ id: s.id, name: s.name }))}
                    />
                ))}

                <DragOverlay>
                    {activeId ? (
                        <ProductCard 
                           product={sections.flatMap(s => s.items).find(i => i.id === activeId)!} 
                           onUpdate={updateProduct} 
                           onRemove={removeProduct} 
                           onDuplicate={handleDuplicate}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>

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
               ${sections.reduce((total, section) => 
                  total + section.items.reduce((sum, p) => sum + (p.price * (1 - (p.discount || 0)/100)), 0), 0
               ).toFixed(2)}
            </p>
          </div>
          

          
          <div className="flex items-center gap-6">
             {/* Hide Prices Toggle */}
             <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <input
                  type="checkbox"
                  id="mainHidePrices"
                  checked={hidePrices}
                  onChange={(e) => setHidePrices(e.target.checked)}
                  className="h-4 w-4 rounded border border-white/20 bg-black/50 text-luxury-gold focus:ring-1 focus:ring-luxury-gold checked:bg-luxury-gold cursor-pointer"
                />
                <label htmlFor="mainHidePrices" className="text-xs font-medium text-white/80 cursor-pointer select-none uppercase tracking-wider">
                  Ocultar Precios
                </label>
             </div>

             <button 
               disabled={sections.every(s => s.items.length === 0) || generating}
               onClick={handleGenerateClick}
               className="btn-primary px-8 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all text-black font-bold"
               style={{background: 'linear-gradient(135deg, #C9A84C 0%, #F5D061 100%)'}}
             >
               <FileText size={20} /> 
               {generating ? 'Generando...' : 'Generar PDF'}
             </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <DossierConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfirm={generateDossier}
        isGenerating={generating}
      />

      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onLoad={handleLoadProject}
        currentState={{ sections, salesperson }}
      />

      <ProductDetailModal 
        isOpen={isDetailModalOpen}
        product={viewProduct}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToDossier={handleAddMultiple}
      />

      <ConfirmationModal 
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
            if (confirmationState.type === 'reset') confirmReset();
            if (confirmationState.type === 'load') confirmLoad(confirmationState.payload);
        }}
        title={confirmationState.type === 'reset' ? '¿Nuevo Proyecto?' : '¿Cargar Proyecto?'}
        message={
            confirmationState.type === 'reset' 
            ? 'Se borrará el borrador actual y no podrás recuperarlo.' 
            : 'Se reemplazará el borrador actual con la versión guardada.'
        }
        confirmText={confirmationState.type === 'reset' ? 'Reiniciar' : 'Cargar'}
        isDestructive={confirmationState.type === 'reset'}
      />

      <VoiceDealCreator />
    </div>
  );
}
