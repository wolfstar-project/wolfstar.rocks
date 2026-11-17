<template>
	<UModal
		v-model:open="open"
		:title="ts('guild_settings.social.edit.title')"
		:description="ts('guild_settings.social.edit.subtitle', { name: editing?.name ?? '' })"
		:dismissible="!saving"
		:ui="{ content: 'sm:max-w-xl' }"
	>
		<template #body>
			<div v-if="editing" class="flex flex-col gap-5">
				<!-- The account and the source name the subscription: to change them is a new one. -->
				<p class="flex items-center gap-2 text-sm">
					<UIcon
						:name="editing.icon"
						class="size-4 shrink-0 text-muted"
						aria-hidden="true"
					/>
					<span class="font-semibold text-highlighted">{{ editing.name }}</span>
					<span class="text-muted">· {{ editing.detail }}</span>
				</p>

				<SelectChannel
					v-model="channelId"
					layout="field"
					:guild="guildData"
					:label="ts('guild_settings.social.editor.channel')"
					:empty-label="ts('guild_settings.social.editor.channel_placeholder')"
					:tooltip-title="ts('guild_settings.social.editor.channel_help')"
				/>

				<UFormField
					:label="ts('guild_settings.social.editor.message')"
					:help="messageHelp"
					:required="editing.messageRequired"
				>
					<UTextarea
						v-model="message"
						:rows="2"
						autoresize
						class="w-full"
						:maxlength="messageLength"
						:aria-label="ts('guild_settings.social.editor.message')"
					/>
					<template #hint>
						<span class="font-mono text-xs text-muted">
							{{ message.length }} / {{ messageLength }}
						</span>
					</template>
				</UFormField>

				<UAlert
					v-if="errorCode"
					color="error"
					variant="subtle"
					icon="ic:round-error-outline"
					role="alert"
					:title="ts(`guild_settings.social.errors.${errorCode.replaceAll('-', '_')}`)"
				/>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="open = false"
				>
					{{ ts("guild_settings.social.editor.cancel") }}
				</UButton>
				<UButton color="primary" :loading="saving" :disabled="!canSave" @click="save">
					{{ ts("guild_settings.social.edit.save") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { SocialEditBody, SocialErrorCode } from "#shared/utils/social";
import type { SocialEditTarget } from "~/utils/social";

const open = defineModel<boolean>("open", { required: true });

const {
	editing,
	messageLength,
	saving = false,
	errorCode = null,
} = defineProps<{
	/** The subscription being edited, as the page lists it. */
	editing: SocialEditTarget | null;
	messageLength: number;
	saving?: boolean;
	/** What the server refused the last save with. */
	errorCode?: SocialErrorCode | null;
}>();

const emit = defineEmits<{
	save: [body: SocialEditBody];
}>();

const { ts } = useI18n();
const { guildData } = useGuildData();

const channelId = ref<string | null>(null);
const message = ref("");

// Each opening starts from the subscription as it is saved.
watch(
	[open, () => editing],
	([isOpen, target]) => {
		if (!isOpen || !target) return;
		channelId.value = target.channelId;
		message.value = target.message ?? "";
	},
	{ immediate: true },
);

const messageHelp = computed(() =>
	editing?.messageRequired
		? ts("guild_settings.social.editor.message_required_help")
		: ts("guild_settings.social.editor.message_help"),
);

const body = computed(() =>
	editing ? socialEditBody(editing, channelId.value, message.value) : null,
);
const canSave = computed(() => body.value !== null);

function save() {
	if (body.value) emit("save", body.value);
}
</script>
