export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  collegeId: string;
  college?: College;
  totalPoints: number;
  solvedCount: number;
  currentStreak: number;
  longestStreak: number;
  profilePic?: string;
  bio?: string;
  globalRank?: number;
  collegeRank?: number;
  createdAt: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  topic: string;
  tags: string;
  timeLimit: number;
  memoryLimit: number;
  starterCode?: Record<string, string>;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
  isSolved?: boolean;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  runtime?: number;
  memory?: number;
  executionTime?: number;
  createdAt: string;
  problem?: {
    title: string;
    slug: string;
    difficulty: string;
    points: number;
  };
}

export type SubmissionHistory = Submission;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  unlocked?: boolean;
  earnedAt?: string | null;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  username: string;
  profilePic?: string;
  totalPoints: number;
  solvedCount: number;
  currentStreak: number;
  college?: {
    id: string;
    name: string;
    code: string;
  };
  isCurrentUser?: boolean;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'UPCOMING' | 'ACTIVE' | 'PAST';
  participantCount: number;
  problemCount: number;
  isRegistered?: boolean;
  problems?: Problem[];
  leaderboard?: Array<{
    rank: number;
    userId: string;
    name: string;
    username: string;
    college: string;
    score: number;
    penalty: number;
    isCurrentUser?: boolean;
  }>;
}
