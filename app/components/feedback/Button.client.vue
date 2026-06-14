<template>
	<div>
		<UButton
			icon="lucide:message-square"
			color="primary"
			variant="soft"
			size="lg"
			class="rounded-full"
			aria-label="Send feedback"
			@click="isOpen = true"
		/>
		<FeedbackModal v-model:open="isOpen" />
	</div>
</template>

<script setup lang="ts">
const isOpen = ref(false);
</script>
