import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { AuditFieldType } from "#shared/utils/audit-field-metadata";
import type { APIGuildMember } from "discord-api-types/v10";
import { getAuditFieldMetadata } from "#shared/utils/audit-field-metadata";

interface AuditChangeResolver {
	roles: Map<string, { name: string }>;
	channels: Map<string, { name: string }>;
}

interface AuditChangeLine {
	key: string;
	label: string;
	type: AuditFieldType;
	kind: "added" | "removed" | "changed";
	fromText: string | null;
	toText: string | null;
}

const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;
const MS_MINUTE = 60_000;
const MS_SECOND = 1_000;

function formatDurationMs(ms: number): string {
	if (ms <= 0) return "0s";
	const days = Math.floor(ms / MS_DAY);
	const hours = Math.floor((ms % MS_DAY) / MS_HOUR);
	const minutes = Math.floor((ms % MS_HOUR) / MS_MINUTE);
	const seconds = Math.floor((ms % MS_MINUTE) / MS_SECOND);
	const parts = (
		[
			[days, "d"],
			[hours, "h"],
			[minutes, "m"],
			[seconds, "s"],
		] as [number, string][]
	)
		.filter(([n]) => n > 0)
		.slice(0, 2)
		.map(([n, unit]) => `${n}${unit}`);
	return parts.join(" ");
}

function formatScalar(value: unknown, type: AuditFieldType, resolver: AuditChangeResolver): string {
	if (value === null || value === undefined) return "Default";
	switch (type) {
		case "role": {
			const id = String(value);
			const name = resolver.roles.get(id)?.name;
			return name ? `@${name}` : `Unknown Role (${id.slice(0, 8)}...${id.slice(-4)})`;
		}
		case "channel": {
			const id = String(value);
			const name = resolver.channels.get(id)?.name;
			return name ? `#${name}` : `Unknown Channel (${id.slice(0, 8)}...)`;
		}
		case "boolean":
			return value ? "Enabled" : "Disabled";
		case "timespan-ms":
			return formatDurationMs(Number(value));
		case "language":
			return String(value);
		case "command-name":
			return `\`${String(value)}\``;
		case "string": {
			const str = String(value);
			return str.length > 60 ? `"${str.slice(0, 60)}..."` : `"${str}"`;
		}
		case "integer":
			return String(Math.round(Number(value)));
		default:
			return String(value);
	}
}

function formatTypedValue(
	value: unknown,
	type: AuditFieldType,
	array: boolean,
	resolver: AuditChangeResolver,
): string {
	if (value === null || value === undefined) return "Default";
	if (!array) return formatScalar(value, type, resolver);

	const items: unknown[] = Array.isArray(value) ? value : [value];
	const formatted = items.map((item) => formatScalar(item, type, resolver));

	const MAX_LEN = 80;
	let result = "";
	let shown = 0;
	for (const part of formatted) {
		const candidate = result.length === 0 ? part : `${result}, ${part}`;
		if (candidate.length > MAX_LEN && shown > 0) break;
		result = candidate;
		shown++;
	}

	const extra = formatted.length - shown;
	return extra > 0 ? `${result} (+${extra} more)` : result;
}

export function auditLogMemberName(member: APIGuildMember): string {
	return member.user?.global_name ?? member.user?.username ?? member.nick ?? "Unknown User";
}

export function auditLogMemberAvatar(member: APIGuildMember) {
	return {
		alt: `${auditLogMemberName(member)}'s avatar`,
		src: member.user ? avatarURL(member.user, { size: 64 }) : undefined,
	};
}

function auditLogChangeLines(
	entry: DashboardAuditEntry,
	resolver: AuditChangeResolver,
): AuditChangeLine[] {
	const { added = {}, removed = {}, changed = {} } = entry.changes ?? {};
	const lines: AuditChangeLine[] = [];

	for (const key of Object.keys(changed)) {
		const change = changed[key];
		if (!change) continue;
		const { label, type, array } = getAuditFieldMetadata(key);
		lines.push({
			key,
			label,
			type,
			kind: "changed",
			fromText: formatTypedValue(change.from, type, array, resolver),
			toText: formatTypedValue(change.to, type, array, resolver),
		});
	}

	for (const key of Object.keys(added)) {
		const { label, type, array } = getAuditFieldMetadata(key);
		lines.push({
			key,
			label,
			type,
			kind: "added",
			fromText: null,
			toText: formatTypedValue(added[key], type, array, resolver),
		});
	}

	for (const key of Object.keys(removed)) {
		const { label, type, array } = getAuditFieldMetadata(key);
		lines.push({
			key,
			label,
			type,
			kind: "removed",
			fromText: formatTypedValue(removed[key], type, array, resolver),
			toText: null,
		});
	}

	return lines;
}

export function auditLogActionDescription(
	entry: DashboardAuditEntry,
	resolver?: AuditChangeResolver,
): string {
	const resolvedResolver = resolver ?? { roles: new Map(), channels: new Map() };
	const lines = auditLogChangeLines(entry, resolvedResolver);

	if (lines.length === 0) return "Settings updated";

	const descriptions = lines.map((line) => {
		if (line.kind === "changed") return `${line.label}: ${line.fromText} \u2192 ${line.toText}`;
		if (line.kind === "added") return `${line.label} added: ${line.toText}`;
		return `${line.label} removed`;
	});

	const MAX = 2;
	const shown = descriptions.slice(0, MAX);
	const extra = descriptions.length - MAX;
	return extra > 0 ? `${shown.join("; ")} (+${extra} more)` : shown.join("; ");
}
