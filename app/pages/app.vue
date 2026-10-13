<template>
	<main class="flex min-h-0 flex-1 flex-col">
		<header class="console-header">
			<UButton
				class="sm:hidden"
				color="neutral"
				variant="ghost"
				size="lg"
				icon="ic:round-menu"
				:aria-label="ts('dashboard.nav_menu')"
				:aria-expanded="drawerOpen"
				@click="toggleDrawer"
			/>
			<div class="min-w-0 sm:flex sm:items-baseline sm:gap-2">
				<h1 class="truncate text-[0.9375rem] leading-tight font-bold sm:text-base">
					{{ navbarTitle }}
				</h1>
				<p
					v-if="activeGuildId && guildData?.name"
					class="truncate text-xs leading-tight text-muted sm:text-[0.8125rem]"
				>
					<span class="hidden sm:inline" aria-hidden="true">· </span>{{ guildData.name }}
				</p>
			</div>
			<span class="flex-1"></span>
			<span v-if="hasStagedChanges" role="status" class="console-unsaved">
				<span
					class="size-1.75 rounded-full bg-warning-content/55"
					aria-hidden="true"
				></span>
				<span class="hidden sm:inline">{{ ts("dashboard.unsaved_title") }}</span>
				<span class="sm:hidden">{{ ts("dashboard.unsaved_short") }}</span>
			</span>
		</header>

		<div class="console-content">
			<ClientOnly>
				<div class="flex flex-col gap-5">
					<GuildPicker v-if="!activeGuildId" />
					<GuildLogsPanel v-else-if="isLogsSection" />
					<component
						:is="renderComponent"
						v-else
						:key="`${activeGuildId}:${section}`"
						v-bind="sectionProps"
					/>
				</div>
				<template #fallback>
					<div class="flex h-48 items-center justify-center">
						<UIcon
							name="heroicons:arrow-path"
							class="size-8 animate-spin text-primary"
						/>
					</div>
				</template>
			</ClientOnly>
		</div>
	</main>
</template>

<script setup lang="ts">
import * as Sentry from "@sentry/nuxt";

definePageMeta({
	auth: "user",
	layout: "dashboard",
	path: "/app",
});

const { ts } = useI18n();
const toast = useToast();
const { guildData } = useGuildData();
const { activeGuildId, hasStagedChanges, section } = useDashboardNavigation();
const { open: drawerOpen, toggle: toggleDrawer } = useDashboardDrawer();

const {
	data: commands,
	refresh: refreshCommands,
	error: commandsError,
} = useCommands({ immediate: false });
const {
	data: languages,
	refresh: refreshLanguages,
	error: languagesError,
} = useLanguages({ immediate: false });

// Pre-define async components outside of computed to avoid re-creating
// wrapper instances on every reactive update, which would unmount/remount.
const asyncComponentMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
	"channels": defineAsyncComponent(() => import("~/components/guild/settings/Channels.vue")),
	"commands": defineAsyncComponent(
		() => import("~/components/guild/settings/DisabledCommands.vue"),
	),
	"events": defineAsyncComponent(() => import("~/components/guild/settings/Events.vue")),
	"moderation": defineAsyncComponent(() => import("~/components/guild/settings/Moderation.vue")),
	"modules": defineAsyncComponent(() => import("~/components/guild/settings/Modules.vue")),
	"roles": defineAsyncComponent(() => import("~/components/guild/settings/Roles.vue")),
	"moderation/word": defineAsyncComponent(
		() => import("~/components/guild/settings/filter/Word.vue"),
	),
	"moderation/capitals": defineAsyncComponent(
		() => import("~/components/guild/settings/filter/Capitals.vue"),
	),
	"moderation/invites": defineAsyncComponent(
		() => import("~/components/guild/settings/filter/Invites.vue"),
	),
	"moderation/links": defineAsyncComponent(
		() => import("~/components/guild/settings/filter/Links.vue"),
	),
	"moderation/messages": defineAsyncComponent(
		() => import("~/components/guild/settings/filter/MessageDuplication.vue"),
	),
	"moderation/lines": defineAsyncComponent(
		() => import("~/components/guild/settings/filter/NewLine.vue"),
	),
	"moderation/reactions": defineAsyncComponent(
		() => import("~/components/guild/settings/filter/Reactions.vue"),
	),
};
const defaultComponent = defineAsyncComponent(
	() => import("~/components/guild/settings/General.vue"),
);

