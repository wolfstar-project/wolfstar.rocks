-- append-only: do NOT modify prior migrations
--
-- Moves the dashboard onto the WolfStar V7 database contract
-- (wolfstar-project/wolfstar -> projects/database/src/prisma8/contract.prisma)
-- and adds the dashboard-owned "Modules" table.
--
-- The bot owns and migrates the shared database, so every statement below is
-- written to no-op when the V7 objects already exist. The legacy V6 tables are
-- renamed to "<name>_v6" rather than dropped: their rows (guild settings,
-- moderation cases, audit chain) do not map onto the V7 columns without a
-- data-specific backfill, so they are kept for that backfill to read.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GuildAutoModerationHardAction') THEN
        CREATE TYPE "GuildAutoModerationHardAction" AS ENUM ('VoiceKick', 'Warning', 'Timeout', 'Kick', 'Softban', 'Ban');
    END IF;
END $$;

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModerationActionType') THEN
        CREATE TYPE "ModerationActionType" AS ENUM ('AddRole', 'RemoveRole', 'Nickname', 'AddWarning', 'RemoveWarning', 'Timeout', 'TimeoutEnd', 'Kick', 'Softban', 'Ban', 'Unban');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Guild" (
    "id" BIGINT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en-US',

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- The bot's V7 Guild table has no locale column yet, so add it when this runs
-- against a database it already created.
ALTER TABLE "Guild" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en-US';

