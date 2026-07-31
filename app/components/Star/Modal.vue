<template>
	<DialogRoot v-model:open="open">
		<DialogTrigger v-if="$slots.default" as-child>
			<slot />
		</DialogTrigger>
		<DialogPortal>
			<DialogOverlay class="inset-0 bg-base-300/60 fixed z-50" />
			<DialogContent
				class="modal-open modal inset-0 p-4 fixed z-50 flex items-center justify-center"
				:aria-describedby="description ? undefined : undefined"
				@escape-key-down="onDismiss"
				@pointer-down-outside="onDismiss"
				@interact-outside="onDismiss"
			>
				<div class="modal-box max-w-lg max-h-[90vh] w-full overflow-y-auto">
					<slot name="content">
						<slot name="header">
							<DialogTitle v-if="title" class="text-lg font-bold">{{
								title
							}}</DialogTitle>
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
						class="btn top-2 right-2 btn-circle btn-ghost btn-sm absolute"
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
