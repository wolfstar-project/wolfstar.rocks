<template>
	<div class="flex min-h-[50dvh] items-center justify-center px-4 py-8">
		<div
			:class="panelClass"
			:role="loading ? 'status' : undefined"
			:aria-live="loading || tone === 'success' ? 'polite' : undefined"
			:aria-busy="loading || undefined"
		>
			<div :class="iconWrapClass" aria-hidden="true">
				<UIcon
					:name="resolvedIcon"
					:class="[
						'size-8 sm:size-10',
						toneIconClass,
						!loading && tone === 'success' ? 'oauth-status-icon-enter' : undefined,
					]"
				/>
				<UIcon
					v-if="loading"
					name="heroicons:arrow-path"
					class="absolute -right-1 -bottom-1 size-5 animate-spin text-primary sm:size-6"
				/>
			</div>

			<p class="text-lg font-semibold text-balance text-base-content sm:text-xl">
				{{ title }}
			</p>

			<div
				v-if="$slots.description"
				class="text-sm text-pretty text-base-content/70 sm:text-base"
			>
				<slot name="description" />
			</div>

			<div
				v-if="loading"
				class="flex items-center justify-center gap-2 pt-1"
				aria-hidden="true"
			>
				<span
					class="size-2 animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full bg-primary"
				/>
				<span
					class="size-2 animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full bg-primary [animation-delay:200ms]"
				/>
				<span
					class="size-2 animate-[dot-pulse_600ms_ease-in-out_infinite] rounded-full bg-primary [animation-delay:400ms]"
				/>
			</div>

			<div
				v-if="$slots.actions"
				class="flex flex-col items-stretch justify-center gap-2 pt-2 sm:flex-row sm:items-center"
			>
				<slot name="actions" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
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

const panelClass = computed(
	() =>
		`oauth-status-panel animate-fade-in-up flex w-full max-w-md flex-col items-center gap-3 rounded-xl border p-5 text-center sm:gap-4 sm:p-8 ${toneSurfaceClass.value}`,
);

const iconWrapClass = computed(
	() =>
		`relative mb-1 flex size-14 items-center justify-center rounded-full sm:size-16 ${toneSurfaceClass.value}`,
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

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
