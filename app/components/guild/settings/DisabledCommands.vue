<template>
	<section class="console-card" aria-labelledby="commands-heading">
		<h2 id="commands-heading" class="text-xl font-bold tracking-[0.01em]">
			{{ ts("guild_settings.commands.title") }}
		</h2>
		<p class="mt-1 mb-4 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.commands.subtitle") }}
		</p>

		<button
			type="button"
			class="command-every"
			aria-haspopup="dialog"
			:aria-label="ts('guild_settings.commands.every_aria')"
			:aria-describedby="everyId"
			@click="openEditor(EVERY_COMMAND, $event)"
		>
			<span class="command-every-tile" aria-hidden="true">
				<UIcon name="ph:asterisk-bold" class="size-4.5" />
			</span>
			<span class="min-w-0 flex-1">
				<span class="block text-[0.9375rem] font-bold">
					{{ ts("guild_settings.commands.every") }}
				</span>
				<span class="mt-0.5 block text-xs text-muted">
					{{ ts("guild_settings.commands.every_hint") }}
				</span>
			</span>
			<span :id="everyId" class="command-every-pills">
				<span class="command-pill">
					{{ tc("guild_settings.command_rules.editor.count", everyRuleCount) }}
				</span>
				<span v-if="everyDiscord" class="command-pill">
					<UIcon name="ic:round-discord" class="size-3.25" aria-hidden="true" />
					{{ everyDiscord }}
				</span>
			</span>
			<UIcon
				name="ic:round-chevron-right"
				class="size-4.5 shrink-0 text-muted"
				aria-hidden="true"
			/>
		</button>

		<div v-if="loading" class="space-y-2">
			<USkeleton v-for="i in 5" :key="i" class="h-11 w-full" />
		</div>

		<GuildSettingsForm
			v-else
			:state="state"
			:schema="disabledCommandsSchema"
			:map-to-guild-data="mapToGuildData"
			:aria-label="ts('guild_settings.commands.form_aria')"
			:aria-busy="loading"
			:aria-disabled="loading"
			@error="onError"
		>
			<div class="divide-y divide-(--home-border-subtle)">
				<UCollapsible
					v-for="category in categories"
					:key="category"
					:open="isCategoryOpen(category)"
					:unmount-on-hide="false"
					@update:open="() => toggleCategory(category)"
				>
					<template #default="{ open }">
						<button type="button" class="command-category">
							<span class="truncate text-[1.0625rem] font-medium">{{
								category
							}}</span>
							<span class="ml-auto font-mono text-xs text-muted">
								{{
									ts("guild_settings.commands.enabled_count", {
										enabled: enabledIn(category),
										total: getCommandsByCategory(category).length,
									})
								}}
							</span>
							<UIcon
								name="ic:round-expand-more"
								class="size-4.5 shrink-0 text-muted transition-transform duration-200"
								:class="[open && 'rotate-180']"
								aria-hidden="true"
							/>
						</button>
					</template>

					<template #content>
						<div
							class="grid grid-cols-1 gap-3 px-1 pt-3.5 pb-1.5 md:grid-cols-2 xl:grid-cols-4"
						>
							<button
								v-for="command in getCommandsByCategory(category)"
								:key="command.name"
								type="button"
								class="command-tile"
								:class="{ 'command-tile--off': !isOn(command) }"
								aria-haspopup="dialog"
								:aria-label="
									ts('guild_settings.command_rules.editor.open_aria', {
										name: command.label,
									})
								"
								:aria-describedby="`${tileIdBase}-${command.name}`"
								@click="openEditor(command, $event)"
							>
								<span class="min-w-0 flex-1">
									<span
										class="block truncate font-mono text-[0.8125rem] font-semibold"
									>
										{{ command.label }}
									</span>
									<span class="block truncate text-xs text-muted">
										{{ command.description }}
									</span>
								</span>
								<span
									:id="`${tileIdBase}-${command.name}`"
									class="flex shrink-0 flex-col items-end gap-1"
								>
									<span
										class="command-state"
										:class="
											isOn(command)
												? 'command-state--on'
												: 'command-state--off'
										"
									>
										<span
											class="size-1.5 rounded-full bg-current"
											aria-hidden="true"
										></span>
										{{
											isOn(command)
												? ts("guild_settings.commands.on")
												: ts("guild_settings.commands.off")
										}}
									</span>
									<span v-if="ruleCount(command) > 0" class="command-rules">
										<UIcon
											name="ic:round-key"
											class="size-3"
											aria-hidden="true"
										/>
										{{
											tc(
												"guild_settings.command_rules.editor.count",
												ruleCount(command),
											)
										}}
									</span>
									<span
										v-if="discordLabel(command)"
										class="command-rules"
										:title="discordLabel(command)"
									>
										<UIcon
											name="ic:round-discord"
											class="size-3"
											aria-hidden="true"
										/>
										<span aria-hidden="true">
											{{ ts("guild_settings.command_rules.discord.badge") }}
										</span>
										<span class="sr-only">{{ discordLabel(command) }}</span>
									</span>
								</span>
							</button>
						</div>

						<div
							class="mx-1 mt-1.5 flex flex-wrap justify-end gap-2 border-t border-(--home-border-subtle) pt-2 pb-2.5"
						>
							<UButton
								color="neutral"
								variant="solid"
								size="sm"
								@click="toggleAllInCategory(category, true)"
							>
								{{ ts("guild_settings.commands.enable_all") }}
							</UButton>
							<UButton
								color="neutral"
								variant="solid"
								size="sm"
								@click="toggleAllInCategory(category, false)"
							>
								{{ ts("guild_settings.commands.disable_all") }}
							</UButton>
							<UButton
								color="neutral"
								variant="outline"
								size="sm"
								@click="resetCategory(category)"
							>
								{{ ts("guild_settings.commands.reset") }}
							</UButton>
						</div>
					</template>
				</UCollapsible>
			</div>
		</GuildSettingsForm>
	</section>

	<section class="console-card" aria-labelledby="commands-channels-heading">
		<div class="flex items-center gap-3">
			<h3
				id="commands-channels-heading"
				class="text-[1.0625rem] font-semibold whitespace-nowrap"
			>
				{{ ts("guild_settings.commands.disabled_channels") }}
			</h3>
			<span class="h-px flex-1 bg-base-content/15" aria-hidden="true"></span>
		</div>
		<GuildSettingsForm
			:state="channelsState"
			:schema="channelsSchema"
			:map-to-guild-data="mapChannelsToGuildData"
			:aria-label="ts('guild_settings.commands.channels_form_aria')"
			class="mt-4 space-y-2"
			@error="onChannelsError"
		>
			<SelectChannels
				v-for="config in ConfigurableCommandChannels"
				:key="config.key"
				v-model="channelsState[config.key]"
				layout="add"
				:guild="guildData"
				:label="translateEntry(config, 'name')"
				:tooltip-title="translateEntry(config, 'description')"
			/>
		</GuildSettingsForm>
	</section>

	<GuildCommandsRuleEditor
		v-model:open="editorOpen"
		:command="editedCommand"
		:inherited="tileCommand ? inheritedRules(tileCommand) : []"
		:disabled-by="tileCommand ? disabledByGroup(tileCommand) : undefined"
		:staged-enabled="tileCommand ? stagedStatusOf(tileCommand.name) : undefined"
		:opener="editorOpener"
		@saved="onRuleSaved"
	/>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { DisableCommands } from "#shared/types";
