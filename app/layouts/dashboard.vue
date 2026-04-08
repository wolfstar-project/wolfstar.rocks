<template>
	<UDashboardGroup unit="rem">
		<UDashboardSidebar
			id="default"
			collapsible
			resizable
			:ui="{
				header: 'bg-base-200/80',
				body: 'bg-base-200/80 border-r border-base-200',
				footer: 'bg-base-200/80 border-t border-b border-base-200',
			}"
		>
			<template #header="{ collapsed }">
				<div v-if="guildData" class="flex cursor-pointer items-center gap-0.5">
					<UAvatar :src :alt="guildData.name" class="mr-2" />
					<h1 v-if="!collapsed" class="text-lg font-semibold">{{ guildData.name }}</h1>
				</div>
				<div v-else class="flex h-10 items-center justify-center">
					<USkeleton class="mr-2 h-10 w-10 rounded-full" />
					<div v-if="!collapsed" class="ms-2">
						<USkeleton class="h-4 w-24 rounded" />
					</div>
				</div>
			</template>
			<template #default="{ collapsed }">
				<UNavigationMenu
					:collapsed="collapsed"
					:items="items[0]"
					orientation="vertical"
					tooltip
					popover
				/>

				<UNavigationMenu
					:collapsed="collapsed"
					:items="items[1]"
					orientation="vertical"
					tooltip
					class="mt-auto"
				/>
			</template>

			<template #footer="{ collapsed }">
				<UserMenu :collapsed="collapsed" />
			</template>
		</UDashboardSidebar>

		<slot v-if="isReadyToRender"></slot>
		<div
			v-else-if="nuxtError"
			class="flex min-h-screen w-full flex-col items-center justify-center space-y-4 px-4 text-center"
			role="alert"
			aria-label="Error loading dashboard"
		>
			<UIcon name="ph:warning-duotone" class="size-12 text-error" aria-hidden="true" />
			<div class="space-y-2">
				<h2 class="text-xl font-semibold text-base-content">
					{{ nuxtError.statusMessage || "Error Loading Dashboard" }}
				</h2>
				<p v-if="nuxtError.status === 403">
					You don't have permission to access this server's dashboard. Make sure you have
					the Manage Server permission and try again.
				</p>
				<p class="text-sm text-base-content/60">
					{{
						nuxtError.message ||
						"Something went wrong while loading the dashboard. Please try again, or contact support if the problem continues."
					}}
				</p>
			</div>
		</div>
		<div
			v-else
			class="flex min-h-screen w-full flex-col items-center justify-center space-y-4 px-4"
			role="status"
			aria-label="Loading dashboard"
		>
			<div class="flex flex-col items-center space-y-4">
				<UIcon name="ph:warning-duotone" class="size-12 text-primary" aria-hidden="true" />
				<div class="space-y-2 text-center">
					<h2 class="text-xl font-semibold text-base-content">Loading Dashboard</h2>
					<p class="text-sm text-base-content/60">Loading server settings...</p>
				</div>
				<div class="flex items-center space-x-2">
					<div
						v-motion
						:initial="{ scale: 0.8, opacity: 0.5 }"
						:enter="{
							scale: 1,
							opacity: 1,
							transition: { repeat: Infinity, repeatType: 'reverse', duration: 600 },
						}"
						class="h-2 w-2 rounded-full bg-primary"
					></div>
					<div
						v-motion
						:initial="{ scale: 0.8, opacity: 0.5 }"
						:enter="{
							scale: 1,
							opacity: 1,
							transition: {
								repeat: Infinity,
								repeatType: 'reverse',
								duration: 600,
								delay: 200,
							},
						}"
						class="h-2 w-2 rounded-full bg-primary"
					></div>
					<div
						v-motion
						:initial="{ scale: 0.8, opacity: 0.5 }"
						:enter="{
							scale: 1,
							opacity: 1,
							transition: {
								repeat: Infinity,
								repeatType: 'reverse',
								duration: 600,
								delay: 400,
							},
						}"
						class="h-2 w-2 rounded-full bg-primary"
					></div>
				</div>
			</div>
		</div>
		<div
			v-if="isReadyToSubmit"
			v-motion
			:initial="{ opacity: 0, y: 8 }"
			:enter="{ opacity: 1, y: 0, transition: { duration: 300, ease: 'easeOut' } }"
			:leave="{ opacity: 0, y: 8, transition: { duration: 200, ease: 'easeIn' } }"
			class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2"
		>
			<UFieldGroup>
				<UButton color="primary" icon="heroicons:check" @click="submitChanges">
					Save Changes
				</UButton>
				<UButton color="error" icon="heroicons:arrow-path" @click="resetChanges">
					Reset Changes
				</UButton>
			</UFieldGroup>
		</div>

		<UModal
			v-model:open="showDialog"
			title="Unsaved Changes"
			description="You have unsaved changes that will be lost if you leave this page."
			:dismissible="false"
		>
			<template #footer>
				<div class="flex justify-end gap-2">
					<UButton color="neutral" variant="ghost" @click="cancelLeave">
						Stay on Page
					</UButton>
					<UButton color="error" @click="confirmLeave"> Discard Changes </UButton>
				</div>
			</template>
		</UModal>
	</UDashboardGroup>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { NavigationMenuItem } from "@nuxt/ui";
