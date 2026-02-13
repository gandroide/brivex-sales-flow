import { useState } from 'react';
import { X, FileText, Calendar, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DossierConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { clientName: string; projectName: string; date: string }) => void;
  isGenerating: boolean;
}

export default function DossierConfigModal({ isOpen, onClose, onConfirm, isGenerating }: DossierConfigModalProps) {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ clientName, projectName, date });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="text-luxury-gold" size={20} />
                  Configurar Dossier
                </h3>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Client Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-bold flex items-center gap-2">
                    <User size={14} /> Cliente
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                  />
                </div>

                {/* Project Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-bold flex items-center gap-2">
                    <Building size={14} /> Proyecto (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Casa de Playa - Punta Cana"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-bold flex items-center gap-2">
                    <Calendar size={14} /> Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-luxury-gold focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex-1 py-3 bg-luxury-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? 'Generando...' : 'Descargar PDF'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
