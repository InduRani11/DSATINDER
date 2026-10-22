import prisma from '../utils/prisma';

export class StreakService {
  public static async recordActivityAndCalculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastActiveDate: true }
    });

    if (!user) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Upsert daily activity for today
    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      update: { problemsSolved: { increment: 1 } },
      create: { userId, date: today, problemsSolved: 1 }
    });

    // If already recorded today, keep existing streak
    if (user.lastActiveDate === today) {
      return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
    }

    let newCurrentStreak = 1;
    if (user.lastActiveDate === yesterday) {
      newCurrentStreak = user.currentStreak + 1;
    }

    const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today
      }
    });

    return { currentStreak: newCurrentStreak, longestStreak: newLongestStreak };
  }
}
