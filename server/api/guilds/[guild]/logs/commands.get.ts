import { CommandLogData } from "#server/database";
import prisma from "#server/database/prisma";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { CommandLogQuerySchema } from "#shared/schemas";
import { useLogger } from "evlog";
import { parse } from "valibot";

export default defineWrappedCachedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);
		if (!guild) throw createError({ status: 404, message: "Guild not found" });

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const { limit, offset, userId, commandName, success, from, to, q } =
			await getValidatedQuery(event, (body) => parse(CommandLogQuerySchema, body));

		const where = {
			guildId,
			...(userId && { userId }),
			...(commandName && { commandName }),
			...(success !== "all" && { success: success === "success" }),
			...(from || to
				? {
						executedAt: {
							...(from && { gte: new Date(from) }),
							...(to && { lte: new Date(to) }),
						},
					}
				: {}),
			...(q && {
				OR: [
					{ commandName: { contains: q, mode: "insensitive" as const } },
					{ errorReason: { contains: q, mode: "insensitive" as const } },
				],
			}),
		};

		const [rows, total] = await Promise.all([
			prisma.commandLog.findMany({
				where,
				orderBy: { executedAt: "desc" },
				take: limit,
				skip: offset,
			}),
			prisma.commandLog.count({ where }),
		]);

		const memberMap = await resolveGuildMembers(guildId, [
			...new Set(rows.map((r) => r.userId)),
		]);

		const entries: CommandLogData[] = rows.map((row) => {
			const member = memberMap.get(row.userId) ?? fallbackMember(row.userId);
			return {
				id: row.id,
				guildId: row.guildId,
				userId: row.userId,
				metadata: { member },
				commandName: row.commandName,
				subcommand: row.subcommand ?? null,
				channelId: row.channelId ?? null,
				success: row.success,
				errorReason: row.errorReason ?? null,
				executedAt: row.executedAt,
				latencyMs: row.latencyMs ?? null,
			};
		});

		return { entries, total };
	},
	{
		auth: true,
		maxAge: 30,
		swr: false,
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
