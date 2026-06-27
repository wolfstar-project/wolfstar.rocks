<template>
	<div class="discord-messages">
		<slot></slot>
	</div>
</template>

<style scoped>
@reference "@/assets/css/main.css";
.discord-messages {
	@apply flex flex-col rounded-xl font-whitney drop-shadow-md;
	background-color: var(--discord-surface);
}
</style>
