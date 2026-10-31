<template>
	<GuildSettingsDisabledCommands :commands />

	<section v-if="groupRules.length > 0" class="console-card" :aria-labelledby="groupRulesId">
		<h3 :id="groupRulesId" class="text-[1.0625rem] font-semibold">
			{{ ts("guild_settings.command_rules.groups_title") }}
		</h3>
		<p class="mt-1 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.command_rules.groups_subtitle") }}
		</p>
		<p class="mt-1 mb-4 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.command_rules.order") }}
		</p>
		<GuildCommandsRuleList :rules="groupRules" />
	</section>

	<GuildCommandsDiscordPermissions />
</template>

<script setup lang="ts">
import type { FlattenedCommand } from "#shared/types/discord";
import {
	getCommandRuleSpecificity,
	isCommandGroupTarget,
	readCommandRules,
} from "#shared/utils/command-rules";

const { commands } = defineProps<{ commands: FlattenedCommand[] }>();

const { ts } = useI18n();
const groupRulesId = useId();
const { activeGuildId } = useActiveGuild();
const { guildSettings } = useGuildSettings();

// Only `/commands` makes them, and no tile shows them: the most specific first.
const groupRules = computed(() =>
	readCommandRules(guildSettings.value?.commandsRestrictions, activeGuildId.value ?? "")
		.filter((rule) => isCommandGroupTarget(rule.command))
		.toSorted(
			(a, b) => getCommandRuleSpecificity(b.command) - getCommandRuleSpecificity(a.command),
		),
);
</script>
