import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProductCard from './ProductCard';

interface SortableProductCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any; 
  onUpdate: (id: string, field: 'discount' | 'note' | 'features' | 'warranty_type' | 'warranty_duration', value: number | string | string[]) => void;
  onRemove: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDuplicate: (product: any) => void;
  onMove: (productId: string, newSectionId: string) => void;
  availableSections: { id: string; name: string }[];
}

export default function SortableProductCard({ product, onUpdate, onRemove, onDuplicate, onMove, availableSections }: SortableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
       {/* Wrap ProductCard but disable its internal drag handlers if any, though ProductCard is just display */}
       <ProductCard 
          product={product} 
          onUpdate={onUpdate} 
          onRemove={onRemove} 
          onDuplicate={onDuplicate} 
          onMove={onMove}
          availableSections={availableSections}
        />
    </div>
  );
}
