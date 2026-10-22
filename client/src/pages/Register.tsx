import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { College } from '../types';
import { UserPlus, Building2, Lock, Mail, User, ShieldAlert } from 'lucide-react';

const DEFAULT_COLLEGES: College[] = [
  { id: "de90ed94-a376-4b13-8e4f-41f228384573", name: "COER University", city: "Roorkee", state: "Uttarakhand", country: "India", code: "COER" },
  { id: "bdb2075a-4498-426b-b450-31a3e4d56fd9", name: "Indian Institute of Technology Delhi", city: "New Delhi", state: "Delhi", country: "India", code: "IITD" },
  { id: "b3c3932e-c2ee-4dfa-846e-f1b7e42f2e52", name: "Indian Institute of Technology Bombay", city: "Mumbai", state: "Maharashtra", country: "India", code: "IITB" },
  { id: "c35ebea0-053f-4fff-a0d7-eec128c9268f", name: "BITS Pilani", city: "Pilani", state: "Rajasthan", country: "India", code: "BITS" },
  { id: "0d470e49-1872-4c4a-916a-dd3f01ab997f", name: "National Institute of Technology Jaipur", city: "Jaipur", state: "Rajasthan", country: "India", code: "NITJ" },
  { id: "70e8519d-f5ab-43c9-a4dd-93ce10853e50", name: "Delhi Technological University", city: "New Delhi", state: "Delhi", country: "India", code: "DTU" },
  { id: "07c8441e-779b-4f93-b745-e0efbf911999", name: "International Institute of Information Technology Hyderabad", city: "Hyderabad", state: "Telangana", country: "India", code: "IIITH" },
  { id: "ac80d02f-d040-484b-adbb-f45ddd5873a7", name: "Massachusetts Institute of Technology", city: "Cambridge", state: "Massachusetts", country: "USA", code: "MIT" },
  { id: "fe15978d-53d0-40bb-81e4-3c7c4520cfc7", name: "Stanford University", city: "Stanford", state: "California", country: "USA", code: "STAN" },
  { id: "6884e7ea-5e16-4991-9ecf-fe94c246d6ad", name: "Harvard University", city: "Cambridge", state: "Massachusetts", country: "USA", code: "HARV" }
];

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState<College[]>(DEFAULT_COLLEGES);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    collegeId: DEFAULT_COLLEGES[0].id
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        let collegeList: College[] = [];
        try {
          const res = await api.get('/auth/colleges');
          collegeList = res.data.colleges || [];
        } catch {
          const res = await api.get('/colleges');
          collegeList = res.data.colleges || [];
        }
        if (collegeList.length > 0) {
          setColleges(collegeList);
          setFormData((prev) => ({ ...prev, collegeId: prev.collegeId || collegeList[0].id }));
        }
      } catch (err) {
        console.warn('Using default fallback colleges:', err);
      }
    };

    fetchColleges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      register(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Student Registration</h1>
            <p className="text-xs text-slate-600 font-medium">Create your AlgoRank student account</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Indu Rani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 pl-9 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Username (3-20 characters)</label>
              <div className="relative">
                <span className="text-slate-400 font-mono absolute left-3 top-2 text-xs">@</span>
                <input
                  type="text"
                  required
                  placeholder="indurani"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 pl-8 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="student@coer.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 pl-9 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Password (min 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 pl-9 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-800 font-bold">Select College / Institution</label>
              </div>
              <div className="relative">
                <Building2 className="w-4 h-4 text-blue-600 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  required
                  value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full bg-white border-2 border-slate-300 hover:border-slate-400 rounded-lg px-3.5 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-xs"
                >
                  {colleges.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      className="bg-white text-slate-900 font-medium py-1.5"
                    >
                      {c.name} ({c.code}) — {c.city}, {c.state || c.country}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Your college rank and leaderboard points will be credited to this institution.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-xs disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Student Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 font-medium">
            Already registered?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-bold">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
