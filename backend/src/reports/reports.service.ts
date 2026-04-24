import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report.name) private reportModel: Model<ReportDocument>) {}

  async create(userId: string): Promise<ReportDocument> {
    const report = new this.reportModel({ userId: new Types.ObjectId(userId) });
    return report.save();
  }

  async update(reportId: string, data: Partial<Report>): Promise<ReportDocument> {
    return this.reportModel.findByIdAndUpdate(reportId, data, { new: true }).exec();
  }

  async findById(reportId: string): Promise<ReportDocument | null> {
    return this.reportModel.findById(reportId).exec();
  }

  async findByUser(userId: string): Promise<ReportDocument[]> {
    return this.reportModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }
}
