import { useState } from 'react';
import { ChevronRight, MessageSquare, AlignLeft, Image, Headphones, AlertCircle, Clock, SkipForward } from 'lucide-react';

interface SlideItem {
  icon: React.ReactNode;
  text: string;
  bold?: boolean;
}

interface Slide {
  title: string;
  subtitle: string;
  items: SlideItem[];
  stats?: { label: string; icon: string }[];
}

const slides: Slide[] = [
  {
    title: 'Test de Speaking en Inglés',
    subtitle: 'Formato del test',
    items: [
      { icon: <MessageSquare className="w-4 h-4" />, text: 'Preguntas abiertas — 5 preguntas' },
      { icon: <MessageSquare className="w-4 h-4" />, text: 'Lectura en voz alta — 5 citas' },
      { icon: <AlignLeft className="w-4 h-4" />, text: 'Lectura de texto — 1 pasaje' },
      { icon: <Image className="w-4 h-4" />, text: 'Describe una imagen — 1 pregunta' },
      { icon: <Headphones className="w-4 h-4" />, text: 'Escucha y responde — 1 pregunta' },
    ],
    stats: [{ label: '13 Preguntas', icon: '?' }, { label: '~20 Minutos', icon: '⏱' }],
  },
  {
    title: 'Test de Speaking en Inglés',
    subtitle: 'Cómo funciona el temporizador',
    items: [
      { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'El test no puede pausarse ni guardarse.', bold: true },
      { icon: <Clock className="w-4 h-4" />, text: 'Cada pregunta tiene tiempo de preparación y tiempo de respuesta.' },
      { icon: <Clock className="w-4 h-4" />, text: 'El temporizador inicia automáticamente y no puede pausarse.' },
      { icon: <ChevronRight className="w-4 h-4" />, text: 'Al terminar el tiempo, la siguiente pregunta carga automáticamente.' },
      { icon: <SkipForward className="w-4 h-4" />, text: 'Puedes omitir el tiempo de preparación con el botón "Saltar".' },
    ],
  },
];

interface Props {
  onDone: () => void;
}

export default function InstructionsSlider({ onDone }: Props) {
  const [current, setCurrent] = useState(0);
  const isLast = current === slides.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-10 relative">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Instrucciones</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{slides[current].title}</h1>

        {slides[current].stats && (
          <div className="flex gap-4 mb-6">
            {slides[current].stats!.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                <span className="font-bold">{s.icon}</span>
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm font-medium text-gray-500 mb-4">{slides[current].subtitle}</p>

        <ul className="space-y-3 mb-10">
          {slides[current].items.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <span className={`text-gray-700 text-sm ${item.bold ? 'font-semibold' : ''}`}>{item.text}</span>
            </li>
          ))}
        </ul>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => isLast ? onDone() : setCurrent(c => c + 1)}
            className="btn-primary"
          >
            {isLast ? 'Continuar' : 'Siguiente'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
