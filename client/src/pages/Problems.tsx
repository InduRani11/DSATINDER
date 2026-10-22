import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { Problem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  CheckCircle2,
  Zap,
  BookOpen
} from 'lucide-react';

export const Problems: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const searchQuery = searchParams.get('search') || '';
  const selectedDifficulty = searchParams.get('difficulty') || '';
  const selectedTopic = searchParams.get('topic') || '';
  const selectedStatus = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || 'title';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
      if (selectedTopic) params.set('topic', selectedTopic);
      if (selectedStatus) params.set('status', selectedStatus);
      params.set('sortBy', sortBy);
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      const res = await api.get(`/problems?${params.toString()}`);
      setProblems(res.data.problems || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
      if (res.data.availableTopics) {
        setTopics(res.data.availableTopics);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [searchParams, user]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toUpperCase()) {
      case 'EASY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 border border-emerald-300 text-emerald-900">Easy (+10)</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 border border-amber-300 text-amber-950">Medium (+25)</span>;
      case 'HARD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 border border-red-300 text-red-950">Hard (+50)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <span>DSA Practice Arena</span>
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">110+ curated problems across 13 core topics.</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-4">
            <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-xs text-xs font-semibold">
              <span className="text-slate-500">Total Listed:</span>{' '}
              <span className="font-extrabold text-slate-900">{pagination.total}</span>
            </div>
            {user && (
              <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-xs text-xs font-semibold">
                <span className="text-slate-500">Your Solved:</span>{' '}
                <span className="font-extrabold text-emerald-700">{user.solvedCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search problem title or topic..."
                value={searchQuery}
                onChange={(e) => updateParam('search', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 pl-10 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => updateParam('difficulty', e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy (10 pts)</option>
              <option value="MEDIUM">Medium (25 pts)</option>
              <option value="HARD">Hard (50 pts)</option>
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => updateParam('topic', e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Status Filter */}
            {user ? (
              <select
                value={selectedStatus}
                onChange={(e) => updateParam('status', e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="solved">Solved Only</option>
                <option value="unsolved">Unsolved Only</option>
              </select>
            ) : (
              <select
                value={sortBy}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="title">Sort by Title</option>
                <option value="points">Sort by Points</option>
              </select>
            )}
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Loading problems...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <p className="text-base font-bold text-slate-800">No problems found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-6 w-14 text-center">Status</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Topic</th>
                    <th className="py-3.5 px-6">Difficulty</th>
                    <th className="py-3.5 px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold">
                  {problems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 text-center">
                        {p.isSolved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                        )}
                      </td>

                      <td className="py-4 px-6 font-bold">
                        <Link
                          to={`/problems/${p.slug}`}
                          className="text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {p.title}
                        </Link>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 font-medium">
                          {p.topic}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {getDifficultyBadge(p.difficulty)}
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-black text-amber-700">
                        <span className="inline-flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                          <span>+{p.points}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>
                Page <strong className="text-slate-900">{pagination.page}</strong> of{' '}
                <strong className="text-slate-900">{pagination.totalPages}</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateParam('page', (pagination.page - 1).toString())}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 disabled:opacity-40 shadow-xs font-bold"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateParam('page', (pagination.page + 1).toString())}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 disabled:opacity-40 shadow-xs font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
