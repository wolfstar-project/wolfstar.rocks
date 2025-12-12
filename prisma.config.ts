import path from "node:path";
/**
 * Prisma configuration file
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ quiet: true });

export default defineConfig({
  schema: path.join("server", "database", "schema.prisma"),
  migrations: {
    path: path.join("server", "database", "migrations"),
  },
});
