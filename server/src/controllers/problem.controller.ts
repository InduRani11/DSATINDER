import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProblems = async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      difficulty,
      topic,
      status,
      sortBy = 'title',
      sortOrder = 'asc',
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const userId = req.user?.id;

    let solvedProblemIds = new Set<string>();
    if (userId) {
      const userSolves = await prisma.userProblem.findMany({
        where: { userId },
        select: { problemId: true }
      });
      solvedProblemIds = new Set(userSolves.map((s: any) => s.problemId));
    }

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { topic: { contains: search as string } }
      ];
    }

    if (difficulty) {
      whereClause.difficulty = (difficulty as string).toUpperCase();
    }

    if (topic) {
      whereClause.topic = topic as string;
    }

    if (status && userId) {
      if (status === 'solved') {
        whereClause.id = { in: Array.from(solvedProblemIds) };
      } else if (status === 'unsolved') {
        whereClause.id = { notIn: Array.from(solvedProblemIds) };
      }
    }

    let orderByClause: any = { title: 'asc' };
    if (sortBy === 'points') {
      orderByClause = { points: sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy === 'difficulty') {
      orderByClause = { points: sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy === 'title') {
      orderByClause = { title: sortOrder === 'desc' ? 'desc' : 'asc' };
    }

    const [problems, totalCount] = await Promise.all([
      prisma.problem.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          points: true,
          topic: true,
          tags: true,
          timeLimit: true,
          memoryLimit: true,
          createdAt: true
        }
      }),
      prisma.problem.count({ where: whereClause })
    ]);

    const formattedProblems = problems.map((p: any) => ({
      ...p,
      isSolved: solvedProblemIds.has(p.id)
    }));

    const topics = [
      'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Recursion',
      'Searching', 'Sorting', 'Hashing', 'Trees', 'Graphs', 'Greedy',
      'Dynamic Programming', 'Bit Manipulation'
    ];

    return res.json({
      problems: formattedProblems,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      availableTopics: topics
    });
  } catch (error: any) {
    console.error('GetProblems error:', error);
    return res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

export const getProblemBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const userId = req.user?.id;

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: { isHidden: false },
          select: { id: true, input: true, expectedOutput: true }
        }
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    let isSolved = false;
    if (userId) {
      const userSolve = await prisma.userProblem.findUnique({
        where: { userId_problemId: { userId, problemId: problem.id } }
      });
      isSolved = !!userSolve;
    }

    return res.json({
      problem: {
        ...problem,
        starterCode: JSON.parse(problem.starterCode || '{}'),
        examples: JSON.parse(problem.examples || '[]'),
        isSolved
      }
    });
  } catch (error: any) {
    console.error('GetProblemBySlug error:', error);
    return res.status(500).json({ error: 'Failed to fetch problem details' });
  }
};
