import { useState, useEffect } from 'react';
import { Quiz, QuizAttempt } from './types';
import { defaultQuizzes } from './data/defaultQuizzes';
import Dashboard from './components/Dashboard';
import QuizPlayer from './components/QuizPlayer';
import ScoreDashboard from './components/ScoreDashboard';
import QuizBuilder from './components/QuizBuilder';
import { GraduationCap } from 'lucide-react';

export default function App() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  
  // Navigation Screens
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'playing' | 'score' | 'builder'>('dashboard');
  
  // Selection Context
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [lastAttemptAnswers, setLastAttemptAnswers] = useState<{ [questionId: string]: number }>({});
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedQuizzesJson = localStorage.getItem('formal_quiz_suite_quizzes');
    if (savedQuizzesJson) {
      try {
        setQuizzes(JSON.parse(savedQuizzesJson));
      } catch (err) {
        setQuizzes(defaultQuizzes);
      }
    } else {
      setQuizzes(defaultQuizzes);
      localStorage.setItem('formal_quiz_suite_quizzes', JSON.stringify(defaultQuizzes));
    }

    const savedAttemptsJson = localStorage.getItem('formal_quiz_suite_attempts');
    if (savedAttemptsJson) {
      try {
        setAttempts(JSON.parse(savedAttemptsJson));
      } catch {
        setAttempts([]);
      }
    }
  }, []);

  // Save changes helper
  const saveQuizzesToStorage = (updatedQuizzes: Quiz[]) => {
    setQuizzes(updatedQuizzes);
    localStorage.setItem('formal_quiz_suite_quizzes', JSON.stringify(updatedQuizzes));
  };

  const saveAttemptsToStorage = (updatedAttempts: QuizAttempt[]) => {
    setAttempts(updatedAttempts);
    localStorage.setItem('formal_quiz_suite_attempts', JSON.stringify(updatedAttempts));
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveScreen('playing');
  };

  const handleCompleteQuiz = (answers: { [questionId: string]: number }, timeSpent: number) => {
    if (!selectedQuiz) return;

    // Compute score percentage
    let correct = 0;
    selectedQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const percentage = Math.round((correct / selectedQuiz.questions.length) * 100);

    const newAttempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: selectedQuiz.id,
      quizName: selectedQuiz.name,
      score: correct,
      totalQuestions: selectedQuiz.questions.length,
      percentage,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timeSpentSeconds: timeSpent,
      answers
    };

    const updatedAttempts = [...attempts, newAttempt];
    saveAttemptsToStorage(updatedAttempts);

    setLastAttemptAnswers(answers);
    setLastAttemptTime(timeSpent);
    setActiveScreen('score');
  };

  const handleEditQuizTrigger = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setActiveScreen('builder');
  };

  const handleCreateQuizTrigger = () => {
    setEditingQuiz(null);
    setActiveScreen('builder');
  };

  const handleSaveQuiz = (quiz: Quiz) => {
    let updatedQuizzes: Quiz[];
    const exists = quizzes.some((q) => q.id === quiz.id);

    if (exists) {
      updatedQuizzes = quizzes.map((q) => (q.id === quiz.id ? quiz : q));
    } else {
      updatedQuizzes = [...quizzes, quiz];
    }

    saveQuizzesToStorage(updatedQuizzes);
    setActiveScreen('dashboard');
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm('Are you positive you wish to remove this quiz module? This cannot be undone.')) {
      const updated = quizzes.filter((q) => q.id !== quizId);
      saveQuizzesToStorage(updated);
    }
  };

  const handleImportQuiz = (quiz: Quiz) => {
    // Check if ID collisions exist
    const isCollision = quizzes.some((q) => q.id === quiz.id);
    let finalQuiz = quiz;
    if (isCollision) {
      finalQuiz = {
        ...quiz,
        id: `quiz-imported-${Date.now()}`,
        name: `${quiz.name} (Imported)`
      };
    }
    const updated = [...quizzes, finalQuiz];
    saveQuizzesToStorage(updated);
  };

  const handleResetQuizzes = () => {
    if (confirm('Revert all quiz layouts back to standard corporate presets? Any user assemblies will be cleared.')) {
      saveQuizzesToStorage(defaultQuizzes);
      saveAttemptsToStorage([]);
      alert('Registers reverted successfully.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Professional Header Navigation */}
      <header className="bg-white border-b border-slate-200 shadow-xs z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              if (activeScreen === 'playing') {
                if (confirm('Abandon your active playthrough?')) {
                  setActiveScreen('dashboard');
                }
              } else {
                setActiveScreen('dashboard');
              }
            }}
          >
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs uppercase tracking-widest shadow-xs">
              AT
            </div>
            <div>
              <h1 className="text-slate-800 font-semibold tracking-tight text-sm sm:text-base">
                Academic & Technology Assessment: <span className="font-normal text-slate-500">Internal Portal</span>
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-xs font-medium text-slate-600">
            <span>Operator ID: 88291-B</span>
            <div className="w-px h-4 bg-slate-300"></div>
            <span className="text-blue-600 font-semibold">Standard Operating Procedures</span>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Welcome Banner (only on landing page) */}
        {activeScreen === 'dashboard' && (
          <div className="mb-8 border-b pb-6 border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Technical Modules Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Standardized multiple-choice examination framework. Design custom quizzes, upload schema scripts, review reference answers, and analyze scoring results.
            </p>
          </div>
        )}

        {/* Screen Switch Component */}
        {activeScreen === 'dashboard' && (
          <Dashboard
            quizzes={quizzes}
            attempts={attempts}
            onSelectQuiz={handleSelectQuiz}
            onCreateQuiz={handleCreateQuizTrigger}
            onEditQuiz={handleEditQuizTrigger}
            onDeleteQuiz={handleDeleteQuiz}
            onImportQuiz={handleImportQuiz}
            onResetQuizzes={handleResetQuizzes}
          />
        )}

        {activeScreen === 'playing' && selectedQuiz && (
          <QuizPlayer
            quiz={selectedQuiz}
            onComplete={handleCompleteQuiz}
            onLeave={() => setActiveScreen('dashboard')}
          />
        )}

        {activeScreen === 'score' && selectedQuiz && (
          <ScoreDashboard
            quiz={selectedQuiz}
            answers={lastAttemptAnswers}
            timeSpentSeconds={lastAttemptTime}
            onRetry={() => {
              setTimeSpentSeconds(0); // clear
              setActiveScreen('playing');
            }}
            onExit={() => {
              setSelectedQuiz(null);
              setActiveScreen('dashboard');
            }}
          />
        )}

        {activeScreen === 'builder' && (
          <QuizBuilder
            onSave={handleSaveQuiz}
            onCancel={() => setActiveScreen('dashboard')}
            editingQuiz={editingQuiz}
          />
        )}
      </main>

      {/* Corporate Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[10px] text-slate-400 tracking-wider uppercase font-medium">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Academic & Technology Assessment Platform. All rights reserved.</p>
          <p className="mt-1 pb-1 text-[9px] text-slate-300 normal-case font-mono">
            Powered by Google AI Studio • Designed with Tailwind spacing rules
          </p>
        </div>
      </footer>
    </div>
  );

  // Dummy state updates to avoid TS issues if not used
  function setTimeSpentSeconds(val: any) {}
}
