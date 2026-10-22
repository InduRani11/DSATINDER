import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Problem, SubmissionHistory } from '../types';
import {
  Flame,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/profile/dashboard');
        setDashboardData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.progressStats || {
    totalPoints: user?.totalPoints || 0,
    solvedCount: user?.solvedCount || 0,
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  };

  const globalRank = dashboardData?.globalRank || user?.globalRank || 1;
  const collegeRank = dashboardData?.collegeRank || user?.collegeRank || 1;
  const recentSubmissions: SubmissionHistory[] = dashboardData?.recentSubmissions || [];
  const recommendedProblems: Problem[] = dashboardData?.recommendedProblems || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Student Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name} 👋
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Representing <strong className="text-blue-600">{user?.college?.name}</strong> ({user?.college?.code})
            </p>
          </div>

          {/* Quick Stat Highlights */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-center">
              <div className="flex items-center justify-center space-x-1 font-black text-base">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{stats.currentStreak}d</span>
              </div>
              <p className="text-[10px] uppercase font-extrabold text-slate-500">Streak</p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-center">
              <div className="flex items-center justify-center space-x-1 font-black text-base">
                <Zap className="w-4 h-4 fill-blue-600 text-blue-600" />
                <span>{stats.totalPoints}</span>
              </div>
              <p className="text-[10px] uppercase font-extrabold text-slate-500">Points</p>
            </div>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-xs">
            <p className="text-xs font-extrabold text-slate-500 uppercase">Global Rank</p>
            <p className="text-2xl font-black text-amber-600 mt-1">#{globalRank}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Overall platform standing</p>
          </div>

          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-xs">
            <p className="text-xs font-extrabold text-slate-500 uppercase">College Rank</p>
            <p className="text-2xl font-black text-blue-600 mt-1">#{collegeRank}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{user?.college?.code} Leaderboard</p>
          </div>

          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-xs">
            <p className="text-xs font-extrabold text-slate-500 uppercase">Solved Problems</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.solvedCount}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">First-solve points awarded</p>
          </div>

          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-xs">
            <p className="text-xs font-extrabold text-slate-500 uppercase">Longest Streak</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{stats.longestStreak} Days</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Active daily coding</p>
          </div>
        </div>

        {/* Difficulty Breakdown & Recommended Problems */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Difficulty Progress */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Difficulty Breakdown</h3>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">Easy (10 pts)</span>
                  <span className="text-slate-500">{stats.easySolved} Solved</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (stats.easySolved / 45) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-700">Medium (25 pts)</span>
                  <span className="text-slate-500">{stats.mediumSolved} Solved</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (stats.mediumSolved / 50) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-red-700">Hard (50 pts)</span>
                  <span className="text-slate-500">{stats.hardSolved} Solved</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (stats.hardSolved / 15) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Unsolved Problems */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm">Recommended Unsolved Problems</h3>
              <Link to="/problems" className="text-xs text-blue-600 hover:underline flex items-center space-x-1 font-bold">
                <span>View Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {recommendedProblems.slice(0, 4).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link to={`/problems/${p.slug}`} className="text-xs font-bold text-slate-900 hover:text-blue-600">
                      {p.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-0.5 text-[11px]">
                      <span className="text-slate-500 font-mono font-medium">{p.topic}</span>
                      <span className={
                        p.difficulty === 'EASY' ? 'text-emerald-700 font-extrabold' :
                        p.difficulty === 'MEDIUM' ? 'text-amber-700 font-extrabold' : 'text-red-700 font-extrabold'
                      }>
                        {p.difficulty}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/problems/${p.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-xs font-bold text-slate-800 shadow-xs"
                  >
                    Solve (+{p.points} pts)
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Recent Submissions</h3>

          {recentSubmissions.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              No recent submissions found. Start solving problems in the arena!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase font-extrabold bg-slate-50">
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {recentSubmissions.slice(0, 5).map((s: any) => (
                    <tr key={s.id}>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {s.problem?.title || 'DSA Problem'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 uppercase">{s.language}</td>
                      <td className="py-3 px-4">
                        <span className={`font-extrabold ${s.status === 'Accepted' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{s.runtime || s.executionTime || 0} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
