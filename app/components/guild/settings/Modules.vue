<template>
	<DashboardPageHeader
		:title="ts('guild_settings.modules.title')"
		:description="ts('guild_settings.modules.subtitle')"
	>
		<UBadge color="primary" variant="soft" size="lg" class="font-semibold">
			{{
				ts("guild_settings.modules.enabled_count", {
					enabled: enabledCount,
					total: MODULE_SWITCH_KEYS.length,
				})
			}}
		</UBadge>
		<UButton color="neutral" variant="outline" size="sm" @click="setAll(true)">
			{{ ts("guild_settings.modules.enable_all") }}
		</UButton>
		<UButton color="neutral" variant="outline" size="sm" @click="setAll(false)">
			{{ ts("guild_settings.modules.disable_all") }}
		</UButton>
	</DashboardPageHeader>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.modules.form_aria')"
		@error="onError"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<UFormField
				v-for="module in moduleCards"
				:key="module.section"
				:name="module.kind === 'setup' ? undefined : module.key"
				class="console-card flex flex-col transition-opacity"
				:ui="{ container: 'flex h-full flex-1 flex-col' }"
			>
				<div class="flex items-start justify-between gap-3">
					<span
						class="flex size-11 shrink-0 items-center justify-center rounded-lg"
						:class="
							isOn(module)
								? 'bg-primary/15 text-primary'
								: 'bg-base-content/8 text-muted'
						"
						aria-hidden="true"
					>
						<UIcon :name="module.icon" class="size-5.5" />
					</span>
					<div class="flex shrink-0 items-center gap-2.5">
						<UBadge
							v-if="module.kind !== 'switch'"
							:color="isOn(module) ? 'success' : 'neutral'"
							variant="subtle"
							class="font-semibold"
						>
							{{ statusLabel(module) }}
						</UBadge>
						<USwitch
							v-if="module.kind !== 'setup'"
							v-model="state[module.key]"
							class="shrink-0"
							:aria-label="
								ts('guild_settings.modules.toggle_aria', {
									title: ts(module.labelKey),
								})
							"
						/>
					</div>
				</div>
				<div
					class="mt-3 min-w-0 flex-1"
					:class="{ 'opacity-60': module.kind !== 'setup' && !state[module.key] }"
				>
					<p class="text-base font-bold">{{ ts(module.labelKey) }}</p>
					<p class="mt-1 text-[0.8125rem] leading-snug text-muted">
						{{ ts(module.descriptionKey) }}
					</p>
					<p
						v-if="module.noteKey"
						class="mt-2 flex items-start gap-1.5 text-xs leading-snug text-muted"
					>
						<UIcon
							name="lucide:info"
							class="mt-px size-3.5 shrink-0"
							aria-hidden="true"
						/>
						<span>{{ ts(module.noteKey) }}</span>
					</p>
				</div>
				<div class="mt-4 flex justify-end">
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						:disabled="module.kind === 'switch' && !isOn(module)"
						@click="goToSection(module.section)"
					>
						{{
							module.kind === "switch" && !isOn(module)
								? ts("guild_settings.modules.enable_first")
								: ts("guild_settings.modules.configure")
						}}
					</UButton>
				</div>
			</UFormField>

			<section
				v-for="module in announcedModules"
				:key="module.slug"
				class="console-card flex flex-col"
				:aria-label="ts(module.labelKey)"
			>
				<div class="flex items-start justify-between gap-3">
					<span
						class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-base-content/8 text-muted"
						aria-hidden="true"
					>
						<UIcon :name="module.icon" class="size-5.5" />
					</span>
					<UBadge color="neutral" variant="subtle" class="font-semibold">
						{{ ts("dashboard.coming_soon.badge") }}
					</UBadge>
				</div>
				<div class="mt-3 min-w-0 flex-1 opacity-60">
					<p class="text-base font-bold">{{ ts(module.labelKey) }}</p>
					<p
						v-if="module.descriptionKey"
						class="mt-1 text-[0.8125rem] leading-snug text-muted"
					>
						{{ ts(module.descriptionKey) }}
					</p>
				</div>
				<div class="mt-4 flex justify-end">
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						@click="goToSection(module.slug)"
					>
						{{ ts("dashboard.coming_soon.learn_more") }}
					</UButton>
				</div>
			</section>
		</div>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
import type { GuildModuleDefinition, GuildModuleEntry } from "#shared/utils/guild-modules";
import type { AutoChannelSlug } from "~/composables/useAutoChannels";
import { GUILD_MODULES, MODULE_SWITCH_KEYS } from "#shared/utils/guild-modules";

