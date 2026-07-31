<template>
	<div
		class="rounded-xl border-base-300/70 bg-base-100 p-2 shadow-lg ease-out md:p-4 relative flex h-full transform-gpu flex-col border transition-all duration-300 motion-reduce:transform-none motion-reduce:transition-none"
		:class="cardClasses"
	>
		<!-- Skeleton Loading State -->
		<template v-if="loading">
			<!-- Mobile Skeleton -->
			<div class="gap-2 md:hidden flex flex-col items-center">
				<StarSkeleton class="h-20 w-20 rounded-xl" />
				<StarSkeleton class="h-4 rounded w-3/4" />
			</div>

			<!-- Desktop Skeleton -->
			<div class="space-y-4 md:flex hidden flex-col items-center">
				<StarSkeleton class="h-20 w-20 rounded-xl" />
				<div class="min-h-16 space-y-2 flex w-full flex-col justify-center">
					<StarSkeleton class="h-4 rounded mx-auto w-3/4" />
					<div class="space-x-4 flex items-center justify-center">
						<div class="space-x-1 flex items-center">
							<StarSkeleton class="h-3 w-3 rounded opacity-50" />
							<StarSkeleton class="h-3 w-8 rounded" />
						</div>
						<div class="space-x-1 flex items-center">
							<StarSkeleton class="h-3 w-3 rounded opacity-50" />
							<StarSkeleton class="h-3 w-8 rounded" />
						</div>
					</div>
				</div>
				<div class="w-full">
					<StarSkeleton class="h-8 rounded-lg w-full" />
				</div>
			</div>
		</template>

		<!-- Actual Content -->
		<template v-if="!loading && guild">
			<!-- Mobile: Compact vertical layout (icon + name) -->
			<div class="gap-2 md:hidden flex flex-col items-center">
				<!-- Guild Icon with action overlay -->
				<NuxtLink
					v-if="guild.wolfstarIsIn && guild.manageable"
					:to="`/guilds/${guild.id}/manage`"
					class="group relative"
					:aria-label="`Manage ${guild.name}`"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
					<div
						class="inset-0 bg-success/80 absolute flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
					>
						<StarIcon
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
					:aria-label="`Invite bot to ${guild.name}`"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
					<div
						class="inset-0 bg-primary/80 absolute flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
					>
						<StarIcon
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
				<span
					class="text-xs font-medium w-full truncate text-center"
					:class="guild.manageable ? 'text-base-content' : 'text-base-content/50'"
				>
					{{ guild.name }}
				</span>
			</div>

			<!-- Desktop: Vertical layout (original) -->
			<div class="gap-3 md:flex hidden h-full w-full flex-col items-center text-center">
				<div
					class="flex flex-col items-center"
					:class="{ 'opacity-60': !guild.manageable }"
				>
					<guild-icon :guild variant="bare" size="lg" :show-status="true" />
				</div>
				<!-- Guild Name -->
				<h3
					class="min-h-12 text-base font-bold line-clamp-2"
					:class="guild.manageable ? 'text-base-content' : 'text-base-content/50'"
				>
					{{ guild.name }}
				</h3>

				<!-- Guild Stats -->
				<div class="gap-4 text-xs text-base-content/60 flex items-center justify-center">
					<span class="gap-1 flex items-center" title="Total members">
						<StarIcon
							name="heroicons:user-group"
							class="size-3 text-base-content/70"
							aria-hidden="true"
						/>
						<span class="sr-only">Total members:</span>
						<span>{{ approximateMemberCount }}</span>
					</span>
					<span class="gap-1 flex items-center" title="Members online">
						<StarIcon
							name="heroicons:signal"
							class="size-3 text-success"
							aria-hidden="true"
						/>
						<span class="sr-only">Members online:</span>
						<span>{{ approximatePresenceCount }}</span>
					</span>
				</div>

				<!-- Action Button -->
				<div class="pt-2 mt-auto w-full">
					<NuxtLink
						v-if="guild.wolfstarIsIn && guild.manageable"
						:to="`/guilds/${guild.id}/manage`"
						class="h-9 rounded-lg border-success/20 bg-success/10 px-3 text-xs font-medium text-success hover:bg-success/20 hover:shadow-md flex w-full items-center justify-center border transition-all duration-200"
						:aria-label="`Manage ${guild.name} server settings`"
					>
						<StarIcon
							name="heroicons:adjustments-horizontal"
							class="mr-1 size-3 inline"
							aria-hidden="true"
						/>
						Manage Server
					</NuxtLink>
					<NuxtLink
						v-else-if="guild.manageable"
						:to="guildAddURL(guild.id)"
						external
						class="h-9 rounded-lg border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary group-hover:bg-primary/20 hover:shadow-md flex w-full items-center justify-center border transition-all duration-200"
						:aria-label="`Invite WolfStar bot to ${guild.name}`"
					>
						<StarIcon
							name="heroicons:rocket-launch"
							class="mr-1 size-3 inline"
							aria-hidden="true"
						/>
						Invite Bot
					</NuxtLink>
					<div
						v-else
						class="h-9 rounded-lg bg-base-300/50 px-3 text-xs font-medium text-base-content/50 flex w-full cursor-not-allowed items-center justify-center transition-all duration-200"
					>
						<StarIcon
							name="heroicons:no-symbol"
							class="mr-1 size-3 inline"
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
		"outline outline-2 outline-error/20": !guild.manageable,
		"outline outline-2 outline-success/20 hover:border-success/40 focus-visible:border-success/50 focus-visible:ring-success/40":
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
