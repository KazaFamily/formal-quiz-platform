import { useState, ChangeEvent } from 'react';
import { Quiz, QuizAttempt } from '../types';
import { Play, Plus, Edit3, Trash2, Search, SlidersHorizontal, BookOpen, Layers, Trophy, Clock, History, AlertCircle, FileUp, CheckCircle, RotateCcw } from 'lucide-react';

interface DashboardProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  onSelectQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onImportQuiz: (quiz: Quiz) => void;
  onResetQuizzes: () => void;
}

export default function Dashboard({
  quizzes,
  attempts,
  onSelectQuiz,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onImportQuiz,
  onResetQuizzes
}: DashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Compute aggregate statistics
  const totalAttempts = attempts.length;
  const avgPercentage = totalAttempts
    ? Math.round(attempts.reduce((sum, item) => sum + item.percentage, 0) / totalAttempts)
    : 0;
  const perfectScoresCount = attempts.filter((a) => a.percentage === 100).length;
  const totalTimeSeconds = attempts.reduce((sum, item) => sum + item.timeSpentSeconds, 0);

  // Retrieve unique categories
  const categories = ['All', ...Array.from(new Set(quizzes.map((q) => q.category).filter(Boolean)))];

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch = q.name.toLowerCase().includes(search.toLowerCase()) ||
                          q.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${seconds % 60}s`;
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.name || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          setImportStatus('Invalid JSON schema structure.');
          return;
        }
        // Give generic ID if missing
        if (!parsed.id) {
          parsed.id = `quiz-custom-imported-${Date.now()}`;
        }
        if (!parsed.category) parsed.category = 'General';
        if (!parsed.difficulty) parsed.difficulty = 'Intermediate';

        onImportQuiz(parsed);
        setImportStatus('Quiz imported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus('Parse Fail: Invalid JSON file.');
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="quiz-dashboard-workspace" className="space-y-8 animate-fade-in">
      
      {/* HUD Corporate Statistics Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Module Registry</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{quizzes.length}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 shrink-0 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completions</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{totalAttempts}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 flex items-center gap-4">
          <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${avgPercentage >= 90 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
            <Trophy size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Grading</span>
            <span className="text-xl font-bold text-slate-800 font-mono">
              {totalAttempts ? `${avgPercentage}%` : '--'}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 shrink-0 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Practice</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{totalAttempts ? formatTotalTime(totalTimeSeconds) : '--'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Quiz Registry (Left) + Attempts Panel (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Space: Directory Search and Registry */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search module titles, topics, descriptors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Quick Filter controllers */}
            <div className="flex items-center gap-2">
              
              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none transition"
              >
                <option value="All">All Topics</option>
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Difficulty Selector */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none transition"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Reset to defaults helper button */}
              <button
                onClick={onResetQuizzes}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Reset to default quizzes"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Import Status Alert Banner */}
          {importStatus && (
            <div className={`p-3 text-xs border rounded-lg flex items-center gap-2 ${
              importStatus.includes('success')
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {importStatus.includes('success') ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span className="font-medium">{importStatus}</span>
            </div>
          )}

          {/* Quiz Cards Deck */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuizzes.length === 0 ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <AlertCircle size={32} className="mx-auto text-slate-300" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">No Assessments Located</h4>
                  <p className="text-xs text-slate-400">Modify filters, clear your search query, or import a customized file.</p>
                </div>
              </div>
            ) : (
              filteredQuizzes.map((quiz) => {
                const isCustom = quiz.id.startsWith('quiz-custom');
                const lastAttempt = [...attempts]
                  .reverse()
                  .find((a) => a.quizId === quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 hover:shadow-xs transition duration-200 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Meta chips */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quiz.category}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            quiz.difficulty === 'Beginner'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                              : quiz.difficulty === 'Intermediate'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100/50'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100/50'
                          }`}>
                            {quiz.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition">
                          {quiz.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {quiz.description}
                        </p>
                      </div>

                      {/* Question stats / performance history block */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="font-semibold">{quiz.questions.length} Question items</span>
                        {lastAttempt && (
                          <span className="font-bold text-slate-500">
                            Last Score: <span className={lastAttempt.percentage >= 90 ? 'text-blue-600' : 'text-slate-700'}>{lastAttempt.percentage}%</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Triggers */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                      
                      {/* Custom indicator or simple label */}
                      <span className="text-[10px] text-slate-300 font-semibold font-mono">
                        {isCustom ? 'LOCAL SPEC' : 'PREINSTALLED'}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Edit trigger */}
                        <button
                          onClick={() => onEditQuiz(quiz)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                          title="Edit Quiz Definition"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete trigger (only for local user created quizzes, standard presets remain safe) */}
                        {isCustom && (
                          <button
                            onClick={() => onDeleteQuiz(quiz.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Quiz"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => onSelectQuiz(quiz)}
                          className="flex items-center gap-1 ml-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs hover:shadow"
                        >
                          <Play size={10} className="fill-current" />
                          <span>Begin</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Space: Recent History Ledger & Sidebars */}
        <div className="space-y-6">
          
          {/* Quick Create CTA Block */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
            {/* Visual background details */}
            <div className="absolute right-0 bottom-0 opacity-10 font-[Space Grotesk] font-bold text-8xl pointer-events-none select-none tracking-tighter">
              Q
            </div>

            <div className="space-y-1.5 relative z-10">
              <h3 className="text-sm font-bold tracking-tight">Enterprise Quiz Architect</h3>
              <p className="text-xs text-slate-300 leading-normal">
                Authorize specialized assessment schemas. Generate customized multiple choice question banks.
              </p>
            </div>

            <div className="flex flex-col gap-2 relative z-10 pt-2">
              <button
                onClick={onCreateQuiz}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Plus size={14} />
                <span>Craft Quiz Visualizer</span>
              </button>

              <label className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition select-none">
                <FileUp size={14} />
                <span>Upload Custom JSON File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Attempts Ledger (Compact table history) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-150 flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Attempts Ledger</h3>
            </div>

            {attempts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No completion records documented. Selected course modules will log attempts here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto custom-scrollbar">
                {[...attempts].reverse().slice(0, 8).map((attempt) => (
                  <div key={attempt.id} className="p-4 hover:bg-slate-50/50 transition flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[150px] sm:max-w-none">
                      <h4 className="text-xs font-bold text-slate-700 truncate" title={attempt.quizName}>
                        {attempt.quizName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{attempt.date}</span>
                        <span>•</span>
                        <span>{attempt.timeSpentSeconds}s</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        attempt.percentage >= 90
                          ? 'bg-blue-50 text-blue-600 border border-blue-100/50'
                          : attempt.percentage >= 70
                          ? 'bg-teal-50 text-teal-600 border border-teal-100/50'
                          : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                        {attempt.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
