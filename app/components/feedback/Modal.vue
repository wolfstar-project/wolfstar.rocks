<template>
	<UModal
		v-model:open="open"
		:title="ts('feedback.title')"
		:description="ts('feedback.description')"
	>
		<template #body>
			<FeedbackForm :id="formId" v-model:submitting="isSubmitting" @sent="open = false" />
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-2.5">
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="isSubmitting"
					@click="open = false"
				>
					{{ ts("common.cancel") }}
				</UButton>
				<UButton
					type="submit"
					:form="formId"
					color="primary"
					:loading="isSubmitting"
					icon="i-lucide-send"
				>
					{{ ts("feedback.send") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });
const { ts } = useI18n();
const formId = useId();
const isSubmitting = ref(false);
</script>
