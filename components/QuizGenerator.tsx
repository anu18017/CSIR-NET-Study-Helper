import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import type { QuizQuestion } from '../types';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

const QuizGenerator: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const result = await generateQuiz(sourceText, numQuestions);
      setQuiz(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };
  
  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
  };
  
  const handleReset = () => {
    setQuiz(null);
    setSourceText('');
    setUserAnswers({});
    setIsSubmitted(false);
    setError(null);
  }

  const getResultColor = (index: number, option: string) => {
    if (!isSubmitted) return 'border-gray-300 hover:border-primary text-dark';
    const correctAnswer = quiz?.[index].correctAnswer;
    const userAnswer = userAnswers[index];
    if (option === correctAnswer) return 'border-green-500 bg-green-100 ring-2 ring-green-500 text-green-800 font-bold';
    if (option === userAnswer && option !== correctAnswer) return 'border-red-500 bg-red-100 ring-2 ring-red-500 text-red-800 font-bold';
    return 'border-gray-300 text-secondary';
  }
  
  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.reduce((score, question, index) => {
        return userAnswers[index] === question.correctAnswer ? score + 1 : score;
    }, 0);
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl shadow-pink-100 animate-fade-in">
      <h2 className="text-3xl font-bold text-dark mb-2">Quiz Generator</h2>
      
      {!quiz && (
        <>
          <p className="text-secondary mb-6">Paste text to generate a quiz and test your knowledge.</p>
          <form onSubmit={handleGenerateQuiz}>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste the text you want to be quizzed on..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
              rows={10}
              disabled={isLoading}
            />
            <div className="mt-4 flex items-center">
              <label htmlFor="numQuestions" className="mr-3 text-gray-700 font-medium">Number of Questions:</label>
              <input
                type="number"
                id="numQuestions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)))}
                className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="1"
                max="10"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !sourceText.trim()}
              className="mt-6 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-fuchsia-200"
            >
              {isLoading ? <LoadingSpinner /> : 'Generate Quiz'}
            </button>
          </form>
        </>
      )}

      {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
      
      {quiz && (
        <div>
          {isSubmitted && (
            <div className="text-center p-4 mb-6 bg-light border border-primary rounded-lg">
                <h3 className="text-xl font-bold text-primary">Your Score: {calculateScore()} / {quiz.length}</h3>
            </div>
          )}
          {quiz.map((q, index) => (
            <div key={index} className="mb-6 border-b border-pink-100 pb-6">
              <p className="font-semibold text-lg mb-3 text-dark">{index + 1}. {q.question}</p>
              <div className="space-y-3">
                {q.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`block p-3 border rounded-lg cursor-pointer transition-all duration-200 ${getResultColor(index, option)}`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={() => handleAnswerChange(index, option)}
                      disabled={isSubmitted}
                      className="mr-3 accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {!isSubmitted ? (
             <button onClick={handleSubmitQuiz} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300">
              Check Answers
            </button>
          ) : (
            <button onClick={handleReset} className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-300">
              Create Another Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;