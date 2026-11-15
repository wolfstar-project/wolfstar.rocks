<template>
	<!--
		The picker spans the composer. Under 480px of its own width, newt/ui moves
		the rail under the list and stacks each row.
	-->
	<SlashCommandSuggestions
		class="discord-slash-command-suggestions mx-4 mb-2 w-auto font-whitney [--newt-slash-suggestions-max-width:none] max-md:mx-0 max-md:mb-0 max-md:rounded-none"
		role="region"
		:aria-label="ariaLabel"
	>
		<template v-if="slots['frequently-used']">
			<SlashCommandSuggestionsRail class="no-scrollbar" :aria-label="railText">
				<SlashCommandSuggestionsRailItem
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
					:active="selectedApp === app"
					:title="SlashCommandApps[app].label"
					:aria-label="
						ts('discord.suggestions.app_commands', { app: SlashCommandApps[app].label })
					"
					@click="selectedApp = app"
				>
					<DiscordChatInputCommandAppIcon :app size="rail" />
				</SlashCommandSuggestionsRailItem>
			</SlashCommandSuggestionsRail>

			<!-- Keyed by the app so a filter change starts at the top of the list. -->
			<SlashCommandSuggestionsList
				:key="selectedApp ?? 'frequently-used'"
				class="overscroll-contain"
				:aria-label="listboxText"
			>
				<section v-if="selectedApp === null">
					<SlashCommandSuggestionsHeader class="discord-slash-command-suggestions-header">
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

			<!-- The matched command is a row the user can pick, so the footer is its own list. -->
			<SlashCommandSuggestionsFooter
				v-if="slots.matched"
				role="listbox"
				:aria-label="matchedText"
				class="block p-2"
			>
				<slot name="matched" />
			</SlashCommandSuggestionsFooter>
		</template>

		<SlashCommandSuggestionsList
			v-else-if="slots.matched"
			class="overscroll-contain"
			:aria-label="listboxText"
		>
			<slot name="matched" />
		</SlashCommandSuggestionsList>

		<SlashCommandSuggestionsList v-else class="overscroll-contain" :aria-label="listboxText">
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
import {
	SlashCommandSuggestions,
	SlashCommandSuggestionsFooter,
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

const ariaLabel = computed(() => ts("discord.suggestions.for_prefix", { prefix }));
const listboxText = computed(() => listboxLabel ?? ts("discord.suggestions.listbox"));
const matchedText = computed(() => matchedLabel ?? ts("discord.suggestions.matched"));
const railText = computed(() => railLabel ?? ts("discord.suggestions.rail"));
</script>
