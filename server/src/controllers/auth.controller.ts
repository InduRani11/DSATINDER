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

    // Verify college exists
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      return res.status(400).json({ error: 'Selected college does not exist.' });
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

export const getColleges = async (_req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json({ colleges });
  } catch (error: any) {
    console.error('GetColleges error:', error);
    return res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};