const { tc, ts } = useI18n();
const { goToSection } = useDashboardNavigation();
const { guildSettings } = useGuildSettings();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	toggles: MODULE_SWITCH_KEYS,
});

interface ModuleCard {
	descriptionKey: string;
	icon: string;
	labelKey: string;
	/** A line under the description, for what the switch does not do yet. */
	noteKey?: string;
	section: string;
}

/** A module switched here: a flag of `Modules`, or the switch of its own table. */
interface SwitchModuleCard extends ModuleCard {
	kind: "switch";
	key: (typeof MODULE_SWITCH_KEYS)[number];
}

/** A module the bot sets up in Discord, on once it has what it needs. */
interface SetupModuleCard extends ModuleCard {
	kind: "setup";
}

/** A module that is a list of channels, with a switch that stops them all. */
interface ListModuleCard extends ModuleCard {
	kind: "list";
	key: (typeof MODULE_SWITCH_KEYS)[number];
	section: AutoChannelSlug;
}

type AnyModuleCard = SwitchModuleCard | SetupModuleCard | ListModuleCard;

// In the order of the sidebar: the `Modules` flags, then the modules with a
// table of their own.
const moduleCards: AnyModuleCard[] = [
	...GUILD_MODULES.map(
		// No entry has a note today, so the entries' own type has no `noteKey`.
		(module: GuildModuleEntry & Pick<GuildModuleDefinition, "noteKey">): SwitchModuleCard => ({
			descriptionKey: module.descriptionKey,
			icon: module.icon,
			key: module.key,
			kind: "switch",
			labelKey: module.labelKey,
			noteKey: module.noteKey,
			section: module.section,
		}),
	),
	{
		descriptionKey: "guild_settings.modules.descriptions.honeypot",
		icon: "lucide:hexagon",
		kind: "setup",
		labelKey: "dashboard.nav.honeypot",
		section: "honeypot",
	},
	{
		descriptionKey: "guild_settings.modules.descriptions.appeals",
		icon: "lucide:scale",
		key: "appealsEnabled",
		kind: "switch",
		labelKey: "dashboard.nav.appeals",
		section: "appeals",
	},
	{
		descriptionKey: "guild_settings.modules.descriptions.autodelete",
		icon: "lucide:timer",
		key: "modulesAutodelete",
		kind: "list",
		labelKey: "dashboard.nav.autodelete",
		section: "autodelete",
	},
	{
		descriptionKey: "guild_settings.modules.descriptions.autopurge",
		icon: "lucide:eraser",
		key: "modulesAutopurge",
		kind: "list",
		labelKey: "dashboard.nav.autopurge",
		section: "autopurge",
	},
	{
		descriptionKey: "guild_settings.modules.descriptions.automessage",
		icon: "lucide:message-square-reply",
		key: "modulesAutomessage",
		kind: "list",
		labelKey: "dashboard.nav.automessage",
		section: "automessage",
	},
];

// The lists are read here for their counts; their sections share the cache.
const { activeGuildId } = useActiveGuild();
const lists = {
	autodelete: useAutoChannels("autodelete", activeGuildId),
	automessage: useAutoChannels("automessage", activeGuildId),
	autopurge: useAutoChannels("autopurge", activeGuildId),
} satisfies Record<AutoChannelSlug, { rows: Ref<readonly unknown[]> }>;

function isOn(module: AnyModuleCard): boolean {
	// The honeypot is the one module set up in Discord: it is on with a channel.
	if (module.kind === "setup") return Boolean(guildSettings.value?.honeypotChannel);
	// Its channels do nothing while the switch is off.
	if (module.kind === "list") {
		return state[module.key] === true && lists[module.section].rows.value.length > 0;
	}
	return state[module.key] === true;
}

function statusLabel(module: SetupModuleCard | ListModuleCard): string {
	if (module.kind === "list") {
		return tc("guild_settings.modules.channel_count", lists[module.section].rows.value.length);
	}
	return isOn(module)
		? ts("guild_settings.modules.set_up")
		: ts("guild_settings.modules.not_set_up");
}

// Modules the bot has and the dashboard cannot configure yet.
const announcedModules = DASHBOARD_NAV.filter((item) => item.comingSoon);

const enabledCount = computed(() => countEnabledModules(state));

function setAll(enabled: boolean) {
	for (const key of MODULE_SWITCH_KEYS) {
		state[key] = enabled;
	}
}
</script>
