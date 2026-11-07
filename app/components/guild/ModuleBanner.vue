<template>
	<section
		class="console-card flex items-center gap-3.5 border-l-[3px]"
		:class="on ? 'border-l-primary' : 'border-l-base-content/20'"
		:aria-labelledby="headingId"
	>
		<span
			class="flex size-11 shrink-0 items-center justify-center rounded-lg"
			:class="on ? 'bg-primary/15 text-primary' : 'bg-base-content/8 text-muted'"
			aria-hidden="true"
		>
			<UIcon :name="icon" class="size-5.5" />
		</span>
		<div class="min-w-0 flex-1">
			<h3 :id="headingId" class="text-base font-bold">{{ title }}</h3>
			<p class="text-[0.8125rem] text-muted">{{ hint }}</p>
		</div>
		<!-- The module's switch, or its state when it has none. -->
		<slot></slot>
	</section>
</template>

<script setup lang="ts">
/**
 * The card at the top of a module's section: what the module is called, what
 * turning it off does, and its switch.
 */
const { on = true } = defineProps<{
	icon: string;
	title: string;
	hint: string;
	/** Whether the module is on; a module that is off is drawn muted. */
	on?: boolean;
}>();

const headingId = useId();
</script>
