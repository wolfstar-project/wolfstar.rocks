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
      process.exit(1);
    }

    const branches = await git.branchLocal();
    if (!branches.all.includes("main") || !branches.all.includes("release")) {
      consola.error("Both 'main' and 'release' branches must exist locally.");
      process.exit(1);
    }

    consola.log("Pre-flight checks passed.");

    const hash = await git.revparse(["main"]);
    if (!hash) {
      consola.error("Could not resolve main branch commit hash.");
      process.exit(1);
    }

    const proceed = await consola.prompt(`This will reset the 'release' branch to 'main' (${hash.slice(0, 7)}) and force-push. Are you sure you want to continue?`, {
      type: "confirm",
    });

    if (!proceed) {
      consola.log("Operation cancelled.");
      return;
    }

    const force = process.argv.includes("--force") || process.env.FORCE_PUSH === "true";
    if (!force) {
      consola.error("This is a destructive operation. Use the --force flag or set FORCE_PUSH=true to proceed.");
      process.exit(1);
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

    consola.log("Release process completed successfully.");
    consola.log(`You can delete the recovery branch with: git branch -D ${recoveryRef}`);
  }
  catch (error) {
    consola.error("An error occurred during the release process:", error);

    if (recoveryRefCreated) {
      consola.log(`Attempting to restore 'release' branch from '${recoveryRef}'...`);
      try {
        await git.checkout("release");
        await git.reset(["--hard", recoveryRef]);
        await git.push(["--force"]);
        consola.log("'release' branch has been restored.");
      }
      catch (restoreError) {
        consola.error("Failed to restore 'release' branch. Manual intervention may be required.", restoreError);
        consola.error(`The state of the 'release' branch before this script was run is saved in the local branch '${recoveryRef}'.`);
      }
    }

    process.exit(1);
  }
}

main();
