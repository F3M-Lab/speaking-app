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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const common_1 = require("@nestjs/common");
const genai_1 = require("@google/genai");
const reports_service_1 = require("../reports/reports.service");
const users_service_1 = require("../users/users.service");
const dimensionSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        level: { type: genai_1.Type.STRING, description: 'CEFR level: A1, A2, B1, B2, C1 or C2' },
        score: { type: genai_1.Type.INTEGER, description: 'Score 0-100' },
        observations: { type: genai_1.Type.STRING, description: 'Observations in Spanish' },
    },
    required: ['level', 'score', 'observations'],
};
const analysisSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        overallLevel: { type: genai_1.Type.STRING },
        overallScore: { type: genai_1.Type.INTEGER },
        wordCount: { type: genai_1.Type.INTEGER },
        dimensions: {
            type: genai_1.Type.OBJECT,
            properties: {
                fluency: dimensionSchema,
                pronunciation: dimensionSchema,
                grammar: dimensionSchema,
                vocabulary: dimensionSchema,
                interaction: dimensionSchema,
            },
            required: ['fluency', 'pronunciation', 'grammar', 'vocabulary', 'interaction'],
        },
        achievements: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    title: { type: genai_1.Type.STRING },
                    description: { type: genai_1.Type.STRING },
                    icon: { type: genai_1.Type.STRING },
                },
                required: ['title', 'description', 'icon'],
            },
        },
        niceDone: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        toImprove: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        pronunciationAnalysis: {
            type: genai_1.Type.OBJECT,
            properties: {
                speechRate: { type: genai_1.Type.STRING },
                fillerWords: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                fillerWordCount: { type: genai_1.Type.INTEGER },
                pausePattern: { type: genai_1.Type.STRING, description: 'In Spanish' },
                specificIssues: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
            },
            required: ['speechRate', 'fillerWords', 'fillerWordCount', 'pausePattern', 'specificIssues'],
        },
        vocabularyAnalysis: {
            type: genai_1.Type.OBJECT,
            properties: {
                uniqueWords: { type: genai_1.Type.INTEGER },
                rareWordsPercentage: { type: genai_1.Type.INTEGER },
                frequentWordsPercentage: { type: genai_1.Type.INTEGER },
                repetitions: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: { word: { type: genai_1.Type.STRING }, count: { type: genai_1.Type.INTEGER } },
                        required: ['word', 'count'],
                    },
                },
                suggestions: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            word: { type: genai_1.Type.STRING },
                            level: { type: genai_1.Type.STRING },
                            synonyms: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                        },
                        required: ['word', 'level', 'synonyms'],
                    },
                },
                rephrasing: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            original: { type: genai_1.Type.STRING },
                            native: { type: genai_1.Type.STRING },
                        },
                        required: ['original', 'native'],
                    },
                },
                wordsByLevel: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            level: { type: genai_1.Type.STRING },
                            percentage: { type: genai_1.Type.INTEGER },
                        },
                        required: ['level', 'percentage'],
                    },
                },
            },
            required: ['uniqueWords', 'rareWordsPercentage', 'frequentWordsPercentage', 'repetitions', 'suggestions', 'rephrasing', 'wordsByLevel'],
        },
        grammarAnalysis: {
            type: genai_1.Type.OBJECT,
            properties: {
                structuresUsed: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                errors: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            original: { type: genai_1.Type.STRING },
                            correction: { type: genai_1.Type.STRING },
                            explanation: { type: genai_1.Type.STRING },
                        },
                        required: ['original', 'correction', 'explanation'],
                    },
                },
                advancedConstructionsCount: { type: genai_1.Type.INTEGER },
            },
            required: ['structuresUsed', 'errors', 'advancedConstructionsCount'],
        },
        transcript: { type: genai_1.Type.STRING },
    },
    required: [
        'overallLevel', 'overallScore', 'wordCount', 'dimensions',
        'achievements', 'niceDone', 'toImprove',
        'pronunciationAnalysis', 'vocabularyAnalysis', 'grammarAnalysis', 'transcript',
    ],
};
const SYSTEM_INSTRUCTION = `You are a certified CEFR Speaking examiner. Your sole job is to assess the spoken English captured in the audio using the Common European Framework of Reference (CEFR) Speaking rubric.

━━━ TWO-SOURCE RULE (NON-NEGOTIABLE) ━━━
There are exactly two valid sources for feedback. Use the right one for each dimension:

SOURCE A — ACOUSTIC SIGNAL (audio only):
  → Pronunciation: phoneme accuracy, word stress, intonation, rhythm, clarity, L1 accent interference.
  → Fluency: speech rate, pause frequency/length, hesitations, filler words. Detect these from the audio, NOT from reading the transcript.

SOURCE B — TRANSCRIPT (what was literally said):
  → Grammar: report ONLY errors in sentences the speaker actually produced. Quote the exact spoken sentence.
  → Vocabulary: suggest alternatives ONLY for words the speaker actually used. Never invent examples.
  → Rephrasing: rephrase ONLY utterances that appear verbatim in the transcript.
  → niceDone / toImprove: observations must refer to evidence heard or read from the actual response.

PROHIBITION: Never correct, suggest, or comment on language the speaker did NOT produce.

━━━ CEFR SPEAKING DESCRIPTORS (use these to assign levels) ━━━

FLUENCY & COHERENCE:
- A1: Only isolated words/memorised phrases; long pauses dominate.
- A2: Short phrases; frequent pauses while searching for words; some repetition.
- B1: Keeps going despite pauses; ideas connected but with noticeable hesitation.
- B2: Speaks at natural pace; occasional searching for words does not impede communication.
- C1: Speaks fluently and spontaneously; uses discourse markers naturally.
- C2: Effortless, precise, natural flow equivalent to an educated native speaker.

PRONUNCIATION:
- A1: Very limited control; frequent mispronunciation impairs understanding.
- A2: Pronunciation generally clear but L1 accent affects intelligibility at times.
- B1: Generally intelligible; systematic errors in specific phonemes or word stress.
- B2: Clear, natural pronunciation; minor accent does not impede communication.
- C1: Varied intonation and precise articulation; rare L1 interference.
- C2: Consistent, precise phonemic control; prosody indistinguishable from educated native.

GRAMMATICAL RANGE & ACCURACY:
- A1: Only basic sentence patterns with frequent errors.
- A2: Simple structures used; errors common but meaning usually clear.
- B1: Uses a range of simple structures correctly; some complex structures with errors.
- B2: Good grammatical control; occasional slips but self-corrects.
- C1: High grammatical accuracy; complex structures used flexibly with rare errors.
- C2: Consistent grammatical accuracy; errors are rare and minor.

LEXICAL RANGE (VOCABULARY):
- A1: Very basic vocabulary (colours, numbers, family, daily objects).
- A2: Sufficient vocabulary for familiar topics; noticeable limitations on less common topics.
- B1: Adequate vocabulary for most everyday situations; circumlocution used for gaps.
- B2: Good range of vocabulary for most topics; some idiomatic expressions used.
- C1: Wide vocabulary used flexibly with precise connotations; minor gaps.
- C2: Precise, nuanced vocabulary including idioms and colloquial expressions.

INTERACTIVE COMMUNICATION:
- A1: Cannot hold a real conversation; minimal response.
- A2: Participates in simple exchanges but relies on repetition.
- B1: Maintains interaction; limited ability to handle unexpected turns.
- B2: Initiates and maintains discourse; copes well with unexpected turns.
- C1: Selects appropriate discourse strategies; negotiates meaning subtly.
- C2: Interacts with ease and precision; full communicative flexibility.

━━━ SCORING RULES ━━━
- Assign each dimension a CEFR level (A1–C2) and a score 0–100 based on the descriptors above.
- The overallLevel MUST be the weighted average of the five dimension levels — it cannot exceed the majority of dimension levels.
- Be honest and precise — do NOT default to B1 unless the evidence supports it.
- Score anchors: A1=10, A2=25, B1=45, B2=65, C1=80, C2=95.

━━━ FILLER WORDS to detect ━━━
um, uh, like, you know, well, so, kind of, sort of, I mean, basically, actually, literally, right

━━━ LANGUAGE RULES (MANDATORY) ━━━
- observations, niceDone, toImprove, pausePattern: write in SPANISH
- English examples, corrections, phonetic notation (/ˈwɜːrd/), synonyms, rephrasing: write in ENGLISH
- Achievement titles: write in SPANISH

━━━ ACHIEVEMENTS ━━━
Award 2-4 meaningful achievements based ONLY on what you actually heard. Icons: mic, zap, crown, target, star, book

━━━ VOCABULARY wordsByLevel ━━━
Distribute ONLY the vocabulary the speaker actually used across A1/A2/B1/B2/C1/C2 (percentages must sum to ~100)

━━━ INSUFFICIENT AUDIO (NON-NEGOTIABLE) ━━━
If the audio contains no speech, only silence, ambient noise, or under 2 seconds of actual speech:
- Set transcript to "" (empty string)
- Set wordCount to 0
- Set all dimension scores to 0, all levels to "A1"
- Set all observations to "Sin respuesta — no se detectó habla en el audio."
- Return achievements: [], niceDone: [], toImprove: []
DO NOT fabricate a transcript, invent a response, or generate any analysis based on the question context alone.`;
const withRetry = async (apiCall, maxRetries = 2, initialDelay = 3000) => {
    let attempt = 0;
    let delay = initialDelay;
    while (attempt < maxRetries) {
        try {
            return await apiCall();
        }
        catch (error) {
            if (error?.status === 429)
                throw error;
            attempt++;
            if (attempt >= maxRetries)
                throw error;
            console.warn(`Gemini API call failed, attempt ${attempt}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    throw new Error('Gemini API call failed after multiple retries.');
};
let AnalysisService = class AnalysisService {
    getGeminiClient() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            throw new Error('GEMINI_API_KEY environment variable not set.');
        return new genai_1.GoogleGenAI({ apiKey });
    }
    constructor(reportsService, usersService) {
        this.reportsService = reportsService;
        this.usersService = usersService;
    }
    async createSession(userId) {
        const report = await this.reportsService.create(userId);
        return report.id;
    }
    async analyzeSubmission(reportId, userId, questionsWithAudio) {
        try {
            const analyses = [];
            for (let i = 0; i < questionsWithAudio.length; i++) {
                const { question, audioBase64, audioMimeType } = questionsWithAudio[i];
                const audioBytesSize = Buffer.byteLength(audioBase64, 'base64');
                if (audioBytesSize < 35_000) {
                    console.log(`\n── Pregunta ${i + 1} / ${questionsWithAudio.length} (${question.id}) — OMITIDA (audio insuficiente: ${audioBytesSize} bytes) ──`);
                    analyses.push(this.getNoResponseAnalysis(question));
                    continue;
                }
                const result = await this.analyzeQuestionAudio(question, audioBase64, audioMimeType);
                console.log(`\n── Pregunta ${i + 1} / ${questionsWithAudio.length} (${question.id}) ──`);
                analyses.push(result);
                if (i < questionsWithAudio.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            const aggregated = this.aggregateAnalyses(analyses);
            await this.reportsService.update(reportId, {
                status: 'completed',
                ...aggregated,
                questionAnalyses: analyses,
            });
            await this.usersService.updateLevel(userId, aggregated.overallLevel);
        }
        catch (error) {
            console.error('Analysis error:', error);
            await this.reportsService.update(reportId, { status: 'error' });
        }
    }
    async analyzeQuestionAudio(question, audioBase64, audioMimeType) {
        const questionContext = this.buildQuestionContext(question);
        const isReadAloud = question.type === 'read-aloud-quote' || question.type === 'read-aloud-text';
        const promptText = isReadAloud
            ? `READ-ALOUD TASK — evaluate PRONUNCIATION and FLUENCY only from the audio.

The speaker is reading prescribed text. They did NOT produce this content freely.
DO NOT evaluate grammar complexity, vocabulary range, or interaction ability — the text belongs to the source material, not to the speaker.

EVALUATE from the audio:
- Pronunciation: phoneme accuracy, word stress, intonation, rhythm, and clarity of each word read.
- Fluency: smoothness of reading, pauses, hesitations, reading pace.

For Grammar, Vocabulary, and Interaction dimensions: set score=50, level="B1", observations="No evaluado — el hablante lee un texto prescrito; el contenido no es producción propia."

${questionContext}`
            : `Analyze this audio recording of an English learner and provide a complete CEFR assessment.

${questionContext}

Listen carefully to the ACTUAL AUDIO for pronunciation accuracy, fluency patterns, speech rate, filler words, hesitations, intonation, and phoneme quality. Do not skip the acoustic analysis.`;
        const apiCall = async () => {
            const ai = this.getGeminiClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        {
                            text: promptText,
                        },
                        {
                            inlineData: {
                                mimeType: audioMimeType,
                                data: audioBase64,
                            },
                        },
                    ],
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: 'application/json',
                    responseSchema: analysisSchema,
                    thinkingConfig: {
                        thinkingLevel: genai_1.ThinkingLevel.HIGH,
                    },
                },
            });
            const jsonString = response.text.trim().replace(/^```json\s*|\s*```$/g, '');
            const result = JSON.parse(jsonString);
            return { ...result, questionId: question.id, questionType: question.type };
        };
        try {
            return await withRetry(apiCall);
        }
        catch (error) {
            console.error(`Error analyzing question ${question.id}:`, error);
            return this.getFallbackAnalysis(question);
        }
    }
    buildQuestionContext(question) {
        let context = `QUESTION TYPE: ${question.type}\nQUESTION: "${question.content}"`;
        if (question.type === 'read-aloud-quote') {
            context += `\n(READ-ALOUD task. Transcribe ONLY what you actually hear in the audio. Do NOT use any prior knowledge of movie quotes. Evaluate pronunciation accuracy and fluency of what was actually spoken.)`;
        }
        if (question.type === 'read-aloud-text') {
            context += `\n(READ-ALOUD task. Transcribe ONLY what you actually hear in the audio. Evaluate reading fluency, pronunciation, and accuracy of each word actually spoken.)`;
        }
        if (question.type === 'describe-image') {
            context += `\nIMAGE SCENE: "${question.imageDescription}"`;
            context += `\n(Evaluate descriptive vocabulary, structure, and fluency)`;
        }
        if (question.type === 'listen-answer' && question.audioQuestion) {
            context += `\nQUESTION THEY HEARD: "${question.audioQuestion}"`;
            context += `\n(Evaluate comprehension-based response quality and spoken English)`;
        }
        return context;
    }
    getNoResponseAnalysis(question) {
        return {
            questionId: question.id,
            questionType: question.type,
            overallLevel: 'A1',
            overallScore: 0,
            wordCount: 0,
            dimensions: {
                fluency: { level: 'A1', score: 0, observations: 'Sin respuesta — no se detectó habla en el audio.' },
                pronunciation: { level: 'A1', score: 0, observations: 'Sin respuesta — no se detectó habla en el audio.' },
                grammar: { level: 'A1', score: 0, observations: 'Sin respuesta — no se detectó habla en el audio.' },
                vocabulary: { level: 'A1', score: 0, observations: 'Sin respuesta — no se detectó habla en el audio.' },
                interaction: { level: 'A1', score: 0, observations: 'Sin respuesta — no se detectó habla en el audio.' },
            },
            achievements: [],
            niceDone: [],
            toImprove: [],
            pronunciationAnalysis: { speechRate: '0 wpm', fillerWords: [], fillerWordCount: 0, pausePattern: 'No se detectó habla.', specificIssues: [] },
            vocabularyAnalysis: { uniqueWords: 0, rareWordsPercentage: 0, frequentWordsPercentage: 0, repetitions: [], suggestions: [], rephrasing: [], wordsByLevel: [] },
            grammarAnalysis: { structuresUsed: [], errors: [], advancedConstructionsCount: 0 },
            transcript: '',
        };
    }
    getFallbackAnalysis(question) {
        return {
            questionId: question.id,
            questionType: question.type,
            overallLevel: 'B1',
            overallScore: 55,
            wordCount: 0,
            dimensions: {
                fluency: { level: 'B1', score: 55, observations: 'No se pudo analizar esta respuesta.' },
                pronunciation: { level: 'B1', score: 55, observations: 'No se pudo analizar esta respuesta.' },
                grammar: { level: 'B1', score: 55, observations: 'No se pudo analizar esta respuesta.' },
                vocabulary: { level: 'B1', score: 55, observations: 'No se pudo analizar esta respuesta.' },
                interaction: { level: 'B1', score: 55, observations: 'No se pudo analizar esta respuesta.' },
            },
            achievements: [],
            niceDone: [],
            toImprove: [],
            pronunciationAnalysis: { speechRate: 'normal', fillerWords: [], fillerWordCount: 0, pausePattern: '', specificIssues: [] },
            vocabularyAnalysis: { uniqueWords: 0, rareWordsPercentage: 0, frequentWordsPercentage: 0, repetitions: [], suggestions: [], rephrasing: [], wordsByLevel: [] },
            grammarAnalysis: { structuresUsed: [], errors: [], advancedConstructionsCount: 0 },
            transcript: '',
        };
    }
    aggregateAnalyses(analyses) {
        if (!analyses.length)
            return {};
        const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const READ_ALOUD_TYPES = ['read-aloud-quote', 'read-aloud-text'];
        const productionAnalyses = analyses.filter(a => !READ_ALOUD_TYPES.includes(a.questionType));
        const prodSource = productionAnalyses.length > 0 ? productionAnalyses : analyses;
        const sourceFor = (key) => ['grammar', 'vocabulary', 'interaction'].includes(key) ? prodSource : analyses;
        const avgScore = (key) => {
            const src = sourceFor(key);
            return Math.round(src.reduce((sum, a) => sum + (a.dimensions?.[key]?.score || 55), 0) / src.length);
        };
        const mostCommonLevel = (key) => {
            const levels = sourceFor(key).map(a => a.dimensions?.[key]?.level || 'B1');
            return levels.sort((a, b) => levels.filter(v => v === b).length - levels.filter(v => v === a).length)[0];
        };
        const dimensionKeys = ['fluency', 'pronunciation', 'grammar', 'vocabulary', 'interaction'];
        const dimensionAvgIdx = Math.round(dimensionKeys.reduce((sum, key) => sum + cefrOrder.indexOf(mostCommonLevel(key)), 0) / dimensionKeys.length);
        const overallLevel = cefrOrder[Math.min(Math.max(dimensionAvgIdx, 0), 5)];
        const overallScore = Math.round(dimensionKeys.reduce((sum, key) => sum + avgScore(key), 0) / dimensionKeys.length);
        const totalWordCount = analyses.reduce((sum, a) => sum + (a.wordCount || 0), 0);
        const allRepetitions = {};
        const allSuggestions = [];
        const allRephrasing = [];
        const allFillerWords = [];
        const allFillerWordCount = analyses.reduce((sum, a) => sum + (a.pronunciationAnalysis?.fillerWordCount || 0), 0);
        const allIssues = [];
        const allStructures = [];
        const allErrors = [];
        let advancedConstructionsCount = 0;
        analyses.forEach(a => {
            a.pronunciationAnalysis?.fillerWords?.forEach((w) => { if (!allFillerWords.includes(w))
                allFillerWords.push(w); });
            a.pronunciationAnalysis?.specificIssues?.forEach((i) => { if (!allIssues.includes(i))
                allIssues.push(i); });
        });
        prodSource.forEach(a => {
            a.vocabularyAnalysis?.repetitions?.forEach((r) => { allRepetitions[r.word] = (allRepetitions[r.word] || 0) + r.count; });
            a.vocabularyAnalysis?.suggestions?.slice(0, 3).forEach((s) => { if (!allSuggestions.find(x => x.word === s.word))
                allSuggestions.push(s); });
            a.vocabularyAnalysis?.rephrasing?.slice(0, 2).forEach((r) => allRephrasing.push(r));
            a.grammarAnalysis?.structuresUsed?.forEach((s) => { if (!allStructures.includes(s))
                allStructures.push(s); });
            a.grammarAnalysis?.errors?.slice(0, 2).forEach((e) => allErrors.push(e));
            advancedConstructionsCount += a.grammarAnalysis?.advancedConstructionsCount || 0;
        });
        const achievementMap = {};
        analyses.forEach(a => { a.achievements?.forEach((ach) => { achievementMap[ach.title] = ach; }); });
        const niceDone = [...new Set(analyses.flatMap(a => a.niceDone || []))].slice(0, 4);
        const toImprove = [...new Set(analyses.flatMap(a => a.toImprove || []))].slice(0, 3);
        const levelKeys = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const wordsByLevel = levelKeys.map(level => {
            const avg = prodSource.reduce((sum, a) => {
                const found = a.vocabularyAnalysis?.wordsByLevel?.find((w) => w.level === level);
                return sum + (found?.percentage || 0);
            }, 0) / prodSource.length;
            return { level, percentage: Math.round(avg) };
        });
        return {
            duration: Math.round(totalWordCount / 130),
            wordCount: totalWordCount,
            overallLevel,
            overallScore,
            dimensions: {
                fluency: { level: mostCommonLevel('fluency'), score: avgScore('fluency'), observations: `Nivel de fluidez: ${mostCommonLevel('fluency')}` },
                pronunciation: { level: mostCommonLevel('pronunciation'), score: avgScore('pronunciation'), observations: `Nivel de pronunciación: ${mostCommonLevel('pronunciation')}` },
                grammar: { level: mostCommonLevel('grammar'), score: avgScore('grammar'), observations: `Nivel gramatical: ${mostCommonLevel('grammar')}` },
                vocabulary: { level: mostCommonLevel('vocabulary'), score: avgScore('vocabulary'), observations: `Nivel de vocabulario: ${mostCommonLevel('vocabulary')}` },
                interaction: { level: mostCommonLevel('interaction'), score: avgScore('interaction'), observations: `Nivel de interacción: ${mostCommonLevel('interaction')}` },
            },
            achievements: Object.values(achievementMap).slice(0, 5),
            niceDone,
            toImprove,
            vocabularyStats: {
                activeVocabularyEstimate: Math.round(totalWordCount * 42),
                uniqueWords: analyses.reduce((sum, a) => sum + (a.vocabularyAnalysis?.uniqueWords || 0), 0),
                rareWordsPercentage: Math.round(analyses.reduce((sum, a) => sum + (a.vocabularyAnalysis?.rareWordsPercentage || 0), 0) / analyses.length),
                frequentWordsPercentage: Math.round(analyses.reduce((sum, a) => sum + (a.vocabularyAnalysis?.frequentWordsPercentage || 0), 0) / analyses.length),
                repetitions: Object.entries(allRepetitions).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count).slice(0, 8),
                suggestions: allSuggestions.slice(0, 12),
                rephrasing: allRephrasing.slice(0, 6),
                wordsByLevel,
            },
            pronunciationStats: {
                speechRate: 'normal',
                fillerWords: allFillerWords,
                totalFillerWordCount: allFillerWordCount,
                issues: allIssues.slice(0, 5),
            },
            grammarStats: {
                structuresUsed: allStructures.slice(0, 8),
                errors: allErrors.slice(0, 6),
                advancedConstructionsCount,
            },
        };
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        users_service_1.UsersService])
], AnalysisService);
//# sourceMappingURL=analysis.service.js.map