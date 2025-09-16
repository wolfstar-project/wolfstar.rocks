<template>
  <UModal
    v-model:open="open"
    title="Give a feedback"
    :ui="{
      body: 'p-4 flex align-center',
      footer: 'justify-end'
    }"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
  >
    <UButton
      icon="i-heroicons-chat-bubble-left-ellipsis"
      aria-label="Feedback"
      color="neutral"
      variant="ghost"
    />

    <template #content>
      <div v-if="!success" class="p-4">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="submitFeedback">
          <UFormField label="Name" name="name">
            <UInput v-model="state.name">
              <template v-if="state.name?.length" #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-circle-x"
                  aria-label="Clear input"
                  @click="state.name = undefined"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput v-model="state.email" autocomplete="email">
              <template v-if="state.email?.length" #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-circle-x"
                  aria-label="Clear input"
                  @click="state.email = ''"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Feedback" name="message">
            <UTextarea v-model="state.message" placeholder="Type feedback..." autoresize />
          </UFormField>
        </UForm>
      </div>
      <div v-else class="p-4 text-green-700 font-semibold">
        Thanks for Feedback!
      </div>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Send" type="submit" :disabled="!state.message" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { InferType } from "yup";
import * as Sentry from "@sentry/nuxt";
import { object, string } from "yup";

const schema = object({
  name: string().optional(),
  email: string().email("Invalid email").required("Email is required"),
  message: string().required("Message is required"),
});

type Schema = InferType<typeof schema>;

const open = ref(false);
const success = ref(false);

const state = reactive<Schema>({
  name: undefined,
  email: "",
  message: "",
});

async function submitFeedback(event: FormSubmitEvent<Schema>) {
  const params: any = {
    email: event.data.email,
  };
  if (event.data.name) {
    params.name = event.data.name;
  }
  if (event.data.message) {
    params.message = event.data.message;
  }
  Sentry.captureFeedback(params);
  success.value = true;
}
</script>
