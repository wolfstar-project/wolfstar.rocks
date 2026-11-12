import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readJson(path: string): unknown {
	return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8"));
}

function findStorageHash(value: unknown): string | null {
	if (typeof value !== "object" || value === null) return null;
	for (const [key, entry] of Object.entries(value)) {
		if (key === "storageHash" && typeof entry === "string") return entry;
		const nested = findStorageHash(entry);
		if (nested !== null) return nested;
	}
	return null;
}

// The bot migrates the shared database and records, in `refs/db.json`, the
// hash of the contract its migrations lead to. The client this app builds
// must describe that same database, so the two are read from the one pinned
// bot commit and compared.
describe("bot contract pin", () => {
	it("emits the contract the bot's migrations lead to", () => {
		const ref = readJson("vendor/wolfstar/projects/database/migrations/app/refs/db.json") as {
			hash: string;
		};
		const emitted = readJson("server/database/generated/prisma/contract.json");

		expect(ref.hash).toMatch(/^[a-f0-9]{64}$/u);
		expect(findStorageHash(emitted)?.replace(/^sha256:/u, "")).toBe(ref.hash);
	});
});
