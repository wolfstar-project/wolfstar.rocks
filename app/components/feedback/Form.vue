<template>
	<UForm :id ref="formRef" :schema :state class="space-y-4" @submit="onSubmit" @error="onError">
		<UFormField v-if="!isDashboard" name="name" :label="ts('feedback.name')" required>
			<UInput
				v-model="state.name"
				:placeholder="ts('feedback.name_placeholder')"
				class="w-full"
			/>
		</UFormField>

		<UFormField v-if="!isDashboard" name="email" :label="ts('feedback.email')" required>
			<UInput
				v-model="state.email"
				type="email"
				:placeholder="ts('feedback.email_placeholder')"
				class="w-full"
			/>
		</UFormField>

		<UFormField name="message" :label="ts('feedback.message')" required>
			<UTextarea
				v-model="state.message"
				:placeholder="ts('feedback.message_placeholder')"
				:rows="4"
				class="w-full"
			/>
		</UFormField>
	</UForm>
</template>

<script setup lang="ts">
import type { FormErrorEvent } from "@nuxt/ui";
import { FeedbackSchema as schema, type FeedbackState as Schema } from "#shared/schemas";

/**
 * The feedback form, sent to Sentry. Its submit button lives with whoever shows
 * it (the feedback dialog, the settings dialog) and points at it by `id`.
 */
defineProps<{
	id: string;
}>();

const emit = defineEmits<{
	/** The message was sent; the form is empty again. */
	sent: [];
}>();

/** Whether a message is being sent, for the submit button outside the form. */
const isSubmitting = defineModel<boolean>("submitting", { default: false });
const { ts } = useI18n();
const toast = useToast();
const route = useRoute();
const { user } = useUserSession();
const { effectiveReduceMotion } = useReduceMotion();

const isDashboard = computed(
	() =>
		route.path === "/app" ||
		(route.path.startsWith("/guilds/") && route.path.includes("/manage")),
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
		// Loaded on submit: the SDK is not needed to render the form, and the
		// component test runner cannot import it at module load.
		const { captureFeedback } = await import("@sentry/nuxt");
		captureFeedback({
			name: state.name,
			email: state.email,
			message: state.message,
		});

		state.message = "";
		emit("sent");

		toast.add({
			color: "success",
			description: ts("feedback.sent_toast_description"),
			icon: "heroicons:check-circle",
			title: ts("feedback.sent_title"),
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
		description: ts("feedback.send_failed_description", {
			message: errorMessage ?? ts("common.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: ts("feedback.send_failed_title"),
	});
}
</script>
