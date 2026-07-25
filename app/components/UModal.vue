<template>
	<DialogRoot v-model:open="open">
		<DialogTrigger v-if="$slots.default" as-child>
			<slot />
		</DialogTrigger>
		<DialogPortal>
			<DialogOverlay class="fixed inset-0 z-50 bg-base-300/60" />
			<DialogContent
				class="modal modal-open fixed inset-0 z-50 flex items-center justify-center p-4"
				:aria-describedby="description ? undefined : undefined"
				@escape-key-down="onDismiss"
				@pointer-down-outside="onDismiss"
				@interact-outside="onDismiss"
			>
				<div class="modal-box max-h-[90vh] w-full max-w-lg overflow-y-auto">
					<slot name="content">
						<slot name="header">
							<DialogTitle v-if="title" class="text-lg font-bold">{{ title }}</DialogTitle>
							<DialogDescription v-if="description" class="py-2 text-sm opacity-80">
								{{ description }}
							</DialogDescription>
						</slot>
						<div class="py-2">
							<slot name="body" />
						</div>
						<div v-if="$slots.footer" class="modal-action">
							<slot name="footer" />
						</div>
					</slot>
					<DialogClose
						v-if="dismissible !== false"
						class="btn btn-ghost btn-sm btn-circle absolute top-2 right-2"
						aria-label="Close"
					>
						<Icon name="lucide:x" class="size-4" />
					</DialogClose>
				</div>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>

<script setup lang="ts">
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "reka-ui";

const props = withDefaults(
	defineProps<{
		title?: string;
		description?: string;
		dismissible?: boolean;
	}>(),
	{
		dismissible: true,
	},
);

const open = defineModel<boolean>("open", { default: false });

function onDismiss(event: Event) {
	if (props.dismissible === false) {
		event.preventDefault();
	}
}
</script>
