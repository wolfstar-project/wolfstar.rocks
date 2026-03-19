<template>
	<div
		class="relative flex h-full transform-gpu flex-col rounded-xl border border-base-300/70 bg-base-100 p-2 shadow-lg transition-all duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none md:p-4"
		:class="cardClasses"
	>
		<!-- Skeleton Loading State -->
		<template v-if="loading">
			<!-- Mobile Skeleton -->
			<div class="flex flex-col items-center gap-2 md:hidden">
				<USkeleton class="h-20 w-20 rounded-2xl" />
				<USkeleton class="h-4 w-3/4 rounded" />
			</div>

			<!-- Desktop Skeleton -->
			<div class="hidden flex-col items-center space-y-4 md:flex">
				<USkeleton class="h-20 w-20 rounded-2xl" />
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
					:to="`/guilds/${guild.id}/manage`"
					class="group relative"
					:aria-label="`Manage ${guild.name}`"
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
					class="group relative"
					:aria-label="`Invite bot to ${guild.name}`"
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
					:aria-label="`${guild.name} - No permission`"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
				</div>
				<!-- Guild Name -->
				<span class="w-full truncate text-center text-xs font-medium text-base-content">
					{{ guild.name }}
				</span>
			</div>

			<!-- Desktop: Vertical layout (original) -->
			<div class="hidden h-full w-full flex-col items-center gap-3 text-center md:flex">
				<div
					class="flex flex-col items-center"
					role="img"
					:aria-label="`${guild.name} server icon`"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
				</div>
				<!-- Guild Name -->
				<h3 class="line-clamp-2 text-base font-bold text-base-content">
					{{ guild.name }}
				</h3>

				<!-- Guild Stats -->
				<div class="flex items-center justify-center gap-4 text-xs text-base-content/60">
					<span
						class="flex items-center gap-1"
						title="Total members"
						aria-label="Total members"
					>
						<UIcon
							name="heroicons:user-group"
							class="size-3 text-base-content/70"
							aria-hidden="true"
						/>
						<span>{{ approximateMemberCount }}</span>
					</span>
					<span
						class="flex items-center gap-1"
						title="Members online"
						aria-label="Members online"
					>
						<UIcon
							name="heroicons:signal"
							class="size-3 text-success"
							aria-hidden="true"
						/>
						<span>{{ approximatePresenceCount }}</span>
					</span>
				</div>

				<!-- Action Button -->
				<div class="mt-auto w-full pt-2">
					<NuxtLink
						v-if="guild.wolfstarIsIn && guild.manageable"
						:to="`/guilds/${guild.id}/manage`"
						class="flex h-9 w-full items-center justify-center rounded-lg border border-success/20 bg-success/10 px-3 text-xs font-medium text-success transition-all duration-200 hover:bg-success/20 hover:shadow-md"
						:aria-label="`Manage ${guild.name} server settings`"
					>
						<UIcon
							name="heroicons:adjustments-horizontal"
							class="mr-1 inline size-3"
							aria-hidden="true"
						/>
						Manage Server
					</NuxtLink>
					<NuxtLink
						v-else-if="guild.manageable"
						:to="guildAddURL(guild.id)"
						class="flex h-9 w-full items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary/20 hover:shadow-md"
						:aria-label="`Invite WolfStar bot to ${guild.name}`"
					>
						<UIcon
							name="heroicons:rocket-launch"
							class="mr-1 inline size-3"
							aria-hidden="true"
						/>
						Invite Bot
					</NuxtLink>
					<div
						v-else
						class="flex h-9 w-full cursor-not-allowed items-center justify-center rounded-lg bg-base-300/50 px-3 text-xs font-medium text-base-content/50 transition-all duration-200"
						role="status"
						:aria-label="`No permission to manage ${guild.name}`"
					>
						<UIcon
							name="heroicons:no-symbol"
							class="mr-1 inline size-3"
							aria-hidden="true"
						/>
						No Permission
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

const cardClasses = computed(() => {
	if (loading || !guild) {
		return {};
	}
	return {
		"hover:-translate-y-1 hover:shadow-2xl focus-visible:-translate-y-1 focus-visible:shadow-2xl focus-visible:outline-none focus-visible:ring-2 motion-reduce:hover:shadow-xl motion-reduce:hover:translate-y-0": true,
		"hover:border-primary/40 focus-visible:border-primary/50 focus-visible:ring-primary/40":
			!guild.wolfstarIsIn && guild.manageable,
		"opacity-75 ring-2 ring-error/20": !guild.manageable,
		"ring-2 ring-success/20 hover:border-success/40 focus-visible:border-success/50 focus-visible:ring-success/40":
			guild.wolfstarIsIn && guild.manageable,
	};
});

const approximatePresenceCount = computed(() => {
	if (!guild) {
		return "N/A";
	}
	return !isNullOrUndefinedOrZero(guild.approximatePresenceCount)
		? formatNumber(guild.approximatePresenceCount)
		: "N/A";
});

const approximateMemberCount = computed(() => {
	if (!guild) {
		return "N/A";
	}
	return !isNullOrUndefinedOrZero(guild.approximateMemberCount)
		? formatNumber(guild.approximateMemberCount)
		: "N/A";
});
</script>
