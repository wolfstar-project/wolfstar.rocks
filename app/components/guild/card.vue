<template>
	<div
		class="relative flex h-full flex-col rounded-lg border border-(--home-border-subtle) bg-(--console-surface,var(--ink-700)) p-3 shadow-(--console-shadow-low,none) transition-colors duration-200 motion-reduce:transition-none md:p-4"
		:class="cardClasses"
	>
		<!-- Skeleton Loading State -->
		<template v-if="loading">
			<!-- Mobile Skeleton -->
			<div class="flex flex-col items-center gap-2 md:hidden">
				<USkeleton class="h-20 w-20 rounded-xl" />
				<USkeleton class="h-4 w-3/4 rounded" />
			</div>

			<!-- Desktop Skeleton -->
			<div class="hidden flex-col items-center space-y-4 md:flex">
				<USkeleton class="h-20 w-20 rounded-xl" />
				<div class="flex min-h-16 w-full flex-col justify-center space-y-2">
					<USkeleton class="mx-auto h-4 w-3/4 rounded" />
					<div class="flex items-center justify-center space-x-4">
						<div class="flex items-center space-x-1">
							<USkeleton class="h-3 w-3 rounded opacity-50" />
							<USkeleton class="h-3 w-8 rounded" />
						</div>
						<div class="flex items-center space-x-1">
							<USkeleton class="h-3 w-3 rounded opacity-50" />
							<USkeleton class="h-3 w-8 rounded" />
						</div>
					</div>
				</div>
				<div class="w-full">
					<USkeleton class="h-8 w-full rounded-lg" />
				</div>
			</div>
		</template>

		<!-- Actual Content -->
		<template v-if="!loading && guild">
			<!-- Mobile: Compact vertical layout (icon + name) -->
			<div class="flex flex-col items-center gap-2 md:hidden">
				<!-- Guild Icon with action overlay -->
				<NuxtLink
					v-if="guild.wolfstarIsIn && guild.manageable"
					:to="{ path: '/app', query: { guild: guild.id } }"
					@click="goToGuild(guild.id)"
					class="group relative"
					:aria-label="ts('guild_card.manage_aria', { name: guild.name })"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
					<div
						class="absolute inset-0 flex items-center justify-center rounded-full bg-success/80 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
					>
						<UIcon
							name="heroicons:adjustments-horizontal"
							class="size-5 text-success-content"
							aria-hidden="true"
						/>
					</div>
				</NuxtLink>
				<NuxtLink
					v-else-if="guild.manageable"
					:to="guildAddURL(guild.id)"
					external
					class="group relative"
					:aria-label="ts('guild_card.invite_aria', { name: guild.name })"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
					<div
						class="absolute inset-0 flex items-center justify-center rounded-full bg-primary/80 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
					>
						<UIcon
							name="heroicons:rocket-launch"
							class="size-5 text-primary-content"
							aria-hidden="true"
						/>
					</div>
				</NuxtLink>
				<div
					v-else
					class="relative cursor-not-allowed opacity-60"
					role="img"
					:aria-label="ts('guild_card.no_permission_aria', { name: guild.name })"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
				</div>
				<!-- Guild Name -->
				<span
					class="w-full truncate text-center text-xs font-medium"
					:class="guild.manageable ? 'text-base-content' : 'text-base-content/50'"
				>
					{{ guild.name }}
				</span>
			</div>

			<!-- Desktop: Vertical layout (original) -->
			<div class="hidden h-full w-full flex-col items-center gap-3 text-center md:flex">
				<div
					class="flex flex-col items-center"
					:class="{ 'opacity-60': !guild.manageable }"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
				</div>
				<!-- Guild Name -->
				<h3
					class="line-clamp-2 min-h-12 text-base font-bold"
					:class="guild.manageable ? 'text-base-content' : 'text-base-content/50'"
				>
					{{ guild.name }}
				</h3>

				<!-- Guild Stats -->
				<div class="flex items-center justify-center gap-4 text-xs text-base-content/60">
					<span
						class="flex items-center gap-1"
						:title="ts('guild_card.total_members', { count: approximateMemberCount })"
					>
						<UIcon
							name="heroicons:user-group"
							class="size-3 text-base-content/70"
							aria-hidden="true"
						/>
						<span class="sr-only">{{ ts("profile.members") }}:</span>
						<span>{{ approximateMemberCount }}</span>
					</span>
					<span class="flex items-center gap-1" :title="ts('guild_card.members_online')">
						<UIcon
							name="heroicons:signal"
							class="size-3 text-success"
							aria-hidden="true"
						/>
						<span class="sr-only">{{ ts("guild_card.members_online") }}:</span>
						<span>{{ approximatePresenceCount }}</span>
					</span>
				</div>

				<!-- Action Button -->
				<div class="mt-auto w-full pt-2">
					<NuxtLink
						v-if="guild.wolfstarIsIn && guild.manageable"
						:to="{ path: '/app', query: { guild: guild.id } }"
						@click="goToGuild(guild.id)"
						class="flex h-9 w-full items-center justify-center rounded-lg border border-success/20 bg-success/10 px-3 text-xs font-medium text-highlighted transition-all duration-200 hover:bg-success/20 hover:shadow-md theme-dark:text-success"
						:aria-label="ts('guild_card.manage_server_aria', { name: guild.name })"
					>
						<UIcon
							name="heroicons:adjustments-horizontal"
							class="mr-1 inline size-3"
							aria-hidden="true"
						/>
						{{ ts("guild_card.manage_server") }}
					</NuxtLink>
					<NuxtLink
						v-else-if="guild.manageable"
						:to="guildAddURL(guild.id)"
						external
						class="flex h-9 w-full items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary/20 hover:shadow-md theme-dark:text-highlighted"
						:aria-label="ts('guild_card.invite_bot_aria', { name: guild.name })"
					>
						<UIcon
							name="heroicons:rocket-launch"
							class="mr-1 inline size-3"
							aria-hidden="true"
						/>
						{{ ts("guild_card.invite_bot") }}
					</NuxtLink>
					<div
						v-else
						class="flex h-9 w-full cursor-not-allowed items-center justify-center rounded-lg bg-base-300/50 px-3 text-xs font-medium text-base-content/50 transition-all duration-200"
					>
						<UIcon
							name="heroicons:no-symbol"
							class="mr-1 inline size-3"
							aria-hidden="true"
						/>
						{{ ts("guild_card.no_permission") }}
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { isNullOrUndefinedOrZero } from "@sapphire/utilities";

interface GuildCardProps {
	guild?: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
	loading?: boolean;
}

const { guild, loading = false } = defineProps<GuildCardProps>();

const { ts } = useI18n();
// Go through the guarded boundary, not `useActiveGuild().selectGuild`: with
// settings staged on another server, this parks the switch for the
// dashboard's "unsaved changes" dialog instead of dropping the edits.
const { goToGuild } = useDashboardNavigation();

const cardClasses = computed(() => {
	if (loading || !guild) {
		return {};
	}
	return {
		"opacity-70": !guild.manageable,
		"hover:border-primary/40 focus-within:border-primary/50": guild.manageable,
	};
});

const approximatePresenceCount = computed(() => {
	if (!guild) {
		return ts("common.na");
	}
	return !isNullOrUndefinedOrZero(guild.approximatePresenceCount)
		? formatNumber(guild.approximatePresenceCount)
		: ts("common.na");
});

const approximateMemberCount = computed(() => {
	if (!guild) {
		return ts("common.na");
	}
	return !isNullOrUndefinedOrZero(guild.approximateMemberCount)
		? formatNumber(guild.approximateMemberCount)
		: ts("common.na");
});
</script>
