<template>
	<DashboardPageHeader
		:title="ts('dashboard.nav.social')"
		:description="ts('guild_settings.social.subtitle')"
	>
		<template v-if="status.kind === 'ready'">
			<UBadge color="primary" variant="soft" size="lg" class="font-semibold">
				{{
					tc(
						"guild_settings.modules.subscription_count",
						status.state.subscriptions.length + status.state.twitch.length,
					)
				}}
			</UBadge>
			<UButton
				v-if="canAdd"
				color="primary"
				size="sm"
				icon="ic:round-add"
				@click="openEditor"
			>
				{{ ts("guild_settings.social.add") }}
			</UButton>
		</template>
	</DashboardPageHeader>

	<DashboardSkeleton v-if="status.kind === 'loading'" kind="table" bare />

	<UAlert
		v-else-if="status.kind === 'unavailable'"
		color="error"
		variant="subtle"
		icon="ic:round-error-outline"
		:title="ts('guild_settings.social.unavailable_title')"
		:description="ts('guild_settings.social.unavailable_body')"
		:actions="[{ label: ts('guild_settings.social.retry'), onClick: () => refresh() }]"
	/>

	<section
		v-else-if="status.kind === 'not-installed'"
		class="console-card flex flex-col items-center gap-2 px-4 py-12 text-center"
		:aria-labelledby="emptyHeadingId"
	>
		<h2 :id="emptyHeadingId" class="text-base font-semibold">
			{{ ts("guild_settings.social.not_installed_title") }}
		</h2>
		<p class="max-w-lg text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.social.not_installed_body") }}
		</p>
		<UButton
			class="mt-2"
			color="primary"
			size="sm"
			:to="invites.Staryl"
			target="_blank"
			external
		>
			{{ ts("guild_settings.social.invite") }}
		</UButton>
	</section>

	<template v-else>
		<GuildModuleBanner
			icon="lucide:rss"
			:title="ts('dashboard.nav.social')"
			:hint="ts('guild_settings.social.module_hint')"
			:on="status.state.enabled"
		>
			<USwitch
				:model-value="status.state.enabled"
				:disabled="switching"
				:aria-label="
					ts('guild_settings.modules.toggle_aria', { title: ts('dashboard.nav.social') })
				"
				@update:model-value="toggle"
			/>
		</GuildModuleBanner>

		<section
			v-if="status.state.subscriptions.length === 0 && status.state.twitch.length === 0"
			class="console-card flex flex-col items-center gap-2 px-4 py-12 text-center"
			:aria-labelledby="emptyHeadingId"
		>
			<h2 :id="emptyHeadingId" class="text-base font-semibold">
				{{ ts("guild_settings.social.empty_title") }}
			</h2>
			<p class="max-w-lg text-[0.8125rem] leading-normal text-muted">
				{{ ts("guild_settings.social.empty_body") }}
			</p>
			<UButton
				v-if="canAdd"
				class="mt-2"
				color="primary"
				size="sm"
				icon="ic:round-add"
				@click="openEditor"
			>
				{{ ts("guild_settings.social.add") }}
			</UButton>
		</section>

		<section
			v-if="status.state.subscriptions.length > 0"
			class="console-card"
			:aria-labelledby="subscriptionsHeadingId"
		>
			<div class="social-heading">
				<h2 :id="subscriptionsHeadingId">
					{{ ts("guild_settings.social.subscriptions_title") }}
				</h2>
				<span class="social-rule" aria-hidden="true"></span>
			</div>

			<!-- Scrolls sideways on a phone, so the keyboard can reach it too. -->
			<div
				class="mt-3 overflow-x-auto"
				tabindex="0"
				role="region"
				:aria-label="ts('guild_settings.social.table_aria')"
			>
				<table class="social-table" :aria-label="ts('guild_settings.social.table_aria')">
					<thead>
						<tr>
							<th scope="col">{{ ts("guild_settings.social.columns.name") }}</th>
							<th scope="col">{{ ts("guild_settings.social.columns.provider") }}</th>
							<th scope="col">{{ ts("guild_settings.social.columns.channel") }}</th>
							<th scope="col">{{ ts("guild_settings.social.columns.status") }}</th>
							<th scope="col">
								<span class="sr-only">{{
									ts("guild_settings.social.columns.actions")
								}}</span>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="subscription in status.state.subscriptions"
							:key="`${subscription.channelId}:${subscription.sourceId}`"
						>
							<td>
								<p class="truncate text-sm font-semibold text-highlighted">
									{{ subscription.displayName }}
								</p>
								<p
									v-if="subscription.message"
									class="truncate text-xs text-muted"
									:title="subscription.message"
								>
									{{ subscription.message }}
								</p>
							</td>
							<td>
								<span class="flex items-center gap-2 text-[0.8125rem]">
									<UIcon
										:name="SOCIAL_PROVIDER_ICONS[subscription.provider]"
										class="size-4 shrink-0 text-muted"
										aria-hidden="true"
									/>
									{{
										ts(
											`guild_settings.social.providers.${subscription.provider}`,
										)
									}}
								</span>
							</td>
							<td class="truncate text-[0.8125rem]">
								{{ channelName(subscription.channelId) }}
							</td>
							<td>
								<GuildLogsPill :tone="socialSubscriptionStatus(subscription).tone">
									{{ ts(socialSubscriptionStatus(subscription).key) }}
								</GuildLogsPill>
							</td>
							<td>
								<span class="flex items-center justify-end gap-1">
									<UButton
										v-if="subscription.manageable"
										color="neutral"
										variant="ghost"
										size="sm"
										icon="ic:round-edit"
										:aria-label="
											ts('guild_settings.social.edit.aria', {
												channel: channelName(subscription.channelId),
												name: subscription.displayName,
											})
										"
										@click="openEdit(socialEditTarget(subscription))"
									/>
									<UButton
										v-if="subscription.manageable"
										color="neutral"
										variant="ghost"
										size="sm"
										icon="ic:round-close"
										:aria-label="
											ts('guild_settings.social.remove_aria', {
												channel: channelName(subscription.channelId),
												name: subscription.displayName,
											})
										"
										@click="askRemove(subscription)"
									/>
									<span v-else class="text-xs whitespace-nowrap text-muted">
										{{ ts("guild_settings.social.managed_in_discord") }}
									</span>
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p class="mt-3 text-[0.8125rem] text-muted">
				{{ ts("guild_settings.social.footnote") }}
			</p>
		</section>

		<section
			v-if="status.state.twitch.length > 0"
			class="console-card"
			:aria-labelledby="twitchHeadingId"
		>
			<div class="social-heading">
				<h2 :id="twitchHeadingId">{{ ts("guild_settings.social.twitch.title") }}</h2>
				<span class="social-rule" aria-hidden="true"></span>
			</div>

			<div
				class="mt-3 overflow-x-auto"
				tabindex="0"
				role="region"
				:aria-label="ts('guild_settings.social.twitch.table_aria')"
			>
				<table
					class="social-table"
					:aria-label="ts('guild_settings.social.twitch.table_aria')"
				>
					<thead>
						<tr>
							<th scope="col">{{ ts("guild_settings.social.twitch.streamer") }}</th>
							<th scope="col">{{ ts("guild_settings.social.twitch.event") }}</th>
							<th scope="col">{{ ts("guild_settings.social.columns.channel") }}</th>
							<th scope="col">{{ ts("guild_settings.social.columns.status") }}</th>
							<th scope="col">
								<span class="sr-only">{{
									ts("guild_settings.social.columns.actions")
								}}</span>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="entry in status.state.twitch"
							:key="`${entry.streamerId}:${entry.type}:${entry.channelId}`"
						>
							<td>
								<p class="truncate text-sm font-semibold text-highlighted">
									{{ streamerName(entry) }}
								</p>
								<p
									v-if="entry.message"
									class="truncate text-xs text-muted"
									:title="entry.message"
								>
									{{ entry.message }}
								</p>
							</td>
							<td class="text-[0.8125rem]">
								{{ ts(`guild_settings.social.twitch.events.${entry.type}`) }}
							</td>
							<td class="truncate text-[0.8125rem]">
								{{ channelName(entry.channelId) }}
							</td>
							<td>
								<GuildLogsPill :tone="entry.revoked ? 'error' : 'success'">
									{{
										entry.revoked
											? ts("guild_settings.social.twitch.revoked")
											: ts("guild_settings.social.health.active")
									}}
								</GuildLogsPill>
							</td>
							<td>
								<span class="flex items-center justify-end gap-1">
									<UButton
										v-if="entry.subscriptionId"
										color="neutral"
										variant="ghost"
										size="sm"
										icon="ic:round-edit"
										:aria-label="
											ts('guild_settings.social.edit.aria', {
												channel: channelName(entry.channelId),
												name: streamerName(entry),
											})
										"
										@click="openEditTwitch(entry)"
									/>
									<UButton
										v-if="entry.subscriptionId"
										color="neutral"
										variant="ghost"
										size="sm"
										icon="ic:round-close"
										:aria-label="
											ts('guild_settings.social.remove_aria', {
												channel: channelName(entry.channelId),
												name: streamerName(entry),
											})
										"
										@click="askRemoveTwitch(entry)"
									/>
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p class="mt-3 text-[0.8125rem] text-muted">
				{{ ts("guild_settings.social.twitch.footnote") }}
			</p>
		</section>

		<GuildSocialEditor
			v-model:open="editorOpen"
			:state="status.state"
			:saving="saving"
			:error-code="errorCode"
			@save="add"
		/>

		<GuildSocialEditDialog
			v-model:open="editOpen"
			:editing="editing"
			:message-length="status.state.limits.messageLength"
			:saving="saving"
			:error-code="editErrorCode"
			@save="saveEdit"
		/>
	</template>

	<UModal
		:open="removing !== null"
		:title="ts('guild_settings.social.remove_title')"
		:description="
			ts('guild_settings.social.remove_description', {
				channel: removing ? channelName(removing.channelId) : '',
				name: removing?.name ?? '',
			})
		"
		:dismissible="!saving"
		@update:open="!$event && closeRemove()"
	>
		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="closeRemove()"
				>
					{{ ts("guild_settings.social.editor.cancel") }}
				</UButton>
				<UButton color="error" :loading="saving" @click="confirmRemove">
					{{ ts("guild_settings.social.remove") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type {
	SocialEditBody,
	SocialErrorCode,
	SocialSubscription,
	SocialTwitchSubscription,
} from "#shared/utils/social";
import type { SocialDraftRequest, SocialEditTarget } from "~/utils/social";

const { tc, ts } = useI18n();
const toast = useToast();
const invites = useInvites();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();
const {
	addSubscription,
	addTwitch,
	editSubscription,
	editTwitch,
	refresh,
	removeSubscription,
	removeTwitch,
	setEnabled,
	status,
} = useSocialModule(activeGuildId);

const emptyHeadingId = useId();
const subscriptionsHeadingId = useId();
const twitchHeadingId = useId();

const canAdd = computed(() => status.value.kind === "ready" && canAddToSocial(status.value.state));

function streamerName(entry: SocialTwitchSubscription): string {
	return entry.streamerName ?? ts("guild_settings.social.twitch.unknown_streamer");
}

function channelName(channelId: string): string {
	const channel = guildData.value?.channels.find((candidate) => candidate.id === channelId);
	return `#${channel?.name ?? ts("select.unknown_channel")}`;
}

function errorMessage(code: SocialErrorCode): string {
	return ts(`guild_settings.social.errors.${code.replaceAll("-", "_")}`);
}

// The switch is Staryl's, so it is not staged with the server's settings: a flip saves at once.
const switching = ref(false);

async function toggle(enabled: boolean) {
	switching.value = true;
	const result = await setEnabled(enabled);
	switching.value = false;

	toast.add(
		result.ok
			? {
					color: "success",
					description: result.value
						? ts("guild_settings.social.switched_on_description")
						: ts("guild_settings.social.switched_off_description"),
					icon: "heroicons:check",
					title: result.value
						? ts("guild_settings.social.switched_on_title")
						: ts("guild_settings.social.switched_off_title"),
				}
			: {
					color: "error",
					description: errorMessage(result.code),
					icon: "heroicons:x-circle",
					title: ts("guild_settings.save_failed"),
				},
	);
}

const editorOpen = ref(false);
const saving = ref(false);
const errorCode = ref<SocialErrorCode | null>(null);

function openEditor() {
	errorCode.value = null;
	editorOpen.value = true;
}

async function add(request: SocialDraftRequest) {
	saving.value = true;
	errorCode.value = null;
	const result =
		request.kind === "twitch"
			? await addTwitch(request.body)
			: await addSubscription(request.body);
	saving.value = false;

	if (!result.ok) {
		errorCode.value = result.code;
		return;
	}
	editorOpen.value = false;
	toast.add({
		color: "success",
		description: ts("guild_settings.social.added_description", {
			channel: channelName(request.body.channelId),
		}),
		icon: "heroicons:check",
		title: ts("guild_settings.social.added_title"),
	});
}

const editOpen = ref(false);
const editing = shallowRef<SocialEditTarget | null>(null);
const editErrorCode = ref<SocialErrorCode | null>(null);

function socialEditTarget(subscription: SocialSubscription): SocialEditTarget {
	return {
		channelId: subscription.channelId,
		detail: ts(`guild_settings.social.providers.${subscription.provider}`),
		icon: SOCIAL_PROVIDER_ICONS[subscription.provider],
		key: { kind: "social", sourceId: subscription.sourceId },
		message: subscription.message,
		messageRequired: false,
		name: subscription.displayName,
	};
}

function openEdit(target: SocialEditTarget) {
	editErrorCode.value = null;
	editing.value = target;
	editOpen.value = true;
}

function openEditTwitch(entry: SocialTwitchSubscription) {
	// A row from a Staryl without the Twitch live routes has no id, and no button.
	if (entry.subscriptionId === undefined) return;
	openEdit({
		channelId: entry.channelId,
		detail: ts(`guild_settings.social.twitch.events.${entry.type}`),
		icon: SOCIAL_PROVIDER_ICONS.TwitchLive,
		key: { kind: "twitch", subscriptionId: entry.subscriptionId },
		message: entry.message,
		messageRequired: entry.type === "StreamOffline",
		name: streamerName(entry),
	});
}

async function saveEdit(body: SocialEditBody) {
	const target = editing.value;
	if (!target) return;
	saving.value = true;
	editErrorCode.value = null;
	const { channelId, key } = target;
	const result =
		key.kind === "twitch"
			? await editTwitch({ channelId, subscriptionId: key.subscriptionId }, body)
			: await editSubscription({ channelId, sourceId: key.sourceId }, body);
	saving.value = false;

	if (!result.ok) {
		editErrorCode.value = result.code;
		return;
	}
	editOpen.value = false;
	toast.add({
		color: "success",
		description: ts("guild_settings.social.edit.saved_description", {
			channel: channelName(body.channelId),
			name: target.name,
		}),
		icon: "heroicons:check",
		title: ts("guild_settings.social.edit.saved_title"),
	});
}

/** What the removal dialog asks about: a subscription, or a Twitch live one. */
type Removal =
	| { kind: "social"; channelId: string; name: string; subscription: SocialSubscription }
	| {
			kind: "twitch";
			channelId: string;
			name: string;
			entry: SocialTwitchSubscription & { subscriptionId: string };
	  };

const removing = shallowRef<Removal | null>(null);

function askRemove(subscription: SocialSubscription) {
	removing.value = {
		channelId: subscription.channelId,
		kind: "social",
		name: subscription.displayName,
		subscription,
	};
}

function askRemoveTwitch(entry: SocialTwitchSubscription) {
	// A row from a Staryl without the Twitch live routes has no id, and no button.
	const { subscriptionId } = entry;
	if (subscriptionId === undefined) return;
	removing.value = {
		channelId: entry.channelId,
		entry: { ...entry, subscriptionId },
		kind: "twitch",
		name: streamerName(entry),
	};
}

function closeRemove() {
	removing.value = null;
}

async function confirmRemove() {
	const removal = removing.value;
	if (!removal) return;
	saving.value = true;
	const result =
		removal.kind === "twitch"
			? await removeTwitch(removal.entry)
			: await removeSubscription(removal.subscription);
	saving.value = false;
	removing.value = null;

	// One that was already gone is removed as far as the admin is concerned.
	const failure = result.ok || result.code === "subscription-not-found" ? null : result.code;
	toast.add(
		failure === null
			? {
					color: "success",
					description: ts("guild_settings.social.removed_description", {
						channel: channelName(removal.channelId),
						name: removal.name,
					}),
					icon: "heroicons:check",
					title: ts("guild_settings.social.removed_title"),
				}
			: {
					color: "error",
					description: errorMessage(failure),
					icon: "heroicons:x-circle",
					title: ts("guild_settings.save_failed"),
				},
	);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.social-heading {
	@apply flex items-center gap-3;
}

.social-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.social-rule {
	@apply h-px flex-1;
	background-color: var(--console-border);
}

.social-table {
	@apply w-full min-w-155 border-collapse;
}

.social-table th {
	@apply px-2.5 pb-2 text-left text-[0.6875rem] font-bold tracking-[0.06em] uppercase;
	color: var(--ui-text-muted);
}

.social-table td {
	@apply h-12 max-w-60 px-2.5 py-2;
	border-top: 1px solid var(--home-border-subtle);
}
</style>
