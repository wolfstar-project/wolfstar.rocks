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
						v-model="source"
						:items="sourceItems"
						class="w-full"
						:placeholder="ts('guild_settings.social.editor.provider_placeholder')"
						:aria-label="ts('guild_settings.social.editor.provider')"
					/>
					<template v-if="hasDisabledSources" #help>
						{{ ts("guild_settings.social.editor.disabled_help") }}
					</template>
				</UFormField>

				<UFormField :label="targetLabel" :help="targetHelp">
					<UInput
						v-model="draft.target"
						class="w-full"
						autocomplete="off"
						spellcheck="false"
						:maxlength="state.limits.targetLength"
						:aria-label="targetLabel"
					/>
				</UFormField>

				<UFormField
					v-if="draft.source === 'TwitchLive'"
					:label="ts('guild_settings.social.twitch.event')"
				>
					<URadioGroup
						v-model="draft.event"
						:items="eventItems"
						orientation="horizontal"
						:aria-label="ts('guild_settings.social.twitch.event')"
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
					:help="messageHelp"
					:required="messageRequired"
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
import type { SocialErrorCode, SocialState } from "#shared/utils/social";
import type { SocialDraftRequest, SocialSource } from "~/utils/social";

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
	save: [request: SocialDraftRequest];
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

const sourceOptions = computed(() => socialSourceOptions(state));
const hasDisabledSources = computed(() => sourceOptions.value.some((option) => option.disabled));

// A source Staryl has no credentials for stays listed, greyed and said so, so it is not mistaken
// for one the dashboard forgot.
const sourceItems = computed(() =>
	sourceOptions.value.map(({ disabled, source: value }) => {
		const name = ts(`guild_settings.social.providers.${value}`);
		return {
			disabled,
			icon: SOCIAL_PROVIDER_ICONS[value],
			label: disabled ? ts("guild_settings.social.editor.not_available", { name }) : name,
			value,
		};
	}),
);

// The select holds no `null`: nothing picked is `undefined` to it.
const source = computed<SocialSource | undefined>({
	get: () => draft.source ?? undefined,
	set: (value) => {
		draft.source = value ?? null;
	},
});

const eventItems = computed(() => [
	{ label: ts("guild_settings.social.twitch.events.StreamOnline"), value: "StreamOnline" },
	{ label: ts("guild_settings.social.twitch.events.StreamOffline"), value: "StreamOffline" },
]);

const targetLabel = computed(() =>
	draft.source === "TwitchLive"
		? ts("guild_settings.social.twitch.streamer")
		: ts("guild_settings.social.editor.target"),
);

// What the platform takes, so the first try has the right shape.
const targetHelp = computed(() =>
	draft.source === null
		? ts("guild_settings.social.editor.target_help.none")
		: ts(`guild_settings.social.editor.target_help.${draft.source}`),
);

const messageRequired = computed(
	() => draft.source === "TwitchLive" && draft.event === "StreamOffline",
);
const messageHelp = computed(() =>
	messageRequired.value
		? ts("guild_settings.social.editor.message_required_help")
		: ts("guild_settings.social.editor.message_help"),
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
	const request = socialDraftRequest(draft);
	if (problem.value || request === null) return;
	emit("save", request);
}
</script>
