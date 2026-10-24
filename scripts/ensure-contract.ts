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
 * A checkout that exists but sits on another commit is reported, not moved: it
 * is either stale after a pull (the contract would be emitted from old columns)
 * or a bump in progress, and only the developer knows which.
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
		execFileSync(
			"git",
			[
				// CI jobs that run in a container check the repository out as another
				// user, and git then refuses to touch it ("dubious ownership"). Only
				// these two directories are trusted, and only for this command.
				"-c",
				`safe.directory=${process.cwd()}`,
				"-c",
				`safe.directory=${resolve(SUBMODULE_PATH)}`,
				"submodule",
				"update",
				"--init",
				"--depth",
				"1",
				SUBMODULE_PATH,
			],
			{ stdio: "inherit" },
		);
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

/** Runs git against this repository, or returns `null` when it cannot. */
function git(...args: string[]): string | null {
	try {
		return execFileSync("git", ["-c", `safe.directory=${process.cwd()}`, ...args], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return null;
	}
}

// `ls-files -s` prints `<mode> <sha> <stage>\t<path>` for the gitlink.
const pinnedCommit = git("ls-files", "-s", "--", SUBMODULE_PATH)?.split(/\s+/u)[1];
const checkedOutCommit = git(
	"-c",
	`safe.directory=${resolve(SUBMODULE_PATH)}`,
	"-C",
	SUBMODULE_PATH,
	"rev-parse",
	"HEAD",
);

if (pinnedCommit && checkedOutCommit && pinnedCommit !== checkedOutCommit) {
	console.warn(
		[
			`[contract] ${SUBMODULE_PATH} is at ${checkedOutCommit.slice(0, 12)}, but this repository pins ${pinnedCommit.slice(0, 12)}.`,
			"[contract] The contract will be emitted from the checked-out commit.",
			`[contract] Stale after a pull? Run \`git submodule update --init ${SUBMODULE_PATH}\`. Bumping the contract? Stage it with \`git add ${SUBMODULE_PATH}\`.`,
		].join("\n"),
	);
}
