<template>
	<div class="px-4 py-8 flex min-h-[50dvh] items-center justify-center">
		<div
			:class="panelClass"
			:role="panelRole"
			:aria-live="panelAriaLive"
			:aria-busy="loading || undefined"
		>
			<div :class="iconWrapClass" aria-hidden="true">
				<Icon
					:name="resolvedIcon"
					:class="
						cn(
							'size-8 sm:size-10',
							toneIconClass,
							!loading && tone === 'success' && 'oauth-status-icon-enter',
						)
					"
				/>
				<Icon
					v-if="loading"
					name="heroicons:arrow-path"
					class="-right-1 -bottom-1 size-5 animate-spin text-primary sm:size-6 absolute"
				/>
			</div>

			<p class="text-lg font-semibold text-base-content sm:text-xl text-balance">
				{{ title }}
			</p>

			<div
				v-if="$slots.description"
				class="text-sm text-base-content/70 sm:text-base text-pretty"
			>
				<slot name="description" />
			</div>

			<div
				v-if="loading"
				class="gap-2 pt-1 flex items-center justify-center"
				aria-hidden="true"
			>
				<span
					class="size-2 bg-primary animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full"
				/>
				<span
					class="size-2 bg-primary animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full [animation-delay:200ms]"
				/>
				<span
					class="size-2 bg-primary animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full [animation-delay:400ms]"
				/>
			</div>

			<div
				v-if="$slots.actions"
				class="gap-2 pt-2 sm:flex-row sm:items-center flex flex-col items-stretch justify-center"
			>
				<slot name="actions" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

type OAuthStatusTone = "info" | "success" | "warning" | "error";

const {
	tone,
	title,
	icon,
	loading = false,
} = defineProps<{
	tone: OAuthStatusTone;
	title: string;
	icon?: string;
	loading?: boolean;
}>();

const defaultIcons: Record<OAuthStatusTone, string> = {
	error: "heroicons:x-circle",
	info: "ph:discord-logo-fill",
	success: "heroicons:check-circle",
	warning: "heroicons:exclamation-triangle",
};

const resolvedIcon = computed(() => icon ?? defaultIcons[tone]);

const panelRole = computed(() => {
	if (loading || tone === "success" || tone === "info") {
		return "status";
	}
	if (tone === "error" || tone === "warning") {
		return "alert";
	}
	return undefined;
});

const panelAriaLive = computed(() => {
	if (loading || tone === "success") {
		return "polite";
	}
	if (tone === "error" || tone === "warning") {
		return "assertive";
	}
	return undefined;
});

const toneIconClass = computed(() => {
	switch (tone) {
		case "success":
			return "text-success";
		case "warning":
			return "text-warning";
		case "error":
			return "text-error";
		default:
			return "text-info";
	}
});

const toneSurfaceClass = computed(() => {
	switch (tone) {
		case "success":
			return "border-success/30 bg-success/10";
		case "warning":
			return "border-warning/30 bg-warning/10";
		case "error":
			return "border-error/30 bg-error/10";
		default:
			return "border-info/30 bg-info/10";
	}
});

const panelClass = computed(() =>
	cn(
		"oauth-status-panel max-w-md animate-fade-in-up gap-3 rounded-xl p-5 sm:gap-4 sm:p-8 flex w-full flex-col items-center border text-center",
		toneSurfaceClass.value,
	),
);

const iconWrapClass = computed(() =>
	cn(
		"mb-1 size-14 sm:size-16 relative flex items-center justify-center rounded-full",
		toneSurfaceClass.value,
	),
);
</script>

<style scoped>
.oauth-status-icon-enter {
	animation: oauth-status-scale-in 280ms ease-out both;
}

@keyframes oauth-status-scale-in {
	from {
		opacity: 0;
		transform: scale(0.7);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}
</style>
