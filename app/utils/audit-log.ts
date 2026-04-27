import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { APIGuildMember } from "discord-api-types/v10";

export function auditLogMemberName(member: APIGuildMember): string {
	return member.user?.global_name ?? member.user?.username ?? member.nick ?? "Unknown User";
}

export function auditLogMemberAvatar(member: APIGuildMember) {
	return {
		alt: `${auditLogMemberName(member)}'s avatar`,
		src: member.user ? avatarURL(member.user, { size: 64 }) : undefined,
	};
}

function formatChangeValue(value: unknown): string {
	if (value === null || value === undefined) return "none";
	if (typeof value === "boolean") return value ? "enabled" : "disabled";
	if (typeof value === "string") return value.length > 30 ? `${value.slice(0, 30)}...` : value;
	return String(value);
}

export function auditLogActionDescription(entry: DashboardAuditEntry): string {
	const { added = {}, removed = {}, changed = {} } = entry.changes ?? {};
	const addedKeys = Object.keys(added);
	const removedKeys = Object.keys(removed);
	const changedKeys = Object.keys(changed);
	const totalCount = addedKeys.length + removedKeys.length + changedKeys.length;

	if (totalCount === 0) return "Settings updated";

	if (totalCount === 1) {
		const addedKey = addedKeys[0];
		const removedKey = removedKeys[0];
		const changedKey = changedKeys[0];
		if (addedKey) return `${addedKey} was added: ${formatChangeValue(added[addedKey])}`;
		if (removedKey) return `${removedKey} was removed`;
		if (changedKey) {
			const change = changed[changedKey];
			if (change)
				return `${changedKey} was updated from ${formatChangeValue(change.from)} to ${formatChangeValue(change.to)}`;
		}
	}

	const allKeys = [...addedKeys, ...removedKeys, ...changedKeys];
	return `Updated ${allKeys.join(", ")}`;
}
