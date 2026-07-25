<template>
	<div class="contents">
		<slot />
		<div
			v-if="toasts.length"
			class="toast z-[100]"
			:class="toastPositionClass"
			aria-live="polite"
			aria-relevant="additions removals"
		>
			<div
				v-for="toast in toasts"
				:key="toast.id"
				role="alert"
				class="alert shadow-lg"
				:class="alertColorClass(toast.color)"
			>
				<Icon v-if="toast.icon" :name="toast.icon" class="size-5 shrink-0" />
				<div class="min-w-0 flex-1">
					<p v-if="toast.title" class="font-semibold">{{ toast.title }}</p>
					<p v-if="toast.description" class="text-sm opacity-90">
						{{ toast.description }}
					</p>
					<div v-if="toast.actions?.length" class="mt-2 flex flex-wrap gap-2">
						<UButton
							v-for="(action, index) in toast.actions"
							:key="index"
							size="xs"
							:label="action.label"
							:color="(action.color as SemanticColor | undefined) ?? 'neutral'"
							:variant="(action.variant as ButtonVariant | undefined) ?? 'soft'"
							:to="action.to"
							:target="action.target"
							@click="action.onClick?.($event)"
						/>
					</div>
				</div>
				<button
					type="button"
					class="btn btn-circle btn-ghost btn-xs"
					:aria-label="`Dismiss ${toast.title ?? 'notification'}`"
					@click="remove(toast.id)"
				>
					<Icon :name="toast.closeIcon ?? 'lucide:x'" class="size-4" />
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { SemanticColor } from "#shared/types/ui";
import { alertColorClass, type ButtonVariant } from "~/utils/ui-classes";

const props = withDefaults(
	defineProps<{
		toaster?: {
			expand?: boolean;
			duration?: number;
			position?: string;
		};
	}>(),
	{
		toaster: () => ({ duration: 5000, expand: true, position: "bottom-right" }),
	},
);

const { toasts, remove } = useToast();

const toastPositionClass = computed(() => {
	const position = props.toaster?.position ?? "bottom-right";
	switch (position) {
		case "top-left":
			return "toast-start toast-top";
		case "top-center":
			return "toast-center toast-top";
		case "top-right":
			return "toast-end toast-top";
		case "bottom-left":
			return "toast-start toast-bottom";
		case "bottom-center":
			return "toast-center toast-bottom";
		default:
			return "toast-end toast-bottom";
	}
});
</script>
