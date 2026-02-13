'use client';

import { X, Save, Copy } from 'lucide-react';

interface SaveOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOverwrite: () => void;
  onSaveNew: () => void;
  existingProjectName: string;
}

export default function SaveOptionsModal({ 
  isOpen, 
  onClose, 
  onOverwrite, 
  onSaveNew,
  existingProjectName
}: SaveOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-luxury-black w-full max-w-md rounded-2xl border border-luxury-gold/30 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-luxury-gold/5 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-luxury-gold">Proyecto Existente</h2>
            <p className="text-white/60 text-sm mt-1">
              Ya existe un proyecto llamado <span className="text-white font-medium">&quot;{existingProjectName}&quot;</span>.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/30 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
            <p className="text-white/80 text-sm">
                ¿Deseas actualizar el proyecto actual con los nuevos cambios o guardar una copia nueva?
            </p>

            <div className="grid gap-3">
                <button 
                    onClick={onOverwrite}
                    className="flex items-center justify-center gap-3 p-4 rounded-xl bg-luxury-gold text-black font-bold hover:bg-white transition-all transform hover:scale-[1.02]"
                >
                    <Save size={18} />
                    Sobrescribir Existente
                </button>

                <button 
                    onClick={onSaveNew}
                    className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all hover:border-white/20"
                >
                    <Copy size={18} />
                    Guardar como Nuevo
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 flex justify-center">
            <button 
                onClick={onClose}
                className="text-white/40 hover:text-white text-sm transition-colors"
            >
                Cancelar Operación
            </button>
        </div>

      </div>
    </div>
  );
}
