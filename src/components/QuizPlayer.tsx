import { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, Clock, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (answers: { [questionId: string]: number }, timeSpentSeconds: number) => void;
  onLeave: () => void;
}

export default function QuizPlayer({ quiz, onComplete, onLeave }: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((currentIdx) / totalQuestions) * 100);

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync selectedOption state when question changes
  useEffect(() => {
    const savedAnswer = answers[currentQuestion.id];
    setSelectedOption(savedAnswer !== undefined ? savedAnswer : null);
  }, [currentIdx, currentQuestion.id, answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optIndex: number) => {
    setSelectedOption(optIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    // Save active choice
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOption
    };
    setAnswers(updatedAnswers);

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed last question, pass on results
      onComplete(updatedAnswers, timeSpent);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div id="quiz-player-viewport" className="max-w-3xl mx-auto py-6 relative">
      
      {/* Top Navigation HUD */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} />
          <span>Exit Module</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-600">
          <Clock size={14} className="text-slate-400" />
          <span className="font-mono text-xs font-semibold">{formatTime(timeSpent)}</span>
        </div>
      </div>

      {/* Progress Monitor */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between items-end text-xs font-medium text-slate-400">
          <span className="uppercase tracking-wider">Evaluation Segment</span>
          <span>{currentIdx + 1} of {totalQuestions} questions</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
          <motion.div
            className="bg-blue-600 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-sm w-full shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle size={24} />
              <h3 className="font-semibold text-slate-800">Abandon Quiz session?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your active completion timer and choices will be discarded. This progress can not be recovered.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 rounded"
              >
                Resume
              </button>
              <button
                onClick={onLeave}
                className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Quit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Card Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Header indicator */}
          <div className="flex items-center gap-2 text-blue-600">
            <HelpCircle size={18} className="opacity-90" />
            <span className="text-xs font-semibold uppercase tracking-wider">Evaluation Question</span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 leading-snug">
            {currentQuestion.questionText}
          </h2>

          {/* Answers grid */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const optionLetter = String.fromCharCode(65 + oIdx); // A, B, C, D...

              return (
                <button
                  key={oIdx}
                  onClick={() => handleOptionSelect(oIdx)}
                  className={`w-full flex items-start gap-4 p-4 text-left border rounded-xl transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="text-sm font-medium text-slate-700 pt-0.5 leading-relaxed">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Interaction Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentIdx === 0}
          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-35 disabled:hover:text-slate-500 transition"
        >
          Previous Question
        </button>

        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition ${
            selectedOption === null
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
          }`}
        >
          <span>{currentIdx === totalQuestions - 1 ? 'Complete Evaluation' : 'Confirm & Advance'}</span>
          <ChevronRight size={14} className="stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
}
