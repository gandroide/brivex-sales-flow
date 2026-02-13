
'use client';
import { useState } from 'react';
import AudioRecorder from '@/components/voice/AudioRecorder';
import { Loader2, ArrowLeft, CheckCircle, Save } from 'lucide-react';
import Link from 'next/link';

interface DealData {
  client_name: string;
  deal_title: string;
  value: number;
  stage: string;
  next_step: string;
  products?: string[];
}

export default function VoicePage() {
  const [step, setStep] = useState<'record' | 'processing' | 'review' | 'success'>('record');
  const [transcription, setTranscription] = useState('');
  const [extractedData, setExtractedData] = useState<DealData>({
    client_name: '',
    deal_title: '',
    value: 0,
    stage: 'Lead In',
    next_step: '',
  });
  const [saving, setSaving] = useState(false);

  const processAudio = async (audioBlob: Blob) => {
    setStep('processing');
    URL.createObjectURL(audioBlob); // Keeps the blob available if needed for playback

    try {
      // 1. Transcribe (Gemini)
      const formData = new FormData();
      formData.append('file', audioBlob);

      const transRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
      const transData = await transRes.json();
      
      if (transData.error) throw new Error(transData.error);
      setTranscription(transData.text);

      // 2. Extract Data (Gemini Multimodal)
      // We send the SAME audio file to this endpoint now
      const extractFormData = new FormData();
      extractFormData.append('file', audioBlob);

      const extractRes = await fetch('/api/voice/extract', {
        method: 'POST',
        // Content-Type header not needed for FormData, browser sets it with boundary
        body: extractFormData,
      });
      const extractData = await extractRes.json();
      
      if (extractData.error) throw new Error(extractData.error);
      setExtractedData(extractData);
      
      setStep('review');
    } catch (error) {
      console.error(error);
      alert('Error procesando audio. Intente nuevamente.');
      setStep('record'); // Reset on error
    }
  };

  const saveToPipedrive = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/pipedrive/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setStep('success');
    } catch (error) {
      console.error(error);
      alert('Error guardando en Pipedrive.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (field: keyof DealData, value: string | number) => {
    setExtractedData({ ...extractedData, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Voice Bridge</h1>
          <p className="text-white/50">Convierte voz en Deals de Pipedrive</p>
        </div>
      </div>

      {step === 'record' && (
        <div className="card">
          <AudioRecorder onAudioReady={processAudio} />
        </div>
      )}

      {step === 'processing' && (
        <div className="card py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-luxury-gold mb-4" size={48} />
          <p className="text-lg font-semibold">Procesando audio...</p>
          <p className="text-white/50 text-sm">Transcribiendo y analizando con IA</p>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <div className="card bg-luxury-gold/5 border-luxury-gold/20">
            <h3 className="text-xs uppercase tracking-widest text-luxury-gold mb-2">Transcripción</h3>
            <p className="italic text-white/80">&quot;{transcription}&quot;</p>
          </div>

          <div className="card space-y-4">
            <h3 className="font-bold text-lg mb-4">Revisar Datos del Deal</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/50 block mb-1">Nombre Cliente</label>
                <input 
                  value={extractedData.client_name}
                  onChange={(e) => handleEdit('client_name', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-white/50 block mb-1">Valor Estimado ($)</label>
                <input 
                  type="number"
                  value={extractedData.value}
                  onChange={(e) => handleEdit('value', Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/50 block mb-1">Título del Deal</label>
              <input 
                value={extractedData.deal_title}
                onChange={(e) => handleEdit('deal_title', e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/50 block mb-1">Etapa Sugerida</label>
                <select 
                  value={extractedData.stage}
                  onChange={(e) => handleEdit('stage', e.target.value)}
                  className="input-field appearance-none"
                >
                  <option value="Lead In">Lead In</option>
                  <option value="Contact Made">Contact Made</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won (Cerrado)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/50 block mb-1">Próximo Paso</label>
                <input 
                  value={extractedData.next_step}
                  onChange={(e) => handleEdit('next_step', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            
            <button 
              onClick={saveToPipedrive}
              disabled={saving}
              className="btn-primary w-full mt-6"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {saving ? 'Guardando...' : 'Crear Deal en Pipedrive'}
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="card py-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Deal Creado!</h2>
          <p className="text-white/50 mb-8">La información se ha sincronizado con Pipedrive correctamente.</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setStep('record')}
              className="btn-secondary"
            >
              Nueva Nota de Voz
            </button>
            <Link href="/" className="btn-primary">
              Volver al Inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
