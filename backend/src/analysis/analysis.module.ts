import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { ReportsModule } from '../reports/reports.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ReportsModule, UsersModule],
  providers: [AnalysisService],
  controllers: [AnalysisController],
})
export class AnalysisModule {}
