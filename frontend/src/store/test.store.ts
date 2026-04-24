import { create } from 'zustand';
import { Question } from '../types';

interface RecordedAnswer {
  questionId: string;
  blob: Blob;
  mimeType: string;
}

interface TestState {
  questions: Question[];
  currentIndex: number;
  recordedAnswers: RecordedAnswer[];
  phase: 'idle' | 'instructions' | 'mic-check' | 'testing' | 'uploading' | 'processing' | 'done';
  reportId: string | null;
  setQuestions: (questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  addAnswer: (answer: RecordedAnswer) => void;
  setPhase: (phase: TestState['phase']) => void;
  setReportId: (id: string) => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  questions: [],
  currentIndex: 0,
  recordedAnswers: [],
  phase: 'idle',
  reportId: null,

  setQuestions: (questions) => set({ questions }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  addAnswer: (answer) => set((state) => ({
    recordedAnswers: [...state.recordedAnswers.filter(a => a.questionId !== answer.questionId), answer],
  })),
  setPhase: (phase) => set({ phase }),
  setReportId: (id) => set({ reportId: id }),
  reset: () => set({
    questions: [],
    currentIndex: 0,
    recordedAnswers: [],
    phase: 'idle',
    reportId: null,
  }),
}));
