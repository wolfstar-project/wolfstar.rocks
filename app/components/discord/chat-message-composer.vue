<template>
	<MessageComposer
		v-model="modelValue"
		:class="[
			'discord-message-composer font-whitney',
			narrow ? 'p-2' : 'mx-4 max-md:mx-0 max-md:rounded-none',
		]"
		:channel-name="channelName"
		:placeholder="placeholder"
		:autocomplete="autocomplete"
		:aria-controls="ariaControls"
		:aria-expanded="ariaExpanded"
		:aria-activedescendant="ariaActivedescendant"
		:layout="resolvedLayout"
		:show-add="false"
		:labels="labels"
		@submit="emit('submit')"
		@escape="emit('escape')"
		@navigate="emit('navigate', $event)"
	>
		<template #leading>
			<!-- The showcase attaches nothing, so the add control is decoration. -->
			<button v-bind="DECORATION" :class="besideFieldButton">
				<UIcon :name="narrow ? 'discord:plus' : 'ph:plus-circle-fill'" :class="iconSize" />
			</button>
			<!-- Discord's phone bar folds the apps and gift away while there is text. -->
			<template v-if="narrow && (!hasValue || appsOpen)">
				<button v-bind="appsButton" :class="besideFieldButton">
					<UIcon :name="appsIcon" :class="iconSize" aria-hidden="true" />
				</button>
				<button v-if="!appsOpen" v-bind="DECORATION" :class="besideFieldButton">
					<UIcon name="discord:gift" :class="iconSize" />
				</button>
			</template>
		</template>

		<template v-if="slots.input" #input="field">
			<slot name="input" v-bind="field" />
		</template>

		<template #actions>
			<button
				v-for="icon of fieldDecorations"
				:key="icon"
				v-bind="DECORATION"
				:class="[inFieldButton, { 'max-md:hidden': !narrow }]"
			>
				<UIcon :name="icon" :class="iconSize" />
			</button>
			<button v-if="!narrow" v-bind="appsButton" :class="inFieldButton">
				<UIcon :name="appsIcon" :class="iconSize" aria-hidden="true" />
			</button>
		</template>

		<!-- Discord shows a microphone until there is something to send. -->
		<template v-if="narrow" #trailing>
			<button v-bind="DECORATION" :class="besideFieldButton">
				<UIcon name="discord:mic" :class="iconSize" />
			</button>
		</template>
	</MessageComposer>
</template>

<script lang="ts">
import type { VNode } from "vue";
import type { MessageComposerInputProps } from "~/components/ui/message-composer";

interface MessageComposerProps {
	channelName: string;
	placeholder?: string;
	/** When true, the input acts as a combobox for slash-command autocomplete. */
	autocomplete?: boolean;
	ariaControls?: string;
	ariaExpanded?: boolean;
	ariaActivedescendant?: string;
	/** When true, the apps control shows a close (X) glyph. */
	appsOpen?: boolean;
	/** Fixes the layout. Without it, the composer is narrow below Tailwind's `md`. */
	layout?: "default" | "narrow";
}

interface MessageComposerSlots {
	/**
	 * Replaces the built-in input, e.g. with a field that draws a composed slash
	 * command. Bind `inputProps` on the field to keep its name, its combobox
	 * attributes and its keys.
	 */
	input?(props: MessageComposerInputProps): VNode[];
}

/** Chrome that only looks like Discord's: hidden from screen readers and out of the tab order. */
const DECORATION = {
	"type": "button",
	"class": "discord-message-composer-action",
	"aria-hidden": "true",
	"tabindex": -1,
} as const;

/** Desktop toolbar order matches Discord: gift, GIF, sticker, emoji, then apps. */
const DESKTOP_DECORATIONS = [
	"discord:gift",
	"discord:gif",
	"discord:sticker",
	"discord:emoji",
] as const;

/** On a phone, Discord keeps only the emoji inside the field. */
const NARROW_DECORATIONS = ["discord:emoji"] as const;

interface MessageComposerEmits {
	openApps: [];
	submit: [];
	escape: [];
	navigate: [direction: "up" | "down"];
}
</script>

<script setup lang="ts">
import type { MessageComposerLabels } from "~/components/ui/message-composer";
import { MessageComposer, messageComposerButtonVariants } from "~/components/ui/message-composer";

const { ts } = useI18n();
const slots = defineSlots<MessageComposerSlots>();
const {
	channelName,
	placeholder,
	autocomplete = false,
	ariaControls,
	ariaExpanded,
	ariaActivedescendant,
	appsOpen = false,
	layout,
} = defineProps<MessageComposerProps>();

const modelValue = defineModel<string>({ default: "" });

const emit = defineEmits<MessageComposerEmits>();

// It stays false until the component mounts, so the server and the first
// client render agree, and a phone switches to the narrow bar after hydration.
const isPhone = useMediaQuery("(max-width: 767.98px)");
const resolvedLayout = computed(() => layout ?? (isPhone.value ? "narrow" : "default"));
const narrow = computed(() => resolvedLayout.value === "narrow");

const labels = computed(
	(): Partial<MessageComposerLabels> => ({
		group: (channel) => ts("discord.composer.label", { channel }),
		placeholder: (channel) => ts("discord.composer.placeholder", { channel }),
		send: ts("discord.composer.send"),
	}),
);

const hasValue = computed(() => modelValue.value.trim().length > 0);

/** A button inside the field keeps the square style; one beside it follows the layout. */
const inFieldButton = messageComposerButtonVariants();
const besideFieldButton = computed(() =>
	messageComposerButtonVariants({ layout: resolvedLayout.value }),
);
const iconSize = computed(() => (narrow.value ? "size-5" : "size-6"));
const fieldDecorations = computed(() => (narrow.value ? NARROW_DECORATIONS : DESKTOP_DECORATIONS));

/** The one working control: it toggles the App Launcher. */
const appsButton = computed(() => {
	const label = ts(appsOpen ? "discord.composer.close_apps" : "discord.composer.open_apps");
	return {
		"type": "button",
		"class": "discord-message-composer-action",
		"aria-label": label,
		"title": label,
		"onClick": () => emit("openApps"),
	} as const;
});
const appsIcon = computed(() => (appsOpen ? "ph:x-bold" : "discord:apps"));
</script>
