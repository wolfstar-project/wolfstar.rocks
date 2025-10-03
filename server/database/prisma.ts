import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "~~/server/database/generated/client";

export interface GetDbParams {
  connectionString: string;
}

export function getDb({ connectionString }: GetDbParams) {
  const pool = new PrismaPg({ connectionString, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });

  const prisma = new PrismaClient({ adapter: pool });

  return prisma;
}
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}
const prisma = getDb({ connectionString: databaseUrl });
export default prisma;
