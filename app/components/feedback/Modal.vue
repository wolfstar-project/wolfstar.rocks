<template>
	<UModal
		v-model:open="open"
		:title="t('feedback.title')"
		:description="t('feedback.description')"
	>
		<template #body>
			<UForm
				id="feedback-form"
				ref="formRef"
				:schema
				:state
				class="space-y-4"
				@submit="onSubmit"
				@error="onError"
			>
				<UFormField v-if="!isDashboard" name="name" :label="t('feedback.name')" required>
					<UInput
						v-model="state.name"
						:placeholder="t('feedback.name_placeholder')"
						class="w-full"
					/>
				</UFormField>

				<UFormField v-if="!isDashboard" name="email" :label="t('feedback.email')" required>
					<UInput
						v-model="state.email"
						type="email"
						:placeholder="t('feedback.email_placeholder')"
						class="w-full"
					/>
				</UFormField>

				<UFormField name="message" :label="t('feedback.message')" required>
					<UTextarea
						v-model="state.message"
						:placeholder="t('feedback.message_placeholder')"
						:rows="4"
						class="w-full"
					/>
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<div class="flex justify-end gap-2">
				<UButton
					color="neutral"
					variant="ghost"
					:disabled="isSubmitting"
					@click="open = false"
				>
					{{ t("common.cancel") }}
				</UButton>
				<UButton
					type="submit"
					form="feedback-form"
					color="primary"
					:loading="isSubmitting"
					icon="i-lucide-send"
				>
					{{ t("feedback.send") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormErrorEvent } from "@nuxt/ui";
import { FeedbackSchema as schema, type FeedbackState as Schema } from "#shared/schemas";
import { captureFeedback } from "@sentry/nuxt";

const open = defineModel<boolean>("open", { default: false });
const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const { user } = useUserSession();
const isSubmitting = ref(false);
const { effectiveReduceMotion } = useReduceMotion();

const isDashboard = computed(
	() => route.path.startsWith("/guilds/") && route.path.includes("/manage"),
);

const state = reactive<Schema>({
	name: user.value?.name ?? "",
	email: user.value?.email ?? "",
	message: "",
});

async function onSubmit() {
	if (!import.meta.client) return;

	isSubmitting.value = true;
	try {
		captureFeedback({
			name: state.name,
			email: state.email,
			message: state.message,
		});

		state.message = "";
		open.value = false;

		toast.add({
			color: "success",
			description: t("feedback.sent_toast_description"),
			icon: "heroicons:check-circle",
			title: t("feedback.sent_title"),
		});
	} finally {
		isSubmitting.value = false;
	}
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({
		behavior: effectiveReduceMotion.value ? "auto" : "smooth",
		block: "center",
	});
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: t("feedback.send_failed_description", {
			message: errorMessage ?? t("common.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: t("feedback.send_failed_title"),
	});
}
</script>
