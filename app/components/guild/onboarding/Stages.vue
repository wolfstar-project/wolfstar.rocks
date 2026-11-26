<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="ob-heading">
			<h3 :id="headingId">{{ ts("guild_settings.onboarding.stages.title") }}</h3>
			<span class="ob-heading-rule" aria-hidden="true"></span>
			<span class="ob-count">
				{{
					ts("guild_settings.onboarding.stages.count", {
						count: stages.length,
						max: MaximumOnboardingStages,
					})
				}}
			</span>
			<UButton
				v-if="stages.length < MaximumOnboardingStages"
				color="primary"
				size="sm"
				:disabled="locked"
				@click="openEditor(null)"
			>
				{{ ts("guild_settings.onboarding.stages.new") }}
			</UButton>
		</div>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.onboarding.stages.help") }}
		</p>

		<div v-if="stages.length === 0" class="ob-empty mt-4">
			<span class="ob-empty-icon" aria-hidden="true">
				<UIcon name="ic:round-checklist" class="size-6 text-muted" />
			</span>
			<p class="text-base font-bold">
				{{ ts("guild_settings.onboarding.stages.empty_title") }}
			</p>
			<p class="max-w-95 text-[0.8125rem] leading-[1.55] text-muted">
				{{ ts("guild_settings.onboarding.stages.empty_description") }}
			</p>
			<UButton color="primary" size="sm" :disabled="locked" @click="openEditor(null)">
				{{ ts("guild_settings.onboarding.stages.new") }}
			</UButton>
		</div>

		<ol v-else class="mt-4 flex flex-col">
			<li v-for="(stage, index) in stages" :key="stage.id" class="ob-item">
				<GuildOnboardingStageRow
					:stage="stage"
					:number="index + 1"
					:status="statusOf(stage)"
					:counts="state.weekByStage[stage.id] ?? NO_COUNTS"
					:first="index === 0"
					:last="index === stages.length - 1"
					:disabled="locked || busy"
					@toggle="toggleStage(stage, $event)"
					@edit="openEditor(stage)"
					@move="moveStage(stage, index, $event)"
				/>
			</li>
		</ol>

		<GuildOnboardingStageEditor
			v-model:open="editorOpen"
			:stage="editedStage"
			:guild="guildData"
			:saving="saving"
			:locked="locked"
			:error-message="editorError"
			@save="saveStage"
			@delete="askDeleteFromEditor"
		/>

		<UModal
			:open="stageToDelete !== null"
			:title="ts('guild_settings.onboarding.stages.delete_title')"
			:description="
				ts('guild_settings.onboarding.stages.delete_description', {
					name: stageToDelete?.name ?? '',
				})
			"
			:dismissible="!saving"
			@update:open="!$event && (stageToDelete = null)"
		>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="outline"
						class="dialog-cancel"
						:disabled="saving"
						@click="stageToDelete = null"
					>
						{{ ts("guild_settings.onboarding.stages.cancel") }}
					</UButton>
					<UButton color="error" :loading="saving" @click="confirmDelete">
						{{ ts("guild_settings.onboarding.stages.delete_confirm") }}
					</UButton>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
import type {
	OnboardingCounts,
	OnboardingStage,
	OnboardingStageInput,
	OnboardingState,
} from "#shared/utils/onboarding";
import type { OnboardingModule, OnboardingWriteResult } from "~/composables/useOnboarding";
import type { OnboardingWriteError } from "~/utils/onboarding";
import { blockedOnboardingStageIds, MaximumOnboardingStages } from "#shared/utils/onboarding";
/**
 * The stages of the open server, in the order a member meets them, each with
 * whether the bot can run it and how many members passed it this week. A
 * stage is a row of its own, written at once like an auto-moderation rule,
 * not staged with the settings.
 */
const { state, onboarding } = defineProps<{
	state: OnboardingState;
	/** The calls that change the onboarding, and whether the page must reload first. */
	onboarding: Pick<
		OnboardingModule,
		"conflict" | "createStage" | "deleteStage" | "reorderStages" | "updateStage"
	>;
}>();

const { ts } = useI18n();
const text = useOnboardingText();
const names = useJoinGuardNames();
const toast = useToast();
const { guildData } = useGuildData();

const headingId = useId();

