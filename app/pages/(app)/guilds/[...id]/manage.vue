<template>
	<UDashboardPanel id="home">
		<template #header>
			<UDashboardNavbar :title="sectionLabel" :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
				<template #right>
					<span
						v-if="guildData?.name"
						class="hidden max-w-48 truncate text-sm text-base-content/60 sm:inline"
					>
						· {{ guildData.name }}
					</span>
					<UBadge v-if="hasUnsavedChanges" color="warning" variant="subtle" size="sm">
						{{ ts("dashboard.unsaved_title") }}
					</UBadge>
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<ClientOnly>
				<component :is="renderComponent" :commands="commands" :languages="languages" />
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
	path: "/guilds/:id/manage/:slug(.*)*",
});

const { ts } = useI18n();
const route = useRoute();
const toast = useToast();
const { guildData } = useGuildData();
const { guildSettingsChanges } = useGuildSettingsChanges();

const hasUnsavedChanges = computed(
	() =>
		guildSettingsChanges.value !== undefined &&
		Object.keys(guildSettingsChanges.value).length > 0,
);

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

const idParam = route.params.id;
const joinedPath = computed(() => (Array.isArray(idParam) ? idParam.join("/") : idParam || ""));

// Section slug -> sidebar label, so the navbar and the document title read like the sidebar.
const SECTION_LABEL_KEYS: Record<string, string> = {
	"channels": "dashboard.nav.channels",
	"commands": "dashboard.nav.commands",
	"events": "dashboard.nav.events",
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

const sectionLabel = computed(() => {
	const key = SECTION_LABEL_KEYS[joinedPath.value];
	return key ? ts(key) : ts("guild_manage.general");
});

const title = computed(() => `${sectionLabel.value} · ${guildData.value?.name ?? ""}`);

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

const renderComponent = computed(() => asyncComponentMap[joinedPath.value] ?? defaultComponent);

// Fetch only the data required by the active section.
// Channels / Events / Roles do not use commands or languages, so we skip
// the network round-trips entirely.
onMounted(() => {
	const section = joinedPath.value || "general";
	Sentry.metrics.count("dashboard.section.view", 1, {
		attributes: { section, guild_id: guildData.value?.id ?? "unknown" },
	});
	Sentry.addBreadcrumb({
		category: "navigation",
		message: `Dashboard section: ${section}`,
		level: "info",
	});

	switch (joinedPath.value) {
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
});

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