import type { CommandRuleSaved } from "#shared/utils/command-rules";
import type { FormErrorEvent } from "@nuxt/ui";
import type * as v from "valibot";
import type { DisableableCommand } from "~/utils/command-settings";
// oxlint-disable-next-line typescript/consistent-type-imports
import { disabledCommandsSchema } from "#shared/schemas";

const { commands } = defineProps<{
	commands: FlattenedCommand[];
}>();

type Schema = v.InferOutput<typeof disabledCommandsSchema>;

// The category most servers come for; the others open on a click.
const DEFAULT_CATEGORY = "Moderation";

const { ts, tc } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { guildData } = useGuildData();
const { activeGuildId } = useActiveGuild();
const { guildSettings, originalGuildSettings, setGuildSettings } = useGuildSettings();

const {
	mapToGuildData: mapChannelsToGuildData,
	onError: onChannelsError,
	schema: channelsSchema,
	state: channelsState,
} = useSettingsForm({ many: ConfigurableCommandChannels.map((entry) => entry.key) });

const expandedCategory = ref<string | undefined>(DEFAULT_CATEGORY);
const tileIdBase = useId();
const everyId = useId();

const editorOpen = ref(false);
const editedCommand = ref<DisableableCommand | typeof EVERY_COMMAND | null>(null);
const editorOpener = ref<HTMLElement | null>(null);
/** The command of the tile the editor opened from; none for every command's rule. */
const tileCommand = computed(() =>
	editedCommand.value === EVERY_COMMAND ? null : editedCommand.value,
);

// One entry per command: the bot lists each subcommand on its own, but the
// settings turn off a whole command, by the name in `command`.
const disableableCommands = computed(() => listDisableableCommands(commands));

const state = reactive<Schema>(
	createDefaultState(disableableCommands.value, guildSettings.value?.commandsDisabled),
);

// Loading state
const loading = computed(() => !commands.length || !guildSettings.value);

const categories = computed(() =>
	[...new Set(disableableCommands.value.map((command) => command.category))].toSorted(),
);

