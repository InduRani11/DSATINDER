import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Zap,
  Building2,
  ArrowRight,
  Sparkles,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const topics = [
    { name: 'Arrays', count: 15, icon: '📊' },
    { name: 'Strings', count: 10, icon: '🔤' },
    { name: 'Linked List', count: 10, icon: '🔗' },
    { name: 'Trees', count: 10, icon: '🌲' },
    { name: 'Graphs', count: 10, icon: '🌐' },
    { name: 'Dynamic Programming', count: 10, icon: '🧠' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>DSA Practice & College Leaderboards</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master DSA Problems.{' '}
              <span className="text-blue-600">Rank Your College.</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Solve 110+ Data Structures & Algorithms problems across 13 topics. Track active streaks, earn difficulty points, and climb real-time Global and College Leaderboards.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {user ? (
                <Link
                  to="/problems"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Browse Problems</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs"
                  >
                    <span>Register Student Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/problems"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs"
                  >
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span>Explore Problems</span>
                  </Link>
                </>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                <p className="text-3xl font-extrabold text-slate-900">110+</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">DSA Problems</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                <p className="text-3xl font-extrabold text-blue-600">10+</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Top Colleges</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                <p className="text-3xl font-extrabold text-emerald-600">5</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Languages (C++, Py, JS, Java, C)</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                <p className="text-3xl font-extrabold text-amber-600">2</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Real Leaderboards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Features</h2>
            <p className="text-xs text-slate-500 mt-1">Clean competitive programming experience focused on learning & progress.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-200">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Dual Leaderboards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare your performance on both Global and My College Leaderboards with rank highlights.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Strict Point System</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Earn 10 pts for Easy, 25 pts for Medium, and 50 pts for Hard. Points are awarded once on your first solve.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Code Execution Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrated Monaco Editor supporting C++, Python 3, Java, JavaScript, and C with test case evaluation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Topics */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">DSA Topics</h2>
              <p className="text-xs text-slate-500">Structured problem tracks</p>
            </div>
            <Link to="/problems" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <span>View All Problems</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((t) => (
              <Link
                key={t.name}
                to={`/problems?topic=${encodeURIComponent(t.name)}`}
                className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:border-blue-400 transition-colors shadow-xs group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                    <p className="text-[11px] text-slate-500">{t.count} Problems</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
