import { Question } from '../../../types';

interface Props {
  question: Question;
}

export default function YouShouldSayQuestion({ question }: Props) {
  return (
    <div className="text-center max-w-2xl w-full">
      <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-6">{question.content}</h2>
      {question.shouldSay && question.shouldSay.length > 0 && (
        <div className="text-left bg-gray-50 rounded-xl px-6 py-5 inline-block w-full">
          <p className="text-sm font-semibold text-gray-500 mb-3">You should say:</p>
          <ul className="space-y-2">
            {question.shouldSay.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-gray-400 mt-5 text-sm font-medium">Speak for 2-3 minutes</p>
    </div>
  );
}
