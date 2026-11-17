<template>
	<UModal
		v-model:open="open"
		:title="ts('guild_settings.social.editor.title')"
		:description="ts('guild_settings.social.editor.subtitle')"
		:dismissible="!saving"
		:ui="{ content: 'sm:max-w-xl' }"
	>
		<template #body>
			<div class="flex flex-col gap-5">
				<UFormField :label="ts('guild_settings.social.editor.provider')">
					<USelect
						v-model="provider"
						:items="providerItems"
						class="w-full"
						:placeholder="ts('guild_settings.social.editor.provider_placeholder')"
						:aria-label="ts('guild_settings.social.editor.provider')"
					/>
				</UFormField>

				<UFormField :label="ts('guild_settings.social.editor.target')" :help="targetHelp">
					<UInput
						v-model="draft.target"
						class="w-full"
						autocomplete="off"
						spellcheck="false"
						:maxlength="state.limits.targetLength"
						:aria-label="ts('guild_settings.social.editor.target')"
					/>
				</UFormField>

				<SelectChannel
					v-model="draft.channelId"
					layout="field"
					:guild="guildData"
					:label="ts('guild_settings.social.editor.channel')"
					:empty-label="ts('guild_settings.social.editor.channel_placeholder')"
					:tooltip-title="ts('guild_settings.social.editor.channel_help')"
				/>

				<UFormField
					:label="ts('guild_settings.social.editor.message')"
					:help="ts('guild_settings.social.editor.message_help')"
				>
					<UTextarea
						v-model="draft.message"
						:rows="2"
						autoresize
						class="w-full"
						:maxlength="state.limits.messageLength"
						:aria-label="ts('guild_settings.social.editor.message')"
					/>
					<template #hint>
						<span class="font-mono text-xs text-muted">
							{{ draft.message.length }} / {{ state.limits.messageLength }}
						</span>
					</template>
				</UFormField>

				<UAlert
					v-if="problemMessage"
					color="error"
					variant="subtle"
					icon="ic:round-error-outline"
					role="alert"
					:title="problemMessage"
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
				<UButton
					color="primary"
					:loading="saving"
					:disabled="problem !== null"
					@click="save"
				>
					{{ ts("guild_settings.social.add") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type {
	SocialErrorCode,
	SocialProviderName,
	SocialState,
	SocialSubscriptionBody,
} from "#shared/utils/social";

const open = defineModel<boolean>("open", { required: true });

const {
	state,
	saving = false,
	errorCode = null,
} = defineProps<{
	/** The module as Staryl holds it: its platforms and its limits. */
	state: SocialState;
	saving?: boolean;
	/** What the server refused the last add with. */
	errorCode?: SocialErrorCode | null;
}>();

const emit = defineEmits<{
	save: [body: SocialSubscriptionBody];
}>();

const { ts } = useI18n();
const { guildData } = useGuildData();

const draft = reactive(emptySocialDraft());

// Every opening starts a new subscription: the dialog adds, it does not edit.
watch(
	open,
	(isOpen) => {
		if (isOpen) Object.assign(draft, emptySocialDraft());
	},
	{ immediate: true },
);

const providerItems = computed(() =>
	addableSocialProviders(state).map((name) => ({
		icon: SOCIAL_PROVIDER_ICONS[name],
		label: ts(`guild_settings.social.providers.${name}`),
		value: name,
	})),
);

// The select holds no `null`: nothing picked is `undefined` to it.
const provider = computed<SocialProviderName | undefined>({
	get: () => draft.provider ?? undefined,
	set: (value) => {
		draft.provider = value ?? null;
	},
});

// What the platform takes, so the first try has the right shape.
const targetHelp = computed(() =>
	draft.provider === null
		? ts("guild_settings.social.editor.target_help.none")
		: ts(`guild_settings.social.editor.target_help.${draft.provider}`),
);

const problem = computed(() => socialDraftProblem(draft, state));

// An empty field shows on its own. The limit does not, so it is said; then what the server refused.
const problemMessage = computed(() => {
	if (problem.value === "limit") {
		return ts("guild_settings.social.errors.limit_reached", {
			maximum: state.limits.subscriptions,
		});
	}
	if (!errorCode) return null;
	return ts(`guild_settings.social.errors.${errorCode.replaceAll("-", "_")}`, {
		maximum:
			errorCode === "x-limit-reached" ? state.limits.xAccounts : state.limits.subscriptions,
	});
});

function save() {
	const body = socialDraftBody(draft);
	if (problem.value || body === null) return;
	emit("save", body);
}
</script>
