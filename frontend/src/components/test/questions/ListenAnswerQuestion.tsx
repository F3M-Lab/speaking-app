import { Question } from '../../../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Play, Pause } from 'lucide-react';

interface Props {
  question: Question;
  onListenPhaseEnd: () => void;
}

const estimateDuration = (text: string, rate = 0.9): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(5, Math.ceil(words / ((150 * rate) / 60)));
};

const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function ListenAnswerQuestion({ question, onListenPhaseEnd }: Props) {
  const text = question.audioText ?? '';
  const audioDuration = estimateDuration(text);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(audioDuration * 3);

  const elapsedRef = useRef(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndRef = useRef(onListenPhaseEnd);
  onEndRef.current = onListenPhaseEnd;

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      elapsedRef.current = Math.min(elapsedRef.current + 0.1, audioDuration);
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= audioDuration) {
        stopProgressTracking();
      }
    }, 100);
  }, [audioDuration, stopProgressTracking]);

  const stopPlayback = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    stopProgressTracking();
  }, [stopProgressTracking]);

  const playFrom = useCallback((offsetSeconds: number) => {
    stopPlayback();

    // Approximate char offset from time offset
    const charOffset = Math.floor((offsetSeconds / audioDuration) * text.length);
    const slice = text.slice(charOffset);
    if (!slice.trim()) return;

    elapsedRef.current = offsetSeconds;
    setElapsed(offsetSeconds);

    const utterance = new SpeechSynthesisUtterance(slice);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setIsPlaying(true);
      startProgressTracking();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      stopProgressTracking();
      elapsedRef.current = audioDuration;
      setElapsed(audioDuration);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      stopProgressTracking();
    };

    window.speechSynthesis.speak(utterance);
  }, [text, audioDuration, stopPlayback, startProgressTracking, stopProgressTracking]);

  // Mount: auto-play + start countdown
  useEffect(() => {
    playFrom(0);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          onEndRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.speechSynthesis.cancel();
      stopProgressTracking();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    playFrom(fraction * audioDuration);
  };

  const handleSkip = () => {
    stopPlayback();
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    onListenPhaseEnd();
  };

  const progress = audioDuration > 0 ? (elapsed / audioDuration) * 100 : 0;
  const countdownFraction = countdown / (audioDuration * 3);
  const countdownColor = countdownFraction > 0.5 ? 'bg-blue-600' : countdownFraction > 0.25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="text-center max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.content}</h2>

      {/* Audio player */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
          {isPlaying ? (
            <button
              onClick={stopPlayback}
              className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 flex-shrink-0 transition-colors"
            >
              <Pause className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              onClick={() => playFrom(elapsed < audioDuration ? elapsed : 0)}
              className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 flex-shrink-0 transition-colors"
            >
              <Play className="w-4 h-4 ml-0.5" />
            </button>
          )}

          {/* Seekable progress bar */}
          <div
            className="flex-1 bg-gray-200 rounded-full h-2.5 cursor-pointer relative group"
            onClick={handleSeek}
          >
            <div
              className="bg-gray-800 h-2.5 rounded-full pointer-events-none"
              style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-gray-900 rounded-full pointer-events-none shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>

          <span className="text-xs text-gray-400 font-mono flex-shrink-0">
            {formatTime(audioDuration)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Haz clic en la barra para ir a cualquier parte del audio</p>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="mb-6 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        <Mic className="w-4 h-4" />
        Saltar preparación
      </button>

      {/* Countdown pill */}
      <div className="flex flex-col items-center gap-2">
        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white ${countdownColor}`}>
          <span>⏱</span>
          <span>Tiempo para escuchar</span>
          <span className="font-mono">{formatTime(countdown)}</span>
        </div>
        <p className="text-xs text-gray-400">
          Puedes escuchar hasta {Math.floor(countdown / audioDuration) + 1} vez{Math.floor(countdown / audioDuration) !== 0 ? ' más' : ''} antes de grabar
        </p>
      </div>
    </div>
  );
}
