import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getGlobalLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;

    const currentUserId = req.user?.id;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        orderBy: [
          { totalPoints: 'desc' },
          { solvedCount: 'desc' },
          { createdAt: 'asc' }
        ],
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          profilePic: true,
          totalPoints: true,
          solvedCount: true,
          currentStreak: true,
          college: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }),
      prisma.user.count()
    ]);

    const rankedUsers = users.map((u: any, idx: number) => ({
      rank: skip + idx + 1,
      ...u,
      isCurrentUser: u.id === currentUserId
    }));

    let currentUserRankInfo = null;
    if (currentUserId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { id: true, totalPoints: true, solvedCount: true }
      });

      if (currentUser) {
        const higherRankCount = await prisma.user.count({
          where: {
            OR: [
              { totalPoints: { gt: currentUser.totalPoints } },
              {
                AND: [
                  { totalPoints: currentUser.totalPoints },
                  { solvedCount: { gt: currentUser.solvedCount } }
                ]
              }
            ]
          }
        });
        currentUserRankInfo = {
          rank: higherRankCount + 1,
          totalPoints: currentUser.totalPoints,
          solvedCount: currentUser.solvedCount
        };
      }
    }

    return res.json({
      leaderboard: rankedUsers,
      currentUserRankInfo,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error('GetGlobalLeaderboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch global leaderboard' });
  }
};

export const getCollegeLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to view your college leaderboard.' });
    }

    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { collegeId: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const collegeId = user.collegeId;

    const college = await prisma.college.findUnique({
      where: { id: collegeId }
    });

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;

    const [collegeUsers, totalCollegeStudents] = await Promise.all([
      prisma.user.findMany({
        where: { collegeId },
        orderBy: [
          { totalPoints: 'desc' },
          { solvedCount: 'desc' },
          { createdAt: 'asc' }
        ],
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          profilePic: true,
          totalPoints: true,
          solvedCount: true,
          currentStreak: true,
          college: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }),
      prisma.user.count({ where: { collegeId } })
    ]);

    const rankedCollegeUsers = collegeUsers.map((u: any, idx: number) => ({
      rank: skip + idx + 1,
      ...u,
      isCurrentUser: u.id === userId
    }));

    const currentUserData = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true, solvedCount: true }
    });

    let collegeRank = 1;
    if (currentUserData) {
      const higherInCollege = await prisma.user.count({
        where: {
          collegeId,
          OR: [
            { totalPoints: { gt: currentUserData.totalPoints } },
            {
              AND: [
                { totalPoints: currentUserData.totalPoints },
                { solvedCount: { gt: currentUserData.solvedCount } }
              ]
            }
          ]
        }
      });
      collegeRank = higherInCollege + 1;
    }

    return res.json({
      college,
      totalStudents: totalCollegeStudents,
      leaderboard: rankedCollegeUsers,
      currentUserCollegeRank: {
        rank: collegeRank,
        totalPoints: currentUserData?.totalPoints || 0,
        solvedCount: currentUserData?.solvedCount || 0
      },
      pagination: {
        total: totalCollegeStudents,
        page,
        limit,
        totalPages: Math.ceil(totalCollegeStudents / limit)
      }
    });
  } catch (error: any) {
    console.error('GetCollegeLeaderboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch college leaderboard' });
  }
};
