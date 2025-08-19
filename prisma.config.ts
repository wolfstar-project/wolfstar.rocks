import type { PrismaConfig } from "prisma";
import path from "node:path";

export default {
  schema: path.join("prisma"),
} satisfies PrismaConfig;
