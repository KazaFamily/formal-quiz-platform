import { Quiz, Question } from '../types';
import CelebrationCanvas from './CelebrationCanvas';
import { RefreshCw, LayoutDashboard, CheckCircle2, XCircle, Award, Hourglass, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ScoreDashboardProps {
  quiz: Quiz;
  answers: { [questionId: string]: number };
  timeSpentSeconds: number;
  onRetry: () => void;
  onExit: () => void;
}

export default function ScoreDashboard({ quiz, answers, timeSpentSeconds, onRetry, onExit }: ScoreDashboardProps) {
  // Compute performance metrics
  let correctCount = 0;
  quiz.questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const rawPercentage = (correctCount / totalQuestions) * 100;
  const percentage = Math.round(rawPercentage);
  const isHighScorer = percentage >= 90;

  // Determine certification badge
  let tierTitle = '';
  let tierDesc = '';
  let badgeColor = '';

  if (percentage === 100) {
    tierTitle = 'Distinguished Scholar';
    tierDesc = 'Flawless execution. Your depth of domain knowledge is exceptional.';
    badgeColor = 'from-amber-500 to-amber-600 shadow-amber-200';
  } else if (percentage >= 90) {
    tierTitle = 'Superior Performance';
    tierDesc = 'Outstanding comprehension. You demonstrate executive readiness.';
    badgeColor = 'from-blue-600 to-blue-700 shadow-blue-200';
  } else if (percentage >= 70) {
    tierTitle = 'Competent Professional';
    tierDesc = 'Demonstrated satisfactory subject familiarity. Small details merit review.';
    badgeColor = 'from-teal-600 to-teal-700 shadow-teal-200';
  } else {
    tierTitle = 'Evaluation Mandate';
    tierDesc = 'Underneath target thresholds. Thorough review of reference resources recommended.';
    badgeColor = 'from-slate-600 to-slate-700 shadow-slate-200';
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div id="score-dashboard-wrapper" className="space-y-8 relative">
      {/* 90%+ score balloon and confetti layer */}
      {isHighScorer && <CelebrationCanvas />}

      {/* Main Score Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Circular Gauge, Raw Score and Badging */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center text-center justify-between shadow-xs relative overflow-hidden">
          
          <div className="space-y-6 w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Assessment Metadata</span>
            
            <div className="flex flex-col items-center py-2">
              <div className="text-slate-400 uppercase tracking-widest text-[10px] font-bold mb-2">Final Performance</div>
              <div className="text-7xl font-black text-slate-800 tracking-tight font-mono">
                {percentage}<span className="text-blue-600">%</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">
                {correctCount} correct out of {totalQuestions} questions
              </div>
            </div>

            {/* Time metric chip */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 border border-slate-150 rounded-lg text-slate-500 font-semibold text-xs max-w-[150px] mx-auto">
              <Hourglass size={13} className="text-slate-400" />
              <span>Duration: <span className="font-mono text-slate-700">{formatTime(timeSpentSeconds)}</span></span>
            </div>
          </div>

          {/* Dynamic Badging & level indicators */}
          <div className="w-full mt-8 pt-6 border-t border-slate-150 space-y-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r ${badgeColor} text-white text-xs font-bold rounded-md shadow-xs`}>
              <Award size={13} />
              <span className="tracking-wide uppercase text-[10px]">{tierTitle}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 px-1 mt-1">
              {tierDesc}
            </p>
          </div>
        </div>

        {/* Right Side: Detailed Review & Answers */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Diagnostic Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed response analysis for internal records.
              </p>
            </div>

            {/* Top Action Controllers */}
            <div className="flex items-center gap-2">
              <button
                onClick={onRetry}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-md text-xs font-medium transition"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>

              <button
                onClick={onExit}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition shadow-xs"
              >
                <LayoutDashboard size={13} />
                <span>Exit</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {quiz.questions.map((q, qIdx) => {
              const selectedIdx = answers[q.id];
              const isCorrect = selectedIdx === q.correctAnswerIndex;
              const hasAnswered = selectedIdx !== undefined;

              return (
                <div
                  key={q.id}
                  className={`border rounded-xl p-4 sm:p-5 bg-white transition ${
                    isCorrect ? 'border-emerald-100' : 'border-red-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question {qIdx + 1}</span>
                      <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                        {q.questionText}
                      </h4>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 size={13} />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-100">
                          <XCircle size={13} />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options review lists */}
                  <div className="mt-4 space-y-1.5 pl-1 border-l-2 border-slate-100">
                    {q.options.map((opt, oIdx) => {
                      const wasSelected = selectedIdx === oIdx;
                      const isOptionCorrect = q.correctAnswerIndex === oIdx;

                      let rowClass = 'text-slate-500';
                      let labelPill = null;

                      if (isOptionCorrect) {
                        rowClass = 'text-slate-800 font-semibold bg-emerald-50/40 border border-emerald-100/50 rounded-md py-1 px-2 -mx-2';
                        labelPill = (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                            Correct Reference
                          </span>
                        );
                      } else if (wasSelected && !isCorrect) {
                        rowClass = 'text-red-700 bg-red-50/40 border border-red-100/50 rounded-md py-1 px-2 -mx-2';
                        labelPill = (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded ml-auto">
                            Your Choice
                          </span>
                        );
                      } else if (wasSelected) {
                        rowClass = 'text-emerald-700 font-semibold bg-emerald-50/50 border border-emerald-100/50 rounded-md py-1 px-2 -mx-2';
                        labelPill = (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                            Your Correct Choice
                          </span>
                        );
                      }

                      return (
                        <div key={oIdx} className={`flex items-center text-xs py-1 transition ${rowClass}`}>
                          <span className="w-4 h-4 shrink-0 font-mono text-[10px] font-bold flex items-center justify-center bg-slate-100 text-slate-500 rounded mr-2">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="leading-relaxed">{opt}</span>
                          {labelPill}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Section */}
                  {q.explanation && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex gap-1 items-start text-slate-600 font-semibold mb-1">
                        <HelpCircle size={13} className="pt-0.5 shrink-0 text-slate-400" />
                        <span>Reference Explanation:</span>
                      </div>
                      <p className="leading-relaxed text-slate-500 italic pl-4">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Retroactive historical suggestion banner */}
      <div className="p-5 bg-linear-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">What is your next objective?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            You can re-attempt this assessment immediately or select another course module.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg transition"
          >
            Re-take Assessment
          </button>

          <button
            onClick={onExit}
            className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
          >
            <span>Return to Suite</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
