<template>
	<section
		:id="id"
		:class="
			cn(
				'home-section animate-on-scroll',
				band && 'home-section--band',
				scrollMargin && 'scroll-mt-24',
				spacing === 'lg' ? 'py-20' : spacing === 'none' ? null : 'py-16',
				className,
			)
		"
		:aria-labelledby="labelledBy"
	>
		<Container v-if="contained">
			<slot />
		</Container>
		<slot v-else />
	</section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
const {
	band = false,
	class: className,
	contained = true,
	id,
	labelledBy,
	scrollMargin = false,
	spacing = "md",
} = defineProps<{
	band?: boolean;
	class?: string;
	contained?: boolean;
	id?: string;
	labelledBy?: string;
	scrollMargin?: boolean;
	spacing?: "lg" | "md" | "none";
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-section--band {
	background-color: oklch(from var(--color-base-100) l c h / 0.35);
}
</style>
