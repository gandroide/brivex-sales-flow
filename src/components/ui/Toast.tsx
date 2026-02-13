import { useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
}

export default function Toast({ id, message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 3000); // Auto dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="bg-black/90 backdrop-blur-md border border-luxury-gold/50 text-luxury-gold px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]"
      style={{ boxShadow: '0 10px 30px -10px rgba(212, 175, 55, 0.3)' }}
    >
      <div className={`p-1 rounded-full ${type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-luxury-gold/10 text-luxury-gold'}`}>
        {type === 'error' ? <AlertCircle size={18} /> : 
         type === 'success' ? <Check size={18} /> : 
         <AlertCircle size={18} />} {/* Default icon */}
      </div>
      
      <span className="flex-1 font-medium text-sm text-white/90">{message}</span>
      
      <button 
        onClick={() => onDismiss(id)}
        className="text-white/30 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
