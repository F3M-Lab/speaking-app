import { useEffect, useRef } from 'react';
import { useTestStore } from '../../store/test.store';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useTimer } from '../../hooks/useTimer';
import { X, ChevronRight, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OpenEndedQuestion from './questions/OpenEndedQuestion';
import ReadAloudQuoteQuestion from './questions/ReadAloudQuoteQuestion';
import ReadAloudTextQuestion from './questions/ReadAloudTextQuestion';
import DescribeImageQuestion from './questions/DescribeImageQuestion';
import ListenAnswerQuestion from './questions/ListenAnswerQuestion';
import YouShouldSayQuestion from './questions/YouShouldSayQuestion';
import InformationSeekingQuestion from './questions/InformationSeekingQuestion';

interface Props {
  onComplete: () => void;
}

type Phase = 'prep' | 'recording';

export default function QuestionScreen({ onComplete }: Props) {
  const navigate = useNavigate();
  const { questions, currentIndex, setCurrentIndex, addAnswer } = useTestStore();
  const { isRecording, audioBlob, mimeType, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const question = questions[currentIndex];
  const phaseRef = useRef<Phase>('prep');
  const isLastQuestion = currentIndex === questions.length - 1;
  const elapsedRef = useRef(0);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  const handleRecordingExpire = () => {
    if (isRecording) stopRecording();
  };

  const handlePrepExpire = async () => {
    phaseRef.current = 'recording';
    recordingTimer.reset(question.speakTime);
    recordingTimer.start();
    await startRecording();
  };

  const prepTimer = useTimer(question?.prepTime || 10, handlePrepExpire);
  const recordingTimer = useTimer(question?.speakTime || 30, handleRecordingExpire);

  useEffect(() => {
    navigatedRef.current = false;
    resetRecording();
    phaseRef.current = 'prep';
    if (question?.type === 'listen-answer') {
      // Prep is driven by audio playback — recording starts via handleAudioEnd callback
    } else if ((question?.prepTime || 0) > 0) {
      prepTimer.reset(question.prepTime);
      prepTimer.start();
    } else {
      handlePrepExpire();
    }
  }, [currentIndex]);

  useEffect(() => {
    if (audioBlob && !isRecording) {
      addAnswer({ questionId: question.id, blob: audioBlob, mimeType });
      setTimeout(() => advance(), 500);
    }
  }, [audioBlob, isRecording]);

  useEffect(() => {
    elapsedRef.current = 0;
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
    }, 1000);
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, []);

  const advance = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goNext = () => {
    prepTimer.stop();
    recordingTimer.stop();
    window.speechSynthesis.cancel();
    if (isRecording) {
      // stopRecording() will set audioBlob → useEffect → advance()
      stopRecording();
      return;
    }
    advance();
  };

  const skipPrep = () => {
    prepTimer.stop();
    handlePrepExpire();
  };

  const isPrep = phaseRef.current === 'prep' && prepTimer.isRunning;

  if (!question) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">SA</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">Pregunta:</span>
          <span className="font-medium text-gray-700">{currentIndex + 1} / {questions.length}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-4xl mx-auto w-full">
        {question.type === 'open-ended' && <OpenEndedQuestion question={question} />}
        {question.type === 'read-aloud-quote' && <ReadAloudQuoteQuestion question={question} />}
        {question.type === 'read-aloud-text' && <ReadAloudTextQuestion question={question} />}
        {question.type === 'describe-image' && <DescribeImageQuestion question={question} />}
        {question.type === 'listen-answer' && <ListenAnswerQuestion question={question} onListenPhaseEnd={handlePrepExpire} />}
        {question.type === 'you-should-say' && <YouShouldSayQuestion question={question} />}
        {question.type === 'information-seeking' && <InformationSeekingQuestion question={question} />}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {isPrep && question.prepTime > 0 && (
            <div className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium">
              <span>⏱</span>
              <span>Preparación</span>
              <span className="font-mono">{prepTimer.formattedTime}</span>
            </div>
          )}
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full font-medium animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full inline-block" />
              <span>Grabando</span>
              <span className="font-mono">{recordingTimer.formattedTime}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-end gap-2">
          {isPrep && (
            <button onClick={skipPrep} className="btn-secondary text-sm">
              <SkipForward className="w-4 h-4" />
              Saltar preparación
            </button>
          )}
          <button onClick={goNext} className="btn-primary">
            {isLastQuestion ? 'Finalizar' : 'Siguiente'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
