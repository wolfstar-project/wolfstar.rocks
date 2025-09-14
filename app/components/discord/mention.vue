<template>
  <button class="tag">
    <span v-if="kind === 'mention'">@</span>
    <icons-app v-else-if="kind === 'app'" class="icon" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ kind?: "mention" | "app" }>(), {
  kind: "mention",
});
</script>

<style scoped>
@reference "@/assets/css/main.css";
.tag {
	@apply gap-1 rounded-md px-0.5 font-normal;
	background-color: hsla(235, 85.6%, 64.7%, 0.3);
	color: hsl(235, 86.2%, 88.6%, 1);

	@media (prefers-color-scheme: light) {
		background-color: hsla(235, 85.6%, 64.7%, 0.15);
		color: hsl(235, 86.2%, 64.7%, 1);
	}
}

.tag > .icon {
	@apply mr-0.5 inline-block h-3 w-3 -translate-y-0.5;
}

.tag:hover,
.tag:focus-visible {
	background-color: hsl(235, 85.6%, 64.7%, 1);
	color: hsl(0, 0%, 100%, 1);

	@media (prefers-color-scheme: light) {
		background-color: hsl(235, 85.6%, 64.7%, 0.7);
		color: hsl(0, 0%, 100%, 1);
	}
}
</style>
