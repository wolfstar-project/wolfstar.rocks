import { consola } from "consola";
import Git from "simple-git";

const git = Git();

async function main() {
  const recoveryRef = `release-backup-${Date.now()}`;
  let recoveryRefCreated = false;

  try {
    consola.log("Running pre-flight checks...");

    const status = await git.status();
    if (!status.isClean()) {
      consola.error("Working tree is not clean. Please commit or stash your changes.");
      process.exitCode = 1;
      return;
    }

    const branches = await git.branchLocal();
    if (!branches.all.includes("main") || !branches.all.includes("release")) {
      consola.error("Both 'main' and 'release' branches must exist locally.");
      process.exitCode = 1;
      return;
    }

    consola.log("Pre-flight checks passed.");

    const hash = (await git.revparse(["main"])).trim();
    if (!hash) {
      consola.error("Could not resolve main branch commit hash.");
      process.exitCode = 1;
      return;
    }

    const force = process.argv.includes("--force") || process.env.FORCE_PUSH === "true";
    if (!force) {
      if (!process.stdout.isTTY) {
        consola.error("Non-interactive environment detected. Re-run with --force or FORCE_PUSH=true.");
        process.exitCode = 1;
        return;
      }

      const proceed = await consola.prompt(
        `This will reset the 'release' branch to 'main' (${hash.slice(0, 7)}). Continue?`,
        { type: "confirm" },
      );

      if (!proceed) {
        consola.log("Operation cancelled.");
        return;
      }
    }

    consola.log("Creating recovery reference...");
    await git.branch([recoveryRef, "release"]);
    recoveryRefCreated = true;
    consola.log(`Recovery reference '${recoveryRef}' created.`);

    consola.log("Checkout release branch");
    await git.checkout("release");

    consola.log(`Reset to main branch (${hash})`);
    await git.reset(["--hard", hash]);

    consola.log("Push to release branch");
    await git.push(["--force"]);

    consola.log("Checkout main branch");
    await git.checkout("main");
  }
  catch (error) {
    consola.error("An error occurred during the release process:", error);

    if (recoveryRefCreated) {
      consola.log(`Attempting to restore 'release' branch from '${recoveryRef}'...`);
      try {
        await git.checkout("release");
        await git.reset(["--hard", recoveryRef]);
        await git.push(["origin", "release", "--force"]);
        consola.log("'release' branch has been restored.");
      }
      catch (restoreError) {
        consola.error(
          "Failed to restore 'release' branch. Manual intervention may be required.",
          restoreError,
        );
        consola.error(
          `The state of the 'release' branch before this script was run is saved in the local branch '${recoveryRef}'.`,
        );
      }
    }
    process.exitCode = 1;
  }
  finally {
    try {
      await git.checkout("main");
    }
    catch (e) {
      consola.warn("Failed to return to 'main' branch after operation.", e);
    }
  }
}

main();
