import { Question } from '../../../types';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  question: Question;
}

// Curated Unsplash photos for the album carousel
const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
  'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=80',
  'https://images.unsplash.com/photo-1530209078565-4a5e47b21b74?w=800&q=80',
  'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=800&q=80',
  'https://images.unsplash.com/photo-1494005612480-90f48f4a3c44?w=800&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800&q=80',
  'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=800&q=80',
];

const PHOTO_COUNT = 5;

const FIXED_INSTRUCTIONS = [
  'Where and when the photo was taken',
  'What / who is in the photo',
  'What is happening',
  'Why you keep the photo in your album',
  'What is so special about this photo? What emotions does it bring to you?',
];

function shufflePhotos(): string[] {
  const shuffled = [...PHOTO_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, PHOTO_COUNT);
}

export default function DescribeImageQuestion({ question }: Props) {
  const photos = useMemo(() => shufflePhotos(), [question.id]);
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full items-start">
      {/* Left: question + instructions + dots */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{question.content}</h2>
        <p className="text-sm text-gray-500 mb-2">Speak for 2-3 minutes, in your talk remember to speak about:</p>
        <ul className="text-sm text-gray-600 space-y-1 mb-5 list-disc list-inside">
          {FIXED_INSTRUCTIONS.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        {/* Dot navigation */}
        <div className="flex items-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? 'w-4 h-4 bg-gray-900'
                  : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-gray-400">{current + 1} / {photos.length}</span>
        </div>
      </div>

      {/* Right: carousel */}
      <div className="relative">
        <div className="rounded-xl overflow-hidden shadow-lg aspect-[4/3] bg-gray-100">
          <img
            key={current}
            src={photos[current]}
            alt={`Photo ${current + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://picsum.photos/seed/${current}/800/600`;
            }}
          />
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
