import type { AppealForm } from "#shared/utils/appeal-forms";
import type {
	MyAppealCase,
	MyAppealEntry,
	MyAppealGuild,
	MyAppealsResponse,
} from "#shared/utils/my-appeals";
import type { Snowflake } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import {
	fetchMemberAppeals,
	fetchMemberBlocks,
	fetchMemberCases,
	type MemberAppeal,
	type MemberCase,
} from "#server/database/settings/appeals/member";
import { fetchAppealForms } from "#server/database/settings/appeals/storage";
import { readSettings } from "#server/database/settings/functions";
import { mapWithConcurrency } from "#server/utils/mapWithConcurrency";
import {
	cooldownEnd,
	decideCaseOpening,
	findCasesInCourse,
	type EligibleAppeal,
} from "#server/utils/my-appeals/eligibility";
import { useApi } from "#server/utils/shared";

/** The most servers the list reads: Discord lets a member be in 200. */
export const MaximumMyAppealGuilds = 200;

/** How many servers are read at once, for their settings, forms and the member's roles. */
const GUILD_CONCURRENCY = 5;

function toMillis(iso: string | null): number | null {
	return iso === null ? null : new Date(iso).getTime();
}

function toEligibleAppeal(appeal: MemberAppeal): EligibleAppeal {
	return {
		caseId: appeal.caseId,
		status: appeal.status,
		createdAt: toMillis(appeal.createdAt) ?? 0,
		decidedAt: toMillis(appeal.decidedAt),
	};
}

/**
 * The roles of the member in a server, `null` when they are not a member (a
 * banned one is not). Only asked for when a form names roles; a failure reads
 * as no member, and the bot checks again when the appeal is sent.
 */
async function readMemberRoles(guildId: Snowflake, userId: Snowflake): Promise<Snowflake[] | null> {
	try {
		return (await useApi().guilds.getMember(guildId, userId)).roles;
	} catch {
		return null;
	}
}

/** What a server says about the member's appeals: its settings, forms and the member's roles. */
async function readGuildContext(guildId: Snowflake, userId: Snowflake) {
	const [settings, forms] = await Promise.all([
		readSettings(guildId),
		fetchAppealForms(db.orm, guildId),
	]);
	const namesRoles = forms.some(
		(form) => form.requiredRoles.length > 0 || form.restrictedRoles.length > 0,
	);
	const roles = namesRoles ? await readMemberRoles(guildId, userId) : [];
	return { settings, forms, roles };
}

function caseState(entry: MemberCase, appeal: MemberAppeal | undefined): MyAppealCase["state"] {
	if (!entry.completed) return "active";
	return appeal?.status === "accepted" ? "lifted" : "ended";
}

function toCase(entry: MemberCase, appeal: MemberAppeal | undefined): MyAppealCase {
	return {
		id: entry.id,
		type: entry.type,
		reason: entry.reason,
		createdAt: entry.createdAt,
		duration: entry.duration,
		state: caseState(entry, appeal),
	};
}

interface GuildEntriesInput {
	guild: MyAppealGuild;
	cases: readonly MemberCase[];
	appeals: readonly MemberAppeal[];
	block: { reason: string | null } | null;
	context: Awaited<ReturnType<typeof readGuildContext>>;
	formNames: ReadonlyMap<string, string>;
	now: number;
}

/**
 * The entries of one server: its cases still in course and its cases with an
 * appeal, each with where it stands.
 */
function guildEntries(input: GuildEntriesInput): MyAppealEntry[] {
	const { guild, cases, appeals, block, context, now } = input;
	const eligibleAppeals = appeals.map((appeal) => toEligibleAppeal(appeal));
	const byCase = new Map(appeals.map((appeal) => [appeal.caseId, appeal]));
	const listed = new Set([
		...findCasesInCourse(cases).map((entry) => entry.id),
		...byCase.keys(),
	]);
	const again = cooldownEnd(eligibleAppeals, context.settings);

	return cases.flatMap((entry): MyAppealEntry[] => {
		if (!listed.has(entry.id) || entry.undo) return [];
		const appeal = byCase.get(entry.id);
		const base = { key: `${guild.id}:${entry.id}`, guild, case: toCase(entry, appeal) };

		if (appeal) {
			return [
				{
					...base,
					status: appeal.status,
					appeal: {
						formName:
							appeal.formId === null
								? null
								: (input.formNames.get(appeal.formId) ?? null),
						answers: appeal.answers,
						createdAt: appeal.createdAt,
						decidedAt: appeal.decidedAt,
						reason: appeal.reason,
					},
					againAt:
						appeal.status === "denied" && again !== null && again > now
							? new Date(again).toISOString()
							: null,
					closed: null,
				},
			];
		}

		const opening = decideCaseOpening({
			entry,
			settings: context.settings,
			block,
			forms: context.forms,
			roles: context.roles,
			cases,
			appeals: eligibleAppeals,
			now,
		});
		return [
			opening.status === "open"
				? { ...base, status: "open", appeal: null, againAt: null, closed: null }
				: {
						...base,
						status: "closed",
						appeal: null,
						againAt:
							opening.againAt === null
								? null
								: new Date(opening.againAt).toISOString(),
						closed: { reason: opening.reason, detail: opening.detail },
					},
		];
	});
}

function groupByGuild<T extends { guildId: Snowflake }>(items: readonly T[]): Map<Snowflake, T[]> {
	const groups = new Map<Snowflake, T[]>();
	for (const item of items) groups.set(item.guildId, [...(groups.get(item.guildId) ?? []), item]);
	return groups;
}

/**
 * The cases of a member in some servers that the member can appeal, waits on,
 * had decided, or cannot appeal, read from the database the dashboard shares
 * with the bot, newest first. The bot is not asked: its API takes five
 * requests in five seconds from a member, and a member is in many servers.
 *
 * @param input.guilds The servers to read, the member's own and the one of the
 * link they came with; past {@linkcode MaximumMyAppealGuilds} the rest is left out.
 */
export async function readMyAppeals(input: {
	userId: Snowflake;
	guilds: readonly MyAppealGuild[];
	now?: number;
}): Promise<MyAppealsResponse> {
	const { userId, now = Date.now() } = input;
	const guilds = [...new Map(input.guilds.map((guild) => [guild.id, guild])).values()].slice(
		0,
		MaximumMyAppealGuilds,
	);
	const ids = guilds.map((guild) => guild.id);
	const [cases, appeals, blocks] = await Promise.all([
		fetchMemberCases(db.orm, ids, userId),
		fetchMemberAppeals(db.orm, ids, userId),
		fetchMemberBlocks(db.orm, ids, userId),
	]);

	const casesByGuild = groupByGuild(cases);
	const appealsByGuild = groupByGuild(appeals);
	const involved = guilds.filter(
		(guild) => casesByGuild.has(guild.id) || appealsByGuild.has(guild.id),
	);

	const perGuild = await mapWithConcurrency(involved, GUILD_CONCURRENCY, async (guild) => {
		const context = await readGuildContext(guild.id, userId);
		const formNames = new Map(context.forms.map((form: AppealForm) => [form.id, form.name]));
		return guildEntries({
			guild,
			cases: casesByGuild.get(guild.id) ?? [],
			appeals: appealsByGuild.get(guild.id) ?? [],
			block: blocks.get(guild.id) ?? null,
			context,
			formNames,
			now,
		});
	});

	const entries = perGuild
		.flat()
		.toSorted(
			(a, b) => new Date(b.case.createdAt).getTime() - new Date(a.case.createdAt).getTime(),
		);
	return { entries, openCount: entries.filter((entry) => entry.status === "open").length };
}
