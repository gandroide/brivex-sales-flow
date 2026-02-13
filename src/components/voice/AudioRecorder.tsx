
'use client';
import { useState, useRef } from 'react';
import { Mic, StopCircle, Upload, X } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
}

export default function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioReady(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('No se pudo acceder al micrófono. Por favor verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      onAudioReady(file);
    }
  };

  const resetAudio = () => {
    setAudioUrl(null);
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-luxury-dark-gray/50 rounded-2xl border border-white/10 relative overflow-hidden">
      {/* Background Pulse Animation */}
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 bg-red-500/20 rounded-full animate-ping" />
        </div>
      )}

      {!audioUrl ? (
        <div className="flex flex-col items-center gap-6 z-10 w-full">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-luxury-gold hover:bg-luxury-gold-hover'
            }`}
          >
            {isRecording ? (
              <StopCircle size={40} className="text-white" />
            ) : (
              <Mic size={40} className="text-black" />
            )}
          </button>
          
          <p className="text-white/50 text-sm font-medium">
            {isRecording ? 'Grabando... Toca para detener' : 'Toca para grabar nota de voz'}
          </p>

          <div className="w-full flex items-center justify-center gap-4 border-t border-white/10 pt-6 mt-2">
            <span className="text-xs text-white/30 uppercase tracking-widest">O subir archivo</span>
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white/70">
              <Upload size={16} />
              <span>WhatsApp Audio (.ogg, .mp3)</span>
              <input 
                type="file" 
                accept="audio/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4 z-10">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                <Mic size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Nota de voz lista</p>
                <p className="text-xs text-white/50">Lista para procesar</p>
              </div>
            </div>
            
            <button 
              onClick={resetAudio}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <audio src={audioUrl} controls className="w-full opacity-70" />
        </div>
      )}
    </div>
  );
}
