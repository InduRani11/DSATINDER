import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: true,
        userBadges: { include: { badge: true } },
        userProblems: {
          include: {
            problem: {
              select: { difficulty: true, topic: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const higherGlobal = await prisma.user.count({
      where: {
        OR: [
          { totalPoints: { gt: user.totalPoints } },
          { AND: [{ totalPoints: user.totalPoints }, { solvedCount: { gt: user.solvedCount } }] }
        ]
      }
    });
    const globalRank = higherGlobal + 1;

    const higherCollege = await prisma.user.count({
      where: {
        collegeId: user.collegeId,
        OR: [
          { totalPoints: { gt: user.totalPoints } },
          { AND: [{ totalPoints: user.totalPoints }, { solvedCount: { gt: user.solvedCount } }] }
        ]
      }
    });
    const collegeRank = higherCollege + 1;

    const [totalEasy, totalMedium, totalHard] = await Promise.all([
      prisma.problem.count({ where: { difficulty: 'EASY' } }),
      prisma.problem.count({ where: { difficulty: 'MEDIUM' } }),
      prisma.problem.count({ where: { difficulty: 'HARD' } })
    ]);

    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;
    const topicSolveMap: Record<string, number> = {};

    user.userProblems.forEach((up: any) => {
      if (up.problem.difficulty === 'EASY') solvedEasy++;
      else if (up.problem.difficulty === 'MEDIUM') solvedMedium++;
      else if (up.problem.difficulty === 'HARD') solvedHard++;

      topicSolveMap[up.problem.topic] = (topicSolveMap[up.problem.topic] || 0) + 1;
    });

    const allBadges = await prisma.badge.findMany();
    const userBadgeIds = new Set(user.userBadges.map((ub: any) => ub.badgeId));

    const badges = allBadges.map((b: any) => ({
      ...b,
      unlocked: userBadgeIds.has(b.id),
      earnedAt: user.userBadges.find((ub: any) => ub.badgeId === b.id)?.earnedAt || null
    }));

    const { password: _, ...userClean } = user;

    return res.json({
      profile: {
        ...userClean,
        globalRank,
        collegeRank,
        difficultyStats: {
          easy: { solved: solvedEasy, total: totalEasy },
          medium: { solved: solvedMedium, total: totalMedium },
          hard: { solved: solvedHard, total: totalHard }
        },
        topicStats: topicSolveMap,
        badges
      }
    });
  } catch (error: any) {
    console.error('GetProfile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { name, bio, profilePic, collegeId } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePic !== undefined) updateData.profilePic = profilePic;
    if (collegeId) {
      const collegeExists = await prisma.college.findUnique({ where: { id: collegeId } });
      if (collegeExists) updateData.collegeId = collegeId;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { college: true }
    });

    const { password: _, ...cleanUser } = updatedUser;

    return res.json({ message: 'Profile updated successfully', user: cleanUser });
  } catch (error: any) {
    console.error('UpdateProfile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: true,
        userProblems: {
          include: { problem: { select: { id: true, difficulty: true, topic: true } } }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const higherGlobal = await prisma.user.count({
      where: {
        OR: [
          { totalPoints: { gt: user.totalPoints } },
          { AND: [{ totalPoints: user.totalPoints }, { solvedCount: { gt: user.solvedCount } }] }
        ]
      }
    });

    const higherCollege = await prisma.user.count({
      where: {
        collegeId: user.collegeId,
        OR: [
          { totalPoints: { gt: user.totalPoints } },
          { AND: [{ totalPoints: user.totalPoints }, { solvedCount: { gt: user.solvedCount } }] }
        ]
      }
    });

    const [totalEasy, totalMedium, totalHard] = await Promise.all([
      prisma.problem.count({ where: { difficulty: 'EASY' } }),
      prisma.problem.count({ where: { difficulty: 'MEDIUM' } }),
      prisma.problem.count({ where: { difficulty: 'HARD' } })
    ]);

    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;
    const topicSolvedCount: Record<string, number> = {};

    user.userProblems.forEach((up: any) => {
      if (up.problem.difficulty === 'EASY') solvedEasy++;
      if (up.problem.difficulty === 'MEDIUM') solvedMedium++;
      if (up.problem.difficulty === 'HARD') solvedHard++;

      topicSolvedCount[up.problem.topic] = (topicSolvedCount[up.problem.topic] || 0) + 1;
    });

    const topicList = [
      'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Recursion',
      'Searching', 'Sorting', 'Hashing', 'Trees', 'Graphs', 'Greedy',
      'Dynamic Programming', 'Bit Manipulation'
    ];

    const topicProgress = await Promise.all(
      topicList.map(async (topic) => {
        const totalInTopic = await prisma.problem.count({ where: { topic } });
        return {
          topic,
          solved: topicSolvedCount[topic] || 0,
          total: totalInTopic
        };
      })
    );

    const recentSubmissions = await prisma.submission.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        problem: {
          select: { title: true, slug: true, difficulty: true, points: true }
        }
      }
    });

    const solvedIds = user.userProblems.map((up: any) => up.problemId);
    const recommendedProblems = await prisma.problem.findMany({
      where: {
        id: { notIn: solvedIds }
      },
      take: 5,
      orderBy: { points: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        points: true,
        topic: true
      }
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        college: user.college,
        totalPoints: user.totalPoints,
        solvedCount: user.solvedCount,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        globalRank: higherGlobal + 1,
        collegeRank: higherCollege + 1
      },
      stats: {
        difficulty: {
          easy: { solved: solvedEasy, total: totalEasy },
          medium: { solved: solvedMedium, total: totalMedium },
          hard: { solved: solvedHard, total: totalHard }
        },
        topicProgress
      },
      recentSubmissions,
      recommendedProblems
    });
  } catch (error: any) {
    console.error('GetDashboardData error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
