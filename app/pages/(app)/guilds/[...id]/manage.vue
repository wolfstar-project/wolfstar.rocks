<template>
	<UDashboardPanel id="home">
		<template #header>
			<UDashboardNavbar :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
				<template #right>
					<UTooltip text="Notifications" :shortcuts="['N']">
						<UButton
							color="neutral"
							variant="ghost"
							square
							aria-label="Open notifications panel"
							@click="isNotificationsSlideoverOpen = true"
						>
							<UChip color="error" inset>
								<UIcon
									name="lucide:bell"
									class="size-5 shrink-0"
									aria-hidden="true"
								/>
							</UChip>
						</UButton>
					</UTooltip>
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
definePageMeta({
	auth: {
		required: true,
	},
	layout: "dashboard",
	path: "/guilds/:id/manage/:slug(.*)*",
});


const route = useRoute();
const { isNotificationsSlideoverOpen } = useDashboardLayout();
const toast = useToast();
const logger = useLogger("wolfstar:manage");
const { guildData } = useGuildData();


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


const slug = route.params.slug as string | string[];


const joinedPath = computed(() => (Array.isArray(slug) ? slug.join("/") : slug || ""));


const title = ref(
	`${joinedPath.value.startsWith("moderation/") ? joinedPath.value.replace("moderation/", "") : joinedPath.value || "General"} · ${guildData.value.name}`,
);


// Pre-define async components outside of computed to avoid re-creating
// wrapper instances on every reactive update, which would unmount/remount.
const asyncComponentMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
	"channels": defineAsyncComponent(() => import("~/components/guild/settings/Channels.vue")),
	"commands": defineAsyncComponent(
		() => import("~/components/guild/settings/DisabledCommands.vue"),
	),
	"events": defineAsyncComponent(() => import("~/components/guild/settings/Events.vue")),
	"moderation": defineAsyncComponent(() => import("~/components/guild/settings/Moderation.vue")),
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
	switch (joinedPath.value) {
		case "": {
			void refreshLanguages();
			break;
		}
		case "commands": {
			void refreshCommands();
			break;
		}
		default: {
			break;
		}
	}
});


watch(commandsError, (error) => {
	if (error) {
		toast.add({
			closeIcon: "heroicons:x-mark",
			color: "error",
			description: error.message || "Couldn't load the command list. Try refreshing.",
			duration: 3000,
			icon: "heroicons:exclamation-triangle",
			title: "Commands Unavailable",
		});
		logger.error("Error fetching commands:", error);
	}
});


watch(languagesError, (error) => {
	if (error) {
		toast.add({
			closeIcon: "heroicons:x-mark",
			color: "error",
			description: error.message || "Couldn't load the language list. Try refreshing.",
			duration: 3000,
			icon: "heroicons:exclamation-triangle",
			title: "Languages Unavailable",
		});
		logger.error("Error fetching languages:", error);
	}
});


useHead({
	title: () => title.value,
});
</script>
