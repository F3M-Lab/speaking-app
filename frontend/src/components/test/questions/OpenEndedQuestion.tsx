import { Question } from '../../../types';

interface Props {
  question: Question;
}

export default function OpenEndedQuestion({ question }: Props) {
  return (
    <div className="text-center max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900 leading-tight">{question.content}</h2>
      {question.instructions && (
        <p className="text-gray-400 mt-4 text-sm">{question.instructions}</p>
      )}
    </div>
  );
}
