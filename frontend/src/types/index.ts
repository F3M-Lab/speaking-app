export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type QuestionType = 'open-ended' | 'read-aloud-quote' | 'read-aloud-text' | 'describe-image' | 'listen-answer' | 'you-should-say' | 'information-seeking';

export interface User {
  id: string;
  name: string;
  email: string;
  currentLevel?: CEFRLevel;
  testsCompleted?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  instructions?: string;
  quote?: string;
  passage?: string;
  imageDescription?: string;
  imageDescriptions?: string[];
  audioText?: string;
  audioQuestion?: string;
  shouldSay?: string[];
  shouldAskAbout?: string[];
  speakTime: number;
  prepTime: number;
}

export interface DimensionScore {
  level: CEFRLevel;
  score: number;
  observations: string;
}

export interface Achievement {
  title: string;
  description: string;
  icon: string;
}

export interface RepetitionItem {
  word: string;
  count: number;
}

export interface VocabSuggestion {
  word: string;
  level: CEFRLevel;
  synonyms: string[];
}

export interface Rephrasing {
  original: string;
  native: string;
}

export interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
}

export interface Report {
  _id: string;
  userId: string;
  status: 'processing' | 'completed' | 'error';
  createdAt: string;
  duration: number;
  wordCount: number;
  overallLevel: CEFRLevel;
  overallScore: number;
  dimensions: {
    fluency: DimensionScore;
    pronunciation: DimensionScore;
    grammar: DimensionScore;
    vocabulary: DimensionScore;
    interaction: DimensionScore;
  };
  achievements: Achievement[];
  niceDone: string[];
  toImprove: string[];
  vocabularyStats: {
    activeVocabularyEstimate: number;
    uniqueWords: number;
    rareWordsPercentage: number;
    frequentWordsPercentage: number;
    repetitions: RepetitionItem[];
    suggestions: VocabSuggestion[];
    rephrasing: Rephrasing[];
    wordsByLevel: Array<{ level: CEFRLevel; percentage: number }>;
  };
  pronunciationStats: {
    speechRate: string;
    fillerWords: string[];
    totalFillerWordCount: number;
    issues: string[];
  };
  grammarStats: {
    structuresUsed: string[];
    errors: GrammarError[];
    advancedConstructionsCount: number;
  };
  questionAnalyses: any[];
}
