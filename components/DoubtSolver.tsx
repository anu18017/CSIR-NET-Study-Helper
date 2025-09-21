import React, { useState, useRef, useEffect } from 'react';
import { solveDoubt } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

declare const mermaid: any;
declare const jspdf: any;
declare const html2canvas: any;

const DoubtSolver: React.FC = () => {
  const [doubt, setDoubt] = useState('');
  const [explanation, setExplanation] = useState('');
  const [diagramCode, setDiagramCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answerContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diagramCode) {
      try {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
        mermaid.run({ querySelector: '.mermaid' });
      } catch (e) {
        console.error("Mermaid rendering error:", e);
        setError("Failed to render the diagram.");
      }
    }
  }, [diagramCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubt.trim()) return;

    setIsLoading(true);
    setError(null);
    setExplanation('');
    setDiagramCode('');

    try {
      const result = await solveDoubt(doubt);
      
      const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/;
      const match = result.match(mermaidRegex);

      if (match && match[1]) {
        setDiagramCode(match[1]);
        setExplanation(result.replace(mermaidRegex, '').trim());
      } else {
        setExplanation(result);
        setDiagramCode('');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadPdf = async () => {
    const content = answerContentRef.current;
    if (!content) return;

    try {
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth - 20; // with margin
      const imgHeight = imgWidth / ratio;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position -= (pdfHeight - 20);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }
      
      pdf.save('AI-Study-Helper-Answer.pdf');

    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Sorry, we couldn't generate the PDF. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl shadow-pink-100 animate-fade-in">
      <h2 className="text-3xl font-bold text-dark mb-2">CSIR NET Doubt Solver</h2>
      <p className="text-secondary mb-6">Stuck on a problem? Get detailed explanations and diagrams for any CSIR NET topic.</p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={doubt}
          onChange={(e) => setDoubt(e.target.value)}
          placeholder="e.g., Explain the mechanism of sodium-potassium pump in cell membranes."
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
          rows={4}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !doubt.trim()}
          className="mt-4 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-fuchsia-200"
        >
          {isLoading ? <LoadingSpinner /> : 'Get Explanation'}
        </button>
      </form>

      {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
      
      {(explanation || diagramCode) && (
        <div className="mt-8">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-2xl font-bold text-dark">Explanation</h3>
             <button 
                onClick={handleDownloadPdf}
                className="bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-hover transition duration-300 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
             </button>
           </div>
          <div ref={answerContentRef} className="p-6 bg-light border border-pink-100 rounded-lg prose max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap">{explanation}</p>
            {diagramCode && (
              <div className="mt-6 flex justify-center p-4 bg-white rounded-md shadow-inner">
                <div className="mermaid" aria-label="Diagrammatic explanation">{diagramCode}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtSolver;