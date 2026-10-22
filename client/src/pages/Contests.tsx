import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Contest, Problem } from '../types';
import { Trophy, Calendar, Clock, Users, ArrowRight, CheckCircle, PlusCircle, Shield, X, Trash2, Search, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Contests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Admin Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
  const [problemSearch, setProblemSearch] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<{ problemId: string; points: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 120,
    adminSecret: 'algorank_admin_2026'
  });

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contests');
      setContests(res.data.contests || []);
    } catch (err) {
      console.error('Error fetching contests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const openAdminModal = async () => {
    setIsModalOpen(true);
    setFormError(null);

    // Pre-populate sensible start and end times
    const now = new Date();
    const start = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins from now
    const end = new Date(start.getTime() + 120 * 60 * 1000); // 2 hours later

    const formatForInput = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData((prev) => ({
      ...prev,
      startTime: prev.startTime || formatForInput(start),
      endTime: prev.endTime || formatForInput(end)
    }));

    // Fetch problems to select from
    if (availableProblems.length === 0) {
      try {
        const res = await api.get('/problems?limit=100');
        setAvailableProblems(res.data.problems || []);
      } catch (err) {
        console.error('Failed to load problems for contest creation:', err);
      }
    }
  };

  const toggleProblemSelection = (problem: Problem) => {
    setSelectedProblems((prev) => {
      const exists = prev.find((p) => p.problemId === problem.id);
      if (exists) {
        return prev.filter((p) => p.problemId !== problem.id);
      } else {
        return [...prev, { problemId: problem.id, points: problem.points || 50 }];
      }
    });
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        throw new Error('Contest end time must be after the start time.');
      }

      await api.post(
        '/contests',
        {
          title: formData.title,
          description: formData.description,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          duration: Number(formData.duration),
          problemIds: selectedProblems,
          adminSecret: formData.adminSecret
        },
        {
          headers: {
            'x-admin-key': formData.adminSecret
          }
        }
      );

      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: 120,
        adminSecret: 'algorank_admin_2026'
      });
      setSelectedProblems([]);
      await fetchContests();
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message || 'Failed to create contest.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    const key = prompt('Admin Authorization required.\nEnter Admin Secret Key to delete:', 'algorank_admin_2026');
    if (!key) return;

    try {
      await api.delete(`/contests/${contestId}`, {
        headers: { 'x-admin-key': key }
      });
      fetchContests();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete contest');
    }
  };

  const handleRegister = async (contestId: string) => {
    if (!user) return;
    try {
      await api.post(`/contests/${contestId}/register`);
      fetchContests();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const filteredProblems = availableProblems.filter(
    (p) =>
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.topic.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.difficulty.toLowerCase().includes(problemSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Admin Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>DSA Competition Arena</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">College & Global Contests</h1>
            <p className="text-xs text-slate-600">Compete in timed rounds to boost your global rating and college standings.</p>
          </div>

          <button
            onClick={openAdminModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Admin: Create Contest</span>
          </button>
        </div>

        {/* Contests Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Loading contests...</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-4">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Contests Scheduled Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Use the "Admin: Create Contest" button above to publish the first contest round.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {contests.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' :
                      c.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {c.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 flex items-center space-x-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{c.duration} mins</span>
                      </span>
                      <button
                        onClick={() => handleDeleteContest(c.id)}
                        title="Delete Contest (Admin)"
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{c.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{new Date(c.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>{c.participantCount} Registered</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <Link
                    to={`/contests/${c.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View Standings & Problems ({c.problemCount || 0})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {user && (
                    c.isRegistered ? (
                      <span className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Registered</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(c.id)}
                        className="px-4 py-1.5 rounded-md text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      >
                        Register Now
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin Contest Creation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Admin: Create DSA Contest</h2>
                    <p className="text-xs text-slate-500">Configure round details, schedule, and attach problem sets</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateContest} className="p-6 space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Contest Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AlgoRank National Hack-Sprint 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Brief contest overview, topics covered, and guidelines..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Start Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">End Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Duration (Mins) *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1440}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Problem Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700">
                      Select Problems for this Contest ({selectedProblems.length} selected)
                    </label>
                    <div className="relative w-44">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                      <input
                        type="text"
                        placeholder="Search problems..."
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md py-1 pl-7 pr-2 text-[11px] focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50">
                    {filteredProblems.length === 0 ? (
                      <p className="p-4 text-center text-slate-400 text-xs">No matching problems found.</p>
                    ) : (
                      filteredProblems.map((prob) => {
                        const isSelected = selectedProblems.some((p) => p.problemId === prob.id);
                        return (
                          <div
                            key={prob.id}
                            onClick={() => toggleProblemSelection(prob)}
                            className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-xs">{prob.title}</span>
                                <span className="text-[10px] text-slate-500 ml-2 font-mono">({prob.topic})</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                  prob.difficulty === 'EASY'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : prob.difficulty === 'MEDIUM'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {prob.difficulty}
                              </span>
                              <span className="text-[11px] font-mono text-slate-600 font-bold">
                                {prob.points} pts
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Admin Secret Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin secret key"
                    value={formData.adminSecret}
                    onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Default key: <code className="text-blue-600 font-mono">algorank_admin_2026</code> (configured via server environment).</p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Creating Contest...' : 'Publish Contest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
