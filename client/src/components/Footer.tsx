import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">Algo<span className="text-blue-600">Rank</span></span>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Full-Stack DSA Practice, Points, College Leaderboard & Competitive Programming Platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 font-semibold">
              <li>
                <Link to="/problems" className="hover:text-blue-600 text-slate-700">DSA Problem Arena</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-blue-600 text-slate-700">Global & College Leaderboards</Link>
              </li>
              <li>
                <Link to="/contests" className="hover:text-blue-600 text-slate-700">Live & Weekly Contests</Link>
              </li>
            </ul>
          </div>

          {/* Colleges */}
          <div>
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider mb-3">Supported Institutions</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              COER University, IIT Delhi, NIT Jaipur, BITS Pilani, IIT Bombay, IIIT Hyderabad, DTU, MIT, Stanford, Harvard.
            </p>
          </div>

          {/* Platform Spec */}
          <div>
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider mb-3">Platform Owner</h4>
            <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Single Admin Architecture</span>
            </div>
            <p className="text-slate-600 mt-1.5 font-medium">Multi-Language Code Runner for C++, Python, Java, JS, C.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-600 font-medium">
          <p>© {new Date().getFullYear()} AlgoRank. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-semibold text-slate-800">Empowering Student Competitive Programmers</p>
        </div>
      </div>
    </footer>
  );
};
