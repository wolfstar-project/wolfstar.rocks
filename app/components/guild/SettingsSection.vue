<script lang="ts">
import type { VNode } from "vue";
import { tv } from "tailwind-variants";

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
	class?: any;
	ui?: Partial<typeof theme.slots>;
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

const ui = computed(() =>
	theme({
		disableTypography: props.disableTypography,
	}),
);
</script>

<template>
	<div data-slot="root" :class="ui.root({ class: [props.class, props.ui?.root] })">
		<header
			v-if="props.title || props.description"
			data-slot="header"
			:class="ui.header({ class: props.ui?.header })"
		>
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
					:class="ui.heading({ class: props.ui?.heading })"
				>
					{{ props.title }}
				</component>
			</template>

			<p
				v-if="props.description"
				data-slot="description"
				:class="ui.description({ class: props.ui?.description })"
			>
				{{ props.description }}
			</p>
		</header>

		<div data-slot="content" :class="ui.content({ class: props.ui?.content })">
			<slot />
		</div>
	</div>
</template>
