<template>
	<UModal
		v-model:open="open"
		title="Send Feedback"
		description="Report a bug or share your thoughts with the WolfStar team."
	>
		<template #body>
			<UForm ref="formRef" :schema :state class="space-y-4" @submit="onSubmit">
				<UFormField name="name" label="Name" required>
					<UInput v-model="state.name" placeholder="Your name" class="w-full" />
				</UFormField>

				<UFormField name="email" label="Email" required>
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
				<UButton color="primary" :loading="isSubmitting" icon="lucide:send" @click="submit">
					Send Feedback
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import * as v from "valibot";

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();
const { user } = useUserSession();

const schema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name is required")),
	email: v.pipe(v.string(), v.email("Enter a valid email address")),
	message: v.pipe(v.string(), v.minLength(10, "Message must be at least 10 characters")),
});

type FeedbackState = v.InferInput<typeof schema>;

const state = reactive<FeedbackState>({
	name: user.value?.name ?? "",
	email: user.value?.email ?? "",
	message: "",
});

// Reset state when modal opens so stale data doesn't persist
watch(open, (isOpen) => {
	if (isOpen) {
		state.name = user.value?.name ?? "";
		state.email = user.value?.email ?? "";
		state.message = "";
	}
});

const formRef = useTemplateRef("formRef");
const isSubmitting = ref(false);

async function submit() {
	await formRef.value?.submit();
}

async function onSubmit() {
	if (!import.meta.client) return;

	isSubmitting.value = true;

	try {
		const { captureFeedback } = await import("@sentry/nuxt");
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
	} catch (error) {
		console.error(error);
		void import("@sentry/nuxt")
			.then(({ captureException }) => captureException(error))
			.catch(() => {});
		toast.add({
			color: "error",
			description: "Failed to send feedback. Please try again.",
			icon: "i-heroicons-x-circle",
			title: "Something went wrong",
		});
	} finally {
		isSubmitting.value = false;
	}
}
</script>
