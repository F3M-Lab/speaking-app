import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getMyReports(req: any): Promise<import("./schemas/report.schema").ReportDocument[]>;
    getReport(id: string, req: any): Promise<import("./schemas/report.schema").ReportDocument>;
}
