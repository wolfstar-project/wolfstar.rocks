<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="jg-heading">
			<h2 :id="headingId">{{ ts("guild_settings.joinguard.rules.title") }}</h2>
			<span class="jg-heading-rule" aria-hidden="true"></span>
			<span class="jg-count">
				{{
					ts("guild_settings.joinguard.rules.count", {
						count: rules.length,
						max: MaximumJoinGuardRules,
					})
				}}
			</span>
			<UButton
				v-if="rules.length < MaximumJoinGuardRules"
				color="primary"
				size="sm"
				:disabled="isLoading || hasFailed"
				@click="openEditor(null)"
			>
				{{ ts("guild_settings.joinguard.rules.new") }}
			</UButton>
		</div>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.joinguard.rules.help") }}
		</p>

		<div class="mt-4">
			<div
				v-if="isLoading"
				class="grid grid-cols-1 gap-3 lg:grid-cols-2"
				role="status"
				:aria-label="ts('guild_settings.joinguard.rules.loading_aria')"
			>
				<USkeleton v-for="n in 2" :key="n" class="h-40 w-full rounded-xl" />
			</div>

			<div v-else-if="hasFailed" class="jg-empty" role="alert">
				<p class="text-toned">{{ ts("guild_settings.joinguard.rules.load_failed") }}</p>
				<UButton color="neutral" variant="outline" @click="refresh()">
					{{ ts("guild_settings.joinguard.rules.retry") }}
				</UButton>
			</div>

			<div v-else-if="rules.length === 0" class="jg-empty">
				<span class="jg-empty-icon" aria-hidden="true">
					<UIcon name="ic:round-verified-user" class="size-6 text-muted" />
				</span>
				<p class="text-base font-bold">
					{{ ts("guild_settings.joinguard.rules.empty_title") }}
				</p>
				<p class="max-w-95 text-[0.8125rem] leading-[1.55] text-muted">
					{{ ts("guild_settings.joinguard.rules.empty_description") }}
				</p>
				<UButton color="primary" size="sm" @click="openEditor(null)">
					{{ ts("guild_settings.joinguard.rules.new") }}
				</UButton>
			</div>

			<ul v-else class="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<li v-for="rule in rules" :key="rule.id" class="flex">
					<GuildJoinguardRuleCard
						class="w-full"
						:rule="rule"
						:busy="busyRuleId === rule.id"
						@toggle="toggleRule(rule, $event)"
						@edit="openEditor(rule)"
						@delete="ruleToDelete = rule"
					/>
				</li>
			</ul>
		</div>

		<GuildJoinguardRuleEditor
			v-model:open="editorOpen"
			:rule="editedRule"
			:checkpoint-on="checkpointOn"
			:guild="guildData"
			:saving="saving"
			:error-code="editorErrorCode"
			@save="saveRule"
			@delete="askDeleteFromEditor"
		/>

		<UModal
			:open="ruleToDelete !== null"
			:title="ts('guild_settings.joinguard.rules.delete_title')"
			:description="
				ts('guild_settings.joinguard.rules.delete_description', {
					name: ruleToDelete?.name ?? '',
				})
			"
			:dismissible="!saving"
			@update:open="!$event && (ruleToDelete = null)"
		>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="outline"
						class="dialog-cancel"
						:disabled="saving"
						@click="ruleToDelete = null"
					>
						{{ ts("guild_settings.joinguard.editor.cancel") }}
					</UButton>
					<UButton color="error" :loading="saving" @click="confirmDelete">
						{{ ts("guild_settings.joinguard.rules.delete_confirm") }}
					</UButton>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
import type { JoinGuardRule, JoinGuardRuleInput } from "#shared/utils/join-guard";
import type { JoinGuardRuleErrorCode } from "~/composables/useJoinGuardRules";
/**
 * The guard rules of the open server. A rule is a row of its own, written at
 * once like an auto-moderation rule, not staged with the settings.
 */
const { ts } = useI18n();
const toast = useToast();
const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const { activeGuildId } = useActiveGuild();

const { createRule, deleteRule, refresh, rules, status, updateRule } =
	useJoinGuardRules(activeGuildId);

const headingId = useId();

const isLoading = computed(
	() => (status.value === "idle" || status.value === "pending") && rules.value.length === 0,
);
const hasFailed = computed(() => status.value === "error" && rules.value.length === 0);

// The settings carry what is staged on top of what is saved, so a checkpoint
// turned on and not saved yet already lets a rule send members there.
const checkpointOn = computed(() => guildSettings.value?.joinGuardCheckpoint === true);

const editorOpen = ref(false);
const editedRule = ref<JoinGuardRule | null>(null);
const editorErrorCode = ref<JoinGuardRuleErrorCode | null>(null);
const ruleToDelete = ref<JoinGuardRule | null>(null);
const saving = ref(false);
const busyRuleId = ref<string | null>(null);

function openEditor(rule: JoinGuardRule | null) {
	editedRule.value = rule;
	editorErrorCode.value = null;
	editorOpen.value = true;
}

function notifyFailure(code: JoinGuardRuleErrorCode) {
	toast.add({
		color: "error",
		description: ts(joinGuardRuleErrorKey(code)),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}

function notifySuccess(titleKey: string, name: string) {
	toast.add({
		color: "success",
		description: ts("guild_settings.joinguard.rules.toasts.applies"),
		icon: "heroicons:check-circle",
		title: ts(titleKey, { name }),
	});
}

async function saveRule(body: JoinGuardRuleInput) {
	saving.value = true;
	editorErrorCode.value = null;
	const target = editedRule.value;
	const result = target ? await updateRule(target.id, body) : await createRule(body);
	saving.value = false;

	if (!result.ok) {
		editorErrorCode.value = result.code;
		notifyFailure(result.code);
		return;
	}

	editorOpen.value = false;
	notifySuccess(
		target
			? "guild_settings.joinguard.rules.toasts.saved"
			: "guild_settings.joinguard.rules.toasts.created",
		result.value.name,
	);
}

async function toggleRule(rule: JoinGuardRule, enabled: boolean) {
	busyRuleId.value = rule.id;
	const result = await updateRule(rule.id, { enabled });
	busyRuleId.value = null;
	if (!result.ok) notifyFailure(result.code);
}

function askDeleteFromEditor() {
	const rule = editedRule.value;
	editorOpen.value = false;
	ruleToDelete.value = rule;
}

async function confirmDelete() {
	const rule = ruleToDelete.value;
	if (!rule) return;

	saving.value = true;
	const result = await deleteRule(rule.id);
	saving.value = false;
	ruleToDelete.value = null;

	if (result.ok) {
		notifySuccess("guild_settings.joinguard.rules.toasts.deleted", rule.name);
	} else {
		notifyFailure(result.code);
	}
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.jg-heading {
	@apply flex flex-wrap items-center gap-3;
}

.jg-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.jg-heading-rule {
	@apply h-px min-w-6 flex-1;
	background-color: var(--console-border);
}

/* The design system's soft badge: a blurple tint, the count in monospace. */
.jg-count {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

.jg-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-8 text-center;
	border: 1px dashed var(--console-border);
}

.jg-empty-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active);
}
</style>
