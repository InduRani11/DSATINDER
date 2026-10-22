import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getContests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const now = new Date();

    const contests = await prisma.contest.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        _count: { select: { participants: true, problems: true } },
        participants: userId ? { where: { userId } } : false
      }
    });

    const formattedContests = contests.map((c: any) => {
      let status = 'UPCOMING';
      if (now >= c.startTime && now <= c.endTime) {
        status = 'ACTIVE';
      } else if (now > c.endTime) {
        status = 'PAST';
      }

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        participantCount: c._count.participants,
        problemCount: c._count.problems,
        status,
        isRegistered: userId ? (c.participants && c.participants.length > 0) : false
      };
    });

    return res.json({ contests: formattedContests });
  } catch (error: any) {
    console.error('GetContests error:', error);
    return res.status(500).json({ error: 'Failed to fetch contests' });
  }
};

export const getContestById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    const contest: any = await prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                slug: true,
                difficulty: true,
                points: true,
                topic: true
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                college: { select: { name: true, code: true } }
              }
            }
          },
          orderBy: [{ score: 'desc' }, { penalty: 'asc' }]
        }
      }
    });

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const now = new Date();
    let status = 'UPCOMING';
    if (now >= contest.startTime && now <= contest.endTime) {
      status = 'ACTIVE';
    } else if (now > contest.endTime) {
      status = 'PAST';
    }

    const isRegistered = userId
      ? contest.participants.some((p: any) => p.userId === userId)
      : false;

    const leaderboard = contest.participants.map((p: any, idx: number) => ({
      rank: idx + 1,
      userId: p.user.id,
      name: p.user.name,
      username: p.user.username,
      college: p.user.college?.code || '',
      score: p.score,
      penalty: p.penalty,
      isCurrentUser: p.userId === userId
    }));

    return res.json({
      contest: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        duration: contest.duration,
        status,
        isRegistered,
        problems: contest.problems.map((cp: any) => ({
          ...cp.problem,
          points: cp.points
        })),
        leaderboard
      }
    });
  } catch (error: any) {
    console.error('GetContestById error:', error);
    return res.status(500).json({ error: 'Failed to fetch contest details' });
  }
};

export const registerForContest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const id = req.params.id as string;

    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const existing = await prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId: id, userId } }
    });

    if (existing) {
      return res.status(400).json({ error: 'You are already registered for this contest' });
    }

    await prisma.contestParticipant.create({
      data: {
        contestId: id,
        userId,
        score: 0,
        penalty: 0
      }
    });

    return res.json({ message: 'Successfully registered for the contest!' });
  } catch (error: any) {
    console.error('RegisterForContest error:', error);
    return res.status(500).json({ error: 'Contest registration failed' });
  }
};

export const createContest = async (req: AuthRequest, res: Response) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.body.adminSecret;
    const expectedKey = process.env.ADMIN_SECRET || 'algorank_admin_2026';

    if (adminKey !== expectedKey) {
      return res.status(403).json({ error: 'Unauthorized: Invalid Admin Secret Key.' });
    }

    const { title, description, startTime, endTime, duration, problemIds } = req.body;

    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, description, startTime, and endTime are required.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end date format.' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }

    const calcDuration = duration ? parseInt(duration, 10) : Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        startTime: start,
        endTime: end,
        duration: calcDuration
      }
    });

    // If problemIds provided, link them
    if (Array.isArray(problemIds) && problemIds.length > 0) {
      for (const item of problemIds) {
        const problemId = typeof item === 'string' ? item : item.problemId;
        const points = typeof item === 'object' && item.points ? parseInt(item.points, 10) : 50;

        const prob = await prisma.problem.findUnique({ where: { id: problemId } });
        if (prob) {
          await prisma.contestProblem.create({
            data: {
              contestId: contest.id,
              problemId: prob.id,
              points: points || prob.points || 50
            }
          });
        }
      }
    }

    const fullContest = await prisma.contest.findUnique({
      where: { id: contest.id },
      include: {
        problems: {
          include: {
            problem: true
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Contest created successfully!',
      contest: fullContest
    });
  } catch (error: any) {
    console.error('CreateContest error:', error);
    return res.status(500).json({ error: 'Failed to create contest: ' + error.message });
  }
};

export const deleteContest = async (req: AuthRequest, res: Response) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.body.adminSecret;
    const expectedKey = process.env.ADMIN_SECRET || 'algorank_admin_2026';

    if (adminKey !== expectedKey) {
      return res.status(403).json({ error: 'Unauthorized: Invalid Admin Secret Key.' });
    }

    const id = req.params.id as string;
    await prisma.contest.delete({ where: { id } });

    return res.json({ message: 'Contest deleted successfully.' });
  } catch (error: any) {
    console.error('DeleteContest error:', error);
    return res.status(500).json({ error: 'Failed to delete contest.' });
  }
};

