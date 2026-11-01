<template>
	<ul class="divide-y divide-(--home-border-subtle)">
		<li v-for="row in rows" :key="row.target" class="py-3 first:pt-0 last:pb-0">
			<p class="text-sm font-semibold">{{ row.name }}</p>
			<p v-if="row.onlyAllowed" class="mt-0.5 text-[0.8125rem] text-muted">
				{{ ts("guild_settings.command_rules.editor.only_allowed") }}
			</p>
			<dl
				v-if="row.lists.length > 0"
				class="mt-1.5 grid gap-x-4 gap-y-1 text-[0.8125rem] sm:grid-cols-[max-content_1fr]"
			>
				<template v-for="list in row.lists" :key="list.key">
					<dt class="text-muted">{{ list.label }}</dt>
					<dd>{{ list.values.join(", ") }}</dd>
				</template>
			</dl>
		</li>
	</ul>
</template>

<script setup lang="ts">
import type { CommandRule, CommandRuleList } from "#shared/utils/command-rules";
import {
	COMMAND_RULE_LISTS,
	isCommandRuleOnlyAllowed,
	withoutEveryone,
} from "#shared/utils/command-rules";
import { resolveGuildMembers } from "~/composables/useGuildMemberSearch";
import { commandTargetLabel } from "~/utils/command-settings";

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
