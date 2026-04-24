export interface Question {
    id: string;
    type: 'open-ended' | 'read-aloud-quote' | 'read-aloud-text' | 'describe-image' | 'listen-answer' | 'you-should-say' | 'information-seeking';
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
export declare class QuestionsService {
    private anthropic;
    generateQuestions(): Promise<Question[]>;
}
