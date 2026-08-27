<template>
	<div>
		<UButton
			icon="lucide:message-square"
			color="primary"
			variant="soft"
			size="lg"
			class="rounded-full"
			:aria-label="ts('feedback.send')"
			@click="isOpen = true"
		/>
		<FeedbackModal v-model:open="isOpen" />
	</div>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const isOpen = ref(false);
</script>
