<script lang="ts">
import type { VNode } from "vue";
import { tv, type ClassValue } from "tailwind-variants";

const theme = tv({
	slots: {
		root: "w-full space-y-6",
		header: "space-y-1",
		heading: "",
		description: "text-sm text-base-content/70",
		content: "space-y-4",
	},
	variants: {
		disableTypography: {
			true: { heading: "" },
			false: { heading: "divider divider-start text-xl font-semibold" },
		},
	},
});

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface SettingsSectionProps {
	description?: string | number;
	title?: string | number;
	disableTypography?: boolean;
	headingLevel?: HeadingLevel;
	forceSemanticHeading?: boolean;
	class?: ClassValue;
	ui?: Partial<typeof theme.slots>;
}

interface SettingsSectionSlots {
	default?(props?: {}): VNode[];
}
</script>

<script setup lang="ts">
const {
	description,
	title,
	disableTypography,
	headingLevel = "h2",
	forceSemanticHeading = false,
	class: className,
	ui: uiProp,
} = defineProps<SettingsSectionProps>();

defineSlots<SettingsSectionSlots>();

const ui = computed(() =>
	theme({
		disableTypography,
	}),
);
</script>

<template>
	<div data-slot="root" :class="ui.root({ class: [className, uiProp?.root] })">
		<header
			v-if="title || description"
			data-slot="header"
			:class="ui.header({ class: uiProp?.header })"
		>
			<template v-if="title">
				<div v-if="disableTypography && !forceSemanticHeading" data-slot="heading">
					{{ title }}
				</div>
				<component
					:is="headingLevel"
					v-else
					data-slot="heading"
					:class="ui.heading({ class: uiProp?.heading })"
				>
					{{ title }}
				</component>
			</template>

			<p
				v-if="description"
				data-slot="description"
				:class="ui.description({ class: uiProp?.description })"
			>
				{{ description }}
			</p>
		</header>

		<div data-slot="content" :class="ui.content({ class: uiProp?.content })">
			<slot />
		</div>
	</div>
</template>
