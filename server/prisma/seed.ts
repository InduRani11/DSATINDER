import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AlgoRank Database Seeding (Clean Production Seed)...');

  // Clear existing data
  await prisma.submission.deleteMany();
  await prisma.userProblem.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.contestParticipant.deleteMany();
  await prisma.contestProblem.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.college.deleteMany();

  // 1. Seed Colleges
  console.log('🏛️ Seeding Colleges...');
  const collegesData = [
    { name: 'COER University', city: 'Roorkee', state: 'Uttarakhand', country: 'India', code: 'COER' },
    { name: 'Indian Institute of Technology Delhi', city: 'New Delhi', state: 'Delhi', country: 'India', code: 'IITD' },
    { name: 'National Institute of Technology Jaipur', city: 'Jaipur', state: 'Rajasthan', country: 'India', code: 'NITJ' },
    { name: 'BITS Pilani', city: 'Pilani', state: 'Rajasthan', country: 'India', code: 'BITS' },
    { name: 'Indian Institute of Technology Bombay', city: 'Mumbai', state: 'Maharashtra', country: 'India', code: 'IITB' },
    { name: 'International Institute of Information Technology Hyderabad', city: 'Hyderabad', state: 'Telangana', country: 'India', code: 'IIITH' },
    { name: 'Delhi Technological University', city: 'New Delhi', state: 'Delhi', country: 'India', code: 'DTU' },
    { name: 'Massachusetts Institute of Technology', city: 'Cambridge', state: 'Massachusetts', country: 'USA', code: 'MIT' },
    { name: 'Stanford University', city: 'Stanford', state: 'California', country: 'USA', code: 'STAN' },
    { name: 'Harvard University', city: 'Cambridge', state: 'Massachusetts', country: 'USA', code: 'HARV' },
  ];

  const colleges: Record<string, any> = {};
  for (const c of collegesData) {
    colleges[c.code] = await prisma.college.create({ data: c });
  }

  // 2. Seed Badges
  console.log('🏆 Seeding Badges...');
  const badgesData = [
    { name: 'First Solve', description: 'Solve your very first DSA problem on AlgoRank', icon: '🏆', category: 'solve', requirement: 'solve:1' },
    { name: '7 Day Streak', description: 'Maintain a 7-day active coding streak', icon: '🔥', category: 'streak', requirement: 'streak:7' },
    { name: '30 Day Streak', description: 'Maintain a 30-day active coding streak', icon: '⚡', category: 'streak', requirement: 'streak:30' },
    { name: '50 Problems Solved', description: 'Successfully solve 50 DSA problems', icon: '💎', category: 'solve', requirement: 'solve:50' },
    { name: '100 Problems Solved', description: 'Successfully solve 100 DSA problems', icon: '🚀', category: 'solve', requirement: 'solve:100' },
    { name: 'College Topper', description: 'Reach Rank 1 in your college leaderboard', icon: '👑', category: 'rank', requirement: 'college_rank:1' },
    { name: 'Global Top 100', description: 'Break into the Global Top 100 leaderboard', icon: '🌎', category: 'rank', requirement: 'global_rank:100' },
    { name: 'DP Master', description: 'Solve 10 Dynamic Programming problems', icon: '🧠', category: 'topic', requirement: 'topic:Dynamic Programming:10' },
    { name: 'Graph Explorer', description: 'Solve 10 Graph problems', icon: '🌐', category: 'topic', requirement: 'topic:Graphs:10' },
    { name: 'Tree Wizard', description: 'Solve 10 Tree problems', icon: '🌲', category: 'topic', requirement: 'topic:Trees:10' },
  ];

  for (const b of badgesData) {
    await prisma.badge.create({ data: b });
  }

  // Helper template generator for starter codes
  const getStarterCode = (functionName: string, paramStr: string, returnType: string) => {
    return JSON.stringify({
      javascript: `// Write your solution here\nfunction ${functionName}(${paramStr}) {\n    // Code here\n}`,
      python: `# Write your solution here\ndef ${functionName}(${paramStr}):\n    pass`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${returnType} ${functionName}(${paramStr}) {\n        // Code here\n    }\n};\n\nint main() {\n    // Solution runner\n    return 0;\n}`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String input = sc.nextLine();\n            // Write your solution here\n        }\n    }\n}`,
      c: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}`
    });
  };

  // Helper function to create problem
  const createProblem = async (
    title: string,
    topic: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    description: string,
    inputFormat: string,
    outputFormat: string,
    constraints: string,
    examples: Array<{ input: string; output: string; explanation?: string }>,
    testCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>,
    functionName: string = 'solve'
  ) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const points = difficulty === 'EASY' ? 10 : difficulty === 'MEDIUM' ? 25 : 50;

    return prisma.problem.create({
      data: {
        title,
        slug,
        topic,
        difficulty,
        points,
        description,
        inputFormat,
        outputFormat,
        constraints,
        tags: `${topic}, ${difficulty.toLowerCase()}`,
        starterCode: getStarterCode(functionName, 'inputData', 'int'),
        examples: JSON.stringify(examples),
        testCases: {
          create: testCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden || false
          }))
        }
      }
    });
  };

  console.log('📚 Seeding 100+ DSA Problems...');

  // --- ARRAYS (15 Problems) ---
  const arrayProblems = [
    { title: 'Two Sum', diff: 'EASY', desc: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.', in: 'First line contains integer N and target. Second line contains N integers.', out: 'Two space-separated indices (0-indexed).', con: '2 <= N <= 10^4, -10^9 <= nums[i] <= 10^9', ex: [{ input: '4 9\n2 7 11 15', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' }], tc: [{ input: '4 9\n2 7 11 15', expectedOutput: '0 1' }, { input: '3 6\n3 2 4', expectedOutput: '1 2' }, { input: '2 6\n3 3', expectedOutput: '0 1', isHidden: true }] },
    { title: 'Contains Duplicate', diff: 'EASY', desc: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and `false` if every element is distinct.', in: 'N on first line, N space-separated integers on second line.', out: 'true or false', con: '1 <= N <= 10^5', ex: [{ input: '4\n1 2 3 1', output: 'true' }], tc: [{ input: '4\n1 2 3 1', expectedOutput: 'true' }, { input: '4\n1 2 3 4', expectedOutput: 'false' }, { input: '10\n1 1 1 3 3 4 3 2 4 2', expectedOutput: 'true', isHidden: true }] },
    { title: 'Best Time to Buy and Sell Stock', diff: 'EASY', desc: 'Find the maximum profit you can achieve from buying and selling a stock on different days.', in: 'N on first line, prices array on second line.', out: 'Single integer representing max profit.', con: '1 <= N <= 10^5', ex: [{ input: '6\n7 1 5 3 6 4', output: '5', explanation: 'Buy on day 2 (price=1) and sell on day 5 (price=6), profit = 6-1 = 5.' }], tc: [{ input: '6\n7 1 5 3 6 4', expectedOutput: '5' }, { input: '5\n7 6 4 3 1', expectedOutput: '0' }, { input: '3\n2 4 1', expectedOutput: '2', isHidden: true }] },
    { title: 'Maximum Subarray (Kadane)', diff: 'MEDIUM', desc: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.', in: 'N on first line, array elements on second line.', out: 'Single integer max sum.', con: '1 <= N <= 10^5', ex: [{ input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6' }], tc: [{ input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' }, { input: '1\n1', expectedOutput: '1' }, { input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: true }] },
    { title: 'Merge Intervals', diff: 'MEDIUM', desc: 'Given an array of `intervals` where intervals[i] = [start_i, end_i], merge all overlapping intervals.', in: 'N line count, then N pairs of integers.', out: 'Merged intervals on separate lines.', con: '1 <= N <= 10^4', ex: [{ input: '4\n1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18' }], tc: [{ input: '4\n1 3\n2 6\n8 10\n15 18', expectedOutput: '1 6\n8 10\n15 18' }, { input: '2\n1 4\n4 5', expectedOutput: '1 5' }] },
    { title: '3Sum', diff: 'MEDIUM', desc: 'Return all triplets `[nums[i], nums[j], nums[k]]` such that `i != j != k` and `nums[i] + nums[j] + nums[k] == 0`.', in: 'N on first line, N integers on second line.', out: 'Sorted list of unique triplets.', con: '3 <= N <= 3000', ex: [{ input: '6\n-1 0 1 2 -1 -4', output: '-1 -1 2\n-1 0 1' }], tc: [{ input: '6\n-1 0 1 2 -1 -4', expectedOutput: '-1 -1 2\n-1 0 1' }, { input: '3\n0 1 1', expectedOutput: '' }] },
    { title: 'Trapping Rain Water', diff: 'HARD', desc: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.', in: 'N on first line, array on second line.', out: 'Total trapped water.', con: '1 <= N <= 2 * 10^4', ex: [{ input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6' }], tc: [{ input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6' }, { input: '6\n4 2 0 3 2 5', expectedOutput: '9', isHidden: true }] },
    { title: 'Product of Array Except Self', diff: 'MEDIUM', desc: 'Return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.', in: 'N on first line, space separated array on second.', out: 'Space separated product array.', con: '2 <= N <= 10^5', ex: [{ input: '4\n1 2 3 4', output: '24 12 8 6' }], tc: [{ input: '4\n1 2 3 4', expectedOutput: '24 12 8 6' }, { input: '5\n-1 1 0 -3 3', expectedOutput: '0 0 9 0 0' }] },
    { title: 'Rotate Array', diff: 'MEDIUM', desc: 'Given an integer array `nums`, rotate the array to the right by `k` steps.', in: 'N and k on first line, array on second line.', out: 'Rotated array elements.', con: '1 <= N <= 10^5', ex: [{ input: '7 3\n1 2 3 4 5 6 7', output: '5 6 7 1 2 3 4' }], tc: [{ input: '7 3\n1 2 3 4 5 6 7', expectedOutput: '5 6 7 1 2 3 4' }] },
    { title: 'Move Zeroes', diff: 'EASY', desc: 'Move all `0`s to the end of the array while maintaining the relative order of non-zero elements.', in: 'N on first line, array on second.', out: 'Modified space-separated array.', con: '1 <= N <= 10^4', ex: [{ input: '5\n0 1 0 3 12', output: '1 3 12 0 0' }], tc: [{ input: '5\n0 1 0 3 12', expectedOutput: '1 3 12 0 0' }] },
    { title: 'Find Missing Number', diff: 'EASY', desc: 'Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range missing from the array.', in: 'N on first line, array of size N on second line.', out: 'Missing number.', con: '1 <= N <= 10^4', ex: [{ input: '3\n3 0 1', output: '2' }], tc: [{ input: '3\n3 0 1', expectedOutput: '2' }, { input: '2\n0 1', expectedOutput: '2' }] },
    { title: 'Container With Most Water', diff: 'MEDIUM', desc: 'Find two lines that together with the x-axis form a container such that the container contains the most water.', in: 'N on first line, heights on second line.', out: 'Maximum water area integer.', con: '2 <= N <= 10^5', ex: [{ input: '9\n1 8 6 2 5 4 8 3 7', output: '49' }], tc: [{ input: '9\n1 8 6 2 5 4 8 3 7', expectedOutput: '49' }] },
    { title: 'Subarray Sum Equals K', diff: 'MEDIUM', desc: 'Given an array of integers `nums` and an integer `k`, return total number of subarrays whose sum equals `k`.', in: 'N and K on first line, array on second line.', out: 'Count of subarrays.', con: '1 <= N <= 2 * 10^4', ex: [{ input: '3 2\n1 1 1', output: '2' }], tc: [{ input: '3 2\n1 1 1', expectedOutput: '2' }, { input: '3 3\n1 2 3', expectedOutput: '2' }] },
    { title: 'First Missing Positive', diff: 'HARD', desc: 'Given an unsorted integer array `nums`, return the smallest missing positive integer.', in: 'N on first line, array on second line.', out: 'Smallest positive integer missing.', con: '1 <= N <= 10^5', ex: [{ input: '3\n1 2 0', output: '3' }, { input: '4\n3 4 -1 1', output: '2' }], tc: [{ input: '3\n1 2 0', expectedOutput: '3' }, { input: '4\n3 4 -1 1', expectedOutput: '2' }] },
    { title: 'Majority Element', diff: 'EASY', desc: 'Given an array `nums` of size `n`, return the majority element (appears more than ⌊n / 2⌋ times).', in: 'N on first line, array on second line.', out: 'Majority element.', con: '1 <= N <= 5 * 10^4', ex: [{ input: '3\n3 2 3', output: '3' }], tc: [{ input: '3\n3 2 3', expectedOutput: '3' }, { input: '7\n2 2 1 1 1 2 2', expectedOutput: '2' }] }
  ];

  for (const p of arrayProblems) {
    await createProblem(p.title, 'Arrays', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- STRINGS (10 Problems) ---
  const stringProblems = [
    { title: 'Valid Anagram', diff: 'EASY', desc: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.', in: 'First line s, second line t.', out: 'true or false', con: '1 <= s.length, t.length <= 5 * 10^4', ex: [{ input: 'anagram\nnagaram', output: 'true' }], tc: [{ input: 'anagram\nnagaram', expectedOutput: 'true' }, { input: 'rat\ncar', expectedOutput: 'false' }] },
    { title: 'Valid Palindrome', diff: 'EASY', desc: 'Check if a phrase is a palindrome considering only alphanumeric characters and ignoring cases.', in: 'Single string input line.', out: 'true or false', con: '1 <= s.length <= 2 * 10^5', ex: [{ input: 'A man, a plan, a canal: Panama', output: 'true' }], tc: [{ input: 'A man, a plan, a canal: Panama', expectedOutput: 'true' }, { input: 'race a car', expectedOutput: 'false' }] },
    { title: 'Longest Substring Without Repeating Characters', diff: 'MEDIUM', desc: 'Given a string `s`, find the length of the longest substring without repeating characters.', in: 'Single line string input.', out: 'Length integer.', con: '0 <= s.length <= 5 * 10^4', ex: [{ input: 'abcabcbb', output: '3' }], tc: [{ input: 'abcabcbb', expectedOutput: '3' }, { input: 'bbbbb', expectedOutput: '1' }, { input: 'pwwkew', expectedOutput: '3' }] },
    { title: 'Longest Palindromic Substring', diff: 'MEDIUM', desc: 'Given a string `s`, return the longest palindromic substring in `s`.', in: 'Single line string s.', out: 'Longest palindrome string.', con: '1 <= s.length <= 1000', ex: [{ input: 'babad', output: 'bab' }], tc: [{ input: 'babad', expectedOutput: 'bab' }, { input: 'cbbd', expectedOutput: 'bb' }] },
    { title: 'Group Anagrams', diff: 'MEDIUM', desc: 'Group anagrams together from an array of strings.', in: 'N on first line, followed by N strings.', out: 'Grouped anagram sets.', con: '1 <= N <= 10^4', ex: [{ input: '6\neat tea tan ate nat bat', output: 'eat tea ate\ntan nat\nbat' }], tc: [{ input: '6\neat tea tan ate nat bat', expectedOutput: 'eat tea ate\ntan nat\nbat' }] },
    { title: 'String to Integer (atoi)', diff: 'MEDIUM', desc: 'Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.', in: 'Single input line string.', out: 'Converted 32-bit signed integer.', con: '0 <= s.length <= 200', ex: [{ input: '42', output: '42' }, { input: '   -42', output: '-42' }], tc: [{ input: '42', expectedOutput: '42' }, { input: '   -42', expectedOutput: '-42' }, { input: '4193 with words', expectedOutput: '4193' }] },
    { title: 'Minimum Window Substring', diff: 'HARD', desc: 'Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` is included in the window.', in: 's on line 1, t on line 2.', out: 'Minimum substring.', con: '1 <= s.length, t.length <= 10^5', ex: [{ input: 'ADOBECODEBANC\nABC', output: 'BANC' }], tc: [{ input: 'ADOBECODEBANC\nABC', expectedOutput: 'BANC' }, { input: 'a\na', expectedOutput: 'a' }] },
    { title: 'Reverse String', diff: 'EASY', desc: 'Write a function that reverses a string in-place.', in: 'Single line string input.', out: 'Reversed string output.', con: '1 <= s.length <= 10^5', ex: [{ input: 'hello', output: 'olleh' }], tc: [{ input: 'hello', expectedOutput: 'olleh' }, { input: 'Hannah', expectedOutput: 'hannaH' }] },
    { title: 'Isomorphic Strings', diff: 'EASY', desc: 'Determine if two strings `s` and `t` are isomorphic.', in: 's on line 1, t on line 2.', out: 'true or false', con: '1 <= s.length <= 5 * 10^4', ex: [{ input: 'egg\nadd', output: 'true' }], tc: [{ input: 'egg\nadd', expectedOutput: 'true' }, { input: 'foo\nbar', expectedOutput: 'false' }] },
    { title: 'Encode and Decode Strings', diff: 'MEDIUM', desc: 'Design an algorithm to encode a list of strings to a single string and decode it back.', in: 'N on line 1, N strings on following lines.', out: 'Decoded strings separated by line breaks.', con: '1 <= N <= 200', ex: [{ input: '2\nlint\ncode', output: 'lint\ncode' }], tc: [{ input: '2\nlint\ncode', expectedOutput: 'lint\ncode' }] }
  ];

  for (const p of stringProblems) {
    await createProblem(p.title, 'Strings', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- LINKED LIST (10 Problems) ---
  const llProblems = [
    { title: 'Reverse Linked List', diff: 'EASY', desc: 'Given the head of a singly linked list, reverse the list, and return the reversed list.', in: 'Space-separated node values.', out: 'Reversed space-separated values.', con: '0 <= Nodes <= 5000', ex: [{ input: '1 2 3 4 5', output: '5 4 3 2 1' }], tc: [{ input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1' }, { input: '1 2', expectedOutput: '2 1' }] },
    { title: 'Merge Two Sorted Lists', diff: 'EASY', desc: 'Merge two sorted linked lists and return it as a sorted list.', in: 'Line 1 list 1, Line 2 list 2.', out: 'Merged space-separated values.', con: '0 <= Nodes <= 50', ex: [{ input: '1 2 4\n1 3 4', output: '1 1 2 3 4 4' }], tc: [{ input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4' }] },
    { title: 'Linked List Cycle', diff: 'EASY', desc: 'Determine if the linked list has a cycle in it.', in: 'Values and pos (-1 if no cycle).', out: 'true or false', con: '0 <= Nodes <= 10^4', ex: [{ input: '3 2 0 -4\n1', output: 'true' }], tc: [{ input: '3 2 0 -4\n1', expectedOutput: 'true' }, { input: '1 2\n-1', expectedOutput: 'false' }] },
    { title: 'Remove Nth Node From End of List', diff: 'MEDIUM', desc: 'Remove the nth node from the end of the list and return its head.', in: 'Line 1 list nodes, Line 2 integer n.', out: 'Modified list values.', con: '1 <= Nodes <= 30', ex: [{ input: '1 2 3 4 5\n2', output: '1 2 3 5' }], tc: [{ input: '1 2 3 4 5\n2', expectedOutput: '1 2 3 5' }] },
    { title: 'Reorder List', diff: 'MEDIUM', desc: 'Reorder list from L0->L1->...->Ln-1->Ln to L0->Ln->L1->Ln-1->L2->Ln-2...', in: 'List values.', out: 'Reordered list values.', con: '1 <= Nodes <= 5 * 10^4', ex: [{ input: '1 2 3 4', output: '1 4 2 3' }], tc: [{ input: '1 2 3 4', expectedOutput: '1 4 2 3' }] },
    { title: 'Merge k Sorted Lists', diff: 'HARD', desc: 'You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.', in: 'K count on line 1, K lines of sorted lists following.', out: 'Merged sorted space-separated values.', con: '0 <= k <= 10^4', ex: [{ input: '3\n1 4 5\n1 3 4\n2 6', output: '1 1 2 3 4 4 5 6' }], tc: [{ input: '3\n1 4 5\n1 3 4\n2 6', expectedOutput: '1 1 2 3 4 4 5 6' }] },
    { title: 'Add Two Numbers', diff: 'MEDIUM', desc: 'You are given two non-empty linked lists representing two non-negative integers stored in reverse order. Add the two numbers and return the sum as a linked list.', in: 'Line 1 digits list 1, Line 2 digits list 2.', out: 'Sum digits list.', con: '1 <= Nodes <= 100', ex: [{ input: '2 4 3\n5 6 4', output: '7 0 8' }], tc: [{ input: '2 4 3\n5 6 4', expectedOutput: '7 0 8' }] },
    { title: 'Intersection of Two Linked Lists', diff: 'EASY', desc: 'Find the node at which two singly linked lists intersect.', in: 'List A and List B inputs with intersect val.', out: 'Intersecting value or null.', con: '1 <= Nodes <= 3 * 10^4', ex: [{ input: '4 1 8 4 5\n5 6 1 8 4 5', output: '8' }], tc: [{ input: '4 1 8 4 5\n5 6 1 8 4 5', expectedOutput: '8' }] },
    { title: 'Copy List with Random Pointer', diff: 'MEDIUM', desc: 'Construct a deep copy of a linked list with random pointers.', in: 'Serialized nodes with random indices.', out: 'Copied list representation.', con: '0 <= Nodes <= 1000', ex: [{ input: '7 null 13 0 11 4 10 2 1 0', output: '7 null 13 0 11 4 10 2 1 0' }], tc: [{ input: '7 null 13 0 11 4 10 2 1 0', expectedOutput: '7 null 13 0 11 4 10 2 1 0' }] },
    { title: 'LRU Cache Design', diff: 'HARD', desc: 'Design a Data Structure for Least Recently Used (LRU) Cache.', in: 'Capacity and query operations.', out: 'Outputs of get queries space-separated.', con: '1 <= Capacity <= 3000', ex: [{ input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2', output: '1 -1' }], tc: [{ input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2', expectedOutput: '1 -1' }] }
  ];

  for (const p of llProblems) {
    await createProblem(p.title, 'Linked List', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- STACK (8 Problems) ---
  const stackProblems = [
    { title: 'Valid Parentheses', diff: 'EASY', desc: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.', in: 'Single line string of brackets.', out: 'true or false', con: '1 <= s.length <= 10^4', ex: [{ input: '()[]{}', output: 'true' }], tc: [{ input: '()[]{}', expectedOutput: 'true' }, { input: '(]', expectedOutput: 'false' }] },
    { title: 'Min Stack', diff: 'MEDIUM', desc: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.', in: 'N operations line by line.', out: 'Outputs of getMin/top calls.', con: '-2^31 <= val <= 2^31 - 1', ex: [{ input: 'push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', output: '-3 0 -2' }], tc: [{ input: 'push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', expectedOutput: '-3 0 -2' }] },
    { title: 'Evaluate Reverse Polish Notation', diff: 'MEDIUM', desc: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation.', in: 'Tokens space separated.', out: 'Evaluated integer.', con: '1 <= tokens.length <= 10^4', ex: [{ input: '2 1 + 3 *', output: '9' }], tc: [{ input: '2 1 + 3 *', expectedOutput: '9' }, { input: '4 13 5 / +', expectedOutput: '6' }] },
    { title: 'Daily Temperatures', diff: 'MEDIUM', desc: 'Given array of `temperatures`, return array `answer` where `answer[i]` is number of days to wait for a warmer temperature.', in: 'N temperatures line.', out: 'Answer days space separated.', con: '1 <= N <= 10^5', ex: [{ input: '73 74 75 71 69 72 76 73', output: '1 1 4 2 1 1 0 0' }], tc: [{ input: '73 74 75 71 69 72 76 73', expectedOutput: '1 1 4 2 1 1 0 0' }] },
    { title: 'Largest Rectangle in Histogram', diff: 'HARD', desc: 'Given an array of integers `heights` representing the histogram\'s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.', in: 'Heights array.', out: 'Max rectangle area.', con: '1 <= heights.length <= 10^5', ex: [{ input: '2 1 5 6 2 3', output: '10' }], tc: [{ input: '2 1 5 6 2 3', expectedOutput: '10' }] },
    { title: 'Generate Parentheses', diff: 'MEDIUM', desc: 'Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.', in: 'Single integer N.', out: 'All valid bracket combinations.', con: '1 <= N <= 8', ex: [{ input: '3', output: '((())) (()()) (())() ()(()) ()()()' }], tc: [{ input: '3', expectedOutput: '((())) (()()) (())() ()(()) ()()()' }] },
    { title: 'Car Fleet', diff: 'MEDIUM', desc: 'Find how many car fleets will arrive at the target destination.', in: 'Target and position/speed arrays.', out: 'Number of fleets.', con: '1 <= N <= 10^5', ex: [{ input: '12\n10 8 0 5 3\n2 4 1 1 3', output: '3' }], tc: [{ input: '12\n10 8 0 5 3\n2 4 1 1 3', expectedOutput: '3' }] },
    { title: 'Simplify Path', diff: 'MEDIUM', desc: 'Given an absolute path for a Unix-style file system, simplify it.', in: 'Path string line.', out: 'Canonical path string.', con: '1 <= path.length <= 300', ex: [{ input: '/home/', output: '/home' }, { input: '/../', output: '/' }], tc: [{ input: '/home/', expectedOutput: '/home' }, { input: '/../', expectedOutput: '/' }] }
  ];

  for (const p of stackProblems) {
    await createProblem(p.title, 'Stack', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- QUEUE (5 Problems) ---
  const queueProblems = [
    { title: 'Implement Queue using Stacks', diff: 'EASY', desc: 'Implement a first in first out (FIFO) queue using only two stacks.', in: 'Operations line by line.', out: 'Space separated return values.', con: '1 <= val <= 9', ex: [{ input: 'push 1\npush 2\npeek\npop\nempty', output: '1 1 false' }], tc: [{ input: 'push 1\npush 2\npeek\npop\nempty', expectedOutput: '1 1 false' }] },
    { title: 'Sliding Window Maximum', diff: 'HARD', desc: 'You are given an array of integers `nums`, there is a sliding window of size `k`. Return max in each window.', in: 'N and K on line 1, array on line 2.', out: 'Max of each window space separated.', con: '1 <= N <= 10^5', ex: [{ input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7' }], tc: [{ input: '8 3\n1 3 -1 -3 5 3 6 7', expectedOutput: '3 3 5 5 6 7' }] },
    { title: 'Rotting Oranges', diff: 'MEDIUM', desc: 'Return the minimum number of minutes that must elapse until no cell has a fresh orange using BFS.', in: 'R C matrix rows following.', out: 'Minimum minutes integer (-1 if impossible).', con: '1 <= R, C <= 10', ex: [{ input: '3 3\n2 1 1\n1 1 0\n0 1 1', output: '4' }], tc: [{ input: '3 3\n2 1 1\n1 1 0\n0 1 1', expectedOutput: '4' }] },
    { title: 'Design Circular Queue', diff: 'MEDIUM', desc: 'Design your implementation of the circular queue.', in: 'Capacity k and queue operations.', out: 'Return outputs space separated.', con: '1 <= k <= 1000', ex: [{ input: '3\nenQueue 1\nenQueue 2\nenQueue 3\nenQueue 4\nRear\nisFull', output: 'true true true false 3 true' }], tc: [{ input: '3\nenQueue 1\nenQueue 2\nenQueue 3\nenQueue 4\nRear\nisFull', expectedOutput: 'true true true false 3 true' }] },
    { title: 'First Unique Character in a Stream', diff: 'MEDIUM', desc: 'Find the first non-repeating character from a stream of characters.', in: 'Stream string input.', out: 'Space separated non-repeating chars.', con: '1 <= s.length <= 10^5', ex: [{ input: 'aabc', output: 'a a b b' }], tc: [{ input: 'aabc', expectedOutput: 'a a b b' }] }
  ];

  for (const p of queueProblems) {
    await createProblem(p.title, 'Queue', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- RECURSION (7 Problems) ---
  const recursionProblems = [
    { title: 'Fibonacci Number', diff: 'EASY', desc: 'Calculate F(n) given `n`.', in: 'Single integer n.', out: 'F(n) integer.', con: '0 <= n <= 30', ex: [{ input: '4', output: '3' }], tc: [{ input: '4', expectedOutput: '3' }, { input: '2', expectedOutput: '1' }] },
    { title: 'Power of Two', diff: 'EASY', desc: 'Given an integer `n`, return `true` if it is a power of two.', in: 'Single integer n.', out: 'true or false', con: '-2^31 <= n <= 2^31 - 1', ex: [{ input: '16', output: 'true' }], tc: [{ input: '16', expectedOutput: 'true' }, { input: '3', expectedOutput: 'false' }] },
    { title: 'Subsets', diff: 'MEDIUM', desc: 'Given an integer array `nums` of unique elements, return all possible subsets (the power set).', in: 'N on line 1, array elements line 2.', out: 'Subsets list.', con: '1 <= N <= 10', ex: [{ input: '3\n1 2 3', output: '[] [1] [2] [1,2] [3] [1,3] [2,3] [1,2,3]' }], tc: [{ input: '3\n1 2 3', expectedOutput: '[] [1] [2] [1,2] [3] [1,3] [2,3] [1,2,3]' }] },
    { title: 'Permutations', diff: 'MEDIUM', desc: 'Given an array `nums` of distinct integers, return all the possible permutations.', in: 'N elements.', out: 'All permutations.', con: '1 <= N <= 6', ex: [{ input: '3\n1 2 3', output: '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1' }], tc: [{ input: '3\n1 2 3', expectedOutput: '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1' }] },
    { title: 'Combination Sum', diff: 'MEDIUM', desc: 'Find all unique combinations in `candidates` where candidate numbers sum to `target`.', in: 'N and target on line 1, array line 2.', out: 'Unique combinations.', con: '1 <= N <= 30', ex: [{ input: '4 7\n2 3 6 7', output: '2 2 3\n7' }], tc: [{ input: '4 7\n2 3 6 7', expectedOutput: '2 2 3\n7' }] },
    { title: 'N-Queens', diff: 'HARD', desc: 'The n-queens puzzle is placing n queens on an n x n chessboard such that no two queens attack each other.', in: 'Integer N board size.', out: 'Distinct solutions count.', con: '1 <= N <= 9', ex: [{ input: '4', output: '2' }], tc: [{ input: '4', expectedOutput: '2' }, { input: '1', expectedOutput: '1' }] },
    { title: 'Word Search', diff: 'MEDIUM', desc: 'Given an `m x n` grid of characters and a string `word`, return `true` if `word` exists in the grid.', in: 'M N and grid string.', out: 'true or false', con: '1 <= m, n <= 6', ex: [{ input: '3 4\nA B C E\nS F C S\nA D E E\nABCCED', output: 'true' }], tc: [{ input: '3 4\nA B C E\nS F C S\nA D E E\nABCCED', expectedOutput: 'true' }] }
  ];

  for (const p of recursionProblems) {
    await createProblem(p.title, 'Recursion', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- SEARCHING (8 Problems) ---
  const searchingProblems = [
    { title: 'Binary Search', diff: 'EASY', desc: 'Given an array of integers `nums` sorted in ascending order and a `target`, search target in `nums`.', in: 'N and target on line 1, sorted array line 2.', out: 'Index of target or -1.', con: '1 <= N <= 10^4', ex: [{ input: '6 9\n-1 0 3 5 9 12', output: '4' }], tc: [{ input: '6 9\n-1 0 3 5 9 12', expectedOutput: '4' }, { input: '6 2\n-1 0 3 5 9 12', expectedOutput: '-1' }] },
    { title: 'Search in Rotated Sorted Array', diff: 'MEDIUM', desc: 'Given rotated sorted array and target, return index of target.', in: 'N and target on line 1, array line 2.', out: 'Index of target or -1.', con: '1 <= N <= 5000', ex: [{ input: '7 0\n4 5 6 7 0 1 2', output: '4' }], tc: [{ input: '7 0\n4 5 6 7 0 1 2', expectedOutput: '4' }] },
    { title: 'Search a 2D Matrix', diff: 'MEDIUM', desc: 'Search for integer target in an `m x n` integer matrix.', in: 'M N and target on line 1, matrix elements line 2.', out: 'true or false', con: '1 <= m, n <= 100', ex: [{ input: '3 4 3\n1 3 5 7 10 11 16 20 23 30 34 60', output: 'true' }], tc: [{ input: '3 4 3\n1 3 5 7 10 11 16 20 23 30 34 60', expectedOutput: 'true' }] },
    { title: 'Find Minimum in Rotated Sorted Array', diff: 'MEDIUM', desc: 'Given the sorted rotated array of unique elements, return the minimum element.', in: 'N on line 1, array line 2.', out: 'Minimum element integer.', con: '1 <= N <= 5000', ex: [{ input: '5\n3 4 5 1 2', output: '1' }], tc: [{ input: '5\n3 4 5 1 2', expectedOutput: '1' }] },
    { title: 'First and Last Position of Element in Sorted Array', diff: 'MEDIUM', desc: 'Find starting and ending position of a given target value.', in: 'N and target on line 1, array line 2.', out: 'Start and end indices space separated.', con: '0 <= N <= 10^5', ex: [{ input: '6 8\n5 7 7 8 8 10', output: '3 4' }], tc: [{ input: '6 8\n5 7 7 8 8 10', expectedOutput: '3 4' }] },
    { title: 'Koko Eating Bananas', diff: 'MEDIUM', desc: 'Find minimum integer speed `k` such that Koko can eat all bananas within `h` hours.', in: 'N and h on line 1, piles array line 2.', out: 'Minimum eating speed k.', con: '1 <= N <= 10^4', ex: [{ input: '4 8\n3 6 7 11', output: '4' }], tc: [{ input: '4 8\n3 6 7 11', expectedOutput: '4' }] },
    { title: 'Median of Two Sorted Arrays', diff: 'HARD', desc: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n`, return the median of the two sorted arrays.', in: 'M N line 1, nums1 line 2, nums2 line 3.', out: 'Float median value.', con: '0 <= m, n <= 1000', ex: [{ input: '2 1\n1 3\n2', output: '2.0' }], tc: [{ input: '2 1\n1 3\n2', expectedOutput: '2.0' }] },
    { title: 'Peak Index in a Mountain Array', diff: 'EASY', desc: 'Find peak element index in a mountain array.', in: 'N array length, elements line 2.', out: 'Peak index.', con: '3 <= N <= 10^5', ex: [{ input: '3\n0 1 0', output: '1' }], tc: [{ input: '3\n0 1 0', expectedOutput: '1' }] }
  ];

  for (const p of searchingProblems) {
    await createProblem(p.title, 'Searching', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- SORTING (7 Problems) ---
  const sortingProblems = [
    { title: 'Sort Colors (Dutch National Flag)', diff: 'MEDIUM', desc: 'Given an array `nums` with `n` objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent (0, 1, 2).', in: 'N on line 1, array line 2.', out: 'Sorted array elements.', con: '1 <= N <= 300', ex: [{ input: '6\n2 0 2 1 1 0', output: '0 0 1 1 2 2' }], tc: [{ input: '6\n2 0 2 1 1 0', expectedOutput: '0 0 1 1 2 2' }] },
    { title: 'Merge Sort Array', diff: 'EASY', desc: 'Merge `nums1` and `nums2` into a single array sorted in non-decreasing order.', in: 'M N line 1, nums1 line 2, nums3 line 3.', out: 'Merged sorted space separated elements.', con: '1 <= M, N <= 200', ex: [{ input: '3 3\n1 2 3\n2 5 6', output: '1 2 2 3 5 6' }], tc: [{ input: '3 3\n1 2 3\n2 5 6', expectedOutput: '1 2 2 3 5 6' }] },
    { title: 'Kth Largest Element in an Array', diff: 'MEDIUM', desc: 'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.', in: 'N and k line 1, array line 2.', out: 'Kth largest element.', con: '1 <= N <= 10^5', ex: [{ input: '6 2\n3 2 1 5 6 4', output: '5' }], tc: [{ input: '6 2\n3 2 1 5 6 4', expectedOutput: '5' }] },
    { title: 'Top K Frequent Elements', diff: 'MEDIUM', desc: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.', in: 'N and k line 1, array line 2.', out: 'Top k elements space separated.', con: '1 <= N <= 10^5', ex: [{ input: '6 2\n1 1 1 2 2 3', output: '1 2' }], tc: [{ input: '6 6 2\n1 1 1 2 2 3', expectedOutput: '1 2' }] },
    { title: 'Sort List', diff: 'MEDIUM', desc: 'Given the head of a linked list, return the list after sorting it in O(n log n) time.', in: 'Linked list values.', out: 'Sorted list values.', con: '0 <= Nodes <= 5 * 10^4', ex: [{ input: '4 2 1 3', output: '1 2 3 4' }], tc: [{ input: '4 2 1 3', expectedOutput: '1 2 3 4' }] },
    { title: 'Insertion Sort List', diff: 'MEDIUM', desc: 'Sort a linked list using insertion sort.', in: 'List values.', out: 'Sorted list values.', con: '1 <= Nodes <= 5000', ex: [{ input: '4 2 1 3', output: '1 2 3 4' }], tc: [{ input: '4 2 1 3', expectedOutput: '1 2 3 4' }] },
    { title: 'Minimum Number of Arrows to Burst Balloons', diff: 'MEDIUM', desc: 'Find the minimum number of arrows required to burst all balloons.', in: 'N balloons on line 1, start end pairs following.', out: 'Minimum arrows count.', con: '1 <= N <= 10^5', ex: [{ input: '4\n10 16\n2 8\n1 6\n7 12', output: '2' }], tc: [{ input: '4\n10 16\n2 8\n1 6\n7 12', expectedOutput: '2' }] }
  ];

  for (const p of sortingProblems) {
    await createProblem(p.title, 'Sorting', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- TREES (10 Problems) ---
  const treeProblems = [
    { title: 'Invert Binary Tree', diff: 'EASY', desc: 'Given the root of a binary tree, invert the tree, and return its root.', in: 'Level order traversal tree array.', out: 'Inverted level order tree array.', con: '0 <= Nodes <= 100', ex: [{ input: '4 2 7 1 3 6 9', output: '4 7 2 9 6 3 1' }], tc: [{ input: '4 2 7 1 3 6 9', expectedOutput: '4 7 2 9 6 3 1' }] },
    { title: 'Maximum Depth of Binary Tree', diff: 'EASY', desc: 'Given the root of a binary tree, return its maximum depth.', in: 'Level order array.', out: 'Max depth integer.', con: '0 <= Nodes <= 10^4', ex: [{ input: '3 9 20 null null 15 7', output: '3' }], tc: [{ input: '3 9 20 null null 15 7', expectedOutput: '3' }] },
    { title: 'Same Tree', diff: 'EASY', desc: 'Given roots of two binary trees `p` and `q`, write a function to check if they are the same or not.', in: 'Tree 1 line 1, Tree 2 line 2.', out: 'true or false', con: '0 <= Nodes <= 100', ex: [{ input: '1 2 3\n1 2 3', output: 'true' }], tc: [{ input: '1 2 3\n1 2 3', expectedOutput: 'true' }] },
    { title: 'Subtree of Another Tree', diff: 'EASY', desc: 'Check if tree `subRoot` is a subtree of tree `root`.', in: 'Root tree line 1, Subtree line 2.', out: 'true or false', con: '1 <= Nodes <= 2000', ex: [{ input: '3 4 5 1 2\n4 1 2', output: 'true' }], tc: [{ input: '3 4 5 1 2\n4 1 2', expectedOutput: 'true' }] },
    { title: 'Lowest Common Ancestor of a Binary Search Tree', diff: 'MEDIUM', desc: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.', in: 'BST level order line 1, p and q line 2.', out: 'LCA node value.', con: '2 <= Nodes <= 10^5', ex: [{ input: '6 2 8 0 4 7 9 null null 3 5\n2 8', output: '6' }], tc: [{ input: '6 2 8 0 4 7 9 null null 3 5\n2 8', expectedOutput: '6' }] },
    { title: 'Binary Tree Level Order Traversal', diff: 'MEDIUM', desc: 'Return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).', in: 'Tree level order array.', out: 'Level wise grouped arrays.', con: '0 <= Nodes <= 2000', ex: [{ input: '3 9 20 null null 15 7', output: '[3] [9,20] [15,7]' }], tc: [{ input: '3 9 20 null null 15 7', expectedOutput: '[3] [9,20] [15,7]' }] },
    { title: 'Validate Binary Search Tree', diff: 'MEDIUM', desc: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).', in: 'Level order array.', out: 'true or false', con: '1 <= Nodes <= 10^4', ex: [{ input: '2 1 3', output: 'true' }], tc: [{ input: '2 1 3', expectedOutput: 'true' }, { input: '5 1 4 null null 3 6', expectedOutput: 'false' }] },
    { title: 'Kth Smallest Element in a BST', diff: 'MEDIUM', desc: 'Given the root of a binary search tree, and an integer `k`, return the `k`th smallest value.', in: 'Tree array line 1, k line 2.', out: 'Kth smallest element.', con: '1 <= k <= Nodes <= 10^4', ex: [{ input: '3 1 4 null 2\n1', output: '1' }], tc: [{ input: '3 1 4 null 2\n1', expectedOutput: '1' }] },
    { title: 'Construct Binary Tree from Preorder and Inorder Traversal', diff: 'MEDIUM', desc: 'Given two integer arrays `preorder` and `inorder`, construct and return the binary tree level order representation.', in: 'Preorder line 1, Inorder line 2.', out: 'Level order tree array.', con: '1 <= Nodes <= 3000', ex: [{ input: '3 9 20 15 7\n9 3 15 20 7', output: '3 9 20 null null 15 7' }], tc: [{ input: '3 9 20 15 7\n9 3 15 20 7', expectedOutput: '3 9 20 null null 15 7' }] },
    { title: 'Binary Tree Maximum Path Sum', diff: 'HARD', desc: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. Return max path sum.', in: 'Tree level order array.', out: 'Max path sum integer.', con: '1 <= Nodes <= 3 * 10^4', ex: [{ input: '1 2 3', output: '6' }, { input: '-10 9 20 null null 15 7', output: '42' }], tc: [{ input: '1 2 3', expectedOutput: '6' }, { input: '-10 9 20 null null 15 7', expectedOutput: '42' }] }
  ];

  for (const p of treeProblems) {
    await createProblem(p.title, 'Trees', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- GRAPHS (10 Problems) ---
  const graphProblems = [
    { title: 'Number of Islands', diff: 'MEDIUM', desc: 'Given an `m x n` 2D binary grid `grid` which represents a map of `1`s (land) and `0`s (water), return the number of islands.', in: 'M N line 1, grid lines following.', out: 'Number of islands integer.', con: '1 <= m, n <= 300', ex: [{ input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1' }], tc: [{ input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expectedOutput: '1' }] },
    { title: 'Clone Graph', diff: 'MEDIUM', desc: 'Given a reference of a node in a connected undirected graph, return a deep copy of the graph.', in: 'Adjacency list format.', out: 'Cloned adjacency list.', con: '1 <= Nodes <= 100', ex: [{ input: '2 4\n1 3\n2 4\n1 3', output: '2 4\n1 3\n2 4\n1 3' }], tc: [{ input: '2 4\n1 3\n2 4\n1 3', expectedOutput: '2 4\n1 3\n2 4\n1 3' }] },
    { title: 'Course Schedule', diff: 'MEDIUM', desc: 'Determine if you can finish all courses given prerequisite pairings (Cycle Detection in Directed Graph).', in: 'NumCourses and numPrereqs line 1, pair lines following.', out: 'true or false', con: '1 <= numCourses <= 2000', ex: [{ input: '2 1\n1 0', output: 'true' }], tc: [{ input: '2 1\n1 0', expectedOutput: 'true' }, { input: '2 2\n1 0\n0 1', expectedOutput: 'false' }] },
    { title: 'Pacific Atlantic Water Flow', diff: 'MEDIUM', desc: 'Find list of grid coordinates where water can flow to both Pacific and Atlantic oceans.', in: 'M N line 1, matrix line 2.', out: 'Grid coordinates list.', con: '1 <= m, n <= 200', ex: [{ input: '5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4', output: '0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0' }], tc: [{ input: '5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4', expectedOutput: '0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0' }] },
    { title: 'Redundant Connection', diff: 'MEDIUM', desc: 'Find an edge that can be removed so that the resulting graph is a tree of n nodes.', in: 'N edges line 1, pairs line 2.', out: 'Redundant edge pair.', con: '3 <= N <= 1000', ex: [{ input: '3\n1 2\n1 3\n2 3', output: '2 3' }], tc: [{ input: '3\n1 2\n1 3\n2 3', expectedOutput: '2 3' }] },
    { title: 'Dijkstra Shortest Path', diff: 'HARD', desc: 'Compute the shortest path distances from source node to all other nodes in a weighted graph.', in: 'N M source line 1, u v w lines following.', out: 'Distances to all nodes space separated.', con: '1 <= N <= 10^5', ex: [{ input: '5 6 1\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1', output: '0 2 3 9 6' }], tc: [{ input: '5 6 1\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1', expectedOutput: '0 2 3 9 6' }] },
    { title: 'Graph Valid Tree', diff: 'MEDIUM', desc: 'Given n nodes labeled from 0 to n-1 and a list of undirected edges, check whether these edges make a valid tree.', in: 'N M line 1, edge lines following.', out: 'true or false', con: '1 <= N <= 2000', ex: [{ input: '5 4\n0 1\n0 2\n0 3\n1 4', output: 'true' }], tc: [{ input: '5 4\n0 1\n0 2\n0 3\n1 4', expectedOutput: 'true' }] },
    { title: 'Number of Connected Components in Undirected Graph', diff: 'MEDIUM', desc: 'Find the number of connected components in an undirected graph.', in: 'N M line 1, edge lines following.', out: 'Connected components count.', con: '1 <= N <= 2000', ex: [{ input: '5 3\n0 1\n1 2\n3 4', output: '2' }], tc: [{ input: '5 3\n0 1\n1 2\n3 4', expectedOutput: '2' }] },
    { title: 'Word Ladder', diff: 'HARD', desc: 'Given start word, end word, and a word dictionary, return length of shortest transformation sequence.', in: 'BeginWord EndWord line 1, N count line 2, words following.', out: 'Sequence length integer.', con: '1 <= wordList.length <= 5000', ex: [{ input: 'hit cog\n6\nhot dot dog lot log cog', output: '5' }], tc: [{ input: 'hit cog\n6\nhot dot dog lot log cog', expectedOutput: '5' }] },
    { title: 'Cheapest Flights Within K Stops', diff: 'MEDIUM', desc: 'Find cheapest price from src to dst with at most k stops.', in: 'N M src dst k line 1, u v price lines following.', out: 'Cheapest price or -1.', con: '1 <= n <= 100', ex: [{ input: '4 5 0 3 1\n0 1 100\n1 2 100\n2 3 100\n0 2 500\n1 3 600', output: '700' }], tc: [{ input: '4 5 0 3 1\n0 1 100\n1 2 100\n2 3 100\n0 2 500\n1 3 600', expectedOutput: '700' }] }
  ];

  for (const p of graphProblems) {
    await createProblem(p.title, 'Graphs', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- GREEDY (5 Problems) ---
  const greedyProblems = [
    { title: 'Jump Game', diff: 'MEDIUM', desc: 'You are given an integer array `nums`. Return `true` if you can reach the last index.', in: 'N on line 1, array on line 2.', out: 'true or false', con: '1 <= N <= 10^4', ex: [{ input: '5\n2 3 1 1 4', output: 'true' }], tc: [{ input: '5\n2 3 1 1 4', expectedOutput: 'true' }, { input: '5\n3 2 1 0 4', expectedOutput: 'false' }] },
    { title: 'Gas Station', diff: 'MEDIUM', desc: 'Return starting gas station index if you can travel around the circuit once, otherwise return -1.', in: 'N line 1, gas array line 2, cost array line 3.', out: 'Start index integer.', con: '1 <= N <= 10^5', ex: [{ input: '5\n1 2 3 4 5\n3 4 5 1 2', output: '3' }], tc: [{ input: '5\n1 2 3 4 5\n3 4 5 1 2', expectedOutput: '3' }] },
    { title: 'Hand of Straights', diff: 'MEDIUM', desc: 'Determine if cards hand can be rearranged into groups of `groupSize` consecutive cards.', in: 'N and groupSize line 1, hand line 2.', out: 'true or false', con: '1 <= N <= 10^4', ex: [{ input: '8 3\n1 2 3 6 2 3 4 7 8', output: 'true' }], tc: [{ input: '8 3\n1 2 3 6 2 3 4 7 8', expectedOutput: 'true' }] },
    { title: 'Non-overlapping Intervals', diff: 'MEDIUM', desc: 'Return minimum number of intervals you need to remove to make the rest non-overlapping.', in: 'N line 1, pairs line 2.', out: 'Minimum removals count.', con: '1 <= N <= 10^5', ex: [{ input: '4\n1 2\n2 3\n3 4\n1 3', output: '1' }], tc: [{ input: '4\n1 2\n2 3\n3 4\n1 3', expectedOutput: '1' }] },
    { title: 'Partition Labels', diff: 'MEDIUM', desc: 'Partition string `s` into as many parts as possible so that each letter appears in at most one part.', in: 'Single string input s.', out: 'Space separated sizes of partition parts.', con: '1 <= s.length <= 500', ex: [{ input: 'ababcbacadefegdehijhklij', output: '9 7 8' }], tc: [{ input: 'ababcbacadefegdehijhklij', expectedOutput: '9 7 8' }] }
  ];

  for (const p of greedyProblems) {
    await createProblem(p.title, 'Greedy', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- DYNAMIC PROGRAMMING (10 Problems) ---
  const dpProblems = [
    { title: 'Climbing Stairs', diff: 'EASY', desc: 'You are climbing a staircase. It takes `n` steps to reach the top. How many distinct ways can you climb to the top?', in: 'Single integer n.', out: 'Distinct ways count.', con: '1 <= n <= 45', ex: [{ input: '3', output: '3' }], tc: [{ input: '3', expectedOutput: '3' }, { input: '2', expectedOutput: '2' }] },
    { title: 'Coin Change', diff: 'MEDIUM', desc: 'Find fewest number of coins needed to make up given amount.', in: 'N and amount line 1, coins line 2.', out: 'Minimum coins count (-1 if impossible).', con: '1 <= amount <= 10^4', ex: [{ input: '3 11\n1 2 5', output: '3' }], tc: [{ input: '3 11\n1 2 5', expectedOutput: '3' }] },
    { title: 'Longest Increasing Subsequence', diff: 'MEDIUM', desc: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.', in: 'N line 1, array line 2.', out: 'Length integer.', con: '1 <= N <= 2500', ex: [{ input: '8\n10 9 2 5 3 7 101 18', output: '4' }], tc: [{ input: '8\n10 9 2 5 3 7 101 18', expectedOutput: '4' }] },
    { title: 'Longest Common Subsequence', diff: 'MEDIUM', desc: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence.', in: 'text1 line 1, text2 line 2.', out: 'Length integer.', con: '1 <= text1.length <= 1000', ex: [{ input: 'abcde\nace', output: '3' }], tc: [{ input: 'abcde\nace', expectedOutput: '3' }] },
    { title: 'Word Break', diff: 'MEDIUM', desc: 'Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented.', in: 'String s line 1, N line 2, dictionary words line 3.', out: 'true or false', con: '1 <= s.length <= 300', ex: [{ input: 'leetcode\n2\nleet code', output: 'true' }], tc: [{ input: 'leetcode\n2\nleet code', expectedOutput: 'true' }] },
    { title: 'House Robber', diff: 'MEDIUM', desc: 'Return the maximum amount of money you can rob tonight without alerting the police (no two adjacent houses robbed).', in: 'N line 1, array line 2.', out: 'Max money integer.', con: '1 <= N <= 100', ex: [{ input: '4\n1 2 3 1', output: '4' }], tc: [{ input: '4\n1 2 3 1', expectedOutput: '4' }] },
    { title: 'House Robber II', diff: 'MEDIUM', desc: 'Houses arranged in a circle. Return max amount of money you can rob.', in: 'N line 1, array line 2.', out: 'Max money integer.', con: '1 <= N <= 100', ex: [{ input: '3\n2 3 2', output: '3' }], tc: [{ input: '3\n2 3 2', expectedOutput: '3' }] },
    { title: 'Decode Ways', diff: 'MEDIUM', desc: 'Given a string `s` containing digits, return the number of ways to decode it.', in: 'Single digit string s.', out: 'Total decoding ways integer.', con: '1 <= s.length <= 100', ex: [{ input: '226', output: '3' }], tc: [{ input: '226', expectedOutput: '3' }] },
    { title: 'Unique Paths', diff: 'MEDIUM', desc: 'Find total number of unique paths from top-left to bottom-right in an `m x n` grid.', in: 'M N line 1.', out: 'Unique paths count integer.', con: '1 <= m, n <= 100', ex: [{ input: '3 7', output: '28' }], tc: [{ input: '3 7', expectedOutput: '28' }] },
    { title: 'Edit Distance (Levenshtein)', diff: 'HARD', desc: 'Given two strings `word1` and `word2`, return the minimum number of operations to convert `word1` to `word2`.', in: 'word1 line 1, word2 line 2.', out: 'Minimum edit operations.', con: '0 <= word1.length, word2.length <= 500', ex: [{ input: 'horse\nros', output: '3' }], tc: [{ input: 'horse\nros', expectedOutput: '3' }] }
  ];

  for (const p of dpProblems) {
    await createProblem(p.title, 'Dynamic Programming', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // --- HASHING (5 Problems) ---
  const hashingProblems = [
    { title: 'Design HashMap', diff: 'EASY', desc: 'Design a HashMap without using any built-in hash table libraries.', in: 'Operations line by line.', out: 'Outputs of get queries space separated.', con: '0 <= key, val <= 10^6', ex: [{ input: 'put 1 1\nput 2 2\nget 1\nget 3\nput 2 1\nget 2\nremove 2\nget 2', output: '1 -1 1 -1' }], tc: [{ input: 'put 1 1\nput 2 2\nget 1\nget 3\nput 2 1\nget 2\nremove 2\nget 2', expectedOutput: '1 -1 1 -1' }] },
    { title: 'Subarray Sums Divisible by K', diff: 'MEDIUM', desc: 'Given an integer array `nums` and an integer `k`, return the number of non-empty subarrays that have a sum divisible by `k`.', in: 'N and k line 1, array line 2.', out: 'Count of subarrays.', con: '1 <= N <= 3 * 10^4', ex: [{ input: '6 5\n4 5 0 -2 -3 1', output: '7' }], tc: [{ input: '6 5\n4 5 0 -2 -3 1', expectedOutput: '7' }] },
    { title: 'Longest Consecutive Sequence', diff: 'MEDIUM', desc: 'Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.', in: 'N line 1, array line 2.', out: 'Length integer.', con: '0 <= N <= 10^5', ex: [{ input: '6\n100 4 200 1 3 2', output: '4' }], tc: [{ input: '6\n100 4 200 1 3 2', expectedOutput: '4' }] },
    { title: 'Check If Array Pairs Are Divisible by k', diff: 'MEDIUM', desc: 'Check if we can divide array into pairs such that sum of every pair is divisible by k.', in: 'N and k line 1, array line 2.', out: 'true or false', con: '1 <= N <= 10^5', ex: [{ input: '10 5\n1 2 3 4 5 10 6 7 8 9', output: 'true' }], tc: [{ input: '10 5\n1 2 3 4 5 10 6 7 8 9', expectedOutput: 'true' }] },
    { title: 'Four Sum II', diff: 'MEDIUM', desc: 'Given 4 integer arrays nums1, nums2, nums3, nums4, return number of tuples (i, j, k, l) such that sum is zero.', in: 'N line 1, 4 array lines following.', out: 'Tuples count.', con: '1 <= N <= 200', ex: [{ input: '2\n1 2\n-2 -1\n-1 2\n0 2', output: '2' }], tc: [{ input: '2\n1 2\n-2 -1\n-1 2\n0 2', expectedOutput: '2' }] }
  ];

  for (const p of hashingProblems) {
    await createProblem(p.title, 'Hashing', p.diff as any, p.desc, p.in, p.out, p.con, p.ex, p.tc);
  }

  // 3. Seed Contests
  console.log('🏁 Seeding Contests...');
  const now = new Date();
  const futureStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const futureEnd = new Date(futureStart.getTime() + 3 * 60 * 60 * 1000);

  const pastStart = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(pastStart.getTime() + 2 * 60 * 60 * 1000);

  await prisma.contest.create({
    data: {
      title: 'AlgoRank Weekly Challenge 1',
      description: 'Test your speed and algorithmic accuracy across Arrays, Dynamic Programming, and Graphs!',
      startTime: futureStart,
      endTime: futureEnd,
      duration: 180
    }
  });

  await prisma.contest.create({
    data: {
      title: 'Inter-College Coding Championship 2026',
      description: 'Compete for college glory! Points scored directly boost your college rank.',
      startTime: pastStart,
      endTime: pastEnd,
      duration: 120
    }
  });

  console.log('✅ AlgoRank Clean Database Seeding Complete! (Zero Dummy Users)');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
