import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
import { definePrismaConfig } from "prisma/config";
import "dotenv/config";

// Prisma ORM 8, running beside the ORM 7 setup in `prisma7.config.ts` during the
// migration described at https://www.prisma.io/docs/guides/upgrade-prisma-orm/postgresql.
//
// No `migrations` directory is wired on purpose: the bot owns the shared
// database and migrates it, so this contract only describes tables it expects
// to find. Every model carries `@@control(external)` to say so, and this
// project must never run `prisma db sign` or `prisma migration plan`.
export default definePrismaConfig({
	orm: ormConfig({
		// The emitted artefacts sit beside the contract source, NOT under
		// `server/database/generated/`: that directory belongs to the ORM 7
		// generator, which wipes it on every `prisma7 generate`.
		contract: "server/database/prisma8/contract.prisma",
		db: {
			// Use process.env so non-Prisma tools (knip) can load this file without DATABASE_URL
			connection: process.env.DATABASE_URL ?? "",
		},
	}),
});
