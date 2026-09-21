import type { CommandLogEntry } from "#shared/types/command-log";
import { db } from "#server/database/prisma";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { CommandLogQuerySchema } from "#shared/schemas";
import { or } from "@prisma/orm-postgres/orm-client";
import { useLogger } from "evlog";
import { parse } from "valibot";

export default defineWrappedCachedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		// Authorization runs in the `authorize` hook on every request; the
		// cached resolver only needs the guild for data assembly.
		const guild = await getGuild(guildId);
		if (!guild) throw createError({ status: 404, message: "Guild not found" });

		const { limit, offset, userId, commandName, success, from, to, q } =
			await getValidatedQuery(event, (body) => parse(CommandLogQuerySchema, body));

		// One filtered collection, reused by the page query and the count: chaining
		// returns a new collection each time, so neither terminal disturbs the other.
		let filtered = db.orm.public.CommandLog.where((row) => row.guildId.eq(BigInt(guildId)));
		if (userId) filtered = filtered.where((row) => row.userId.eq(BigInt(userId)));
		if (commandName) filtered = filtered.where((row) => row.commandName.eq(commandName));
		if (success !== "all") {
			filtered = filtered.where((row) => row.success.eq(success === "success"));
		}
		if (from) filtered = filtered.where((row) => row.executedAt.gte(asTimestampString(from)));
		if (to) filtered = filtered.where((row) => row.executedAt.lte(asTimestampString(to)));
		if (q) {
			const pattern = containsPattern(q);
			filtered = filtered.where((row) =>
				or(row.commandName.ilike(pattern), row.errorReason.ilike(pattern)),
			);
		}

		const [rows, { total }] = await Promise.all([
			filtered
				.orderBy((row) => row.executedAt.desc())
				.limit(limit)
				.offset(offset)
				.all(),
			filtered.aggregate((aggregate) => ({ total: aggregate.count() })),
		]);

		const memberMap = await resolveGuildMembers(guildId, [
			...new Set(rows.map((row) => String(row.userId))),
		]);

		const entries: CommandLogEntry[] = rows.map((row) => {
			const userId = String(row.userId);
			const member = memberMap.get(userId) ?? fallbackMember(userId);
			return {
				id: row.id,
				guildId: String(row.guildId),
				userId,
				commandName: row.commandName,
				commandType: row.commandType,
				commandId: row.commandId === null ? null : String(row.commandId),
				subcommand: row.subcommand ?? null,
				channelId: row.channelId === null ? null : String(row.channelId),
				success: row.success,
				errorReason: row.errorReason ?? null,
				executedAt: row.executedAt,
				latencyMs: row.latencyMs ?? null,
				metadata: { member },
			};
		});

		return { entries, total };
	},
	{
		auth: true,
		maxAge: 30,
		swr: false,
		authorize: async (event) => {
			const guildId = getGuildParam(event);
			const guild = await getGuild(guildId);
			if (!guild) {
				throw createError({ message: "Guild not found", status: 404 });
			}
			const member = await getCurrentMember(event, guild.id);
			useLogger(event).set({ guild: { id: guildId }, member: { id: member.user.id } });
			await canManage(guild, member);
		},
		getKey: (event) => {
			const guildId = getGuildParam(event);
			const url = getRequestURL(event);
			return `guild:${guildId}:logs:commands${url.search}`;
		},
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 30, window: seconds(60) },
	},
);
