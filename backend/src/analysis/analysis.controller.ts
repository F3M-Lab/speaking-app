import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalysisService } from './analysis.service';
import { ReportsService } from '../reports/reports.service';
import { memoryStorage } from 'multer';

@Controller('analysis')
export class AnalysisController {
  constructor(
    private analysisService: AnalysisService,
    private reportsService: ReportsService,
  ) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  async createSession(@Request() req) {
    const reportId = await this.analysisService.createSession(req.user.id);
    return { reportId };
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('audios', 13, { storage: memoryStorage() }))
  async submitAnalysis(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('reportId') reportId: string,
    @Body('questionsJson') questionsJson: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibieron archivos de audio');
    }
    if (!reportId) {
      throw new BadRequestException('reportId es requerido');
    }
    if (!questionsJson) {
      throw new BadRequestException('questionsJson es requerido');
    }

    let questions: any[];
    try {
      questions = JSON.parse(questionsJson);
    } catch {
      throw new BadRequestException('questionsJson inválido');
    }

    const questionsWithAudio = files.map((file, index) => ({
      question: questions[index],
      audioBase64: file.buffer.toString('base64'),
      audioMimeType: file.mimetype || 'audio/webm',
    }));

    // Start analysis in background (non-blocking)
    this.analysisService.analyzeSubmission(reportId, req.user.id, questionsWithAudio);

    return { reportId, status: 'processing', message: 'Análisis en proceso' };
  }

  @Get('status/:reportId')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Param('reportId') reportId: string) {
    const report = await this.reportsService.findById(reportId);
    if (!report) return { status: 'not_found' };
    return { status: report.status, reportId };
  }
}
