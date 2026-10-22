import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { CodeExecutionService } from '../services/execution.service';
import { StreakService } from '../services/streak.service';
import { BadgeService } from '../services/badge.service';

export const runCodeSample = async (req: AuthRequest, res: Response) => {
  try {
    const { problemId, language, sourceCode } = req.body;

    if (!problemId || !language || !sourceCode) {
      return res.status(400).json({ error: 'Problem ID, language, and source code are required' });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: { isHidden: false }
        }
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const result = await CodeExecutionService.executeCode(
      language,
      sourceCode,
      problem.testCases,
      problem.timeLimit
    );

    return res.json({ result });
  } catch (error: any) {
    console.error('Run code sample error:', error);
    return res.status(500).json({ error: 'Code execution failed' });
  }
};

export const submitSolution = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { problemId, language, sourceCode } = req.body;

    if (!problemId || !language || !sourceCode) {
      return res.status(400).json({ error: 'Problem ID, language, and source code are required' });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: true
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Execute code against all test cases (hidden + public)
    const result = await CodeExecutionService.executeCode(
      language,
      sourceCode,
      problem.testCases,
      problem.timeLimit
    );

    // Record submission entry in DB
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        language,
        sourceCode,
        status: result.status,
        runtime: result.runtime,
        memory: result.memory
      }
    });

    let firstSolve = false;
    let pointsAwarded = 0;
    let newBadges: string[] = [];

    // Award points if accepted & first time solve
    if (result.status === 'Accepted') {
      const existingSolve = await prisma.userProblem.findUnique({
        where: {
          userId_problemId: { userId, problemId: problem.id }
        }
      });

      if (!existingSolve) {
        firstSolve = true;
        pointsAwarded = problem.points; // STRICT: Points always determined by DB

        await prisma.$transaction([
          prisma.userProblem.create({
            data: {
              userId,
              problemId: problem.id,
              pointsAwarded
            }
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              totalPoints: { increment: pointsAwarded },
              solvedCount: { increment: 1 }
            }
          })
        ]);

        // Update streak & check badge unlocks
        await StreakService.recordActivityAndCalculateStreak(userId);
        newBadges = await BadgeService.checkAndAwardBadges(userId);
      }
    }

    return res.json({
      submission: {
        id: submission.id,
        status: submission.status,
        runtime: submission.runtime,
        memory: submission.memory,
        createdAt: submission.createdAt
      },
      result,
      firstSolve,
      pointsAwarded,
      newBadges
    });
  } catch (error: any) {
    console.error('Submit solution error:', error);
    return res.status(500).json({ error: 'Submission failed' });
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: { userId },
        include: {
          problem: {
            select: {
              title: true,
              slug: true,
              difficulty: true,
              points: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.submission.count({ where: { userId } })
    ]);

    return res.json({
      submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('GetSubmissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch submission history' });
  }
};
