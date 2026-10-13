import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { AuditFieldType } from "#shared/utils/audit-field-metadata";
import type { APIGuildMember } from "discord-api-types/v10";
import { getAuditFieldMetadata } from "#shared/utils/audit-field-metadata";

export interface AuditChangeResolver {
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

/**
 * Avatar props for a member shown next to their name.
 *
 * The name is always printed beside the picture, so the image is decorative
 * and carries no `alt`. That also keeps `UAvatar` from spelling a fallback out
 * of it: a log row stores the member as they were, and once their avatar has
 * changed the stored one no longer loads. The Discord mark stands in then, as
 * it does for a row with no member at all.
 */
export function auditLogMemberAvatar(member?: APIGuildMember | null) {
	return {
		alt: "",
		icon: "ic:round-discord",
		src: member?.user ? avatarURL(member.user, { size: 64 }) : undefined,
	};
}

export function auditLogChangeLines(
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

/** One run of an action sentence; `strong` marks what changed and its values. */
export interface AuditActionPart {
	text: string;
	strong: boolean;
}

const MAXIMUM_DESCRIBED_CHANGES = 2;

/**
 * The sentence describing an entry, split so the activity table can set the
 * setting and its values apart from the words around them.
 */
export function auditLogActionParts(
	entry: DashboardAuditEntry,
	resolver?: AuditChangeResolver,
): AuditActionPart[] {
	const resolvedResolver = resolver ?? { roles: new Map(), channels: new Map() };
	const lines = auditLogChangeLines(entry, resolvedResolver);

	if (lines.length === 0) return [{ strong: false, text: "Settings updated" }];

	const plain = (text: string): AuditActionPart => ({ strong: false, text });
	const strong = (text: string | null): AuditActionPart => ({ strong: true, text: text ?? "" });

	const parts: AuditActionPart[] = [];
	for (const [index, line] of lines.slice(0, MAXIMUM_DESCRIBED_CHANGES).entries()) {
		if (index > 0) parts.push(plain("; "));
		parts.push(strong(line.label));
		if (line.kind === "changed") {
			parts.push(plain(": "), strong(line.fromText), plain(" \u2192 "), strong(line.toText));
		} else if (line.kind === "added") {
			parts.push(plain(" added: "), strong(line.toText));
		} else {
			parts.push(plain(" removed"));
		}
	}

	const extra = lines.length - MAXIMUM_DESCRIBED_CHANGES;
	if (extra > 0) parts.push(plain(` (+${extra} more)`));
	return parts;
}

export function auditLogActionDescription(
	entry: DashboardAuditEntry,
	resolver?: AuditChangeResolver,
): string {
	return auditLogActionParts(entry, resolver)
		.map((part) => part.text)
		.join("");
}

function startOfDay(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * When an entry happened, the way the activity table reads it: "Today 11:05",
 * "Yesterday 22:41", "3 days ago", then a plain date once it is a week old.
 */
export function formatActivityTime(timestamp: string | Date, now: Date, locale: string): string {
	const date = new Date(timestamp);
	// Rounded, since a daylight-saving change makes a day 23 or 25 hours long.
	const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / MS_DAY);

	if (daysAgo < 0 || daysAgo >= 7) {
		return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
	}

	const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
		-daysAgo,
		"day",
	);
	if (daysAgo > 1) return relative;

	const time = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
	return `${relative.charAt(0).toLocaleUpperCase(locale)}${relative.slice(1)} ${time}`;
}
