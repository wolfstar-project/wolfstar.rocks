<template>
	<article class="jg-rule" :class="{ 'jg-rule--off': !rule.enabled }" :aria-labelledby="nameId">
		<div class="flex items-center gap-2.5">
			<h3 :id="nameId" class="min-w-0 flex-auto truncate text-[0.9375rem] font-bold">
				{{ rule.name }}
			</h3>
			<USwitch
				:model-value="rule.enabled"
				:disabled="busy"
				:aria-label="ts('guild_settings.joinguard.rules.toggle_aria', { name: rule.name })"
				@update:model-value="emit('toggle', $event)"
			/>
		</div>

		<div>
			<p :id="conditionsId" class="mb-1.5 console-label">
				{{ ts("guild_settings.joinguard.rules.when") }}
			</p>
			<ul class="flex flex-wrap gap-1.5" :aria-labelledby="conditionsId">
				<li v-for="chip in conditions" :key="chip" class="jg-chip">{{ chip }}</li>
			</ul>
		</div>

		<div>
			<p :id="actionsId" class="mb-1.5 console-label">
				{{ ts("guild_settings.joinguard.rules.then") }}
			</p>
			<ul class="flex flex-wrap gap-1.5" :aria-labelledby="actionsId">
				<li v-for="chip in actions" :key="chip" class="jg-chip" :class="`jg-chip--${tone}`">
					{{ chip }}
				</li>
			</ul>
		</div>

		<div class="mt-auto flex items-center gap-1.5">
			<UButton
				color="neutral"
				variant="outline"
				size="sm"
				:disabled="busy"
				:aria-label="ts('guild_settings.joinguard.rules.edit_aria', { name: rule.name })"
				@click="emit('edit')"
			>
				{{ ts("guild_settings.joinguard.rules.edit") }}
			</UButton>
			<UButton
				color="error"
				variant="ghost"
				size="sm"
				:disabled="busy"
				:aria-label="ts('guild_settings.joinguard.rules.delete_aria', { name: rule.name })"
				@click="emit('delete')"
			>
				{{ ts("guild_settings.joinguard.rules.delete") }}
			</UButton>
		</div>
	</article>
</template>

<script setup lang="ts">
import type { JoinGuardRule } from "#shared/utils/join-guard";

/**
 * A guard rule as the section lists it: its name and switch, what the account
 * must have, what WolfStar does, toned by how hard it is, and its buttons.
 */
const { rule, busy = false } = defineProps<{
	rule: JoinGuardRule;
	/** A write of this rule is in flight. */
	busy?: boolean;
}>();

const emit = defineEmits<{
	toggle: [enabled: boolean];
	edit: [];
	delete: [];
}>();

const i18n = useI18n();
const { ts } = i18n;
const names = useJoinGuardNames();

const nameId = useId();
const conditionsId = useId();
const actionsId = useId();

const conditions = computed(() => joinGuardConditionChips(rule, i18n));
const actions = computed(() => joinGuardActionChips(rule, i18n, names));
const tone = computed(() => joinGuardRuleTone(rule));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.jg-rule {
	@apply flex flex-col gap-3 rounded-xl p-4;
	background-color: var(--console-rail, var(--ink-800));
	border: 1px solid var(--home-border-subtle);
}

.jg-rule--off {
	opacity: 0.62;
}

.jg-chip {
	@apply inline-flex h-6 items-center rounded-full px-2.25 text-xs font-semibold whitespace-nowrap text-highlighted;
	background-color: var(--console-active);
}

.jg-chip--error {
	background-color: color-mix(in oklab, var(--color-error) 16%, transparent);
}

.jg-chip--primary {
	background-color: color-mix(in oklab, var(--color-primary) 16%, transparent);
}

.jg-chip--warning {
	background-color: color-mix(in oklab, var(--color-warning) 16%, transparent);
}
</style>