const isLogsSection = computed(() => section.value === "logs");
const renderComponent = computed(() => asyncComponentMap[section.value] ?? defaultComponent);

// The navbar and the document title read like the sidebar.
const sectionLabel = computed(() => {
	const item = findDashboardNavItem(section.value);
	return ts(item?.labelKey ?? "dashboard.nav.overview");
});
// Each section declares only the data it reads, so it is handed only that.
const sectionProps = computed(() => {
	if (renderComponent.value === defaultComponent) {
		return { languages: languages.value };
	}
	return section.value === "commands" ? { commands: commands.value } : {};
});

const navbarTitle = computed(() =>
	activeGuildId.value ? sectionLabel.value : ts("dashboard.picker.title"),
);
const title = computed(() =>
	activeGuildId.value
		? `${sectionLabel.value} · ${guildData.value?.name ?? ""}`
		: ts("dashboard.picker.title"),
);

// Fetch only the data required by the active section.
// Channels / Events / Roles do not use commands or languages, so we skip
// the network round-trips entirely.
watch(
	[activeGuildId, section],
	([guildId, currentSection]) => {
		if (!guildId) {
			return;
		}
		const sectionName = currentSection || "general";
		Sentry.metrics.count("dashboard.section.view", 1, {
			attributes: { section: sectionName, guild_id: guildId },
		});
		Sentry.addBreadcrumb({
			category: "navigation",
			message: `Dashboard section: ${sectionName}`,
			level: "info",
		});

		switch (currentSection) {
			case "": {
				void Sentry.startSpan({ name: "dashboard.fetch.languages", op: "ui.fetch" }, () =>
					refreshLanguages(),
				);
				break;
			}
			case "commands": {
				void Sentry.startSpan({ name: "dashboard.fetch.commands", op: "ui.fetch" }, () =>
					refreshCommands(),
				);
				break;
			}
			default: {
				break;
			}
		}
	},
	{ immediate: true },
);

watch([commandsError, languagesError], ([commandsErr, languagesErr]) => {
	if (commandsErr) {
		Sentry.metrics.count("dashboard.fetch.error", 1, {
			attributes: { type: "commands" },
		});
		toast.add({
			closeIcon: "heroicons:x-mark",
			color: "error",
			description: commandsErr.message || ts("guild_manage.commands_unavailable_description"),
			duration: 3000,
			icon: "heroicons:exclamation-triangle",
			title: ts("guild_manage.commands_unavailable_title"),
		});
		log.error({
			tag: "wolfstar:dashboard",
			message: "Error fetching commands",
			error: commandsErr.message,
		});
	}

	if (languagesErr) {
		Sentry.metrics.count("dashboard.fetch.error", 1, {
			attributes: { type: "languages" },
		});
		toast.add({
			closeIcon: "heroicons:x-mark",
			color: "error",
			description:
				languagesErr.message || ts("guild_manage.languages_unavailable_description"),
			duration: 3000,
			icon: "heroicons:exclamation-triangle",
			title: ts("guild_manage.languages_unavailable_title"),
		});
		log.error({
			tag: "wolfstar:dashboard",
			message: "Error fetching languages",
			error: languagesErr.message,
		});
	}
});

useSeoMeta({
	title: () => title.value,
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.console-header {
	@apply flex h-13 shrink-0 items-center gap-2.5 px-2 sm:h-12 sm:pr-3 sm:pl-3.5;
	border-bottom: 1px solid var(--home-border-subtle);
	box-shadow: var(--console-shadow-low);
}

.console-content {
	@apply min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-5.5;
}

.console-unsaved {
	@apply inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-warning px-2.5 text-xs font-bold whitespace-nowrap text-warning-content;
}
</style>
