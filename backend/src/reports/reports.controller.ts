import { Controller, Get, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyReports(@Request() req) {
    return this.reportsService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getReport(@Param('id') id: string, @Request() req) {
    const report = await this.reportsService.findById(id);
    if (!report) throw new NotFoundException('Reporte no encontrado');
    return report;
  }
}
