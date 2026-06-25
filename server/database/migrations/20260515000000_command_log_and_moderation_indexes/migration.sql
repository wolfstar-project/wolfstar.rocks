-- append-only: do NOT modify prior migrations

-- CommandLog: new table for bot-emitted command execution records.
-- Hash-chain is NOT used here; CommandLog is independent of AuditEvent.
CREATE TABLE "command_log" (
    "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
    "guild_id"     VARCHAR(19)   NOT NULL,
    "user_id"      VARCHAR(19)   NOT NULL,
    "user_tag"     VARCHAR(37),
    "command_name" VARCHAR(64)   NOT NULL,
    "subcommand"   VARCHAR(64),
    "channel_id"   VARCHAR(19),
    "success"      BOOLEAN       NOT NULL DEFAULT TRUE,
    "error_reason" VARCHAR(2000),
    "executed_at"  TIMESTAMP(6)  NOT NULL,
    "latency_ms"   INTEGER,
    "metadata"     JSON,
    CONSTRAINT "command_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "command_log_guild_id_executed_at_idx"
    ON "command_log" ("guild_id", "executed_at" DESC);

CREATE INDEX "command_log_guild_id_user_id_executed_at_idx"
    ON "command_log" ("guild_id", "user_id", "executed_at");

CREATE INDEX "command_log_guild_id_command_name_executed_at_idx"
    ON "command_log" ("guild_id", "command_name", "executed_at");

-- Partial indexes on Moderation for filtered pagination queries.
-- Partial (WHERE createdAt IS NOT NULL) because createdAt is nullable on this table.
CREATE INDEX IF NOT EXISTS "moderation_guild_id_created_at_idx"
    ON "moderation" ("guild_id", "created_at" DESC) WHERE "created_at" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "moderation_guild_id_user_id_created_at_idx"
    ON "moderation" ("guild_id", "user_id", "created_at") WHERE "created_at" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "moderation_guild_id_moderator_id_created_at_idx"
    ON "moderation" ("guild_id", "moderator_id", "created_at") WHERE "created_at" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "moderation_guild_id_type_created_at_idx"
    ON "moderation" ("guild_id", "type", "created_at") WHERE "created_at" IS NOT NULL;
