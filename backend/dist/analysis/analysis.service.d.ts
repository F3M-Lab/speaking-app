import { ReportsService } from '../reports/reports.service';
import { UsersService } from '../users/users.service';
import { Question } from '../questions/questions.service';
interface QuestionWithAudio {
    question: Question;
    audioBase64: string;
    audioMimeType: string;
}
export declare class AnalysisService {
    private reportsService;
    private usersService;
    private getGeminiClient;
    constructor(reportsService: ReportsService, usersService: UsersService);
    createSession(userId: string): Promise<string>;
    analyzeSubmission(reportId: string, userId: string, questionsWithAudio: QuestionWithAudio[]): Promise<void>;
    private analyzeQuestionAudio;
    private buildQuestionContext;
    private getNoResponseAnalysis;
    private getFallbackAnalysis;
    private aggregateAnalyses;
}
export {};