const NO_COUNTS: OnboardingCounts = { failed: 0, passed: 0, waiting: 0 };

const stages = computed(() => state.stages);
const blocked = computed(() => blockedOnboardingStageIds(state.blockers, state.stages));
// After a conflict every write would be refused until the page reloads.
const locked = computed(() => onboarding.conflict.value);

function statusOf(stage: OnboardingStage): "ready" | "blocked" | "off" {
	if (!stage.enabled) return "off";
	return blocked.value.has(stage.id) ? "blocked" : "ready";
}

const editorOpen = ref(false);
const editedStage = ref<OnboardingStage | null>(null);
const editorError = ref<string | null>(null);
const stageToDelete = ref<OnboardingStage | null>(null);
const saving = ref(false);
const busy = ref(false);

// Reloading after a conflict replaces the stages under the editor: what it
// shows may no longer be the stage, so it closes.
watch(locked, (isLocked, wasLocked) => {
	if (wasLocked && !isLocked) {
		editorOpen.value = false;
		stageToDelete.value = null;
	}
});

function openEditor(stage: OnboardingStage | null) {
	editedStage.value = stage;
	editorError.value = null;
	editorOpen.value = true;
}

function messageOf(error: OnboardingWriteError): string {
	return onboardingWriteErrorMessage(error, { logChannelId: state.logChannelId }, text, names);
}

/** A conflict is said by the section's banner, which offers to reload: a toast would say it twice. */
function notifyFailure(error: OnboardingWriteError) {
	if (error.code === "conflict") return;
	toast.add({
		color: "error",
		description: messageOf(error),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}

function notifySuccess(titleKey: string, name: string) {
	toast.add({
		color: "success",
		description: ts("guild_settings.onboarding.stages.toasts.applies"),
		icon: "heroicons:check-circle",
		title: ts(titleKey, { name }),
	});
}

async function saveStage(body: OnboardingStageInput) {
	saving.value = true;
	editorError.value = null;
	const target = editedStage.value;
	const result = target
		? await onboarding.updateStage(target.id, body)
		: await onboarding.createStage(body);
	saving.value = false;

	if (!result.ok) {
		editorError.value = messageOf(result.error);
		notifyFailure(result.error);
		return;
	}

	editorOpen.value = false;
	notifySuccess(
		target
			? "guild_settings.onboarding.stages.toasts.saved"
			: "guild_settings.onboarding.stages.toasts.created",
		body.name,
	);
}

/** Runs a write of a row, with the rows' buttons off until it is back. */
async function runRowWrite(write: () => Promise<OnboardingWriteResult>) {
	busy.value = true;
	const result = await write();
	busy.value = false;
	if (!result.ok) notifyFailure(result.error);
	return result;
}

function toggleStage(stage: OnboardingStage, enabled: boolean) {
	return runRowWrite(() => onboarding.updateStage(stage.id, { enabled }));
}

async function moveStage(stage: OnboardingStage, index: number, direction: -1 | 1) {
	const order = moveOnboardingStage(
		stages.value.map((entry) => entry.id),
		index,
		direction,
	);
	if (order === null) return;

	const result = await runRowWrite(() => onboarding.reorderStages(order));
	if (result.ok) notifySuccess("guild_settings.onboarding.stages.toasts.moved", stage.name);
}

function askDeleteFromEditor() {
	const stage = editedStage.value;
	editorOpen.value = false;
	stageToDelete.value = stage;
}

async function confirmDelete() {
	const stage = stageToDelete.value;
	if (!stage) return;

	saving.value = true;
	const result = await onboarding.deleteStage(stage.id);
	saving.value = false;
	stageToDelete.value = null;

	if (result.ok) {
		notifySuccess("guild_settings.onboarding.stages.toasts.deleted", stage.name);
	} else {
		notifyFailure(result.error);
	}
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.ob-heading {
	@apply flex flex-wrap items-center gap-3;
}

.ob-heading h3 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.ob-heading-rule {
	@apply h-px min-w-6 flex-1;
	background-color: var(--console-border);
}

/* The design system's soft badge: a blurple tint, the count in monospace. */
.ob-count {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

.ob-item + .ob-item {
	border-top: 1px solid var(--home-border-subtle);
}

.ob-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-8 text-center;
	border: 1px dashed var(--console-border);
}

.ob-empty-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active);
}
</style>