-- CreateTable
CREATE TABLE IF NOT EXISTS "Modules" (
    "id" BIGINT NOT NULL,
    "automod" BOOLEAN NOT NULL DEFAULT true,
    "moderation" BOOLEAN NOT NULL DEFAULT true,
    "logs" BOOLEAN NOT NULL DEFAULT true,
    "commands" BOOLEAN NOT NULL DEFAULT true,
    "roles" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildCommands" (
    "id" BIGINT NOT NULL,
    "disabled" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disabled_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "disabled_in_channels" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "GuildCommands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildPermissions" (
    "id" BIGINT NOT NULL,
    "users" JSONB NOT NULL DEFAULT '[]',
    "roles" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "GuildPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildModeration" (
    "id" BIGINT NOT NULL,
    "channel_id" BIGINT,
    "track_bans" BOOLEAN NOT NULL DEFAULT false,
    "track_timeouts" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GuildModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModeration" (
    "id" BIGINT NOT NULL,
    "channel_id" BIGINT,
    "track_native" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GuildAutoModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationAttachments" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationCapitals" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "minimum" INTEGER NOT NULL,
    "maximum" INTEGER NOT NULL,
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationCapitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationLinks" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "allowed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationNewlines" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "maximum" INTEGER NOT NULL,
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationNewlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationInvites" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "allowed_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowed_guilds" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationInvites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationWords" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "words" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationWords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationNoMentionSpam" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "alerts" BOOLEAN NOT NULL DEFAULT false,
    "mentions_allowed" INTEGER NOT NULL,
    "time_period" INTEGER NOT NULL,
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationNoMentionSpam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationMentions" (
    "id" BIGINT NOT NULL,
    "enabled" BOOLEAN,
    "soft_action" INTEGER NOT NULL,
    "hard_action" "GuildAutoModerationHardAction" NOT NULL,
    "hard_action_duration" INTEGER,
    "threshold_maximum" INTEGER NOT NULL,
    "threshold_duration" INTEGER NOT NULL,
    "ignored_roles" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignored_channels" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildAutoModerationMentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildAutoModerationMentionsOverrides" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT NOT NULL,
    "roles" BIGINT[],
    "users" BIGINT[],
    "points" INTEGER NOT NULL,

    CONSTRAINT "GuildAutoModerationMentionsOverrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildLogs" (
    "id" BIGINT NOT NULL,
    "member_add" BIGINT,
    "member_remove" BIGINT,
    "member_nickname_update" BIGINT,
    "member_username_update" BIGINT,
    "message_delete" BIGINT,
    "message_delete_nsfw" BIGINT,
    "message_update" BIGINT,
    "message_update_nsfw" BIGINT,
    "prune" BIGINT,
    "reaction" BIGINT,
    "role_create" BIGINT,
    "role_update" BIGINT,
    "role_delete" BIGINT,
    "channel_create" BIGINT,
    "channel_update" BIGINT,
    "channel_delete" BIGINT,
    "emoji_create" BIGINT,
    "emoji_update" BIGINT,
    "emoji_delete" BIGINT,
    "emoji_add" BIGINT,
    "emoji_add_include_twemoji" BOOLEAN NOT NULL DEFAULT false,
    "server_update" BIGINT,
    "command" BIGINT,
    "settings" BIGINT,
    "ignore_all" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignore_messages" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "ignore_reactions" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "GuildLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuildRoles" (
    "id" BIGINT NOT NULL,
    "initial" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "initial_humans" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "initial_robots" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "admin" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "moderator" BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    "muted" BIGINT,
    "restricted_reaction" BIGINT,
    "restricted_embed" BIGINT,
    "restricted_emoji" BIGINT,
    "restricted_attachment" BIGINT,
    "restricted_voice" BIGINT,

    CONSTRAINT "GuildRoles_pkey" PRIMARY KEY ("id")
);

-- The bot's V7 GuildRoles only carries the initial roles, so add the ones the
-- dashboard configures when this runs against a database it already created.
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "admin" BIGINT[] DEFAULT ARRAY[]::BIGINT[];
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "moderator" BIGINT[] DEFAULT ARRAY[]::BIGINT[];
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "muted" BIGINT;
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "restricted_reaction" BIGINT;
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "restricted_embed" BIGINT;
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "restricted_emoji" BIGINT;
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "restricted_attachment" BIGINT;
ALTER TABLE "GuildRoles" ADD COLUMN IF NOT EXISTS "restricted_voice" BIGINT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "StickyRole" (
    "user_id" BIGINT NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "role_ids" BIGINT[],

    CONSTRAINT "StickyRole_pkey" PRIMARY KEY ("user_id","guild_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ModerationAction" (
    "id" INTEGER NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "action" "ModerationActionType" NOT NULL,
    "metadata" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "target_id" BIGINT NOT NULL,
    "moderator_id" BIGINT NOT NULL,
    "reference_id" INTEGER,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id","guild_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" BIGINT NOT NULL,
    "report" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditEvent" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" BIGINT NOT NULL,
    "actor_name" TEXT,
    "target_type" TEXT,
    "target_id" BIGINT,
    "outcome" TEXT NOT NULL,
    "tenant_id" BIGINT,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "changes" JSONB,
    "context" JSONB,
    "prev_hash" TEXT,
    "hash" TEXT NOT NULL,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditChainHead" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "hash" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditChainHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CommandLog" (
    "id" TEXT NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "command_name" TEXT NOT NULL,
    "command_type" TEXT NOT NULL,
    "command_id" BIGINT,
    "subcommand" TEXT,
    "channel_id" BIGINT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_reason" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL,
    "latency_ms" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "CommandLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AuditEvent_hash_key" ON "AuditEvent"("hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditEvent_action_timestamp_idx" ON "AuditEvent"("action", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditEvent_actor_id_timestamp_idx" ON "AuditEvent"("actor_id", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditEvent_tenant_id_timestamp_idx" ON "AuditEvent"("tenant_id", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommandLog_guild_id_executed_at_idx" ON "CommandLog"("guild_id", "executed_at" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommandLog_guild_id_user_id_executed_at_idx" ON "CommandLog"("guild_id", "user_id", "executed_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommandLog_guild_id_command_name_executed_at_idx" ON "CommandLog"("guild_id", "command_name", "executed_at");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Modules_id_fkey') THEN
        ALTER TABLE "Modules" ADD CONSTRAINT "Modules_id_fkey" FOREIGN KEY ("id") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildCommands_id_fkey') THEN
        ALTER TABLE "GuildCommands" ADD CONSTRAINT "GuildCommands_id_fkey" FOREIGN KEY ("id") REFERENCES "Modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildPermissions_id_fkey') THEN
        ALTER TABLE "GuildPermissions" ADD CONSTRAINT "GuildPermissions_id_fkey" FOREIGN KEY ("id") REFERENCES "Modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildModeration_id_fkey') THEN
        ALTER TABLE "GuildModeration" ADD CONSTRAINT "GuildModeration_id_fkey" FOREIGN KEY ("id") REFERENCES "Modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModeration_id_fkey') THEN
        ALTER TABLE "GuildAutoModeration" ADD CONSTRAINT "GuildAutoModeration_id_fkey" FOREIGN KEY ("id") REFERENCES "Modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationAttachments_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationAttachments" ADD CONSTRAINT "GuildAutoModerationAttachments_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationCapitals_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationCapitals" ADD CONSTRAINT "GuildAutoModerationCapitals_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationLinks_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationLinks" ADD CONSTRAINT "GuildAutoModerationLinks_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationNewlines_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationNewlines" ADD CONSTRAINT "GuildAutoModerationNewlines_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationInvites_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationInvites" ADD CONSTRAINT "GuildAutoModerationInvites_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationWords_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationWords" ADD CONSTRAINT "GuildAutoModerationWords_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationNoMentionSpam_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationNoMentionSpam" ADD CONSTRAINT "GuildAutoModerationNoMentionSpam_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationMentions_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationMentions" ADD CONSTRAINT "GuildAutoModerationMentions_id_fkey" FOREIGN KEY ("id") REFERENCES "GuildAutoModeration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildAutoModerationMentionsOverrides_parent_id_fkey') THEN
        ALTER TABLE "GuildAutoModerationMentionsOverrides" ADD CONSTRAINT "GuildAutoModerationMentionsOverrides_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "GuildAutoModerationMentions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildLogs_id_fkey') THEN
        ALTER TABLE "GuildLogs" ADD CONSTRAINT "GuildLogs_id_fkey" FOREIGN KEY ("id") REFERENCES "Modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GuildRoles_id_fkey') THEN
        ALTER TABLE "GuildRoles" ADD CONSTRAINT "GuildRoles_id_fkey" FOREIGN KEY ("id") REFERENCES "Modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StickyRole_guild_id_fkey') THEN
        ALTER TABLE "StickyRole" ADD CONSTRAINT "StickyRole_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ModerationAction_guild_id_fkey') THEN
        ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- ArchiveLegacyTables
-- Each rename only runs when the V6 table is still present and has not been
-- archived yet, so re-running the migration (or running it against a database
-- the bot already migrated) changes nothing.
DO $$
DECLARE
    legacy TEXT;
BEGIN
    FOREACH legacy IN ARRAY ARRAY['guilds', 'moderation', 'schedule', 'migrations', 'audit_event', 'audit_chain_head', 'command_log']
    LOOP
        IF to_regclass(format('public.%I', legacy)) IS NOT NULL
            AND to_regclass(format('public.%I', legacy || '_v6')) IS NULL
        THEN
            EXECUTE format('ALTER TABLE %I RENAME TO %I', legacy, legacy || '_v6');
        END IF;
    END LOOP;

    -- The V6 "user" table is lower-case; V7 adds a separate quoted "User".
    IF to_regclass('public.user') IS NOT NULL AND to_regclass('public.user_v6') IS NULL THEN
        EXECUTE 'ALTER TABLE "user" RENAME TO user_v6';
    END IF;
END $$;
