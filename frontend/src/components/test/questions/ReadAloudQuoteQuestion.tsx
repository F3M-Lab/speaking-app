import { Question } from '../../../types';

interface Props {
  question: Question;
}

export default function ReadAloudQuoteQuestion({ question }: Props) {
  return (
    <div className="text-center max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.content}</h2>
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <span className="text-6xl">🎬</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-6 py-4">
          <p className="text-white text-lg font-medium text-center leading-relaxed">
            {question.quote}
          </p>
          {question.imageDescription && (
            <p className="text-gray-400 text-xs text-center mt-1">{question.imageDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}
