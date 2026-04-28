-- Audit trail: replace legacy audit_log with tamper-evident audit_event + chain head
-- append-only: do NOT modify prior migrations

CREATE TABLE "audit_event" (
    "hash"               VARCHAR(64)   NOT NULL,
    "prev_hash"          VARCHAR(64),
    "tenant_id"          VARCHAR(19)   NOT NULL,
    "actor_id"           VARCHAR(19)   NOT NULL,
    "actor_display_name" VARCHAR(64),
    "action"             VARCHAR(64)   NOT NULL,
    "outcome"            VARCHAR(16)   NOT NULL,
    "reason"             VARCHAR(2000),
    "changes"            JSON,
    "timestamp"          TIMESTAMP(6)  NOT NULL,
    "request_id"         VARCHAR(64),
    "trace_id"           VARCHAR(64),
    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("hash")
);

CREATE INDEX "audit_event_action_timestamp_idx" ON "audit_event"("action", "timestamp");
CREATE INDEX "audit_event_actor_id_timestamp_idx" ON "audit_event"("actor_id", "timestamp");
CREATE INDEX "audit_event_tenant_id_timestamp_idx" ON "audit_event"("tenant_id", "timestamp");

CREATE TABLE "audit_chain_head" (
    "tenant_id"     VARCHAR(19)   NOT NULL,
    "last_hash"     VARCHAR(64)   NOT NULL,
    "last_sequence" BIGINT        NOT NULL DEFAULT 0,
    "updated_at"    TIMESTAMP(6)  NOT NULL,
    CONSTRAINT "audit_chain_head_pkey" PRIMARY KEY ("tenant_id")
);

-- Remove legacy audit_log table if it still exists (idempotent cleanup)
DROP TABLE IF EXISTS "audit_log" CASCADE;
