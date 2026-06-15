import { useState, useEffect, ChangeEvent } from 'react';
import { Quiz, Question } from '../types';
import { Plus, Trash2, Save, Code, Eye, FileUp, AlertTriangle, Check, CheckCircle2, Copy, Download } from 'lucide-react';

interface QuizBuilderProps {
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
  editingQuiz: Quiz | null;
}

export default function QuizBuilder({ onSave, onCancel, editingQuiz }: QuizBuilderProps) {
  const [activeTab, setActiveTab ] = useState<'visual' | 'json'>('visual');
  const [quizName, setQuizName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // JSON view states
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load existing quiz for editing or initialize with empty template
  useEffect(() => {
    if (editingQuiz) {
      setQuizName(editingQuiz.name);
      setDescription(editingQuiz.description);
      setCategory(editingQuiz.category || 'General');
      setDifficulty(editingQuiz.difficulty || 'Intermediate');
      setQuestions(editingQuiz.questions);
      setRawJson(JSON.stringify(editingQuiz, null, 2));
    } else {
      setQuizName('');
      setDescription('');
      setCategory('General');
      setDifficulty('Intermediate');
      setQuestions([
        {
          id: 'q-1',
          questionText: 'Sample Question: What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Machine Language',
            'Hyperlink and Text Management Language',
            'Home Tool Markup Language'
          ],
          correctAnswerIndex: 0,
          explanation: 'HTML stands for Hyper Text Markup Language. It is the standard markup language for creating Web pages.'
        }
      ]);
    }
  }, [editingQuiz]);

  // Sync state changes to Raw JSON tab
  useEffect(() => {
    if (activeTab === 'visual') {
      const compiledQuiz: Quiz = {
        id: editingQuiz?.id || `quiz-custom-${Date.now()}`,
        name: quizName || 'Untitled Quiz',
        description: description || 'No description provided.',
        category,
        difficulty,
        questions
      };
      setRawJson(JSON.stringify(compiledQuiz, null, 2));
    }
  }, [quizName, description, category, difficulty, questions, activeTab, editingQuiz]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-custom-${Date.now()}-${questions.length}`,
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].questionText = text;
    setQuestions(updated);
  };

  const handleExplanationChange = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].explanation = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = val;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push('');
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].options.length <= 2) {
      alert('Questions must have at least two answers.');
      return;
    }
    
    // Adjust correct answers if indices shift
    if (updated[qIdx].correctAnswerIndex === oIdx) {
      updated[qIdx].correctAnswerIndex = 0;
    } else if (updated[qIdx].correctAnswerIndex > oIdx) {
      updated[qIdx].correctAnswerIndex -= 1;
    }

    updated[qIdx].options.splice(oIdx, 1);
    setQuestions(updated);
  };

  const handleCorrectAnswerSelect = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctAnswerIndex = oIdx;
    setQuestions(updated);
  };

  // Raw JSON parser and validator
  const handleJsonChange = (val: string) => {
    setRawJson(val);
    try {
      if (!val.trim()) {
        setJsonError('JSON cannot be empty');
        return;
      }
      const parsed = JSON.parse(val);
      
      // Perform structural validations
      if (!parsed.name || typeof parsed.name !== 'string') {
        setJsonError('Missing "name" string field on quiz level.');
        return;
      }
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        setJsonError('"questions" must be a non-empty array.');
        return;
      }

      for (let i = 0; i < parsed.questions.length; i++) {
        const q = parsed.questions[i];
        if (!q.questionText || typeof q.questionText !== 'string') {
          setJsonError(`Question #${i + 1} is missing "questionText" string.`);
          return;
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          setJsonError(`Question #${i + 1} must have an "options" array with at least 2 values.`);
          return;
        }
        if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
          setJsonError(`Question #${i + 1} must have a valid "correctAnswerIndex" referencing its options.`);
          return;
        }
      }

      setJsonError(null);
    } catch (e: any) {
      setJsonError(`JSON Syntax Error: ${e.message}`);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(quizName || 'custom-quiz').toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawJson(content);
      setActiveTab('json');
      handleJsonChange(content);
    };
    reader.readAsText(file);
  };

  const handleSaveCompiledQuiz = () => {
    if (activeTab === 'json') {
      if (jsonError) {
        alert('Please fix JSON synthesis errors before saving.');
        return;
      }
      try {
        const parsed = JSON.parse(rawJson);
        // Ensure id exists
        if (!parsed.id) {
          parsed.id = editingQuiz?.id || `quiz-custom-${Date.now()}`;
        }
        onSave(parsed);
      } catch {
        alert('Invalid JSON structure.');
      }
    } else {
      // Validate visual fields
      if (!quizName.trim()) {
        alert('Please enter a Quiz Name.');
        return;
      }
      const emptyQuestions = questions.some(q => !q.questionText.trim());
      if (emptyQuestions) {
        alert('Please fill out all Question titles/text.');
        return;
      }
      const emptyOptions = questions.some(q => q.options.some(opt => !opt.trim()));
      if (emptyOptions) {
        alert('Please ensure there are no blank answers. Write an option or remove it.');
        return;
      }

      const compiledQuiz: Quiz = {
        id: editingQuiz?.id || `quiz-custom-${Date.now()}`,
        name: quizName.trim(),
        description: description.trim() || 'Custom created quiz.',
        category: category.trim() || 'General',
        difficulty,
        questions: questions.map((q, idx) => ({
          ...q,
          id: q.id || `q-custom-${idx}-${Date.now()}`
        }))
      };
      onSave(compiledQuiz);
    }
  };

  return (
    <div id="quiz-builder-wrapper" className="space-y-6">
      {/* Top Bar with actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {editingQuiz ? 'Edit Quiz' : 'Assemble New Quiz'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Build visually with form inputs or edit the raw JSON declaration directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Trigger */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition">
            <FileUp size={14} />
            <span>Upload JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveCompiledQuiz}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs hover:shadow-md transition"
          >
            <Save size={14} />
            <span>Save Quiz</span>
          </button>
        </div>
      </div>

      {/* Editor Tab Controllers */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('visual')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-[2px] transition ${
            activeTab === 'visual'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye size={16} />
          <span>Visual Creator</span>
        </button>

        <button
          onClick={() => {
            // Force compilation to JSON string before entering
            const compiledQuiz: Quiz = {
              id: editingQuiz?.id || `quiz-custom-${Date.now()}`,
              name: quizName || 'Untitled Quiz',
              description: description || 'No description provided.',
              category,
              difficulty,
              questions
            };
            setRawJson(JSON.stringify(compiledQuiz, null, 2));
            setActiveTab('json');
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-[2px] transition ${
            activeTab === 'json'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code size={16} />
          <span>JSON Schema Editor</span>
        </button>
      </div>

      {/* Visual Workspace */}
      {activeTab === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata Section */}
          <div className="lg:col-span-1 space-y-5 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Quiz Framework</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quiz Name</label>
                <input
                  type="text"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  placeholder="e.g. Finance & Auditing Standards"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Compliance, Operations, engineering"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Guidelines</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, target audience or compliance context..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Questions Core Workspace */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Questions Board ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition"
              >
                <Plus size={14} />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs space-y-4 transition"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">
                    Q{qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50 transition"
                    title="Remove Question"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Question title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Question Text</label>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder="e.g. What is the standard protocol utilized for..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* MCQ Options */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-500">Choice Answers</label>
                    <span className="text-[10px] text-slate-400 italic">Select the indicator dot for the correct answer</span>
                  </div>

                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCorrectAnswerSelect(qIdx, oIdx)}
                        className={`flex items-center justify-center w-5 h-5 rounded-full border transition ${
                          q.correctAnswerIndex === oIdx
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                            : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                        }`}
                        title="Set as correct answer"
                      >
                        <Check size={12} className="stroke-[3]" />
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(qIdx, oIdx)}
                        className="p-1 text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddOption(qIdx)}
                    className="text-xs font-medium text-slate-500 hover:text-blue-500 flex items-center gap-1 pt-1 pl-7 transition"
                  >
                    <Plus size={12} />
                    <span>Add option</span>
                  </button>
                </div>

                {/* Explanation */}
                <div className="pt-2 border-t border-slate-50">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Explanatory Reference <span className="text-slate-400 font-normal">(Shown on final summary)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={q.explanation || ''}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    placeholder="Underlying principle, documentation links, or justification details..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Raw JSON Code Workspace */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Paste or draft your absolute schema representation here
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition"
              >
                {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Schema'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition"
              >
                <Download size={13} />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={22}
              value={rawJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full font-mono text-xs p-4 bg-slate-900 text-slate-100 rounded-lg focus:outline-none border border-slate-800 leading-relaxed shadow-inner"
              placeholder={`{
  "name": "Custom Chemistry Quiz",
  "category": "Science",
  "difficulty": "Beginner",
  "description": "Short description of the parameters",
  "questions": [
    {
      "id": "chem-1",
      "questionText": "What is the chemical formula of ozone gas?",
      "options": ["O2", "O3", "CO2", "H2O"],
      "correctAnswerIndex": 1,
      "explanation": "Ozone is trioxygen, containing three atoms of oxygen."
    }
  ]
}`}
            />
          </div>

          {/* Validation Feedback Banner */}
          {jsonError ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
              <AlertTriangle className="shrink-0 text-red-500" size={16} />
              <div>
                <span className="font-semibold block mb-0.5">Validation Failure</span>
                <p className="font-mono">{jsonError}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-emerald-500 animate-pulse" size={16} />
              <span className="font-medium">Valid JSON Quiz Structure format. Ready to save!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
