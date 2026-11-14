<template>
	<!--
		newt/ui MessageComposer has no slot that replaces its input, so a `#value`
		slot hides the built-in input (the second child) and takes its place.
	-->
	<MessageComposer
		v-model="modelValue"
		:class="[
			'discord-message-composer mx-4 font-whitney max-md:mx-0 max-md:rounded-none',
			{
				'discord-message-composer-has-value': hasValue,
				'discord-message-composer-apps-open': appsOpen,
				'[&>div:nth-child(2)]:hidden': hasValueSlot,
			},
		]"
		:aria-label="composerLabel"
		:channel-name="channelName"
		:placeholder="displayPlaceholder"
		:autocomplete="autocomplete && !hasValueSlot"
		:aria-controls="ariaControls"
		:aria-expanded="ariaExpanded"
		:aria-activedescendant="ariaActivedescendant"
		@submit="emit('submit')"
		@escape="emit('escape')"
		@navigate="emit('navigate', $event)"
	>
		<template #actions>
			<div
				v-if="hasValueSlot"
				class="discord-message-composer-field flex min-w-0 flex-1 items-center"
			>
				<slot name="value" />
			</div>
			<div class="discord-message-composer-actions flex shrink-0 items-center gap-0.5">
				<button
					v-for="action of ComposerActions"
					:key="action.icon"
					type="button"
					class="discord-message-composer-action inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-inherit hover:bg-newt-bg-hover hover:text-newt-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newt-text-link"
					:class="{ 'max-md:hidden': action.decorative }"
					:aria-label="action.opensApps ? appsLabel : undefined"
					:aria-hidden="action.decorative ? true : undefined"
					:tabindex="action.decorative ? -1 : undefined"
					:title="action.opensApps ? appsLabel : undefined"
					@click="action.opensApps && emit('openApps')"
				>
					<UIcon
						:name="action.opensApps && appsOpen ? 'ph:x-bold' : action.icon"
						class="size-6"
						aria-hidden="true"
					/>
				</button>
			</div>
		</template>
	</MessageComposer>
</template>

<script lang="ts">
import type { VNode } from "vue";

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
}

interface MessageComposerSlots {
	/** Replaces the built-in input, e.g. with a field that overlays a composed slash command. */
	value?(props?: Record<string, never>): VNode[];
}

interface ComposerAction {
	icon: string;
	/** The one functional control: it toggles the App Launcher. */
	opensApps?: boolean;
	/** Non-functional chrome: hidden from AT, not focusable, hidden on phones. */
	decorative?: boolean;
}

/** Desktop toolbar order matches Discord: gift, GIF, sticker, emoji, apps. */
const ComposerActions: readonly ComposerAction[] = [
	{ icon: "discord:gift", decorative: true },
	{ icon: "discord:gif", decorative: true },
	{ icon: "discord:sticker", decorative: true },
	{ icon: "discord:emoji", decorative: true },
	{ icon: "discord:apps", opensApps: true },
];

interface MessageComposerEmits {
	openApps: [];
	submit: [];
	escape: [];
	navigate: [direction: "up" | "down"];
}
</script>

<script setup lang="ts">
import { MessageComposer } from "~/components/ui/message-composer";

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
} = defineProps<MessageComposerProps>();

const modelValue = defineModel<string>({ default: "" });

const emit = defineEmits<MessageComposerEmits>();

const hasValueSlot = computed(() => Boolean(slots.value));
const displayPlaceholder = computed(
	() => placeholder ?? ts("discord.composer.placeholder", { channel: channelName }),
);
const composerLabel = computed(() => ts("discord.composer.label", { channel: channelName }));
const appsLabel = computed(() =>
	ts(appsOpen ? "discord.composer.close_apps" : "discord.composer.open_apps"),
);
const hasValue = computed(() => modelValue.value.trim().length > 0);
</script>
