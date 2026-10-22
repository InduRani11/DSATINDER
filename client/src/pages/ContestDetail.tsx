import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Contest } from '../types';
import { Trophy, Clock, Code2 } from 'lucide-react';



export const ContestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchContestDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/contests/${id}`);
        setContest(res.data.contest);
      } catch (err) {
        console.error('Error fetching contest detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContestDetail();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading contest arena...</p>
        </div>
      </div>
    );
  }
  if (!contest) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <p className="text-xs">Contest not found.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
              contest.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              contest.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              'bg-slate-100 text-slate-600'
            }`}>
              {contest.status}
            </span>
            <span className="text-xs text-slate-500 flex items-center space-x-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Duration: {contest.duration} Minutes</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{contest.title}</h1>
          <p className="text-xs text-slate-600">{contest.description}</p>
        </div>
        {/* Contest Problems List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <span>Contest Problems</span>
          </h2>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <th className="py-3.5 px-6">Problem Title</th>
                    <th className="py-3.5 px-6">Topic</th>
                    <th className="py-3.5 px-6">Difficulty</th>
                    <th className="py-3.5 px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contest.problems && contest.problems.length > 0 ? (
                    contest.problems.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <Link to={`/problems/${p.slug}`} className="hover:text-blue-600 transition-colors">
                            {p.title}
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono">
                            {p.topic}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-xs">
                          <span className={
                            p.difficulty === 'EASY' ? 'text-emerald-600' :
                            p.difficulty === 'MEDIUM' ? 'text-amber-600' : 'text-red-600'
                          }>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-amber-600">
                          +{p.points} Pts
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                        No problems have been attached to this contest yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Contest Leaderboard */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Live Contest Standings</span>
          </h2>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Participant</th>
                    <th className="py-3.5 px-6">College</th>
                    <th className="py-3.5 px-6 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contest.leaderboard && contest.leaderboard.length > 0 ? (
                    contest.leaderboard.map((row) => (
                      <tr key={row.userId} className={row.isCurrentUser ? 'bg-blue-50/60 border-l-4 border-blue-600 font-bold' : ''}>
                        <td className="py-4 px-6 font-mono font-bold text-slate-600">#{row.rank}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">{row.name} ({row.username})</td>
                        <td className="py-4 px-6 font-mono text-xs text-blue-600">{row.college}</td>
                        <td className="py-4 px-6 text-right font-black text-amber-600">{row.score} pts</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">No submission rankings recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};