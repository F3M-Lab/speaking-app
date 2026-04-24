import { QuestionsService } from './questions.service';
export declare class QuestionsController {
    private questionsService;
    constructor(questionsService: QuestionsService);
    generateQuestions(): Promise<import("./questions.service").Question[]>;
}
