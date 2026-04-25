import { defineAuditAction } from "evlog";

export const guildSettingsUpdate = defineAuditAction("guild.settings.update");
export const guildSettingsAccessDenied = defineAuditAction("guild.settings.access-denied");
export const userLogin = defineAuditAction("user.login");
export const userLogout = defineAuditAction("user.logout");
export const sessionRefresh = defineAuditAction("session.refresh");
export const oauthStateInvalid = defineAuditAction("oauth.state.invalid");

export type AuditActionName =
	| "guild.settings.update"
	| "guild.settings.access-denied"
	| "user.login"
	| "user.logout"
	| "session.refresh"
	| "oauth.state.invalid";
