<template>
	<UDashboardPanel id="app">
		<template #header>
			<UDashboardNavbar :title="navbarTitle" :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
				<template #right>
					<span
						v-if="activeGuildId && guildData?.name"
						class="hidden max-w-48 truncate text-sm text-base-content/60 sm:inline"
					>
						· {{ guildData.name }}
					</span>
					<UBadge v-if="hasStagedChanges" color="warning" variant="subtle" size="sm">
						{{ ts("dashboard.unsaved_title") }}
					</UBadge>
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<ClientOnly>
				<GuildPicker v-if="!activeGuildId" />
				<GuildLogsPanel v-else-if="isLogsSection" />
				<component
					:is="renderComponent"
					v-else
					:key="`${activeGuildId}:${section}`"
					:commands="commands"
					:languages="languages"
				/>
				<template #fallback>
					<div class="flex h-48 items-center justify-center">
						<UIcon
							name="heroicons:arrow-path"
							class="size-8 animate-spin text-primary"
						/>
					</div>
				</template>
			</ClientOnly>
		</template>
	</UDashboardPanel>
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

// Section slug -> sidebar label, so the navbar and the document title read like the sidebar.
const SECTION_LABEL_KEYS: Record<string, string> = {
	"channels": "dashboard.nav.channels",
	"commands": "dashboard.nav.commands",
	"events": "dashboard.nav.events",
	"logs": "dashboard.nav.logs",
	"moderation": "dashboard.nav.moderation",
	"moderation/capitals": "dashboard.nav.capitals",
	"moderation/invites": "dashboard.nav.invites",
	"moderation/lines": "dashboard.nav.line_spam",
	"moderation/links": "dashboard.nav.links",
	"moderation/messages": "dashboard.nav.message_duplication",
	"moderation/reactions": "dashboard.nav.reactions",
	"moderation/word": "dashboard.nav.bad_words",
	"modules": "dashboard.nav.modules",
	"roles": "dashboard.nav.roles",
};

const isLogsSection = computed(() => section.value === "logs");
const renderComponent = computed(() => asyncComponentMap[section.value] ?? defaultComponent);

const sectionLabel = computed(() => {
	const key = SECTION_LABEL_KEYS[section.value];
	return key ? ts(key) : ts("guild_manage.general");
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
