/**
 * Prisma configuration file
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */

import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("server", "database", "schema.prisma"),
  migrations: {
    path: path.join("server", "database", "migrations"),
  },
});
