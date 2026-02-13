'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-luxury-black w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 text-center">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-luxury-gold/10 text-luxury-gold'}`}>
                <AlertTriangle size={24} />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-white/60 text-sm">{message}</p>
        </div>

        <div className="flex border-t border-white/10">
            <button 
                onClick={onClose}
                className="flex-1 py-4 text-white/50 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
            >
                {cancelText}
            </button>
            <div className="w-[1px] bg-white/10"></div>
            <button 
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
                className={`flex-1 py-4 transition-colors text-sm font-bold ${isDestructive ? 'text-red-500 hover:bg-red-500/10' : 'text-luxury-gold hover:bg-luxury-gold/10'}`}
            >
                {confirmText}
            </button>
        </div>

      </div>
    </div>
  );
}
