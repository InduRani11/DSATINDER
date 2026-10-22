import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Trophy,
  Zap,
  Flame,
  Award,
  Mail
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <p className="text-xs text-slate-500 font-mono font-semibold">@{user.username}</p>

              <div className="flex items-center space-x-3 mt-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </span>
                <span className="flex items-center space-x-1 text-blue-600">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user.college?.name || 'COER University'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-center">
              <p className="text-xs uppercase font-extrabold text-slate-500">Global Rank</p>
              <p className="text-xl font-black text-amber-600">#{user.globalRank || 1}</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-center">
              <p className="text-xs uppercase font-extrabold text-slate-500">College Rank</p>
              <p className="text-xl font-black text-blue-600">#{user.collegeRank || 1}</p>
            </div>
          </div>
        </div>

        {/* 3 Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-extrabold uppercase">Total Points</p>
              <p className="text-2xl font-black text-slate-900">{user.totalPoints} pts</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-extrabold uppercase">Current Streak</p>
              <p className="text-2xl font-black text-slate-900">{user.currentStreak} Days</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-extrabold uppercase">Problems Solved</p>
              <p className="text-2xl font-black text-slate-900">{user.solvedCount}</p>
            </div>
          </div>
        </div>

        {/* Achievements Info */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900">Achievement Badges</h2>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div className="text-3xl">🏆</div>
            <p className="text-sm font-extrabold text-slate-900">DSA Pioneer</p>
            <p className="text-xs text-slate-600 font-medium">Solve DSA problems in the arena to unlock milestone badges and climb leaderboards!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
