<template>
	<main class="flex min-h-0 flex-1 flex-col">
		<header class="console-header">
			<UButton
				class="sm:hidden"
				color="neutral"
				variant="ghost"
				size="lg"
				icon="ic:round-arrow-back-ios-new"
				:aria-label="ts('dashboard.phone.back')"
				@click="openList"
			/>
			<div class="min-w-0 sm:flex sm:items-baseline sm:gap-2">
				<!-- Focused when a phone opens the page, so it is announced. -->
				<h1
					tabindex="-1"
					class="truncate text-[0.9375rem] leading-tight font-bold sm:text-base"
				>
					{{ navbarTitle }}
				</h1>
				<p
					v-if="navbarSubtitle"
					class="truncate text-xs leading-tight text-muted sm:text-[0.8125rem]"
				>
					<span class="hidden sm:inline" aria-hidden="true">· </span>{{ navbarSubtitle }}
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

		<!-- The Home is a conversation: it scrolls its own log above the footer. -->
		<ClientOnly v-if="!activeGuildId">
			<DashboardDirectMessageThread>
				<template #notice>
					<DashboardServersNotice />
				</template>
			</DashboardDirectMessageThread>
		</ClientOnly>
		<div v-else class="console-content">
			<ClientOnly>
				<div class="flex flex-col gap-5">
					<DashboardSkeleton v-if="!isGuildLoaded" :kind="skeletonKind" />
					<GuildLogsPanel v-else-if="isLogsSection" />
					<component
						:is="renderComponent"
						v-else
						:key="`${activeGuildId}:${section}`"
						v-bind="sectionProps"
					/>
				</div>
				<template #fallback>
					<DashboardSkeleton :kind="skeletonKind" />
				</template>
			</ClientOnly>
		</div>

		<!-- A server with no settings yet is set up in a dialog over whatever is open. -->
		<ClientOnly>
			<GuildSetupWizard v-if="activeGuildId" />
		</ClientOnly>
	</main>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { DashboardSkeleton } from "#components";
import * as Sentry from "@sentry/nuxt";

definePageMeta({
	auth: "user",
	layout: "dashboard",
	path: "/app",
});

const { ts } = useI18n();
const toast = useToast();
const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const { activeGuildId, hasStagedChanges, section } = useDashboardNavigation();
const { openList } = usePhoneScreen();

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

// The layout fetches the server and its settings; until both are in, the
// section is drawn as a skeleton of its own shape.
const isGuildLoaded = computed(
	() =>
		!!guildData.value &&
		Object.keys(guildData.value).length > 0 &&
		!!guildSettings.value &&
		Object.keys(guildSettings.value).length > 0,
);
const skeletonKind = computed(() => dashboardSkeletonKind(section.value));

// A section's code is loaded on its first opening; the skeleton stands in for
// it when that takes a moment.
function sectionComponent(loader: () => Promise<Component>, kind: DashboardSkeletonKind) {
	return defineAsyncComponent({
		delay: 150,
		loader,
		loadingComponent: h(DashboardSkeleton, { kind }),
	});
}

// Pre-define async components outside of computed to avoid re-creating
// wrapper instances on every reactive update, which would unmount/remount.
const asyncComponentMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
	access: sectionComponent(() => import("~/components/guild/settings/Access.vue"), "form"),
	appeals: sectionComponent(() => import("~/components/guild/settings/Appeals.vue"), "form"),
	autodelete: sectionComponent(
		() => import("~/components/guild/settings/AutoDelete.vue"),
		"table",
	),
	automessage: sectionComponent(
		() => import("~/components/guild/settings/AutoMessage.vue"),
		"form",
	),
	automod: sectionComponent(() => import("~/components/guild/settings/Automod.vue"), "table"),
	autopurge: sectionComponent(() => import("~/components/guild/settings/AutoPurge.vue"), "table"),
	channels: sectionComponent(() => import("~/components/guild/settings/Channels.vue"), "form"),
	commands: sectionComponent(() => import("~/components/guild/settings/Commands.vue"), "form"),
	moderation: sectionComponent(
		() => import("~/components/guild/settings/Moderation.vue"),
		"form",
	),
	honeypot: sectionComponent(() => import("~/components/guild/settings/Honeypot.vue"), "form"),
	modules: sectionComponent(() => import("~/components/guild/settings/Modules.vue"), "modules"),
	roles: sectionComponent(() => import("~/components/guild/settings/Roles.vue"), "form"),
};
const comingSoonComponent = defineAsyncComponent(
	() => import("~/components/dashboard/ComingSoon.vue"),
);
const defaultComponent = sectionComponent(
	() => import("~/components/guild/settings/General.vue"),
	"overview",
);

const isLogsSection = computed(() => section.value === "logs");
const renderComponent = computed(() => {
	if (findDashboardNavItem(section.value)?.comingSoon) {
		return comingSoonComponent;
	}
	return asyncComponentMap[section.value] ?? defaultComponent;
});

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

const { thread } = useDirectMessages();
const navbarTitle = computed(() =>
	activeGuildId.value ? sectionLabel.value : (thread.value?.name ?? ts("dashboard.dm.title")),
);
const navbarSubtitle = computed(() =>
	activeGuildId.value ? guildData.value?.name : ts("dashboard.dm.direct_message"),
);
const title = computed(() =>
	activeGuildId.value
		? `${sectionLabel.value} · ${guildData.value?.name ?? ""}`
		: `${navbarTitle.value} · ${ts("dashboard.dm.title")}`,
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

/* On a phone the page leaves room to scroll clear of the floating context card. */
.console-content {
	@apply min-h-0 flex-1 overflow-y-auto p-3.5 pb-24 sm:p-5.5;
}

.console-unsaved {
	@apply inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-warning px-2.5 text-xs font-bold whitespace-nowrap text-warning-content;
}
</style>
