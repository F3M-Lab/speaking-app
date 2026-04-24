import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
export declare class ReportsService {
    private reportModel;
    constructor(reportModel: Model<ReportDocument>);
    create(userId: string): Promise<ReportDocument>;
    update(reportId: string, data: Partial<Report>): Promise<ReportDocument>;
    findById(reportId: string): Promise<ReportDocument | null>;
    findByUser(userId: string): Promise<ReportDocument[]>;
}
