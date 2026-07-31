<template>
	<div class="contents">
		<slot />
		<div
			v-if="visibleToasts.length"
			class="toast z-[100]"
			:class="toastPositionClass"
			aria-live="polite"
			aria-relevant="additions removals"
		>
			<div
				v-for="toast in visibleToasts"
				:key="toast.id"
				role="alert"
				class="alert shadow-lg"
				:class="alertColorClass(toast.color)"
				@click="toast.onClick?.(toast)"
			>
				<Icon v-if="toast.icon" :name="toast.icon" class="size-5 shrink-0" />
				<div class="min-w-0 flex-1">
					<p v-if="toast.title" class="font-semibold">
						{{ toast.title
						}}<span
							v-if="toast._duplicate && toast._duplicate > 0"
							class="ms-1 opacity-70"
							>({{ toast._duplicate + 1 }})</span
						>
					</p>
					<p v-if="toast.description" class="text-sm opacity-90">
						{{ toast.description }}
					</p>
					<div v-if="toast.actions?.length" class="mt-2 gap-2 flex flex-wrap">
						<StarButton
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
					v-if="toast.close !== false"
					type="button"
					class="btn btn-circle btn-ghost btn-xs"
					:aria-label="`Dismiss ${toast.title ?? 'notification'}`"
					@click.stop="remove(toast.id)"
				>
					<Icon :name="toast.closeIcon ?? 'lucide:x'" class="size-4" />
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { SemanticColor } from "#shared/types/ui";
import { toastMaxInjectionKey } from "~/composables/useToast";
import { alertColorClass, type ButtonVariant } from "~/utils/ui-classes";

const props = withDefaults(
	defineProps<{
		toaster?: {
			expand?: boolean;
			duration?: number;
			position?: string;
			/** Maximum number of toasts to display at once. @default 5 */
			max?: number;
		};
	}>(),
	{
		toaster: () => ({ duration: 5000, expand: true, position: "bottom-right", max: 5 }),
	},
);

const { toasts, remove } = useToast();

provide(
	toastMaxInjectionKey,
	computed(() => props.toaster?.max ?? 5),
);

const visibleToasts = computed(() => toasts.value.filter((toast) => toast.open !== false));

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
