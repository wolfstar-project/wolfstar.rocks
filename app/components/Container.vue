<template>
	<div class="home-container">
		<slot />
	</div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.home-container {
	@apply mx-auto w-full max-w-275 px-4 sm:px-6 lg:px-8;
}
</style>
