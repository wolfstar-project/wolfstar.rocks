<template>
	<!-- Single-line children: newlines between tags become text nodes inside the pill. -->
	<Mention :variant="VARIANTS[kind]" :avatar class="discord-mention"
		><span v-if="kind === 'mention'" aria-hidden="true">@</span
		><span v-else-if="kind === 'channel'" aria-hidden="true">#</span
		><LazyIconsApp
			v-else-if="kind === 'app' && !avatar"
			class="size-3.5 shrink-0"
			aria-hidden="true" /><slot></slot
	></Mention>
</template>

<script lang="ts">
import type { VNode } from "vue";
import type { MentionVariants } from "~/components/ui/mention";

type MentionKind = "mention" | "channel" | "app";

interface MentionProps {
	kind?: MentionKind;
	/** User avatar URL. Shown on desktop (≥48rem) and hidden on mobile. */
	avatar?: string;
}

interface MentionSlots {
	default?(props?: Record<string, never>): VNode[];
}

const VARIANTS = {
	mention: "user",
	channel: "channel",
	app: "app",
} as const satisfies Record<MentionKind, MentionVariants["variant"]>;
</script>

<script setup lang="ts">
import { Mention } from "~/components/ui/mention";

defineSlots<MentionSlots>();

const { kind = "mention", avatar } = defineProps<MentionProps>();
</script>
