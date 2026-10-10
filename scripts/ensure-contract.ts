/**
 * Makes sure the bot's data contract is on disk before `prisma contract emit`
 * reads it.
 *
 * The contract lives in the `vendor/wolfstar` git submodule (the bot's
 * repository), which a plain `git clone` or a CI checkout without
 * `submodules: true` leaves empty. Rather than have every workflow remember
 * the flag, `postinstall` runs this first: when the file is missing it
 * initializes the submodule at the commit this repository pins.
 *
 * Usage: node scripts/ensure-contract.ts
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const SUBMODULE_PATH = "vendor/wolfstar";
const CONTRACT_PATH = resolve(SUBMODULE_PATH, "projects/database/src/contract.prisma");

if (!existsSync(CONTRACT_PATH)) {
	console.log(`[contract] ${SUBMODULE_PATH} is not checked out, initializing the submodule...`);
	try {
		execFileSync("git", ["submodule", "update", "--init", "--depth", "1", SUBMODULE_PATH], {
			stdio: "inherit",
		});
	} catch (error) {
		console.error(
			`[contract] Could not initialize ${SUBMODULE_PATH}. Run \`git submodule update --init\` and install again.`,
		);
		throw error;
	}

	if (!existsSync(CONTRACT_PATH)) {
		throw new Error(`[contract] ${CONTRACT_PATH} is missing from the pinned bot commit.`);
	}
}
