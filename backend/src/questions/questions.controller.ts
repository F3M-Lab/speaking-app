import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  generateQuestions() {
    return this.questionsService.generateQuestions();
  }
}
