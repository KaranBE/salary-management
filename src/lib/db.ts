import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaInstance = () => {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  
  // Ensure the database path is absolute so it resolves correctly in Next.js and scripts
  let url = dbUrl;
  if (dbUrl.startsWith('file:')) {
    const dbFile = dbUrl.replace(/^file:/, '');
    const absolutePath = path.isAbsolute(dbFile) 
      ? dbFile 
      : path.resolve(process.cwd(), dbFile);
    url = `file:${absolutePath}`;
  }

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || getPrismaInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
