import { useEffect, useState } from 'react';
import api from '../../services/api';

const STEPS = [
  { icon: '🧠', text: 'Midiendo tu fluidez' },
  { icon: '🎙', text: 'Analizando tu ritmo de habla' },
  { icon: '🌐', text: 'Identificando tu nivel de confianza' },
  { icon: '📖', text: 'Analizando errores gramaticales' },
  { icon: '⏳', text: 'Generando tus resultados' },
];

interface Props {
  reportId: string;
  onDone: () => void;
}

export default function ProcessingScreen({ reportId, onDone }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex(i => (i + 1) % STEPS.length);
    }, 2500);

    const pollInterval = setInterval(async () => {
      try {
        const { data } = await api.get(`/analysis/status/${reportId}`);
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(pollInterval);
          clearInterval(stepInterval);
          setTimeout(onDone, 1000);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(pollInterval);
    };
  }, [reportId, onDone]);

  const step = STEPS[stepIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-12">SpeakingApp está analizando tu habla</h1>
      <div className="text-6xl mb-6">{step.icon}</div>
      <p className="text-lg font-semibold text-gray-800 mb-8">{step.text}</p>
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${i <= stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400 mt-8">
        Puedes revisar los resultados en la página{' '}
        <span className="text-blue-500 font-medium">Mis reportes</span>
      </p>
    </div>
  );
}
