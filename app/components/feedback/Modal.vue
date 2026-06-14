<template>
	<UModal
		v-model:open="open"
		title="Send Feedback"
		description="Report a bug or share your thoughts with the WolfStar team."
	>
		<template #body>
			<UForm
				ref="formRef"
				:schema
				:state
				class="space-y-4"
				@submit="onSubmit"
				@error="onError"
			>
				<UFormField v-if="!isDashboard" name="name" label="Name" required>
					<UInput v-model="state.name" placeholder="Your name" class="w-full" />
				</UFormField>

				<UFormField v-if="!isDashboard" name="email" label="Email" required>
					<UInput
						v-model="state.email"
						type="email"
						placeholder="your@email.com"
						class="w-full"
					/>
				</UFormField>

				<UFormField name="message" label="Message" required>
					<UTextarea
						v-model="state.message"
						placeholder="What happened? What did you expect to happen?"
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
					Cancel
				</UButton>
				<UButton color="primary" :loading="isSubmitting" icon="lucide:send">
					Send Feedback
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormErrorEvent } from "@nuxt/ui";
import { FeedbackSchema as schema, type FeedbackState as Schema } from "#shared/schemas";
import { captureFeedback } from "@sentry/nuxt";

const { isDashboard = false } = defineProps<{
	isDashboard?: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });
const toast = useToast();
const { user } = useUserSession();

const state = reactive<Schema>({
	name: user.value?.name ?? "",
	email: user.value?.email ?? "",
	message: "",
});

const isSubmitting = ref(false);

async function onSubmit() {
	if (!import.meta.client) return;

	isSubmitting.value = true;
	try {
		captureFeedback({
			name: state.name,
			email: state.email,
			message: state.message,
		});

		open.value = false;

		toast.add({
			color: "success",
			description: "Your feedback has been sent. Thank you!",
			icon: "i-heroicons-check-circle",
			title: "Feedback Sent",
		});
	} finally {
		isSubmitting.value = false;
	}
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: `Couldn't send feedback. ${errorMessage ?? "Please try again."}`,
		icon: "i-heroicons-x-circle",
		title: "Send Feedback Failed",
	});
}
</script>
