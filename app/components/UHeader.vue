<template>
	<header class="navbar bg-base-100 px-4" :class="attrClass" v-bind="restAttrs">
		<div class="navbar-start gap-2">
			<button
				type="button"
				class="btn btn-ghost btn-square lg:hidden"
				aria-label="Open menu"
				aria-controls="u-header-mobile-menu"
				:aria-expanded="open"
				@click="open = true"
			>
				<Icon name="lucide:menu" class="size-5" />
			</button>
			<slot name="left">
				<span v-if="title" class="text-lg font-bold">{{ title }}</span>
			</slot>
		</div>
		<div class="navbar-center hidden lg:flex">
			<slot />
		</div>
		<div class="navbar-end gap-2">
			<slot name="right" />
		</div>

		<dialog
			id="u-header-mobile-menu"
			ref="dialogRef"
			class="modal lg:hidden"
			@close="open = false"
		>
			<div class="modal-box flex max-h-[90vh] flex-col">
				<form method="dialog" class="absolute top-2 right-2">
					<button type="submit" class="btn btn-ghost btn-sm btn-circle" aria-label="Close menu">
						<Icon name="lucide:x" class="size-4" />
					</button>
				</form>
				<slot name="body" />
			</div>
			<form method="dialog" class="modal-backdrop">
				<button type="submit" aria-label="Close menu">close</button>
			</form>
		</dialog>
	</header>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{
	title?: string;
}>();

const open = ref(false);
const dialogRef = useTemplateRef<HTMLDialogElement>("dialogRef");

watch(open, (isOpen) => {
	const dialog = dialogRef.value;
	if (!dialog) return;
	if (isOpen && !dialog.open) dialog.showModal();
	if (!isOpen && dialog.open) dialog.close();
});

const attrs = useAttrs();
const attrClass = computed(() => attrs.class);
const restAttrs = computed(() => {
	const { class: _class, ...rest } = attrs;
	return rest;
});
</script>
