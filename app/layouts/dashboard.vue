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
			:aria-label="t('dashboard.error_aria')"
		>
			<UIcon name="ph:warning-duotone" class="size-12 text-error" aria-hidden="true" />
			<div class="space-y-2">
				<h2 class="text-xl font-semibold text-base-content">
					{{ nuxtError.statusMessage || t("dashboard.error_title") }}
				</h2>
				<p v-if="nuxtError.status === 403">
					{{ t("dashboard.error_forbidden") }}
				</p>
				<p class="text-sm text-base-content/60">
					{{ nuxtError.message || t("dashboard.error_fallback") }}
				</p>
			</div>
		</div>
		<div
			v-else
			class="flex min-h-screen w-full flex-col items-center justify-center space-y-4 px-4"
			role="status"
			:aria-label="t('dashboard.loading_aria')"
		>
			<div class="flex flex-col items-center space-y-4">
				<UIcon name="ph:warning-duotone" class="size-12 text-primary" aria-hidden="true" />
				<div class="space-y-2 text-center">
					<h2 class="text-xl font-semibold text-base-content">
						{{ t("dashboard.loading_title") }}
					</h2>
					<p class="text-sm text-base-content/60">
						{{ t("dashboard.loading_description") }}
					</p>
				</div>
				<div class="flex items-center space-x-2">
					<div
						class="h-2 w-2 animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full bg-primary"
					></div>
					<div
						class="h-2 w-2 animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full bg-primary [animation-delay:200ms]"
					></div>
					<div
						class="h-2 w-2 animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full bg-primary [animation-delay:400ms]"
					></div>
				</div>
			</div>
		</div>
		<Transition
			enter-active-class="transition-[opacity,transform] duration-300 ease-out"
			enter-from-class="opacity-0 translate-y-2"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="transition-[opacity,transform] duration-200 ease-in"
			leave-from-class="opacity-100 translate-y-0"
			leave-to-class="opacity-0 translate-y-2"
		>
			<div
				v-if="isReadyToSubmit"
				style="view-transition-name: save-changes-bar"
				class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2"
			>
				<UFieldGroup>
					<UButton color="primary" icon="heroicons:check" @click="submitChanges">
						{{ t("dashboard.save_changes") }}
					</UButton>
					<UButton color="error" icon="heroicons:arrow-path" @click="resetChanges">
						{{ t("dashboard.reset_changes") }}
					</UButton>
				</UFieldGroup>
			</div>
		</Transition>

		<UModal
			v-model:open="showDialog"
			:title="t('dashboard.unsaved_title')"
			:description="t('dashboard.unsaved_description')"
			:dismissible="false"
		>
			<template #footer>
				<div class="flex justify-end gap-2">
					<UButton color="neutral" variant="ghost" @click="cancelLeave">
						{{ t("dashboard.stay_on_page") }}
					</UButton>
					<UButton color="error" @click="confirmLeave">
						{{ t("dashboard.discard_changes") }}
					</UButton>
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
import { parseGuildSettings, classifyGuildError } from "~/utils/guild-dashboard";

function isSafeUrl(url: unknown): url is string {
	if (typeof url !== "string") return false;
	try {
		const { protocol } = new URL(url);
		return protocol === "https:";
	} catch {
		return false;
	}
}

const { t } = useI18n();

const guildId = useRouteParams("id", null, { transform: String });

