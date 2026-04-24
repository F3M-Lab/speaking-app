import { Document, Types } from 'mongoose';
export type ReportDocument = Report & Document;
export declare class Report {
    userId: Types.ObjectId;
    status: string;
    duration: number;
    wordCount: number;
    overallLevel: string;
    overallScore: number;
    dimensions: {
        fluency: {
            level: string;
            score: number;
            observations: string;
        };
        pronunciation: {
            level: string;
            score: number;
            observations: string;
        };
        grammar: {
            level: string;
            score: number;
            observations: string;
        };
        vocabulary: {
            level: string;
            score: number;
            observations: string;
        };
        interaction: {
            level: string;
            score: number;
            observations: string;
        };
    };
    achievements: Array<{
        title: string;
        description: string;
        icon: string;
    }>;
    niceDone: string[];
    toImprove: string[];
    vocabularyStats: {
        activeVocabularyEstimate: number;
        uniqueWords: number;
        rareWordsPercentage: number;
        frequentWordsPercentage: number;
        repetitions: Array<{
            word: string;
            count: number;
        }>;
        suggestions: Array<{
            word: string;
            level: string;
            synonyms: string[];
        }>;
        rephrasing: Array<{
            original: string;
            native: string;
        }>;
        wordsByLevel: Array<{
            level: string;
            percentage: number;
        }>;
    };
    pronunciationStats: {
        speechRate: string;
        fillerWords: string[];
        totalFillerWordCount: number;
        issues: string[];
    };
    grammarStats: {
        structuresUsed: string[];
        errors: Array<{
            original: string;
            correction: string;
            explanation: string;
        }>;
        advancedConstructionsCount: number;
    };
    questionAnalyses: any[];
}
export declare const ReportSchema: import("mongoose").Schema<Report, import("mongoose").Model<Report, any, any, any, Document<unknown, any, Report, any, {}> & Report & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Report, Document<unknown, {}, import("mongoose").FlatRecord<Report>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Report> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
