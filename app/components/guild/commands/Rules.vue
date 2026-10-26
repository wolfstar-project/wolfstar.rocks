<template>
	<section class="console-card" :aria-labelledby="headingId">
		<h2 :id="headingId" class="text-xl font-bold tracking-[0.01em]">
			{{ ts("guild_settings.command_rules.title") }}
		</h2>
		<p class="mt-1 mb-4 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.command_rules.subtitle") }}
		</p>

		<p v-if="rows.length === 0" class="text-[0.8125rem] text-muted">
			{{ ts("guild_settings.command_rules.empty") }}
		</p>

		<ul v-else class="divide-y divide-(--home-border-subtle)">
			<li v-for="row in rows" :key="row.command" class="py-3">
				<p class="font-mono text-sm font-semibold">/{{ row.name }}</p>
				<dl
					class="mt-1.5 grid gap-x-4 gap-y-1 text-[0.8125rem] sm:grid-cols-[max-content_1fr]"
				>
					<template v-for="list in row.lists" :key="list.key">
						<dt class="text-muted">{{ list.label }}</dt>
						<dd>{{ list.values.join(", ") }}</dd>
					</template>
				</dl>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import type { FlattenedCommand } from "#shared/types/discord";
import { readCommandRules, type CommandRule } from "#shared/utils/command-rules";
import { resolveGuildMembers } from "~/composables/useGuildMemberSearch";

const { commands } = defineProps<{ commands: FlattenedCommand[] }>();

const { ts } = useI18n();
const headingId = useId();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();

type RuleList = Exclude<keyof CommandRule, "command">;

const LIST_LABELS: Record<RuleList, string> = {
	allowedChannels: "guild_settings.command_rules.allowed_channels",
	ignoredChannels: "guild_settings.command_rules.ignored_channels",
	allowedRoles: "guild_settings.command_rules.allowed_roles",
	ignoredRoles: "guild_settings.command_rules.ignored_roles",
	allowedUsers: "guild_settings.command_rules.allowed_users",
	ignoredUsers: "guild_settings.command_rules.ignored_users",
};

const rules = computed(() => readCommandRules(guildSettings.value?.commandsRestrictions));

// Members are named once their ids resolve; until then, and for those who left, by id.
const memberNames = ref(new Map<string, string>());
watch(
	[() => activeGuildId.value, rules],
	async ([guildId, current]) => {
		const ids = [
			...new Set(current.flatMap((rule) => [...rule.allowedUsers, ...rule.ignoredUsers])),
		];
		if (!guildId || ids.length === 0) return;
		const members = await resolveGuildMembers(guildId, ids).catch(() => []);
		memberNames.value = new Map(
			members.map((member) => [member.id, member.user.globalName ?? member.user.username]),
		);
	},
	{ immediate: true },
);

function nameOf(list: RuleList, id: string): string {
	if (list === "allowedChannels" || list === "ignoredChannels") {
		const name = guildData.value?.channels.find((channel) => channel.id === id)?.name;
		return name ? `#${name}` : id;
	}
	if (list === "allowedRoles" || list === "ignoredRoles") {
		return guildData.value?.roles.find((role) => role.id === id)?.name ?? id;
	}
	return memberNames.value.get(id) ?? id;
}

// The bot rules a command by its piece name; the dashboard shows the name
// Discord shows, the first word of the bot's entry for it.
function discordName(command: string): string {
	const entry = commands.find((candidate) => (candidate.command ?? candidate.name) === command);
	return entry?.name.split(" ")[0] ?? command;
}

const rows = computed(() =>
	rules.value
		.map((rule) => ({
			command: rule.command,
			name: discordName(rule.command),
			lists: (Object.keys(LIST_LABELS) as RuleList[])
				.filter((list) => rule[list].length > 0)
				.map((list) => ({
					key: list,
					label: ts(LIST_LABELS[list]),
					values: rule[list].map((id) => nameOf(list, id)),
				})),
		}))
		.toSorted((a, b) => a.name.localeCompare(b.name)),
);
</script>
