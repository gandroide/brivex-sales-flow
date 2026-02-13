'use client'; // Refresh file system

import { useState, useEffect } from 'react';
import { X, Clock, Loader2, Save, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import SaveOptionsModal from './SaveOptionsModal';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoad: (data: any) => void;
  currentState: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections: any[];
    salesperson: string;
  };
}

export default function HistoryModal({ isOpen, onClose, onLoad, currentState }: HistoryModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  
  // Save Fields
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  
  // Overwrite Logic
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false);
  const [existingProjectId, setExistingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dossiers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setHistory(data);
    if (error) console.error(error);
    setLoading(false);
  };

  const checkBeforeSave = async () => {
    if (!clientName || !projectName) {
      toastError('Por favor ingrese Cliente y Proyecto');
      return;
    }

    // Check for existing project with same name/client
    const { data } = await supabase
      .from('dossiers')
      .select('id')
      .eq('client_name', clientName)
      .eq('project_name', projectName)
      .maybeSingle();

    if (data) {
      setExistingProjectId(data.id);
      setIsSaveOptionsOpen(true);
    } else {
      executeSave(null);
    }
  };

  const executeSave = async (overwriteId: string | null) => {
    setSaving(true);
    try {
      const payload = {
        client_name: clientName,
        project_name: projectName,
        salesperson: currentState.salesperson,
        data: {
            sections: currentState.sections,
            salesperson: currentState.salesperson,
            savedAt: new Date().toISOString()
        }
      };

      let error;
      
      if (overwriteId) {
        // Update existing
        const { error: updateError } = await supabase
          .from('dossiers')
          .update(payload)
          .eq('id', overwriteId);
        error = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('dossiers')
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;
      
      success(overwriteId ? 'Proyecto actualizado correctamente' : 'Proyecto guardado exitosamente');
      
      if (!overwriteId) {
          // If bold new save, clear inputs? Maybe keep them.
          // setClientName('');
          // setProjectName('');
      }
      
      setIsSaveOptionsOpen(false);
      setExistingProjectId(null);
      fetchHistory(); // Refresh list
      
    } catch (error) {
      console.error(error);
      toastError('Error al guardar el proyecto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      // Confirmed delete
      deleteProject(id);
    } else {
      // First click - show confirmation
      setDeleteConfirmId(id);
      // Auto-revert after 3 seconds if not clicked
      setTimeout(() => setDeleteConfirmId(prev => prev === id ? null : prev), 3000);
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic UI update
    setHistory(prev => prev.filter(item => item.id !== id));
    setDeleteConfirmId(null);
    
    try {
      const { error } = await supabase.from('dossiers').delete().eq('id', id);
      if (error) throw error;
      success('Proyecto eliminado');
    } catch (err) {
      console.error(err);
      toastError('Error al eliminar el proyecto');
      fetchHistory(); // Revert state on error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-luxury-black w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-light text-white flex items-center gap-2">
            <Clock className="text-luxury-gold" /> Historial de Proyectos
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* SAVE SECTION */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Save size={14} /> Guardar Estado Actual
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input 
                        type="text" 
                        placeholder="Nombre del Cliente"
                        className="bg-black/20 border border-white/10 rounded px-3 py-2 text-white placeholder:text-white/20 focus:border-luxury-gold outline-none"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Nombre del Proyecto"
                        className="bg-black/20 border border-white/10 rounded px-3 py-2 text-white placeholder:text-white/20 focus:border-luxury-gold outline-none"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                    />
                </div>
                <button 
                    onClick={checkBeforeSave}
                    disabled={saving || !clientName || !projectName}
                    className="w-full py-2 bg-luxury-gold text-black font-bold rounded hover:bg-white transition-colors disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : 'Guardar en Base de Datos'}
                </button>
            </div>

            {/* LOAD SECTION */}
            <div>
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Proyectos Guardados</h3>
                
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-luxury-gold" />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-white/30 text-center italic">No hay proyectos guardados.</p>
                ) : (
                    <div className="space-y-2">
                        {history.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => onLoad(item.data)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl group transition-all text-left"
                            >
                                <div className="flex-1">
                                    <h4 className="font-bold text-white">{item.project_name}</h4>
                                    <p className="text-xs text-white/50">{item.client_name} • {item.salesperson}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-white/30 font-mono">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                    
                                    {/* Delete Button */}
                                    <button 
                                        onClick={(e) => handleDeleteClick(item.id, e)}
                                        className={`p-2 rounded-full transition-all ${
                                            deleteConfirmId === item.id 
                                            ? 'bg-red-500/20 text-red-500 w-24' 
                                            : 'bg-white/5 text-white/30 hover:bg-red-500/10 hover:text-red-500 w-8'
                                        } flex items-center justify-center`}
                                    >
                                        {deleteConfirmId === item.id ? (
                                            <span className="text-xs font-bold animate-pulse whitespace-nowrap">Confirmar?</span>
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                    </button>

                                    {/* Load/Download Indicator (Visual only as clicking row loads) */}
                                    <div className="bg-luxury-gold/20 text-luxury-gold p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download size={14} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

        </div>


        
        <SaveOptionsModal 
          isOpen={isSaveOptionsOpen}
          onClose={() => setIsSaveOptionsOpen(false)}
          onOverwrite={() => executeSave(existingProjectId)}
          onSaveNew={() => executeSave(null)}
          existingProjectName={projectName}
        />


      </div>
    </div>
  );
}
