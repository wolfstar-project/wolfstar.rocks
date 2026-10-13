<template>
	<span class="automod-type-icon" :class="`automod-type-icon--${AUTOMOD_TYPE_TONES[type]}`">
		<UIcon :name="AUTOMOD_TYPE_ICONS[type]" class="size-4" aria-hidden="true" />
	</span>
</template>

<script setup lang="ts">
import type { AutoModerationRuleType } from "#shared/utils/automod-rules";
import { AUTOMOD_TYPE_ICONS, AUTOMOD_TYPE_TONES } from "~/utils/automod-rule-labels";

/** The tinted tile that stands for a kind of rule. */
const { type } = defineProps<{
	type: AutoModerationRuleType;
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.automod-type-icon {
	@apply flex size-7 shrink-0 items-center justify-center rounded-[7px];
	background-color: color-mix(in oklab, var(--automod-type-tone) 15%, transparent);
	color: var(--automod-type-tone);
}

.automod-type-icon--primary {
	--automod-type-tone: var(--color-primary);
}

.automod-type-icon--warning {
	--automod-type-tone: var(--color-warning);
}

.automod-type-icon--error {
	--automod-type-tone: var(--color-error);
}
</style>
