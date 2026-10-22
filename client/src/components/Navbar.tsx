import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Terminal,
  Code2,
  Trophy,
  Award,
  BarChart3,
  User as UserIcon,
  LogOut,
  Flame,
  Zap,
  Building2,
  LogIn,
  UserPlus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/', icon: Terminal },
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: 'Contests', path: '/contests', icon: Trophy },
    { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'My Progress', path: '/dashboard', icon: BarChart3, requiresAuth: true },
    { name: 'Profile', path: '/profile', icon: UserIcon, requiresAuth: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              Algo<span className="text-blue-600">Rank</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3 text-xs">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Streak Badge */}
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.currentStreak}d Streak</span>
                </div>

                {/* Total Points */}
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-extrabold">
                  <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  <span>{user.totalPoints} pts</span>
                </div>

                {/* College Tag */}
                {user.college && (
                  <div className="hidden lg:flex items-center space-x-1 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user.college.code}</span>
                  </div>
                )}

                {/* High-Visibility Profile Avatar Pill & Logout */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/profile"
                    title="View Student Profile"
                    className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all shadow-xs group ring-2 ring-blue-600/30"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-blue-700 font-black text-xs flex items-center justify-center shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs pr-1 font-extrabold text-white">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3.5 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
