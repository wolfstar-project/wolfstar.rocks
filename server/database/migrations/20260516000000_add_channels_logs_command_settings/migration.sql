-- append-only: do NOT modify prior migrations

-- AlterTable: add channel references for the command and settings audit-log channels.
-- These columns tell the bot where to post command-execution and settings-change events.
ALTER TABLE "guilds" ADD COLUMN "channels.logs.command"  VARCHAR(19);
ALTER TABLE "guilds" ADD COLUMN "channels.logs.settings" VARCHAR(19);
