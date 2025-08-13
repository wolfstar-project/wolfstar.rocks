import { PrismaPg } from "@prisma/adapter-pg";
import { isDevelopment } from "std-env";
import { PrismaClient } from "~~/server/database/generated/client";

export interface GetDbParams {
  connectionString: string;
}

export function getDb({ connectionString }: GetDbParams) {
  const pool = new PrismaPg({ connectionString });

  const prisma = new PrismaClient({ adapter: pool });

  return prisma;
}

const prisma = getDb({ connectionString: isDevelopment ? process.env.DATABASE_URL! : process.env.DIRECT_URL! });
export default prisma;
