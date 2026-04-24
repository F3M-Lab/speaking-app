"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@anthropic-ai/sdk");
let QuestionsService = class QuestionsService {
    constructor() {
        this.anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    async generateQuestions() {
        const q1 = {
            id: 'q1',
            type: 'open-ended',
            content: "What's your name? and How old are you?",
            speakTime: 20,
            prepTime: 0,
        };
        const prompt = `Generate exactly 12 speaking test questions (q2 through q13) for an English learner assessment.

Return a JSON array of 12 objects. No markdown, no explanation — only the raw JSON array.

RULES PER QUESTION:

q2 — open-ended, basic preference, A1/A2 level
Randomly choose a simple preference topic (colour, food, sport, animal, music, season, weather, movie genre, school subject, etc.)
Ask ONE simple question about that topic.
{
  "id": "q2",
  "type": "open-ended",
  "content": "What's your favourite [topic]?",
  "speakTime": 20,
  "prepTime": 0
}

q3 — read-aloud-quote, A2 level, standard
Famous movie or TV quote, 10–13 words. Simple vocabulary, no special grammar feature.
{
  "id": "q3",
  "type": "read-aloud-quote",
  "content": "Pronounce the quote from the given picture",
  "quote": "[the quote, 10–13 words]",
  "imageDescription": "[movie/show title and brief context]",
  "speakTime": 30,
  "prepTime": 0
}

q4 — read-aloud-quote, A2 level with phrasal verb
Famous movie or TV quote, 10–13 words. MUST contain a phrasal verb (e.g. give up, find out, look after, cheer up, move on).
{
  "id": "q4",
  "type": "read-aloud-quote",
  "content": "Pronounce the quote from the given picture",
  "quote": "[the quote, 10–13 words, with phrasal verb]",
  "imageDescription": "[movie/show title and brief context]",
  "speakTime": 30,
  "prepTime": 0
}

q5 — read-aloud-quote, B1 level
Famous movie or TV quote, 10–13 words. Intermediate vocabulary and grammar.
{
  "id": "q5",
  "type": "read-aloud-quote",
  "content": "Pronounce the quote from the given picture",
  "quote": "[the quote, 10–13 words]",
  "imageDescription": "[movie/show title and brief context]",
  "speakTime": 30,
  "prepTime": 0
}

q6 — read-aloud-quote, B2 level
Famous movie or TV quote, 18–25 words. Upper-intermediate vocabulary, complex sentence structure.
{
  "id": "q6",
  "type": "read-aloud-quote",
  "content": "Pronounce the quote from the given picture",
  "quote": "[the quote, 18–25 words]",
  "imageDescription": "[movie/show title and brief context]",
  "speakTime": 45,
  "prepTime": 0
}

q7 — read-aloud-quote, C1 level
Famous movie or TV quote, 10–15 words. Advanced or sophisticated vocabulary (abstract, nuanced, or literary).
{
  "id": "q7",
  "type": "read-aloud-quote",
  "content": "Pronounce the quote from the given picture",
  "quote": "[the quote, 10–15 words]",
  "imageDescription": "[movie/show title and brief context]",
  "speakTime": 30,
  "prepTime": 0
}

q8 — read-aloud-text
A 150–200 word reading passage on a relatable topic (travel, technology, relationships, work, food, nature, etc.).
Structure it in 3–4 short paragraphs. Each paragraph should be 2–4 sentences. Topic must vary each time.
{
  "id": "q8",
  "type": "read-aloud-text",
  "content": "Read the Text",
  "passage": "[full passage, 150–200 words, 3–4 paragraphs separated by \\n\\n]",
  "speakTime": 210,
  "prepTime": 0
}

q9 — open-ended, B1 opinion with quantifier
A B1-level opinion question that includes "how much" or "how many" in the question. Pick a random everyday topic (internet, social media, exercise, cooking, reading, shopping, travel, etc.).
{
  "id": "q9",
  "type": "open-ended",
  "content": "[opinion question including 'how much' or 'how many']",
  "instructions": "Speak for 2-3 minutes",
  "speakTime": 180,
  "prepTime": 30
}

q10 — describe-image
Fixed structure. Do NOT include imageDescriptions — the images come from the app's photo pool.
{
  "id": "q10",
  "type": "describe-image",
  "content": "Here are photos from your photo album, choose one photo to describe to your friend:",
  "speakTime": 180,
  "prepTime": 30
}

q11 — listen-answer
A short spoken scenario (10–15 seconds when read aloud at normal pace) followed by a question the learner must answer. Vary the topic each time.
{
  "id": "q11",
  "type": "listen-answer",
  "content": "Listen to the audio and answer the questions",
  "audioText": "[short statement or scenario, 10–15 seconds spoken]",
  "audioQuestion": "[the question the learner must answer after listening]",
  "speakTime": 180,
  "prepTime": 0
}

q12 — you-should-say (IELTS Part 2 style)
Randomly choose a descriptive topic (ideal day, a childhood memory, a favourite place, a special person in your life, a recent achievement, a skill you want to learn, a book or film that changed you, etc.).
Write a main question and 4 "you should say" bullet points that guide the answer.
{
  "id": "q12",
  "type": "you-should-say",
  "content": "[main descriptive topic, e.g. 'Describe your ideal day']",
  "shouldSay": [
    "[bullet 1 — contextual detail]",
    "[bullet 2 — who/what is involved]",
    "[bullet 3 — how/when/where]",
    "[bullet 4 — reflection or opinion]"
  ],
  "speakTime": 210,
  "prepTime": 30
}

q13 — information-seeking
Randomly choose a real-life scenario where the student must ask questions to get details (camping trip, job interview, house rental, birthday party, cooking class, concert, gym membership, language course, etc.).
Write a scenario sentence and 4 bullet points of things they should ask about.
{
  "id": "q13",
  "type": "information-seeking",
  "content": "[scenario sentence explaining the situation and who to ask]",
  "shouldAskAbout": [
    "[thing to ask about 1]",
    "[thing to ask about 2]",
    "[thing to ask about 3]",
    "[thing to ask about 4]"
  ],
  "speakTime": 180,
  "prepTime": 30
}

IMPORTANT:
- Every test run must feel different. Vary topics, quotes, scenarios, and opinions each time.
- All quotes must be real, recognisable lines from well-known films or TV shows.
- Return ONLY the JSON array of 12 objects (q2–q13). No explanation, no markdown.`;
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }],
            });
            const text = response.content[0].type === 'text' ? response.content[0].text : '';
            const cleaned = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
            const generated = JSON.parse(cleaned);
            return [q1, ...generated];
        }
        catch (error) {
            console.error('Error generating questions:', error);
            throw new common_1.InternalServerErrorException('Error al generar preguntas');
        }
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)()
], QuestionsService);
//# sourceMappingURL=questions.service.js.map