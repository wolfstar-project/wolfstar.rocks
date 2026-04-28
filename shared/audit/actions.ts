import { defineAuditAction } from "evlog";

const ACTION_NAMES = {
	guildSettingsUpdate: "guild.settings.update",
	guildSettingsAccessDenied: "guild.settings.access-denied",
	userLogin: "user.login",
	userLogout: "user.logout",
	sessionRefresh: "session.refresh",
	oauthStateInvalid: "oauth.state.invalid",
} as const satisfies Record<string, string>;

export type AuditActionName = (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES];

export const guildSettingsUpdate = defineAuditAction(ACTION_NAMES.guildSettingsUpdate);
export const guildSettingsAccessDenied = defineAuditAction(ACTION_NAMES.guildSettingsAccessDenied);
export const userLogin = defineAuditAction(ACTION_NAMES.userLogin);
export const userLogout = defineAuditAction(ACTION_NAMES.userLogout);
export const sessionRefresh = defineAuditAction(ACTION_NAMES.sessionRefresh);
export const oauthStateInvalid = defineAuditAction(ACTION_NAMES.oauthStateInvalid);
