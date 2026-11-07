<template>
	<div class="flex items-center gap-2">
		<UPopover
			v-model:open="open"
			:content="{ side: 'bottom', align: 'start', sideOffset: 8 }"
			:ui="{
				content:
					'rounded-[8px] bg-(--popover-surface) p-0 shadow-(--popover-shadow) ring-(--field-border)',
			}"
		>
			<button
				type="button"
				class="emoji-trigger"
				aria-haspopup="dialog"
				:aria-expanded="open"
				:aria-label="ts('guild_settings.appeals.emoji.trigger_aria')"
			>
				<GuildAppealsFormIcon v-if="icon" :icon="icon" />
				<UIcon
					v-else
					name="ic:round-add-reaction"
					class="size-5 text-muted"
					aria-hidden="true"
				/>
			</button>

			<template #content>
				<GuildAppealsEmojiPickerPanel
					:servers="servers"
					:current="icon"
					:server-name="serverName"
					:server-icon="serverIcon"
					@pick="onPick"
				/>
			</template>
		</UPopover>

		<UButton
			v-if="icon"
			color="neutral"
			variant="ghost"
			size="sm"
			icon="ic:round-close"
			:aria-label="ts('guild_settings.appeals.emoji.remove')"
			@click="icon = ''"
		/>
	</div>
</template>

<script setup lang="ts">
import type { ServerEmoji } from "~/utils/emoji-picker";

/** What the form stores: an emoji, or `<:name:id>` for one of the server, empty for none. */
const icon = defineModel<string>({ required: true });

const {
	servers = [],
	serverName = null,
	serverIcon = null,
} = defineProps<{
	/** The emoji of the server, which the picker offers first. */
	servers?: readonly ServerEmoji[];
	/** The name of the server, which titles its emoji in the picker. */
	serverName?: string | null;
	/** The icon of the server, drawn beside its name. */
	serverIcon?: string | null;
}>();

const { ts } = useI18n();

const open = ref(false);

function onPick(value: string) {
	icon.value = value;
	open.value = false;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The icon of the form, which is also the button that picks it: the field
   surface of the editor's inputs, with the add-reaction mark while it has none. */
.emoji-trigger {
	@apply flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-xl leading-none;
	background-color: var(--field-surface);
	border: 1px solid var(--field-border);
}

.emoji-trigger:hover,
.emoji-trigger[aria-expanded="true"] {
	background-color: color-mix(in oklab, var(--field-surface) 85%, var(--ui-text-highlighted));
}

.emoji-trigger:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}
</style>
