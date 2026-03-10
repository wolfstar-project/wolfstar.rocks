import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
	schema: "server/database/schema.prisma",
	migrations: {
		path: "server/database/migrations",
	},
	datasource: {
		url: env("DATABASE_URL"),
	},
});
