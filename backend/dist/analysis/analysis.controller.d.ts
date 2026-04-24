import { AnalysisService } from './analysis.service';
import { ReportsService } from '../reports/reports.service';
export declare class AnalysisController {
    private analysisService;
    private reportsService;
    constructor(analysisService: AnalysisService, reportsService: ReportsService);
    createSession(req: any): Promise<{
        reportId: string;
    }>;
    submitAnalysis(req: any, files: Express.Multer.File[], reportId: string, questionsJson: string): Promise<{
        reportId: string;
        status: string;
        message: string;
    }>;
    getStatus(reportId: string): Promise<{
        status: string;
        reportId?: undefined;
    } | {
        status: string;
        reportId: string;
    }>;
}