// Helper to create default state from commands and settings
function createDefaultState(
	cmdList: DisableableCommand[],
	disabledCommands: string[] | undefined,
): Schema {
	const result: Record<string, DisableCommands.Command> = {};

	for (const command of cmdList) {
		result[command.name] = {
			category: command.category,
			description: command.description,
			isEnabled: !disabledCommands?.includes(command.name),
			name: command.name,
		};
	}

	return result;
}

function mapToGuildData(formState: Schema): Partial<GuildData> {
	// A group `/commands` disabled has no tile, and a save must not drop it.
	const disabledCommands = (originalGuildSettings.value?.commandsDisabled ?? []).filter(
		(name) => !(name in formState),
	);

	for (const key in formState) {
		const cmd = formState[key];
		if (cmd && !cmd.isEnabled) {
			disabledCommands.push(cmd.name);
		}
	}

	return { commandsDisabled: disabledCommands };
}

function toggleCommand(name: string, isEnabled: boolean) {
	const cmd = state[name];
	if (cmd) {
		state[name] = { ...cmd, isEnabled };
	}
}

/** What turns a command off besides its own tile: a group `/commands` disabled. */
function disabledByGroup(command: DisableableCommand): string | undefined {
	return guildSettings.value?.commandsDisabled.find(
		(name) => name !== command.name && matchesCommandRuleTarget(name, command),
	);
}

function isOn(command: DisableableCommand): boolean {
	return state[command.name]?.isEnabled === true && disabledByGroup(command) === undefined;
}

const guildId = computed(() => activeGuildId.value ?? "");
const rules = computed(() =>
	readCommandRules(guildSettings.value?.commandsRestrictions, guildId.value),
);

// What each tile counts: what the rules that match the command leave in force,
// its own and the ones of its groups.
const ruleCounts = computed(
	() =>
		new Map(
			disableableCommands.value.map((command) => [
				command.name,
				countCommandRuleEntries(
					resolveCommandRules(findMatchingCommandRules(rules.value, command)),
					guildId.value,
				),
			]),
		),
);

function ruleCount(command: DisableableCommand): number {
	return ruleCounts.value.get(command.name) ?? 0;
}

const everyRuleCount = computed(() =>
	countCommandRuleEntries([findCommandRule(rules.value, EVERY_COMMAND)], guildId.value),
);

// Whether Discord applies a rule too is read from Discord: nothing else stores it.
const discordPermissions = useCommandPermissions(activeGuildId);

function discordStateOf(target: string) {
	const commandId = discordPermissions.commandIdOf(target);
	if (!commandId) return "off";
	return commandDiscordState(
		discordPermissions.rowsOf(commandId),
		findCommandRule(rules.value, target),
		guildId.value,
	);
}

/** What a tile says of Discord: nothing while only WolfStar applies the command's rules. */
function discordLabel(command: DisableableCommand): string | undefined {
	switch (discordStateOf(command.name)) {
		case "matching":
			return ts("guild_settings.command_rules.discord.badge_matching");
		case "different":
			return ts("guild_settings.command_rules.discord.badge_different");
		case "off":
			return undefined;
	}
}

const everyDiscord = computed(() => {
	if (!discordPermissions.data.value) return undefined;
	switch (discordStateOf(EVERY_COMMAND)) {
		case "matching":
			return ts("guild_settings.command_rules.discord.badge_matching");
		case "different":
			return ts("guild_settings.command_rules.discord.badge_different");
		case "off":
			return ts("guild_settings.command_rules.discord.wolfstar_only");
	}
});

/** The rules of a command that its editor only shows: the ones of its groups. */
function inheritedRules(command: DisableableCommand) {
	return findMatchingCommandRules(rules.value, command).filter(
		(rule) => rule.command !== command.name,
	);
}

function getCommandsByCategory(category: string): DisableableCommand[] {
	return disableableCommands.value.filter((command) => command.category === category);
}

function toggleAllInCategory(category: string, enable: boolean) {
	const commands = getCommandsByCategory(category);
	for (const command of commands) {
		toggleCommand(command.name, enable);
	}
}

function enabledIn(category: string): number {
	return getCommandsByCategory(category).filter(isOn).length;
}

function isCategoryOpen(category: string): boolean {
	return expandedCategory.value === category;
}

function toggleCategory(category: string): void {
	expandedCategory.value = isCategoryOpen(category) ? undefined : category;
}

function resetCategory(category: string) {
	const commands = getCommandsByCategory(category);
	for (const command of commands) {
		toggleCommand(command.name, !guildSettings.value?.commandsDisabled.includes(command.name));
	}

	toast.add({
		color: "info",
		description: ts("guild_settings.commands.category_reset_description", { category }),
		icon: "i-heroicons-arrow-path",
		title: ts("guild_settings.commands.category_reset"),
	});
}

