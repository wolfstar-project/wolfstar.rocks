import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "~~/server/database/generated/client";

export interface GetDbParams {
  connectionString: string;
}

export function getDb({ connectionString }: GetDbParams) {
  const pool = new PrismaPg({ connectionString });

  const prisma = new PrismaClient({ adapter: pool });

  return prisma;
}
const databaseUrl = process.env.DATABASE_URL;
const prisma = getDb({ connectionString: databaseUrl! });
export default prisma;
