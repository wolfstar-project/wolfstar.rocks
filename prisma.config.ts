import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";
import { typedExtensionDescriptor } from "prisma-orm-extension-typed-json/control";
import { definePrismaConfig } from "prisma/config";
import "dotenv/config";

// Prisma ORM 8 only, set up the way the bot's `projects/database` package is
// (wolfstar-project/wolfstar, V7): the contract is the source, and
// `prisma contract emit` writes the typed artefacts the runtime client loads.
//
// No `migrations` directory is wired on purpose. The bot owns the shared
// database and migrates it; this app only reads and writes the tables the
// contract describes, so it must never run `prisma db sign` or
// `prisma migration plan`.
export default definePrismaConfig({
	orm: definePostgresConfig({
		// The bot's own contract, read straight from its repository: the
		// `vendor/wolfstar` submodule pins the commit this app is built against.
		contract: "vendor/wolfstar/projects/database/src/contract.prisma",
		// Gitignored: regenerate with `pnpm prisma:generate`.
		output: "server/database/generated/prisma",
		extensions: [typedExtensionDescriptor],
		db: {
			// Use process.env so non-Prisma tools (knip) can load this file without DATABASE_URL
			connection: process.env.DATABASE_URL ?? "",
		},
	}),
});
