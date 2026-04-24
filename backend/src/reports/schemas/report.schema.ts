import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: 'processing' })
  status: string; // 'processing' | 'completed' | 'error'

  @Prop({ default: 0 })
  duration: number; // minutes

  @Prop({ default: 0 })
  wordCount: number;

  @Prop({ default: null })
  overallLevel: string;

  @Prop({ default: 0 })
  overallScore: number;

  @Prop({ type: Object, default: {} })
  dimensions: {
    fluency: { level: string; score: number; observations: string };
    pronunciation: { level: string; score: number; observations: string };
    grammar: { level: string; score: number; observations: string };
    vocabulary: { level: string; score: number; observations: string };
    interaction: { level: string; score: number; observations: string };
  };

  @Prop({ type: Array, default: [] })
  achievements: Array<{ title: string; description: string; icon: string }>;

  @Prop({ type: Array, default: [] })
  niceDone: string[];

  @Prop({ type: Array, default: [] })
  toImprove: string[];

  @Prop({ type: Object, default: {} })
  vocabularyStats: {
    activeVocabularyEstimate: number;
    uniqueWords: number;
    rareWordsPercentage: number;
    frequentWordsPercentage: number;
    repetitions: Array<{ word: string; count: number }>;
    suggestions: Array<{ word: string; level: string; synonyms: string[] }>;
    rephrasing: Array<{ original: string; native: string }>;
    wordsByLevel: Array<{ level: string; percentage: number }>;
  };

  @Prop({ type: Object, default: {} })
  pronunciationStats: {
    speechRate: string;
    fillerWords: string[];
    totalFillerWordCount: number;
    issues: string[];
  };

  @Prop({ type: Object, default: {} })
  grammarStats: {
    structuresUsed: string[];
    errors: Array<{ original: string; correction: string; explanation: string }>;
    advancedConstructionsCount: number;
  };

  @Prop({ type: Array, default: [] })
  questionAnalyses: any[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);
