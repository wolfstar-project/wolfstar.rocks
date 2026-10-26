import type { DashboardAuditAction } from "#shared/types/audit-log";
import { defineAuditAction } from "evlog";

const ACTION_NAMES = {
	guildSettingsUpdate: "guild.settings.update",
	guildSettingsAccessDenied: "guild.settings.access-denied",
	userSettingsUpdate: "user.settings.update",
	userLogin: "user.login",
	userLogout: "user.logout",
	sessionRefresh: "session.refresh",
	oauthStateInvalid: "oauth.state.invalid",
	commandExecuted: "command.executed",
	guildAccessLegacyRemoved: "guild.access.legacy-removed",
	guildCommandPermissionsUpdate: "guild.command-permissions.update",
	guildCommandPermissionsAccessDenied: "guild.command-permissions.access-denied",
} as const satisfies Record<string, string>;

export type AuditActionName = (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES];

export const DASHBOARD_AUDIT_ACTIONS: readonly DashboardAuditAction[] = [
	"guild.settings.update",
	"guild.settings.access-denied",
	"guild.access.legacy-removed",
	"guild.command-permissions.update",
	"guild.command-permissions.access-denied",
] as const;

export const guildSettingsUpdate = defineAuditAction(ACTION_NAMES.guildSettingsUpdate);
export const guildSettingsAccessDenied = defineAuditAction(ACTION_NAMES.guildSettingsAccessDenied);
export const userSettingsUpdate = defineAuditAction(ACTION_NAMES.userSettingsUpdate);
export const userLogin = defineAuditAction(ACTION_NAMES.userLogin);
export const userLogout = defineAuditAction(ACTION_NAMES.userLogout);
export const sessionRefresh = defineAuditAction(ACTION_NAMES.sessionRefresh);
export const oauthStateInvalid = defineAuditAction(ACTION_NAMES.oauthStateInvalid);
export const guildAccessLegacyRemoved = defineAuditAction(ACTION_NAMES.guildAccessLegacyRemoved);
export const guildCommandPermissionsUpdate = defineAuditAction(
	ACTION_NAMES.guildCommandPermissionsUpdate,
);
export const guildCommandPermissionsAccessDenied = defineAuditAction(
	ACTION_NAMES.guildCommandPermissionsAccessDenied,
);