/** A tile's status when it differs from the stored one, so it is not saved yet. */
function stagedStatusOf(name: string): boolean | undefined {
	const isEnabled = state[name]?.isEnabled;
	const storedEnabled = !originalGuildSettings.value?.commandsDisabled.includes(name);
	return isEnabled === undefined || isEnabled === storedEnabled ? undefined : isEnabled;
}

function openEditor(command: DisableableCommand | typeof EVERY_COMMAND, event?: MouseEvent) {
	editedCommand.value = command;
	editorOpener.value = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
	editorOpen.value = true;
}

// Back from the sign-in that lets the editor write to Discord: its command opens
// again, once the page is there for the dialog to open over.
onMounted(() => {
	watch(
		() => [loading.value, route.query.rules] as const,
		([isLoading, ruled]) => {
			if (isLoading || typeof ruled !== "string") return;
			const command =
				ruled === EVERY_COMMAND
					? EVERY_COMMAND
					: disableableCommands.value.find((entry) => entry.name === ruled);
			if (command) openEditor(command);
			const { rules: _, ...query } = route.query;
			void router.replace({ query });
		},
		{ immediate: true },
	);
});

/**
 * Takes in what the editor saved. The tiles' form rebases when the stored
 * disabled commands change, so the tiles are set to them first, and the toggles
 * of other tiles not saved yet are made again after, to stay staged.
 */
function onRuleSaved(saved: CommandRuleSaved, guildId: string) {
	const current = originalGuildSettings.value;
	if (!current || guildId !== activeGuildId.value) return;

	const staged = Object.values(state)
		.filter(
			(command) =>
				command.name !== saved.command &&
				command.isEnabled === current.commandsDisabled.includes(command.name),
		)
		.map((command) => [command.name, command.isEnabled] as const);

	Object.assign(state, createDefaultState(disableableCommands.value, saved.commandsDisabled));
	setGuildSettings(
		{
			...current,
			commandsDisabled: saved.commandsDisabled,
			commandsRestrictions: saved.commandsRestrictions,
		},
		guildId,
	);
	for (const [name, isEnabled] of staged) toggleCommand(name, isEnabled);
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: ts("guild_settings.commands.save_failed", {
			message: errorMessage ?? ts("guild_settings.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}

// Watch for loading state change to hydrate local state (immediate mode)
watch(
	loading,
	(isLoading) => {
		if (!isLoading && guildSettings.value) {
			const newValues = createDefaultState(
				disableableCommands.value,
				guildSettings.value.commandsDisabled,
			);

			// Remove stale keys not in new values
			for (const key in state) {
				if (!(key in newValues)) {
					delete state[key];
				}
			}

			// Assign new values
			Object.assign(state, newValues);
		}
	},
	{ immediate: true },
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.command-every {
	@apply mb-1.5 flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] px-3.5 py-3 text-left sm:flex-nowrap;
	border: 1px solid var(--field-border);
	background-color: var(--console-surface, transparent);
}

.command-every:hover {
	background-color: var(--console-hover);
}

.command-every:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

/* On a phone the pills take a line of their own under the text, lined up with
   it past the tile: kept on the row, they squeezed the text to a word a line
   and drew over it. */
.command-every-pills {
	@apply order-last flex w-full flex-wrap gap-1.5 ps-12 sm:order-none sm:w-auto sm:shrink-0 sm:justify-end sm:ps-0;
}

.command-every-tile {
	@apply flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary;
}

.command-pill {
	@apply inline-flex h-6 items-center gap-1.5 rounded-full bg-base-content/8 px-2.25 text-xs font-semibold whitespace-nowrap text-toned;
}

.command-category {
	@apply flex min-h-11 w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-2 py-1.5 text-left;
}

.command-category:hover {
	background-color: var(--console-hover);
}

.command-category:focus-visible,
.command-tile:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}

.command-tile {
	@apply flex min-h-13.5 min-w-0 cursor-pointer items-center gap-3 rounded-lg bg-transparent px-3 py-2.5 text-left;
	border: 1px solid var(--home-border-subtle);
}

.command-tile:hover {
	background-color: var(--console-hover);
}

.command-tile--off {
	@apply opacity-60;
}

.command-state {
	@apply inline-flex h-5.5 items-center gap-1.5 rounded-full px-2 text-[0.6875rem] font-semibold;
}

.command-rules {
	@apply inline-flex items-center gap-1 text-[0.6875rem] whitespace-nowrap text-muted;
}

.command-state--on {
	background-color: oklch(from var(--color-success) l c h / 0.16);
	color: var(--color-success);
}

.command-state--off {
	background-color: var(--console-input);
	color: var(--ui-text-muted);
}
</style>
