<template>
	<ul>
		<li v-for="row in rows" :key="row.target" class="rule-row">
			<p class="flex flex-wrap items-center gap-2">
				<span class="text-sm font-bold">{{ row.name }}</span>
				<span v-if="row.onlyAllowed" class="rule-pill">
					{{ ts("guild_settings.command_rules.editor.only_allowed") }}
				</span>
			</p>
			<dl v-if="row.lists.length > 0" class="mt-1.5">
				<div
					v-for="list in row.lists"
					:key="list.key"
					class="grid gap-x-3 gap-y-0.5 py-0.75 sm:grid-cols-[8rem_minmax(0,1fr)]"
				>
					<dt class="text-xs font-semibold text-muted">{{ list.label }}</dt>
					<dd class="text-[0.8125rem] wrap-anywhere text-toned">
						{{ list.values.join(", ") }}
					</dd>
				</div>
			</dl>
		</li>
	</ul>
</template>

<script setup lang="ts">
import type { CommandRule, CommandRuleList } from "#shared/utils/command-rules";
// Named, not auto-imported: knip only follows auto-imports of the `use*` composables.
import { resolveGuildMembers } from "~/composables/useGuildMemberSearch";
/** Rules as they stand, each under its target: what the dashboard does not edit. */
const { rules } = defineProps<{ rules: readonly CommandRule[] }>();

const { ts } = useI18n();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();

const guildId = computed(() => activeGuildId.value ?? "");

// Literal keys, so the i18n report sees each.
function listLabel(list: CommandRuleList): string {
	switch (list) {
		case "allowedChannels":
			return ts("guild_settings.command_rules.allowed_channels");
		case "ignoredChannels":
			return ts("guild_settings.command_rules.ignored_channels");
		case "allowedRoles":
			return ts("guild_settings.command_rules.allowed_roles");
		case "ignoredRoles":
			return ts("guild_settings.command_rules.ignored_roles");
		case "allowedUsers":
			return ts("guild_settings.command_rules.allowed_users");
		case "ignoredUsers":
			return ts("guild_settings.command_rules.ignored_users");
	}
}

// Members are named once their ids resolve; until then, and for those who left,
// by id. The rules change with each edit of the editor around them, the ids do not.
const memberNames = ref(new Map<string, string>());
const memberIds = computed(() =>
	[...new Set(rules.flatMap((rule) => [...rule.allowedUsers, ...rule.ignoredUsers]))].join(),
);
watch(
	[guildId, memberIds],
	async ([id, joined]) => {
		if (!id || !joined) return;
		const members = await resolveGuildMembers(id, joined.split(",")).catch(() => []);
		memberNames.value = new Map(
			members.map((member) => [member.id, member.user.globalName ?? member.user.username]),
		);
	},
	{ immediate: true },
);

const roles = computed(() => new Map(guildData.value?.roles.map((role) => [role.id, role])));

// The order they decide in: the highest first, by position, then the higher id.
function highestFirst(ids: readonly string[]): string[] {
	const position = (id: string) => roles.value.get(id)?.rawPosition ?? -1;
	return ids.toSorted((a, b) => position(b) - position(a) || Number(BigInt(b) - BigInt(a)));
}

function namesOf(list: CommandRuleList, ids: readonly string[]): string[] {
	if (list === "allowedChannels" || list === "ignoredChannels") {
		return ids.map((id) => {
			const name = guildData.value?.channels.find((channel) => channel.id === id)?.name;
			return name ? `#${name}` : id;
		});
	}
	if (list === "allowedRoles" || list === "ignoredRoles") {
		return highestFirst(ids).map((id) => roles.value.get(id)?.name ?? id);
	}
	return ids.map((id) => memberNames.value.get(id) ?? id);
}

const rows = computed(() =>
	rules.map((rule) => {
		const listed = withoutEveryone(rule, guildId.value);
		return {
			target: rule.command,
			name: commandTargetLabel(
				rule.command,
				ts("guild_settings.command_rules.every_command"),
			),
			onlyAllowed: isCommandRuleOnlyAllowed(rule, guildId.value),
			lists: COMMAND_RULE_LISTS.filter((list) => listed[list].length > 0).map((list) => ({
				key: list,
				label: listLabel(list),
				values: namesOf(list, listed[list]),
			})),
		};
	}),
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.rule-row {
	@apply py-3;
	border-top: 1px solid var(--home-border-subtle);
}

.rule-pill {
	@apply inline-flex h-6 items-center rounded-full bg-base-content/8 px-2.25 text-xs font-semibold whitespace-nowrap text-toned;
}
</style>
