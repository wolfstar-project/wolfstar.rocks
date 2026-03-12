import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
	schema: "server/database/schema.prisma",
	migrations: {
		path: "server/database/migrations",
	},
});
