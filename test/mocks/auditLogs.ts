import type { CommandLogData } from "#shared/types";
import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { APIGuildMember } from "discord-api-types/v10";
import { GUILD_ID } from "~~/test/nuxt/api/_helpers";

export const MOCK_COMMAND_ENTRY: CommandLogData = {
	id: "00000000-0000-0000-0000-000000000001",
	guildId: GUILD_ID,
	userId: "111111111111111111",
	commandName: "ban",
	commandType: "CHAT_INPUT",
	commandId: null,
	subcommand: null,
	channelId: "333333333333333330",
	success: false,
	errorReason: "User not found",
	executedAt: "2026-05-15T00:00:00.000Z",
	latencyMs: 120,
	metadata: null,
};

export const MOCK_AUDIT_ENTRY: DashboardAuditEntry = {
	id: "abc123",
	guildId: GUILD_ID,
	action: "guild.settings.update",
	outcome: "success",
	member: {
		user: {
			id: "987654321098765432",
			username: "TestOwner",
			discriminator: "0",
			avatar: null,
			global_name: null,
		},
		roles: [],
		joined_at: "",
		deaf: false,
		mute: false,
		flags: 0,
	} as unknown as APIGuildMember,
	changes: { changed: { prefix: { from: "!", to: "?" } } },
	reason: null,
	timestamp: "2026-05-15T00:00:00.000Z",
};

export const MOCK_MODERATION_ENTRY: ModerationLogEntry = {
	caseId: 1,
	guildId: GUILD_ID,
	userId: "111111111111111111",
	targetMember: null,
	moderatorId: "222222222222222222",
	moderatorMember: null,
	typeCode: 1,
	typeName: "Warning",
	reason: "Spamming",
	imageURL: null,
	duration: null,
	metadata: { archived: false, completed: false, temporary: false },
	createdAt: "2026-05-15T00:00:00.000Z",
};
