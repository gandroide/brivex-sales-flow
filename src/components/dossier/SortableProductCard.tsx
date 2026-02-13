import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProductCard from './ProductCard';

interface SortableProductCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any; 
  onUpdate: (id: string, field: 'discount' | 'note' | 'features', value: number | string | string[]) => void;
  onRemove: (id: string) => void;
}

export default function SortableProductCard({ product, onUpdate, onRemove }: SortableProductCardProps) {
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
       <ProductCard product={product} onUpdate={onUpdate} onRemove={onRemove} />
    </div>
  );
}
