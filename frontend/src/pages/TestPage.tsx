import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../store/test.store';
import api from '../services/api';
import InstructionsSlider from '../components/test/InstructionsSlider';
import MicrophoneCheck from '../components/test/MicrophoneCheck';
import QuestionScreen from '../components/test/QuestionScreen';
import UploadingScreen from '../components/test/UploadingScreen';
import ProcessingScreen from '../components/test/ProcessingScreen';
import { Loader2 } from 'lucide-react';

export default function TestPage() {
  const navigate = useNavigate();
  const { phase, setPhase, questions, setQuestions, recordedAnswers, reportId, setReportId, reset } = useTestStore();
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    reset();
    setPhase('instructions');
  }, []);

  const handleInstructionsDone = async () => {
    setPhase('mic-check');
  };

  const handleMicCheckDone = async () => {
    setLoadingQuestions(true);
    setLoadError('');
    try {
      const { data: sessionData } = await api.post('/analysis/session');
      setReportId(sessionData.reportId);
      const { data: questionsData } = await api.post('/questions/generate');
      setQuestions(questionsData);
      setPhase('testing');
    } catch (err) {
      setLoadError('Error al cargar las preguntas. Intenta de nuevo.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleTestComplete = async () => {
    setPhase('uploading');
    try {
      const formData = new FormData();
      formData.append('reportId', reportId!);

      const questionsForAnalysis = recordedAnswers.map(a =>
        questions.find(q => q.id === a.questionId)!
      ).filter(Boolean);
      formData.append('questionsJson', JSON.stringify(questionsForAnalysis));

      recordedAnswers.forEach((answer, idx) => {
        const extension = answer.mimeType.includes('webm') ? 'webm' : answer.mimeType.includes('mp4') ? 'mp4' : 'ogg';
        formData.append('audios', answer.blob, `audio_${idx}.${extension}`);
      });

      await api.post('/analysis/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPhase('processing');
    } catch (err) {
      console.error('Submit error:', err);
      setPhase('processing');
    }
  };

  const handleProcessingDone = () => {
    navigate(`/report/${reportId}`);
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Estamos generando el cuestionario.</p>
          <p className="text-gray-400 text-sm mt-1">Esto puede tardar unos segundos</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center card p-8 max-w-md">
          <p className="text-red-600 font-medium mb-4">{loadError}</p>
          <button onClick={handleMicCheckDone} className="btn-primary">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {phase === 'instructions' && <InstructionsSlider onDone={handleInstructionsDone} />}
      {phase === 'mic-check' && <MicrophoneCheck onDone={handleMicCheckDone} />}
      {phase === 'testing' && questions.length > 0 && <QuestionScreen onComplete={handleTestComplete} />}
      {phase === 'uploading' && <UploadingScreen />}
      {phase === 'processing' && <ProcessingScreen reportId={reportId!} onDone={handleProcessingDone} />}
    </>
  );
}
