import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "~~/server/database/generated/prisma/client";

export interface GetDbParams {
  connectionString: string;
}

export function getDb({ connectionString }: GetDbParams) {
  const pool = new PrismaPg({ connectionString, database: "postgres" });

  const prisma = new PrismaClient({ adapter: pool });

  return prisma;
}

const prisma = getDb({ connectionString: process.env.DATABASE_URL! });
export default prisma;
