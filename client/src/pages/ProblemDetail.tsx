import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import type { Problem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Zap,
  Copy,
  Check,
  Award,
  Terminal,
  BookOpen,
  Code
} from 'lucide-react';

export const ProblemDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java' | 'c'>('javascript');
  const [code, setCode] = useState<string>('');

  const [executing, setExecuting] = useState(false);

  const [execResult, setExecResult] = useState<any>(null);
  const [submissionOutcome, setSubmissionOutcome] = useState<{
    status: string;
    firstSolve: boolean;
    pointsAwarded: number;
    newBadges: string[];
  } | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/problems/${slug}`);
        const p: Problem = res.data.problem;
        setProblem(p);

        if (p.starterCode && p.starterCode[language]) {
          setCode(p.starterCode[language]);
        } else {
          setCode(`// Write your solution for ${p.title} here`);
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'cpp' | 'java' | 'c') => {
    setLanguage(newLang);
    if (problem?.starterCode && problem.starterCode[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const getMonacoLang = (lang: string) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      case 'c': return 'c';
      default: return 'javascript';
    }
  };

  const handleRunCode = async () => {
    if (!problem || !user) {
      if (!user) navigate('/login');
      return;
    }

    setExecuting(true);
    setExecResult(null);
    setSubmissionOutcome(null);

    try {
      const res = await api.post('/submissions/run', {
        problemId: problem.id,
        language,
        sourceCode: code
      });
      setExecResult(res.data.result);
    } catch (err: any) {
      setExecResult({
        status: 'Runtime Error',
        error: err.response?.data?.error || 'Execution failed'
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem || !user) {
      if (!user) navigate('/login');
      return;
    }

    setExecuting(true);
    setExecResult(null);
    setSubmissionOutcome(null);

    try {
      const res = await api.post('/submissions', {
        problemId: problem.id,
        language,
        sourceCode: code
      });

      const outcome = res.data;
      setExecResult(outcome.result);
      setSubmissionOutcome({
        status: outcome.result.status,
        firstSolve: outcome.firstSolve,
        pointsAwarded: outcome.pointsAwarded,
        newBadges: outcome.newBadges || []
      });

      if (outcome.result.status === 'Accepted') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        refreshUser();
      }
    } catch (err: any) {
      setExecResult({
        status: 'Runtime Error',
        error: err.response?.data?.error || 'Submission failed'
      });
    } finally {
      setExecuting(false);
    }
  };

  const copyExampleInput = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold">Loading compiler workspace...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <p className="text-base font-bold">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-6">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{problem.title}</h1>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                  {problem.topic}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  problem.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  problem.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-red-100 text-red-900 border border-red-300'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 font-extrabold text-xs flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 fill-blue-600" />
                  <span>+{problem.points} Points</span>
                </span>
              </div>
            </div>
          </div>

          {problem.isSolved && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Solved Problem</span>
            </div>
          )}
        </div>

        {/* 2-Column Spacious Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN - Problem Description (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col space-y-6 max-h-[1050px] overflow-y-auto">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">Problem Statement</h2>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">{problem.description}</p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-xs text-blue-700 uppercase tracking-wider mb-1">Input Format</h3>
                <p className="text-xs text-slate-800 font-medium">{problem.inputFormat}</p>
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-blue-700 uppercase tracking-wider mb-1">Output Format</h3>
                <p className="text-xs text-slate-800 font-medium">{problem.outputFormat}</p>
              </div>
            </div>

            {problem.examples && problem.examples.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Examples</h3>
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>Example {idx + 1}</span>
                      <button
                        onClick={() => copyExampleInput(ex.input, idx)}
                        className="text-slate-600 hover:text-blue-600 flex items-center space-x-1 font-bold"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy Input'}</span>
                      </button>
                    </div>
                    <div>
                      <span className="text-xs text-slate-700 font-bold">Input:</span>
                      <pre className="mt-1 p-3 rounded-lg bg-white border border-slate-300 text-blue-900 font-mono text-xs overflow-x-auto font-bold">
                        {ex.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-slate-700 font-bold">Output:</span>
                      <pre className="mt-1 p-3 rounded-lg bg-white border border-slate-300 text-emerald-900 font-mono text-xs overflow-x-auto font-bold">
                        {ex.output}
                      </pre>
                    </div>
                    {ex.explanation && (
                      <div className="text-xs text-slate-700 pt-1 border-t border-slate-200 font-medium">
                        <span className="font-bold text-slate-900">Explanation:</span> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-2">Constraints</h3>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 font-bold">
                {problem.constraints}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Monaco Editor (600px) & Execution Results Drawer (380px) (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            {/* Compiler Editor Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
              {/* Compiler Controls Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center space-x-2.5">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-slate-900 font-extrabold">Select Language:</span>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-600 shadow-xs"
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                    <option value="java">Java 17</option>
                    <option value="c">C (GCC)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunCode}
                    disabled={executing}
                    className="px-4 py-2 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Code</span>
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    disabled={executing}
                    className="px-5 py-2 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Code</span>
                  </button>
                </div>
              </div>

              {/* Monaco Editor (Spacious 580px Height) */}
              <div className="h-[580px] w-full border-b border-slate-200">
                <Editor
                  height="100%"
                  language={getMonacoLang(language)}
                  theme="vs"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace"
                  }}
                />
              </div>
            </div>

            {/* Execution & Judge Output Drawer (Spacious 380px Height) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-h-[380px] flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-100 border-b border-slate-200 text-xs font-extrabold text-slate-900">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>Execution & Judge Output Drawer</span>
                </div>

                {execResult && (
                  <div className="flex items-center space-x-4 text-xs font-mono font-bold">
                    <span className="flex items-center space-x-1 text-blue-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{execResult.runtime} ms</span>
                    </span>
                    <span className="flex items-center space-x-1 text-purple-700">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{execResult.memory} KB</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 font-mono text-xs space-y-4 flex-1 overflow-y-auto">
                {executing ? (
                  <div className="flex items-center space-x-3 text-slate-700 py-12 justify-center">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="font-extrabold text-sm">Compiling and evaluating source code against test cases...</span>
                  </div>
                ) : submissionOutcome ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      submissionOutcome.status === 'Accepted'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-extrabold'
                        : 'bg-red-100 border-red-300 text-red-950 font-extrabold'
                    }`}>
                      <div className="flex items-center space-x-2 font-extrabold text-base">
                        {submissionOutcome.status === 'Accepted' ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-700" />
                        )}
                        <span>Judge Result: {submissionOutcome.status}</span>
                      </div>

                      {submissionOutcome.firstSolve && (
                        <span className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-black text-xs">
                          <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
                          <span>+{submissionOutcome.pointsAwarded} Points Awarded!</span>
                        </span>
                      )}
                    </div>

                    {submissionOutcome.newBadges && submissionOutcome.newBadges.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-purple-100 border border-purple-300 text-purple-950 flex items-center space-x-2 text-xs font-extrabold">
                        <Award className="w-5 h-5 text-purple-700" />
                        <span>
                          Achievement Badge Unlocked: {submissionOutcome.newBadges.join(', ')}! 🏆
                        </span>
                      </div>
                    )}

                    {execResult?.testResults && (
                      <div className="space-y-3">
                        {execResult.testResults.map((tr: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-900">Test Case {idx + 1}</span>
                              <span className={tr.passed ? 'text-emerald-700 font-black' : 'text-red-700 font-black'}>
                                {tr.passed ? 'PASSED ✅' : 'FAILED ❌'}
                              </span>
                            </div>
                            {!tr.isHidden && (
                              <div className="text-slate-800 space-y-1 pt-1 font-bold">
                                <div>Input: <span className="text-blue-700">{tr.input}</span></div>
                                <div>Expected: <span className="text-emerald-700">{tr.expectedOutput}</span></div>
                                <div>Actual: <span className={tr.passed ? 'text-emerald-700' : 'text-red-700'}>{tr.actualOutput}</span></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : execResult ? (
                  <div className="space-y-4">
                    <div className={`p-3.5 rounded-xl border font-black text-xs ${
                      execResult.status === 'Accepted' ? 'bg-emerald-100 border-emerald-300 text-emerald-950' : 'bg-red-100 border-red-300 text-red-950'
                    }`}>
                      Status: {execResult.status} ({execResult.passedCount} / {execResult.totalCount} Sample Cases Passed)
                    </div>

                    {execResult.error && (
                      <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-950 text-xs whitespace-pre-wrap font-mono font-bold">
                        <strong className="block mb-1 text-sm text-red-900">Compiler / Execution Error:</strong>
                        {execResult.error}
                      </div>
                    )}

                    {execResult.testResults?.map((tr: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-bold">
                        <div className="flex justify-between">
                          <span className="text-slate-900">Sample {idx + 1}</span>
                          <span className={tr.passed ? 'text-emerald-700 font-black' : 'text-red-700 font-black'}>{tr.passed ? 'Passed' : 'Failed'}</span>
                        </div>
                        <div>Input: <span className="text-blue-700">{tr.input}</span></div>
                        <div>Expected: <span className="text-emerald-700">{tr.expectedOutput}</span></div>
                        <div>Output: <span className="text-slate-900">{tr.actualOutput}</span></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-600 py-10 text-center text-xs space-y-2">
                    <p className="font-extrabold text-slate-900 text-sm">Compiler Output Workspace Ready</p>
                    <p>Click <span className="text-emerald-700 font-black">Run Code</span> to test sample inputs, or <span className="text-blue-700 font-black">Submit Code</span> for official judge scoring.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
