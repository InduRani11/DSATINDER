import { PrismaClient } from '@prisma/client';
import path from 'path';

// If DATABASE_URL is not provided via environment, resolve to the bundled dev.db
if (!process.env.DATABASE_URL) {
  const dbPath = path.resolve(__dirname, '../../prisma/dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export default prisma;