if (!isValidGuildId(guildId.value)) {
	throw createError({
		why: t("dashboard.invalid_guild_why"),
		status: 400,
		message: t("dashboard.invalid_guild_message"),
		fix: t("dashboard.invalid_guild_fix"),
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

const { user } = useUserSession();
const { guilds: userGuilds } = useUser(user);
watch(
	[guildId, userGuilds],
	([newGuildId, newUserGuilds]) => {
		const seedGuild = newUserGuilds?.find((g) => g.id === newGuildId);
		if (seedGuild) {
			setGuildData(seedGuild);
		}
	},
	{ immediate: true },
);

const requestFetch = useRequestFetch();
const route = useRoute();
const refreshGuildCache = computed(() => route.query.refresh === "true");

const {
	data,
	pending: isLoading,
	error,
} = useAsyncData(
	() => `dashboard:guild:${guildId.value}`,
	() => {
		const refreshQuery = refreshGuildCache.value ? { refresh: "true" } : undefined;
		return Promise.all([
			requestFetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(
				`/api/guilds/${guildId.value}`,
				{ query: refreshQuery },
			),
			requestFetch<string>(`/api/guilds/${guildId.value}/settings`, {
				query: refreshQuery,
			}),
		]);
	},
);

watch(
	data,
	(newData) => {
		if (newData) {
			setGuildData(newData[0]);

			const parsedSettings = parseGuildSettings(
				newData[1],
				guildSettings.value ?? {},
				(parseErr) => {
					log.error({
						tag: "wolfstar:dashboard",
						message: `Failed to parse guild settings payload for guild Id: ${guildId.value}`,
						error: parseError(parseErr),
					});
				},
			);

			setGuildSettings(parsedSettings as GuildData);

			if (nuxtError.value) {
				clearError();
			}
		}
	},
	{ immediate: true },
);

watch(
	error,
	async (err) => {
		if (err) {
			const parsedError = parseError(err);

			log.error({
				tag: "wolfstar:dashboard",
				message: `Error loading guild data or settings for guild Id: ${guildId.value}`,
				error: parsedError,
			});

			switch (classifyGuildError(parsedError.status)) {
				case "forbidden": {
					if (import.meta.client) {
						toast.add({
							title: t("dashboard.access_denied_title"),
							description: t("dashboard.access_denied_description"),
							color: "error",
							icon: "heroicons:x-circle",
						});
					}
					if (import.meta.client && window.history.length > 1) {
						router.back();
					} else {
						await navigateTo("/");
					}
					break;
				}
				case "unauthorized": {
					if (import.meta.client) {
						toast.add({
							title: t("dashboard.unauthorized_title"),
							description: t("dashboard.unauthorized_description"),
							color: "error",
							icon: "heroicons:x-circle",
						});
					}
					if (import.meta.client && window.history.length > 1) {
						router.back();
					} else {
						await navigateTo("/");
					}
					break;
				}
				default: {
					if (import.meta.client) {
						const link = isSafeUrl(parsedError.link) ? parsedError.link : null;
						toast.add({
							title: parsedError.message,
							description: parsedError.why,
							color: "error",
							actions: link
								? [
										{
											label: t("common.learn_more"),
											onClick: () => {
												window.open(link, "_blank", "noopener,noreferrer");
											},
										},
									]
								: undefined,
							icon: "heroicons:x-circle",
						});
					}
					showError({
						status: parsedError.status || 500,
						message: parsedError.message,
						data: {
							why: parsedError.why,
							fix: parsedError.fix,
							link: parsedError.link,
						},
					});
				}
			}
		}
	},
	{ immediate: true },
);

const { effectiveReduceMotion } = useReduceMotion();

const items = computed<NavigationMenuItem[][]>(() => [
	[
		{
			exact: true,
			icon: "heroicons:home",
			label: t("dashboard.nav.home"),
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage`,
		},
		{
			icon: "lucide:shield",
			label: t("dashboard.nav.moderation"),
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/moderation`,
			children: [
				{
					label: t("dashboard.nav.bad_words"),
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/word`,
				},
				{
					label: t("dashboard.nav.capitals"),
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/capitals`,
				},
				{
					label: t("dashboard.nav.invites"),
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/invites`,
				},
				{
					label: t("dashboard.nav.links"),
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/links`,
				},
				{
					label: t("dashboard.nav.message_duplication"),
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/messages`,
				},
				{
					label: t("dashboard.nav.line_spam"),
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/lines`,
				},
				{
					label: t("dashboard.nav.reactions"),
					onSelect: () => {
						open.value = false;
					},
					to: `/guilds/${guildId.value}/manage/moderation/reactions`,
				},
			],
		},
		{
			icon: "heroicons:hashtag",
			label: t("dashboard.nav.channels"),
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/channels`,
		},
		{
			icon: "heroicons:user-group",
			label: t("dashboard.nav.roles"),
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/roles`,
		},
		{
			icon: "heroicons:bell",
			label: t("dashboard.nav.events"),
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/events`,
		},
		{
			icon: "heroicons:command-line",
			label: t("dashboard.nav.commands"),
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/manage/commands`,
		},
		{
			icon: "lucide:logs",
			label: t("dashboard.nav.logs"),
			onSelect: () => {
				open.value = false;
			},
			to: `/guilds/${guildId.value}/logs`,
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

const src = computed(() =>
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
				log.error({
					tag: "wolfstar:dashboard",
					message: `Failed to parse response from settings update for guild Id: ${guildId.value}`,
					error: parseError(error),
				});
				throw createError({
					message: t("dashboard.update_failed_message"),
					why: t("dashboard.update_failed_why"),
					status: 500,
					fix: t("dashboard.update_failed_fix"),
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
		if (!document.startViewTransition || effectiveReduceMotion.value) {
			setGuildSettings(data.value!);
			setGuildSettingsChanges(undefined);
		} else {
			if (document.activeViewTransition) {
				document.activeViewTransition.skipTransition();
			}
			document.startViewTransition(async () => {
				setGuildSettings(data.value!);
				setGuildSettingsChanges(undefined);
				await nextTick();
			});
		}

		log.info(
			"wolfstar:dashboard",
			`Guild settings changes saved successfully for guild Id: ${guildId.value}`,
		);

		toast.add({
			color: "success",
			description: t("dashboard.settings_saved_description"),
			icon: "i-heroicons-check-circle",
			title: t("dashboard.settings_saved_title"),
		});
	}
}

function resetChanges() {
	if (!document.startViewTransition || effectiveReduceMotion.value) {
		resetGuildSettingsChanges();
	} else {
		if (document.activeViewTransition) {
			document.activeViewTransition.skipTransition();
		}
		document.startViewTransition(async () => {
			resetGuildSettingsChanges();
			await nextTick();
		});
	}

	log.info("wolfstar:dashboard", `Guild settings changes reset for guild Id: ${guildId.value}`);

	toast.add({
		color: "info",
		description: t("dashboard.changes_reset_description"),
		icon: "heroicons:arrow-path",
		title: t("dashboard.changes_reset_title"),
	});
}

// Clear staged changes when guild ID changes (prevents cross-guild leakage)
watch(guildId, (newGuildId, oldGuildId) => {
	if (oldGuildId && newGuildId !== oldGuildId) {
		resetGuildSettingsChanges();
		log.info(
			"wolfstar:dashboard",
			`Cleared staged changes due to guild switch from ${oldGuildId} to ${newGuildId}`,
		);
	}
});
</script>
