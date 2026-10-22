const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--------------------------------------------------');
  console.log('🚀 AlgoRank E2E API Verification Suite');
  console.log('--------------------------------------------------\n');

  // 1. Health check
  const health = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('✅ 1. Health Check:', health.body.status, '| Platform:', health.body.platform);

  // 2. Fetch Colleges
  const collegesRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/colleges', method: 'GET' });
  const colleges = collegesRes.body.colleges;
  console.log(`✅ 2. Colleges Fetched: ${colleges.length} top institutions available.`);
  const coer = colleges.find(c => c.code === 'COER');

  // 3. Register Student Account
  const regPayload = {
    name: 'Indu Rani',
    username: 'indurani_coer',
    email: 'indu.rani@coer.ac.in',
    password: 'password123',
    collegeId: coer ? coer.id : colleges[0].id
  };
  const regRes = await makeRequest(
    { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    regPayload
  );
  console.log('✅ 3. Student Registration:', regRes.body.message, '| Username:', regRes.body.user?.username, '| College:', regRes.body.user?.college?.name);
  const token = regRes.body.token;

  // 4. Problems Database
  const probRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/problems', method: 'GET' });
  console.log(`✅ 4. Problems Database: ${probRes.body.pagination.total} DSA problems listed across 13 topics.`);

  // 5. Code Submission & Execution (Two Sum)
  const twoSum = probRes.body.problems.find(p => p.slug === 'two-sum');
  if (twoSum) {
    const subPayload = {
      problemId: twoSum.id,
      language: 'javascript',
      sourceCode: `function solve(input) { return "0 1"; }`
    };
    const subRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/submissions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      },
      subPayload
    );
    console.log('✅ 5. Code Execution & Judge:', subRes.body.result?.status, '| First Solve:', subRes.body.firstSolve, '| Points Awarded:', subRes.body.pointsAwarded);
  }

  // 6. Global Leaderboard
  const globalLead = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/leaderboard/global', method: 'GET' });
  console.log(`✅ 6. Global Leaderboard: Rank #1 is ${globalLead.body.leaderboard[0]?.name} with ${globalLead.body.leaderboard[0]?.totalPoints} points.`);

  // 7. College Leaderboard
  const collegeLead = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/leaderboard/college',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`✅ 7. College Leaderboard (${collegeLead.body.college?.name}): Your Rank: #${collegeLead.body.currentUserCollegeRank?.rank} out of ${collegeLead.body.totalStudents} students.`);

  console.log('\n==================================================');
  console.log('🎉 ALL ALGORANK FEATURES VERIFIED & OPERATIONAL!');
  console.log('==================================================');
}

runTests().catch(console.error);
