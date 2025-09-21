import React from 'react';
import type { ActiveTab } from '../App';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const BrainIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" strokeWidth="1.5" stroke="white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    <path d="M12 2a10 10 0 00-10 10c0 4.48 2.94 8.28 7 9.58V12H7v-2h2V7.5C9 5.02 10.52 3.5 12.97 3.5c1.16 0 2.15.09 2.44.13V6h-1.4c-1.21 0-1.44.57-1.44 1.41V8h2.8l-.36 2H12.57v9.58c4.06-1.3 7-5.1 7-9.58A10 10 0 0012 2z" />
  </svg>
);


const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'solver', label: 'Doubt Solver' },
    { id: 'summarizer', label: 'Note Summarizer' },
    { id: 'quiz', label: 'Quiz Generator' },
  ];

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-primary p-2 rounded-full">
               <BrainIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-dark ml-3">AI Study Helper</h1>
          </div>
          <nav className="flex space-x-1 bg-pink-100 p-1 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm sm:text-base font-medium rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;