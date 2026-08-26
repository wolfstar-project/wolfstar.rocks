<template>
	<div>
		<UButton
			icon="lucide:message-square"
			color="primary"
			variant="soft"
			size="lg"
			class="rounded-full"
			:aria-label="t('feedback.send')"
			@click="isOpen = true"
		/>
		<FeedbackModal v-model:open="isOpen" />
	</div>
</template>

<script setup lang="ts">
const { ts: t } = useI18n();
const isOpen = ref(false);
</script>
