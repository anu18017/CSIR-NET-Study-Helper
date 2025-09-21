import React, { useState } from 'react';
import Header from './components/Header';
import DoubtSolver from './components/DoubtSolver';
import NoteSummarizer from './components/NoteSummarizer';
import QuizGenerator from './components/QuizGenerator';

export type ActiveTab = 'solver' | 'summarizer' | 'quiz';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('solver');

  const renderContent = () => {
    switch (activeTab) {
      case 'solver':
        return <DoubtSolver />;
      case 'summarizer':
        return <NoteSummarizer />;
      case 'quiz':
        return <QuizGenerator />;
      default:
        return <DoubtSolver />;
    }
  };

  return (
    <div className="min-h-screen bg-light font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-secondary text-sm">
        <p>Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;