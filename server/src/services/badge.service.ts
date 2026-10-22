import prisma from '../utils/prisma';

export class BadgeService {
  public static async checkAndAwardBadges(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProblems: { include: { problem: true } },
        userBadges: true,
        college: true
      }
    });

    if (!user) return [];

    const existingBadgeIds = new Set(user.userBadges.map((ub: any) => ub.badgeId));
    const allBadges = await prisma.badge.findMany();
    const newlyAwardedBadgeNames: string[] = [];

    const topicSolveCounts: Record<string, number> = {};
    for (const up of user.userProblems) {
      const topic = up.problem.topic;
      topicSolveCounts[topic] = (topicSolveCounts[topic] || 0) + 1;
    }

    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) continue;

      let qualified = false;
      const req = badge.requirement;

      if (req.startsWith('solve:')) {
        const target = parseInt(req.split(':')[1], 10);
        if (user.solvedCount >= target) qualified = true;
      } else if (req.startsWith('streak:')) {
        const target = parseInt(req.split(':')[1], 10);
        if (user.currentStreak >= target || user.longestStreak >= target) qualified = true;
      } else if (req.startsWith('topic:')) {
        const parts = req.split(':');
        const topicName = parts[1];
        const target = parseInt(parts[2], 10);
        if ((topicSolveCounts[topicName] || 0) >= target) qualified = true;
      }

      if (qualified) {
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id
          }
        });
        newlyAwardedBadgeNames.push(badge.name);
      }
    }

    return newlyAwardedBadgeNames;
  }
}
