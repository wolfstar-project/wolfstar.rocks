<template>
	<GuildSettingsDisabledCommands :commands />

	<section v-if="groupRules.length > 0" class="console-card" :aria-labelledby="groupRulesId">
		<div class="flex items-center gap-3">
			<h3 :id="groupRulesId" class="text-[1.0625rem] font-semibold whitespace-nowrap">
				{{ ts("guild_settings.command_rules.groups_title") }}
			</h3>
			<span class="h-px flex-1 bg-base-content/15" aria-hidden="true"></span>
		</div>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.command_rules.groups_subtitle") }}
		</p>
		<p class="mt-4 mb-1 text-[0.8125rem] leading-normal text-toned">
			{{ ts("guild_settings.command_rules.order") }}
		</p>
		<GuildCommandsRuleList :rules="groupRules" />
	</section>
</template>

<script setup lang="ts">
import type { FlattenedCommand } from "#shared/types/discord";
import {
	EVERY_COMMAND,
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
// The rule of every command has a row of its own above the commands.
const groupRules = computed(() =>
	readCommandRules(guildSettings.value?.commandsRestrictions, activeGuildId.value ?? "")
		.filter((rule) => isCommandGroupTarget(rule.command) && rule.command !== EVERY_COMMAND)
		.toSorted(
			(a, b) => getCommandRuleSpecificity(b.command) - getCommandRuleSpecificity(a.command),
		),
);
</script>
