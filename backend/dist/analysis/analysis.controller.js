"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const analysis_service_1 = require("./analysis.service");
const reports_service_1 = require("../reports/reports.service");
const multer_1 = require("multer");
let AnalysisController = class AnalysisController {
    constructor(analysisService, reportsService) {
        this.analysisService = analysisService;
        this.reportsService = reportsService;
    }
    async createSession(req) {
        const reportId = await this.analysisService.createSession(req.user.id);
        return { reportId };
    }
    async submitAnalysis(req, files, reportId, questionsJson) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No se recibieron archivos de audio');
        }
        if (!reportId) {
            throw new common_1.BadRequestException('reportId es requerido');
        }
        if (!questionsJson) {
            throw new common_1.BadRequestException('questionsJson es requerido');
        }
        let questions;
        try {
            questions = JSON.parse(questionsJson);
        }
        catch {
            throw new common_1.BadRequestException('questionsJson inválido');
        }
        const questionsWithAudio = files.map((file, index) => ({
            question: questions[index],
            audioBase64: file.buffer.toString('base64'),
            audioMimeType: file.mimetype || 'audio/webm',
        }));
        this.analysisService.analyzeSubmission(reportId, req.user.id, questionsWithAudio);
        return { reportId, status: 'processing', message: 'Análisis en proceso' };
    }
    async getStatus(reportId) {
        const report = await this.reportsService.findById(reportId);
        if (!report)
            return { status: 'not_found' };
        return { status: report.status, reportId };
    }
};
exports.AnalysisController = AnalysisController;
__decorate([
    (0, common_1.Post)('session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('audios', 13, { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)('reportId')),
    __param(3, (0, common_1.Body)('questionsJson')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String, String]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "submitAnalysis", null);
__decorate([
    (0, common_1.Get)('status/:reportId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "getStatus", null);
exports.AnalysisController = AnalysisController = __decorate([
    (0, common_1.Controller)('analysis'),
    __metadata("design:paramtypes", [analysis_service_1.AnalysisService,
        reports_service_1.ReportsService])
], AnalysisController);
//# sourceMappingURL=analysis.controller.js.map