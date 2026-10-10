import type { Contract, Models } from "#server/database/generated/prisma/contract";
import contractJson from "#server/database/generated/prisma/contract.json" with { type: "json" };
import { lints } from "@prisma/orm-postgres/family-runtime";
import postgres from "@prisma/orm-postgres/runtime";
import { typedRuntimeDescriptor } from "prisma-orm-extension-typed-json/runtime";

/**
 * Prisma ORM 8 client for the database this app shares with the WolfStar bot.
 *
 * Wired the way the bot's `projects/database` package wires its own
 * (wolfstar-project/wolfstar, V7): the same contract, the typed-JSON extension
 * for the columns that hold structured values, and the lint middleware.
 */
export const db = postgres<Contract>({
	// `undefined`, never `""`: the factory connects lazily and accepts a missing
	// URL (it only throws once a query needs a connection), but it rejects an
	// empty string outright. Prerendering imports this module at build time,
	// where `DATABASE_URL` is not set.
	url: process.env.DATABASE_URL || undefined,
	contractJson,
	extensions: [typedRuntimeDescriptor],
	// Refuses a `DELETE` or an `UPDATE` without a `WHERE` before it reaches the database:
	middleware: [lints()],
});

export type Database = typeof db;

export type { Contract, Models };
