<template>
	<!-- Guild UIcon - Card or Bare variant -->
	<div
		ref="icon"
		:class="[
			variant === 'card'
				? 'group relative flex flex-col items-center space-y-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-base-200/50 hover:shadow-lg'
				: 'relative',
			{
				'ring-2 ring-primary/20':
					variant === 'card' && guild.wolfstarIsIn && guild.manageable,
				'ring-2 ring-error/20': variant === 'card' && !guild.manageable,
				'opacity-75': variant === 'card' && !guild.manageable,
			},
		]"
	>
		<!-- Guild UIcon -->
		<div class="relative" :class="[variant === 'card' ? '' : 'group']">
			<!-- Status Indicator -->
			<div v-if="showStatus && guild" class="absolute -top-1 -right-1 z-10">
				<UTooltip :text="statusIndicator.tooltipText">
					<div
						class="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm transition-all duration-200"
						:class="statusIndicator.wrapperClasses"
					>
						<span class="sr-only">{{ statusIndicator.tooltipText }}</span>
						<UIcon
							:name="statusIndicator.iconName"
							:class="statusIndicator.iconClasses"
							aria-hidden="true"
						/>
					</div>
				</UTooltip>
			</div>
			<div class="avatar" :class="{ 'avatar-placeholder': isDefault }">
				<div
					class="flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
					:class="iconSizeClasses"
					role="img"
				>
					<div v-if="!loaded" class="h-full w-full skeleton"></div>
					<NuxtImg
						v-if="!isDefault && loaded"
						:src="createUrl(preferredFormat, iconPixelSize)"
						:format="preferredFormat === 'gif' ? undefined : 'webp'"
						:width="iconPixelSize"
						:height="iconPixelSize"
						sizes="96px"
						:alt="guild?.name || 'Guild icon'"
						class="h-full w-full rounded-full object-cover"
						loading="lazy"
						decoding="async"
						crossorigin="anonymous"
					/>
					<div
						v-else-if="isDefault && loaded"
						class="flex items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20 text-base-content"
						:class="iconSizeClasses"
					>
						<span :class="acronymSizeClasses">{{ guild.acronym }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Guild Name (optional) - only in card variant -->
		<div v-if="variant === 'card' && showName && guild" class="w-full text-center">
			<h3
				class="line-clamp-1 text-xs font-medium text-base-content transition-colors group-hover:text-primary"
			>
				{{ guild.name }}
			</h3>
		</div>

		<!-- Guild Stats (optional) - only in card variant -->
		<div
			v-if="variant === 'card' && showStats && guild"
			class="flex items-center justify-center space-x-2 text-xs text-base-content/60"
		>
			<span
				v-if="guild.approximateMemberCount"
				class="flex items-center space-x-1"
				title="Total members"
			>
				<UIcon name="ph:users-fill" class="h-2 w-2" aria-hidden="true" />
				<span>{{ formatNumber(guild.approximateMemberCount) }}</span>
			</span>
			<span
				v-if="guild.approximatePresenceCount"
				class="flex items-center space-x-1"
				title="Members online"
			>
				<UIcon name="ph:wifi-high" class="h-2 w-2 text-success" aria-hidden="true" />
				<span>{{ formatNumber(guild.approximatePresenceCount) }}</span>
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
interface GuildIconProps {
	guild: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
	size?: "sm" | "md" | "lg" | "xl";
	variant?: "card" | "bare";
	showStatus?: boolean;
	showName?: boolean;
	showStats?: boolean;
}

const {
	guild,
	size = "md",
	variant = "card",
	showStatus = true,
	showName = false,
	showStats = false,
} = defineProps<GuildIconProps>();

const loaded = ref(false);
const icon = useTemplateRef<HTMLElement | null>("icon");
const prefersReducedMotion = usePreferredReducedMotion();

// Intersection Observer to lazy-load the icon image
const { stop } = useIntersectionObserver(
	icon,
	([entry]) => {
		if (entry?.isIntersecting) {
			loaded.value = true;
			stop();
		}
	},
	{ rootMargin: "150px" },
);
// Make these computed to avoid SSR hydration issues
const isDefault = ref(false);
const isAnimated = ref(false);
// Size-based classes for DaisyUI Avatar
const iconSizeClasses = computed(() => {
	const sizeMap = {
		lg: "size-20",
		md: "size-16",
		sm: "size-12",
		xl: "size-24",
	};
	return sizeMap[size];
});

const acronymSizeClasses = computed(() => {
	const sizeMap = {
		lg: "text-xl font-bold",
		md: "text-lg font-bold",
		sm: "text-sm font-bold",
		xl: "text-2xl font-bold",
	};
	return sizeMap[size];
});

const iconPixelSize = computed(() => {
	const sizeMap = {
		lg: 80,
		md: 64,
		sm: 48,
		xl: 96,
	} as const;

	return sizeMap[size];
});

const preferredFormat = computed<"gif" | "png">(() => {
	if (isAnimated.value && prefersReducedMotion.value !== "reduce") {
		return "gif";
	}

	return "png";
});

interface StatusIndicator {
	wrapperClasses: string;
	iconName: string;
	iconClasses: string;
	tooltipText: string;
}

const statusIndicator = computed<StatusIndicator>(() => {
	// 1) Bot present
	if (guild.wolfstarIsIn) {
		// 1a) Bot present + user can manage
		if (guild.manageable) {
			return {
				iconClasses: "h-5 w-5",
				iconName: "heroicons:check-badge",
				tooltipText: "WolfStar is active in this server",
				wrapperClasses: "bg-success/70 hover:bg-success/60",
			};
		}

		// 1b) Bot present + user cannot manage
		return {
			iconClasses: "h-4 w-4",
			iconName: "heroicons:lock-closed",
			tooltipText:
				"WolfStar is active, but you have insufficient permissions to manage this server",
			wrapperClasses: "bg-warning/70 hover:bg-warning/60",
		};
	}

	// 2) Bot not present
	if (guild.manageable) {
		return {
			iconClasses: "h-5 w-5",
			iconName: "heroicons:plus-circle",
			tooltipText: "You can invite WolfStar to this server",
			wrapperClasses: "bg-primary/70 hover:bg-primary/60",
		};
	}

	// 3) Bot not present + user cannot manage
	return {
		iconClasses: "h-4 w-4",
		iconName: "heroicons:shield-exclamation",
		tooltipText: "You cannot invite WolfStar to this server due to insufficient permissions",
		wrapperClasses: "bg-error/70",
	};
});

// Utility functions
function createUrl(format: "webp" | "png" | "gif", size: number) {
	return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${format}?size=${size}`;
}

function formatNumber(num: number): string {
	return Intl.NumberFormat("en-US", {
		compactDisplay: "short",
		maximumFractionDigits: 1,
		notation: "compact",
	}).format(num);
}

watch(
	() => guild,
	(guild) => {
		isDefault.value = guild.icon === null;
		isAnimated.value = guild.icon?.startsWith("a_") ?? false;
	},
	{ immediate: true },
);
</script>
