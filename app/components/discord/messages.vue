<template>
	<div class="discord-messages">
		<slot></slot>
	</div>
</template>

<style scoped>
@reference "@/assets/css/main.css";
.discord-messages {
	@apply flex flex-col rounded-xl bg-base-300 font-whitney drop-shadow-md;
	background-color: var(--color-base-300);
	background-color: oklch(from var(--color-base-200) calc(l - 0.04) c h);
}
</style>
