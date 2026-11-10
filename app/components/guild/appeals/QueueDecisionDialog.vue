<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="description"
		:ui="{ content: 'sm:max-w-120' }"
	>
		<template #body>
			<form :id="formId" novalidate @submit.prevent="emit('confirm', reason)">
				<UFormField
					:label="ts('guild_settings.appeals.queue.dialog.reason_label')"
					:help="ts('guild_settings.appeals.queue.dialog.reason_help')"
					:hint="`${reason.trim().length}/${MaximumAppealDecisionReasonLength}`"
				>
					<UTextarea
						v-model="reason"
						:maxlength="MaximumAppealDecisionReasonLength"
						:placeholder="ts('guild_settings.appeals.queue.dialog.reason_placeholder')"
						:rows="3"
						autoresize
						class="w-full"
					/>
				</UFormField>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					@click="open = false"
				>
					{{ ts("guild_settings.appeals.queue.dialog.cancel") }}
				</UButton>
				<UButton
					type="submit"
					:form="formId"
					:color="decision === 'Approve' ? 'primary' : 'error'"
				>
					{{
						decision === "Approve"
							? ts("guild_settings.appeals.queue.accept")
							: ts("guild_settings.appeals.queue.deny")
					}}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>("open", { required: true });

const { decision, name, caseId } = defineProps<{
	decision: AppealDecision;
	/** Who appealed, as the queue shows them. */
	name: string;
	/** The case that was appealed. */
	caseId: number;
}>();

const emit = defineEmits<{
	/** The decision was confirmed, with the reason as typed. */
	confirm: [reason: string];
}>();

const { ts } = useI18n();
const formId = useId();

const reason = ref("");

// Each opening starts blank, so the reason of the last appeal is never sent with the next.
watch(open, (isOpen) => {
	if (isOpen) reason.value = "";
});

const title = computed(() =>
	decision === "Approve"
		? ts("guild_settings.appeals.queue.dialog.accept_title")
		: ts("guild_settings.appeals.queue.dialog.deny_title"),
);

const description = computed(() =>
	decision === "Approve"
		? ts("guild_settings.appeals.queue.dialog.accept_description", { name, caseId })
		: ts("guild_settings.appeals.queue.dialog.deny_description", { name, caseId }),
);
</script>
