import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { AuthValidator } from '../validators/auth.validator';

const JWT_SECRET = process.env.JWT_SECRET || 'algorank_super_secret_jwt_key_2026_dsa_platform';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, collegeId, profilePic, bio } = req.body;

    // Strong Input Validation
    const validationError = AuthValidator.validateRegisterInput({ name, username, email, password, collegeId });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check existing email
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      return res.status(400).json({ error: 'This email address is already registered.' });
    }

    // Check existing username
    const existingUsername = await prisma.user.findUnique({ where: { username: cleanUsername } });
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
    }

    // Verify college exists or auto-upsert from defaults
    let college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      const defaultCol = DEFAULT_COLLEGES.find((c) => c.id === collegeId || c.code === collegeId);
      if (defaultCol) {
        college = await prisma.college.upsert({
          where: { code: defaultCol.code },
          update: {},
          create: defaultCol
        });
      } else {
        college = await prisma.college.upsert({
          where: { code: DEFAULT_COLLEGES[0].code },
          update: {},
          create: DEFAULT_COLLEGES[0]
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        collegeId,
        profilePic: profilePic || null,
        bio: bio || null,
        totalPoints: 0,
        solvedCount: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      include: {
        college: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, collegeId: user.collegeId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required.' });
    }

    const searchKey = emailOrUsername.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: searchKey },
          { username: searchKey }
        ]
      },
      include: {
        college: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, collegeId: user.collegeId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        college: true,
        userBadges: { include: { badge: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate Global Rank
    const higherGlobalUsers = await prisma.user.count({
      where: {
        OR: [
          { totalPoints: { gt: user.totalPoints } },
          {
            AND: [
              { totalPoints: user.totalPoints },
              { solvedCount: { gt: user.solvedCount } }
            ]
          }
        ]
      }
    });
    const globalRank = higherGlobalUsers + 1;

    // Calculate College Rank
    const higherCollegeUsers = await prisma.user.count({
      where: {
        collegeId: user.collegeId,
        OR: [
          { totalPoints: { gt: user.totalPoints } },
          {
            AND: [
              { totalPoints: user.totalPoints },
              { solvedCount: { gt: user.solvedCount } }
            ]
          }
        ]
      }
    });
    const collegeRank = higherCollegeUsers + 1;

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      user: {
        ...userWithoutPassword,
        globalRank,
        collegeRank
      }
    });
  } catch (error: any) {
    console.error('GetMe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const DEFAULT_COLLEGES = [
  { id: "de90ed94-a376-4b13-8e4f-41f228384573", name: "COER University", city: "Roorkee", state: "Uttarakhand", country: "India", code: "COER" },
  { id: "bdb2075a-4498-426b-b450-31a3e4d56fd9", name: "Indian Institute of Technology Delhi", city: "New Delhi", state: "Delhi", country: "India", code: "IITD" },
  { id: "b3c3932e-c2ee-4dfa-846e-f1b7e42f2e52", name: "Indian Institute of Technology Bombay", city: "Mumbai", state: "Maharashtra", country: "India", code: "IITB" },
  { id: "c35ebea0-053f-4fff-a0d7-eec128c9268f", name: "BITS Pilani", city: "Pilani", state: "Rajasthan", country: "India", code: "BITS" },
  { id: "0d470e49-1872-4c4a-916a-dd3f01ab997f", name: "National Institute of Technology Jaipur", city: "Jaipur", state: "Rajasthan", country: "India", code: "NITJ" },
  { id: "70e8519d-f5ab-43c9-a4dd-93ce10853e50", name: "Delhi Technological University", city: "New Delhi", state: "Delhi", country: "India", code: "DTU" },
  { id: "07c8441e-779b-4f93-b745-e0efbf911999", name: "International Institute of Information Technology Hyderabad", city: "Hyderabad", state: "Telangana", country: "India", code: "IIITH" },
  { id: "ac80d02f-d040-484b-adbb-f45ddd5873a7", name: "Massachusetts Institute of Technology", city: "Cambridge", state: "Massachusetts", country: "USA", code: "MIT" },
  { id: "fe15978d-53d0-40bb-81e4-3c7c4520cfc7", name: "Stanford University", city: "Stanford", state: "California", country: "USA", code: "STAN" },
  { id: "6884e7ea-5e16-4991-9ecf-fe94c246d6ad", name: "Harvard University", city: "Cambridge", state: "Massachusetts", country: "USA", code: "HARV" }
];

export const getColleges = async (_req: Request, res: Response) => {
  try {
    let colleges = await prisma.college.findMany({
      orderBy: { name: 'asc' }
    });

    if (!colleges || colleges.length === 0) {
      // Auto-populate default colleges if DB was newly created on cloud
      for (const col of DEFAULT_COLLEGES) {
        await prisma.college.upsert({
          where: { code: col.code },
          update: {},
          create: col
        }).catch(() => {});
      }
      colleges = await prisma.college.findMany({ orderBy: { name: 'asc' } });
    }

    return res.json({ colleges: colleges.length > 0 ? colleges : DEFAULT_COLLEGES });
  } catch (error: any) {
    console.warn('GetColleges warning, serving default colleges list:', error?.message);
    return res.json({ colleges: DEFAULT_COLLEGES });
  }
};
