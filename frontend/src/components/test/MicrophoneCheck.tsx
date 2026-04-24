import { useState, useRef } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { Mic, Square, Play, ChevronRight } from 'lucide-react';

interface Props {
  onDone: () => void;
}

export default function MicrophoneCheck({ onDone }: Props) {
  const { isRecording, audioBlob, startRecording, stopRecording, resetRecording, error } = useAudioRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = async () => {
    resetRecording();
    setSeconds(0);
    await startRecording();
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const handleStop = () => {
    stopRecording();
    if (timerRef.current) clearInterval(timerRef.current);
    setHasRecorded(true);
  };

  const handlePlayback = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play();
    audio.onended = () => setIsPlaying(false);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-10">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Instrucciones</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test de Speaking en Inglés</h1>
        <p className="text-sm font-medium text-gray-500 mb-4">Configuración de micrófono y audio</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ul className="space-y-3">
            {[
              'Asegúrate de que tu micrófono esté encendido.',
              'Haz clic en "Iniciar grabación" y di: "Testing, 123. Testing, 123."',
              'Haz clic en "Detener" y luego reproduce tu grabación.',
              'Si el audio es muy suave o fuerte, ajusta la posición del micrófono.',
              'Consejo: Usa un auricular con cable para mejor calidad.',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-sm text-gray-600">{text}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm font-medium text-gray-600">Configura tu audio antes del test</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2.5">
                <span>🎙</span>
                <span className="text-sm font-medium">Micrófono</span>
              </div>
              {!isRecording ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  <Mic className="w-4 h-4" />
                  Iniciar grabación
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span className="font-mono">{fmt(seconds)}</span>
                </button>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {hasRecorded && audioBlob && (
              <button
                onClick={handlePlayback}
                disabled={isPlaying}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                <Play className="w-4 h-4" />
                {isPlaying ? 'Reproduciendo...' : 'Reproducir'}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-10">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
          <button onClick={onDone} className="btn-primary" disabled={!hasRecorded}>
            Iniciar Test
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
