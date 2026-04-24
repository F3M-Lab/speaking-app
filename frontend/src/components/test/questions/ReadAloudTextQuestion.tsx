import { Question } from '../../../types';

interface Props {
  question: Question;
}

export default function ReadAloudTextQuestion({ question }: Props) {
  return (
    <div className="max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{question.content}</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
        <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
          {question.passage}
        </p>
      </div>
    </div>
  );
}
