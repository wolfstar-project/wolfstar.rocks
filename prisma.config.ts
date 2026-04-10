import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
	schema: "server/database/schema.prisma",
	migrations: {
		path: "server/database/migrations",
	},
	datasource: {
		// Use process.env so non-Prisma tools (knip) can load this file without DATABASE_URL
		url: process.env.DATABASE_URL ?? "",
	},
});
