import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { LeaderboardUser } from '../types';
import { useAuth } from '../context/AuthContext';
import { Building2, Globe, Trophy, Zap, UserPlus } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'global' | 'college'>(
    location.pathname.includes('college') ? 'college' : 'global'
  );

  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([]);
  const [collegeLeaderboard, setCollegeLeaderboard] = useState<LeaderboardUser[]>([]);

  const [currentUserGlobalRank, setCurrentUserGlobalRank] = useState<number | null>(null);
  const [currentUserCollegeRank, setCurrentUserCollegeRank] = useState<number | null>(null);
  const [totalCollegeStudents, setTotalCollegeStudents] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);

  const fetchGlobal = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaderboard/global');
      setGlobalLeaderboard(res.data.leaderboard || []);
      if (res.data.currentUserRankInfo) {
        setCurrentUserGlobalRank(res.data.currentUserRankInfo.rank);
      }
    } catch (err) {
      console.error('Failed to load global leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollege = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/leaderboard/college');
      setCollegeLeaderboard(res.data.leaderboard || []);
      setTotalCollegeStudents(res.data.totalStudents || 0);
      if (res.data.currentUserCollegeRank) {
        setCurrentUserCollegeRank(res.data.currentUserCollegeRank.rank);
      }
    } catch (err) {
      console.error('Failed to load college leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'global') {
      fetchGlobal();
    } else {
      fetchCollege();
    }
  }, [activeTab, user]);

  const handleTabSwitch = (tab: 'global' | 'college') => {
    setActiveTab(tab);
    if (tab === 'global') {
      navigate('/leaderboard/global');
    } else {
      navigate('/leaderboard/college');
    }
  };

  const activeLeaderboard = activeTab === 'global' ? globalLeaderboard : collegeLeaderboard;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Official Rankings</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Competitive Leaderboard</h1>
          <p className="text-xs text-slate-600 font-medium">Track your standing globally and within your college community.</p>
        </div>

        {/* Tab Toggle Bar */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-xl flex items-center space-x-2 border border-slate-200 shadow-xs">
            <button
              onClick={() => handleTabSwitch('global')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'global'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>GLOBAL</span>
            </button>

            <button
              onClick={() => handleTabSwitch('college')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'college'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>MY COLLEGE</span>
            </button>
          </div>
        </div>

        {/* Highlight Student Rank Banner */}
        {user && (
          <div className="bg-white p-6 rounded-xl mb-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{user.name} ({user.username})</h3>
                <p className="text-xs text-blue-600 font-semibold flex items-center space-x-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user.college?.name || 'COER University'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {activeTab === 'global' ? (
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold">Your Global Rank</p>
                  <p className="text-2xl font-black text-amber-600">
                    #{currentUserGlobalRank !== null ? currentUserGlobalRank : '--'}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold">Your College Rank</p>
                  <p className="text-2xl font-black text-blue-600">
                    #{currentUserCollegeRank !== null ? currentUserCollegeRank : '--'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold">({totalCollegeStudents} Registered Students)</span>
                </div>
              )}

              <div className="text-center border-l border-slate-200 pl-6">
                <p className="text-xs text-slate-500 uppercase font-bold">Total Points</p>
                <p className="text-2xl font-black text-emerald-600">{user.totalPoints} pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Loading {activeTab} rankings from database...</p>
            </div>
          ) : activeLeaderboard.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <UserPlus className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-base font-bold text-slate-800">No real students registered in this category yet.</p>
              <p className="text-xs text-slate-500">Leaderboards populate exclusively from live student registrations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Student</th>
                    {activeTab === 'global' && <th className="py-3.5 px-6">College</th>}
                    <th className="py-3.5 px-6 text-center">Problems Solved</th>
                    <th className="py-3.5 px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeLeaderboard.map((u) => {
                    const isTop1 = u.rank === 1;
                    const isTop2 = u.rank === 2;
                    const isTop3 = u.rank === 3;

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          u.isCurrentUser
                            ? 'bg-blue-50/60 border-l-4 border-blue-600 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {isTop1 && <span className="text-lg">🥇</span>}
                            {isTop2 && <span className="text-lg">🥈</span>}
                            {isTop3 && <span className="text-lg">🥉</span>}
                            <span className={`font-mono text-xs font-extrabold ${
                              isTop1 ? 'text-amber-600' : isTop2 ? 'text-slate-700' : isTop3 ? 'text-amber-700' : 'text-slate-600'
                            }`}>
                              #{u.rank}
                            </span>
                          </div>
                        </td>

                        {/* Student Name & Username */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-extrabold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`font-extrabold ${u.isCurrentUser ? 'text-blue-600' : 'text-slate-900'}`}>
                                {u.name} {u.isCurrentUser && '(You)'}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono font-semibold">@{u.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* College */}
                        {activeTab === 'global' && (
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800 font-medium">
                              {u.college?.name || 'COER University'}
                            </span>
                          </td>
                        )}

                        {/* Solved Count */}
                        <td className="py-4 px-6 text-center font-bold text-slate-800">
                          {u.solvedCount}
                        </td>

                        {/* Total Points */}
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center space-x-1 font-black text-amber-700">
                            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                            <span>{u.totalPoints} pts</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
