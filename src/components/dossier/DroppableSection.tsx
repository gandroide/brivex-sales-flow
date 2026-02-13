import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableProductCard from './SortableProductCard';
import { Edit2, Check, Trash2, X } from 'lucide-react';

interface Product {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface SectionProps {
  section: {
    id: string;
    name: string;
    items: Product[];
  };
  onRename: (id: string, newName: string) => void;
  onRemoveSection: (id: string) => void;
  onUpdateProduct: (id: string, field: 'discount' | 'note' | 'features', value: number | string | string[]) => void;
  onRemoveProduct: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDuplicateProduct: (product: any) => void;
}


export default function DroppableSection({ section, onRename, onRemoveSection, onUpdateProduct, onRemoveProduct, onDuplicateProduct }: SectionProps) {
  const { setNodeRef } = useDroppable({
    id: section.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedName, setEditedName] = useState(section.name);

  const handleRename = () => {
    if (editedName.trim()) {
      onRename(section.id, editedName);
      setIsEditing(false);
    }
  };

  return (
    <div ref={setNodeRef} className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input 
                        className="bg-transparent border-b border-luxury-gold text-xl font-bold text-white focus:outline-none"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        autoFocus
                    />
                    <button onClick={handleRename} className="text-green-400 hover:text-green-300"><Check size={18} /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 group">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">{section.name}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity hover:text-luxury-gold">
                        <Edit2 size={14} />
                    </button>
                    <span className="bg-luxury-gold/20 text-luxury-gold text-xs px-2 py-0.5 rounded-full ml-2">
                        {section.items.length} Items
                    </span>
                </div>
            )}
        </div>
        
        {section.id !== 'unassigned' && (
            isDeleting ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-200 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                    <span className="text-red-400 text-xs font-medium">¿Eliminar sección?</span>
                    <div className="flex items-center gap-2 border-l border-red-500/20 pl-2">
                        <button 
                            onClick={() => onRemoveSection(section.id)} 
                            className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            Sí
                        </button>
                        <button 
                            onClick={() => setIsDeleting(false)} 
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsDeleting(true)} 
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-all text-white/20 hover:text-red-400"
                >
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">Eliminar</span>
                    <Trash2 size={16} />
                </button>
            )
        )}
      </div>

      <SortableContext 
        items={section.items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4 min-h-[100px]"> 
          {section.items.length === 0 && (
             <div className="h-24 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-white/20 text-sm italic">
                Arrastra productos aquí
             </div>
          )}
          {section.items.map((product) => (
            <SortableProductCard 
              key={product.id} 
              product={product} 
              onUpdate={onUpdateProduct} 
              onRemove={onRemoveProduct} 
              onDuplicate={onDuplicateProduct}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
