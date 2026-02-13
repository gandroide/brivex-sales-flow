'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function VoiceDealCreator() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('error');
      setErrorMessage('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStop = async () => {
    setStatus('analyzing');
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    try {
      const response = await fetch('/api/pipedrive/voice-deal', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process voice note');
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000); // Reset after 3 seconds
    } catch (err: unknown) {
      console.error('Error processing voice note:', err);
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Error processing request.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      {/* Status Bubble */}
      {status !== 'idle' && (
        <div className={`
          px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-md mb-2
          ${status === 'recording' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
          ${status === 'analyzing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : ''}
          ${status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ''}
          ${status === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
        `}>
          {status === 'recording' && <span className="animate-pulse">🔴 Recording...</span>}
          {status === 'analyzing' && <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> AI Processing...</span>}
          {status === 'success' && <span className="flex items-center gap-2"><CheckCircle size={14} /> Deal Created!</span>}
          {status === 'error' && <span className="flex items-center gap-2"><AlertCircle size={14} /> {errorMessage}</span>}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={status === 'analyzing'}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105
          ${isRecording 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : status === 'analyzing'
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100' // Changed to white to match theme style or keep it distinct
          }
          ${status === 'idle' && 'bg-gradient-to-br from-luxury-gold to-yellow-600 text-black border border-white/20'} 
        `}
      >
        {status === 'analyzing' ? (
          <Loader2 className="animate-spin" size={24} />
        ) : isRecording ? (
          <Square size={24} fill="currentColor" />
        ) : (
          <Mic size={24} />
        )}
      </button>
    </div>
  );
}
