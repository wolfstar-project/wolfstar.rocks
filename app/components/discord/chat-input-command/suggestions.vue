<template>
	<!--
		newt/ui SlashCommandSuggestions is a fixed row (rail | list) capped at
		640px. The app stretches it over the composer, stacks the matched command
		under the list, and moves the rail under the list on phones.
	-->
	<SlashCommandSuggestions
		class="discord-slash-command-suggestions mx-4 mb-2 w-auto max-w-none flex-col font-whitney max-md:mx-0 max-md:mb-0 max-md:rounded-none"
		role="region"
		:aria-label="ariaLabel"
	>
		<template v-if="slots['frequently-used']">
			<div
				class="discord-slash-command-suggestions-inner flex min-h-0 flex-1 max-md:flex-col"
			>
				<SlashCommandSuggestionsRail
					class="discord-slash-command-suggestions-sidebar no-scrollbar max-md:order-last max-md:flex-row max-md:overflow-x-auto max-md:overflow-y-hidden max-md:border-e-0 max-md:border-t"
					:aria-label="railText"
				>
					<SlashCommandSuggestionsRailItem
						class="discord-slash-command-suggestions-sidebar-item"
						:active="selectedApp === null"
						:title="ts('discord.suggestions.frequently_used')"
						:aria-label="ts('discord.suggestions.frequently_used')"
						@click="selectedApp = null"
					>
						<UIcon name="discord:recently-used" class="size-8" aria-hidden="true" />
					</SlashCommandSuggestionsRailItem>
					<SlashCommandSuggestionsRailItem
						v-for="app in SlashCommandRailApps"
						:key="app"
						class="discord-slash-command-suggestions-sidebar-item"
						:active="selectedApp === app"
						:title="SlashCommandApps[app].label"
						:aria-label="`${SlashCommandApps[app].label} commands`"
						@click="selectedApp = app"
					>
						<DiscordChatInputCommandAppIcon :app size="rail" />
					</SlashCommandSuggestionsRailItem>
				</SlashCommandSuggestionsRail>

				<!-- Keyed by the app so a filter change starts at the top of the list. -->
				<SlashCommandSuggestionsList
					:key="selectedApp ?? 'frequently-used'"
					:class="listClass"
					:aria-label="listboxText"
				>
					<section
						v-if="selectedApp === null"
						class="discord-slash-command-suggestions-recent"
					>
						<SlashCommandSuggestionsHeader
							class="discord-slash-command-suggestions-header"
						>
							<UIcon
								name="discord:recently-used"
								class="size-3.5 shrink-0"
								aria-hidden="true"
							/>
							{{ ts("discord.suggestions.frequently_used") }}
						</SlashCommandSuggestionsHeader>
						<slot name="frequently-used" />
					</section>
					<slot />
				</SlashCommandSuggestionsList>
			</div>

			<!-- newt/ui has no footer part for the matched command. -->
			<div
				v-if="slots.matched"
				role="listbox"
				:aria-label="matchedText"
				class="discord-slash-command-suggestions-matched shrink-0 border-t border-newt-border p-2"
			>
				<slot name="matched" />
			</div>
		</template>

		<SlashCommandSuggestionsList
			v-else-if="slots.matched"
			:class="listClass"
			:aria-label="listboxText"
		>
			<slot name="matched" />
		</SlashCommandSuggestionsList>

		<SlashCommandSuggestionsList v-else :class="listClass" :aria-label="listboxText">
			<slot />
		</SlashCommandSuggestionsList>
	</SlashCommandSuggestions>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface SlashCommandSuggestionsProps {
	listboxLabel?: string;
	matchedLabel?: string;
	prefix: string;
	railLabel?: string;
}

interface SlashCommandSuggestionsSlots {
	"frequently-used"?(props?: Record<string, never>): VNode[];
	"matched"?(props?: Record<string, never>): VNode[];
	"default"?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import { scrollbarClassName } from "~/components/ui/scrollbar";
import {
	SlashCommandSuggestions,
	SlashCommandSuggestionsHeader,
	SlashCommandSuggestionsList,
	SlashCommandSuggestionsRail,
	SlashCommandSuggestionsRailItem,
} from "~/components/ui/slash-command-suggestions";

const { ts } = useI18n();
const slots = defineSlots<SlashCommandSuggestionsSlots>();

const { listboxLabel, matchedLabel, prefix, railLabel } =
	defineProps<SlashCommandSuggestionsProps>();

/** `null` shows the frequently used list; an app name filters to that app's commands. */
const selectedApp = defineModel<SlashCommandAppName | null>("selectedApp", { default: null });

/** newt/ui's list scrolls with the browser's default scrollbar; this applies the newt one. */
const listClass = ["discord-slash-command-suggestions-list overscroll-contain", scrollbarClassName];

const ariaLabel = computed(() => ts("discord.suggestions.for_prefix", { prefix }));
const listboxText = computed(() => listboxLabel ?? ts("discord.suggestions.listbox"));
const matchedText = computed(() => matchedLabel ?? ts("discord.suggestions.matched"));
const railText = computed(() => railLabel ?? ts("discord.suggestions.rail"));
</script>
