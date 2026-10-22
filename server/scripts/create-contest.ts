import prisma from '../src/utils/prisma';

/**
 * Admin CLI script to create a contest with DSA problems
 * Usage:
 *   npx ts-node scripts/create-contest.ts "Contest Title" "Description" 120 5
 * Or interactive execution.
 */
async function main() {
  const args = process.argv.slice(2);
  const title = args[0] || 'AlgoRank Weekend Sprint';
  const description = args[1] || 'Solve handpicked algorithmic challenges across multiple topics!';
  const durationMinutes = parseInt(args[2] || '120', 10);
  const problemCount = parseInt(args[3] || '4', 10);

  const now = new Date();
  const startTime = new Date(now.getTime() + 10 * 60 * 1000); // starts in 10 mins
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  console.log(`🚀 Creating contest: "${title}"...`);

  // Pick random problems from database
  const problems = await prisma.problem.findMany({
    take: problemCount,
    orderBy: { createdAt: 'desc' }
  });

  if (problems.length === 0) {
    console.error('❌ No problems found in database! Please seed problems first.');
    process.exit(1);
  }

  const contest = await prisma.contest.create({
    data: {
      title,
      description,
      startTime,
      endTime,
      duration: durationMinutes
    }
  });

  for (const prob of problems) {
    await prisma.contestProblem.create({
      data: {
        contestId: contest.id,
        problemId: prob.id,
        points: prob.points || 50
      }
    });
  }

  console.log(`✅ Contest successfully created!`);
  console.log(`   ID: ${contest.id}`);
  console.log(`   Title: ${contest.title}`);
  console.log(`   Starts: ${startTime.toISOString()}`);
  console.log(`   Ends: ${endTime.toISOString()}`);
  console.log(`   Linked Problems (${problems.length}):`);
  problems.forEach((p, idx) => {
    console.log(`     ${idx + 1}. [${p.difficulty}] ${p.title} (${p.topic})`);
  });
}

main()
  .catch((e) => {
    console.error('Error creating contest:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
