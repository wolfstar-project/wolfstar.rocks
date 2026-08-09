<script lang="ts">
import type { VNode } from "vue";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface SettingsSectionProps {
	description?: string | number;
	title?: string | number;
	disableTypography?: boolean;
	headingLevel?: HeadingLevel;
	forceSemanticHeading?: boolean;
	class?: string | string[] | Record<string, boolean>;
	ui?: Partial<{
		root: string;
		header: string;
		heading: string;
		description: string;
		content: string;
	}>;
}

interface SettingsSectionSlots {
	default?(props?: {}): VNode[];
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<SettingsSectionProps>(), {
	headingLevel: "h2",
	forceSemanticHeading: false,
});

defineSlots<SettingsSectionSlots>();

function mergeClass(
	base: string,
	...extras: Array<string | string[] | Record<string, boolean> | undefined>
) {
	const parts: string[] = [base];
	for (const extra of extras) {
		if (!extra) continue;
		if (typeof extra === "string") {
			parts.push(extra);
			continue;
		}
		if (Array.isArray(extra)) {
			parts.push(...extra.filter(Boolean));
			continue;
		}
		for (const [key, on] of Object.entries(extra)) {
			if (on) parts.push(key);
		}
	}
	return parts.filter(Boolean).join(" ");
}

const rootClass = computed(() => mergeClass("space-y-6 w-full", props.class, props.ui?.root));
const headerClass = computed(() => mergeClass("space-y-1", props.ui?.header));
const headingClass = computed(() =>
	mergeClass(
		props.disableTypography ? "" : "divider divider-start text-xl font-semibold",
		props.ui?.heading,
	),
);
const descriptionClass = computed(() =>
	mergeClass("text-sm text-base-content/70", props.ui?.description),
);
const contentClass = computed(() => mergeClass("space-y-4", props.ui?.content));
</script>

<template>
	<div data-slot="root" :class="rootClass">
		<header v-if="props.title || props.description" data-slot="header" :class="headerClass">
			<template v-if="props.title">
				<div
					v-if="props.disableTypography && !props.forceSemanticHeading"
					data-slot="heading"
				>
					{{ props.title }}
				</div>
				<component
					:is="props.headingLevel"
					v-else
					data-slot="heading"
					:class="headingClass"
				>
					{{ props.title }}
				</component>
			</template>

			<p v-if="props.description" data-slot="description" :class="descriptionClass">
				{{ props.description }}
			</p>
		</header>

		<div data-slot="content" :class="contentClass">
			<slot />
		</div>
	</div>
</template>
