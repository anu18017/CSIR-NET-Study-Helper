import React, { useState } from 'react';
import { summarizeText } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

const NoteSummarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const result = await summarizeText(text);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl shadow-pink-100 animate-fade-in">
      <h2 className="text-3xl font-bold text-dark mb-2">Note Summarizer</h2>
      <p className="text-secondary mb-6">Paste your notes or any text below to get a quick summary in bullet points.</p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
          rows={10}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="mt-4 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-fuchsia-200"
        >
          {isLoading ? <LoadingSpinner /> : 'Summarize Text'}
        </button>
      </form>

      {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
      
      {summary && (
        <div className="mt-8 p-6 bg-light border border-pink-100 rounded-lg">
          <h3 className="text-2xl font-bold text-dark mb-4">Summary</h3>
          <div className="text-gray-800 whitespace-pre-wrap prose max-w-none">{summary}</div>
        </div>
      )}
    </div>
  );
};

export default NoteSummarizer;