import { isNullOrUndefinedOrZero, objectValues } from "@sapphire/utilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { objectToTuples } from "@sapphire/utilities/objectToTuples";
import { parseError, createError } from "evlog";

const logger = useLogger("wolfstar:dashboard");

const guildId = useRouteParams("id", null, { transform: String });

if (!isValidGuildId(guildId.value)) {
	throw createError({
		why: "Guild IDs must be 17-19 digit numbers.",
		status: 400,
		message: "The provided guild ID is not valid.",
		fix: "Please check the URL and ensure the guild ID is correct.",
	});
}

const toast = useToast();
const router = useRouter();
const open = ref(false);
const nuxtError = useError();
const { setGuildData, guildData } = useGuildData();
const { setGuildSettings, guildSettings } = useGuildSettings();
const { setGuildSettingsChanges, guildSettingsChanges, resetGuildSettingsChanges } =
	useGuildSettingsChanges();
const isLoading = useState<boolean>("dashboard:loading", () => true);

const items = computed<NavigationMenuItem[][]>(() => [
	[
		{
			exact: true,
			icon: "heroicons:home",
			label: "Home",
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage`,
		},
		{
			icon: "lucide:shield",
			label: "Moderation",
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/moderation`,
			children: [
				{
					label: "Bad Words",
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/word`,
				},
				{
					label: "Capitals",
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/capitals`,
				},
				{
					label: "Invites",
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/invites`,
				},
				{
					label: "Links",
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/links`,
				},
				{
					label: "Message Duplication",
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/messages`,
				},
				{
					label: "Line Spam",
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/lines`,
				},
				{
					label: "Reactions",
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/reactions`,
				},
			],
		},
		{
			icon: "heroicons:hashtag",
			label: "Channels",
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/channels`,
		},
		{
			icon: "heroicons:user-group",
			label: "Roles",
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/roles`,
		},
		{
			icon: "heroicons:bell",
			label: "Events",
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/events`,
		},
		{
			icon: "heroicons:command-line",
			label: "Commands",
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/commands`,
		},
	],
]);

const isReadyToRender = computed(
	() =>
		!nuxtError.value &&
		!isLoading.value &&
		!isNullOrUndefined(guildData.value) &&
		!isNullOrUndefined(guildSettings.value) &&
		!isNullOrUndefinedOrZero(objectValues(guildData.value).length) &&
		!isNullOrUndefinedOrZero(objectValues(guildSettings.value).length),
);

const isReadyToSubmit = computed(
	() =>
		!isNullOrUndefined(guildSettingsChanges.value) &&
		objectValues(guildSettingsChanges.value).length > 0,
);

const { showDialog, confirmLeave, cancelLeave } = useUnsavedChanges(isReadyToSubmit);

const src = computed(
	() =>
		guildIconURL(guildData as unknown as OauthFlattenedGuild, {
			size: 64,
		})!,
);
// Validate Guild ID format (Discord Snowflake: 17-19 digit string)
function isValidGuildId(id: string | undefined | null): boolean {
	if (isNullOrUndefined(id)) {
		return false;
	}
	const snowflakeRegex = /^\d{17,19}$/;
	return snowflakeRegex.test(id);
}

async function submitChanges() {
	const { data } = await useFetch(`/api/guilds/${guildId.value}/settings`, {
		body: {
			data: objectToTuples(guildSettingsChanges.value as Partial<GuildData>),
		},
		transform: (response: string) => {
			try {
				return JSON.parse(response);
			} catch (error) {
				logger.error(
					`Failed to parse response from settings update for guild Id: ${guildId.value}`,
					parseError(error),
				);
				throw createError({
					message: "Failed to update guild settings",
					why: "Something went wrong while saving your settings.",
					status: 500,
					fix: "Please try again later. If the issue persists, contact support.",
					cause: error as Error,
				});
			}
		},
		method: "PATCH",
	});

	if (!data.value) {
		return;
	}

	if (!isNullOrUndefined(data.value) && objectValues(data.value).length !== 0) {
		setGuildSettings(data.value);
		setGuildSettingsChanges(undefined);

		logger.info(`Guild settings changes saved successfully for guild Id: ${guildId.value}`);

		toast.add({
			color: "success",
			description: "Your server settings have been saved.",
			icon: "i-heroicons-check-circle",
			title: "Settings Saved",
		});
	}
}

function resetChanges() {
	resetGuildSettingsChanges();

	logger.info(`Guild settings changes reset for guild Id: ${guildId.value}`);

	toast.add({
		color: "info",
		description: "All changes have been reverted to the last saved state.",
		icon: "heroicons:arrow-path",
		title: "Changes Reset",
	});
}

// Clear staged changes when guild ID changes (prevents cross-guild leakage)
watch(guildId, (newGuildId, oldGuildId) => {
	if (oldGuildId && newGuildId !== oldGuildId) {
		resetGuildSettingsChanges();
		logger.info(
			`Cleared staged changes due to guild switch from ${oldGuildId} to ${newGuildId}`,
		);
	}
});

onMounted(async () => {
	isLoading.value = true;

	try {
		// Fetch guild data and settings in parallel to halve round-trip latency.
		const [guildData, guildSettings] = await Promise.all([
			$fetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(
				`/api/guilds/${guildId.value}`,
			),
			$fetch<string>(`/api/guilds/${guildId.value}/settings`),
		]);

		setGuildData(guildData);
		setGuildSettings(JSON.parse(guildSettings));

		if (nuxtError.value) {
			clearError();
		}
		// oxlint-disable-next-line unicorn/catch-error-name
	} catch (err: unknown) {
		const error = parseError(err);

		logger.error(`Error loading guild data or settings for guild Id: ${guildId.value}`, error);

		switch (error.status) {
		case 403: {
			toast.add({
					toast.add({
						title: "Access Denied",
						description: "You don't have permission to access this server's dashboard.",
						color: "error",
						icon: "heroicons:x-circle",
					});
				}
				break;
			case 401: {
				toast.add({
					title: "Unauthorized",
					description:
				"Your session has expired or you are not authorized. Please log in again to access the dashboard.",
					color: "error",
					icon: "heroicons:x-circle",
				});
				if (import.meta.client && window.history.length > 1) {
					router.back();
				} else {
					await navigateTo("/");
				}
				break;
			}
			default: {
				toast.add({
					title: error.message,
					description: error.why,
					color: "error",
					actions: error.link
						? [
								{
									label: "Learn more",
									onClick: () => {
										window.open(error.link);
									},
								},
							]
						: undefined,
					icon: "heroicons:x-circle",
				});
			}
		}
	} finally {
		isLoading.value = false;
	}
});
</script>
