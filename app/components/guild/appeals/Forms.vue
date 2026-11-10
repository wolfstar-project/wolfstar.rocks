<template>
	<section class="space-y-4" :aria-labelledby="headingId">
		<div class="flex items-center gap-3">
			<h2 :id="headingId" class="text-[1.0625rem] font-semibold whitespace-nowrap">
				{{ ts("guild_settings.appeals.forms.title") }}
			</h2>
			<span class="h-px flex-1 bg-base-content/15" aria-hidden="true"></span>
		</div>
		<p class="text-[0.8125rem] text-muted">
			{{ ts("guild_settings.appeals.forms.help") }}
		</p>

		<!-- Stacked on a phone, in a row from `sm` up. -->
		<div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
			<UButton
				color="primary"
				class="justify-center"
				:disabled="isLoading || hasFailed || forms.length >= MaximumAppealForms"
				:title="
					ts('guild_settings.appeals.forms.count', {
						count: forms.length,
						max: MaximumAppealForms,
					})
				"
				@click="openEditor(null)"
			>
				{{ ts("guild_settings.appeals.forms.new") }}
			</UButton>
			<span class="forms-count self-start sm:ml-auto sm:self-auto">
				{{
					ts("guild_settings.appeals.forms.count", {
						count: forms.length,
						max: MaximumAppealForms,
					})
				}}
			</span>
		</div>

		<div
			v-if="isLoading"
			class="grid grid-cols-1 gap-4 md:grid-cols-2"
			role="status"
			:aria-label="ts('guild_settings.appeals.forms.loading_aria')"
		>
			<USkeleton v-for="n in 2" :key="n" class="h-40 w-full rounded-lg" />
		</div>

		<div
			v-else-if="hasFailed"
			class="console-card flex flex-col items-center gap-3 py-10 text-center"
			role="alert"
		>
			<UIcon
				name="heroicons:exclamation-triangle"
				class="size-8 text-error"
				aria-hidden="true"
			/>
			<p class="text-toned">{{ ts("guild_settings.appeals.forms.load_failed") }}</p>
			<UButton color="neutral" variant="outline" @click="refresh()">
				{{ ts("guild_settings.appeals.forms.retry") }}
			</UButton>
		</div>

		<div
			v-else-if="forms.length === 0"
			class="console-card flex flex-col items-center gap-2 px-4 py-10 text-center"
		>
			<UIcon name="ic:round-rate-review" class="size-8 text-muted" aria-hidden="true" />
			<p class="font-semibold">
				{{ ts("guild_settings.appeals.forms.empty_title") }}
			</p>
			<p class="max-w-md text-sm text-muted">
				{{ ts("guild_settings.appeals.forms.empty_description") }}
			</p>
		</div>

		<ol v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<li
				v-for="(form, index) in forms"
				:key="form.id"
				class="console-card flex flex-col gap-3"
				:class="{ 'opacity-70': !form.enabled }"
			>
				<div class="flex items-start gap-2.5">
					<span class="form-icon" aria-hidden="true">
						<GuildAppealsFormIcon :icon="form.icon" />
					</span>
					<div class="min-w-0 flex-1">
						<p class="truncate text-[0.9375rem] leading-tight font-semibold">
							{{ form.name }}
						</p>
						<p
							v-if="form.description"
							class="mt-0.5 line-clamp-2 text-[0.8125rem] text-muted"
						>
							{{ form.description }}
						</p>
					</div>
					<USwitch
						:model-value="form.enabled"
						:disabled="busyFormId !== null"
						:aria-label="
							ts('guild_settings.appeals.forms.enable_aria', { name: form.name })
						"
						@update:model-value="toggleForm(form, $event)"
					/>
				</div>

				<ul
					class="flex flex-wrap gap-1.5"
					:aria-label="ts('guild_settings.appeals.forms.takes')"
				>
					<li v-if="!form.enabled" class="form-badge form-badge--locked">
						{{ ts("guild_settings.appeals.forms.locked") }}
					</li>
					<li v-if="form.types.length === 0" class="form-badge">
						{{ ts("guild_settings.appeals.forms.every_kind") }}
					</li>
					<li v-for="name in caseTypeNames(form)" :key="name" class="form-badge">
						{{ ts(APPEAL_CASE_TYPE_KEYS[name]) }}
					</li>
					<li class="form-badge">
						{{
							tc(
								"guild_settings.appeals.forms.questions_count",
								form.questions.length,
							)
						}}
					</li>
				</ul>

				<div class="mt-auto flex items-center gap-2 pt-1">
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						icon="ic:round-arrow-upward"
						:disabled="index === 0 || busyFormId !== null"
						:aria-label="
							ts('guild_settings.appeals.forms.move_up_aria', { name: form.name })
						"
						@click="move(index, index - 1)"
					/>
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						icon="ic:round-arrow-downward"
						:disabled="index === forms.length - 1 || busyFormId !== null"
						:aria-label="
							ts('guild_settings.appeals.forms.move_down_aria', { name: form.name })
						"
						@click="move(index, index + 1)"
					/>
					<span class="grow"></span>
					<UButton
						color="neutral"
						variant="outline"
						size="sm"
						class="form-action"
						:aria-label="
							ts('guild_settings.appeals.forms.edit_aria', { name: form.name })
						"
						@click="openEditor(form)"
					>
						{{ ts("guild_settings.appeals.forms.edit") }}
					</UButton>
					<UButton
						color="error"
						variant="outline"
						size="sm"
						class="form-action form-action--danger"
						:aria-label="
							ts('guild_settings.appeals.forms.delete_aria', { name: form.name })
						"
						@click="formToDelete = form"
					>
						{{ ts("guild_settings.appeals.forms.delete") }}
					</UButton>
				</div>
			</li>
		</ol>

		<GuildAppealsFormEditor
			v-model:open="editorOpen"
			:form="editedForm"
			:guild="guildData"
			:saving="saving"
			:error-code="editorErrorCode"
			@save="saveForm"
		/>

		<UModal
			:open="formToDelete !== null"
			:title="ts('guild_settings.appeals.forms.delete_title')"
			:description="
				ts('guild_settings.appeals.forms.delete_description', {
					name: formToDelete?.name ?? '',
				})
			"
			:dismissible="!saving"
			@update:open="!$event && (formToDelete = null)"
		>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="outline"
						class="dialog-cancel"
						:disabled="saving"
						@click="formToDelete = null"
					>
						{{ ts("guild_settings.appeals.editor.cancel") }}
					</UButton>
					<UButton color="error" :loading="saving" @click="confirmDelete">
						{{ ts("guild_settings.appeals.forms.delete") }}
					</UButton>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
const { ts, tc } = useI18n();
const toast = useToast();
const { guildData } = useGuildData();
const { activeGuildId } = useActiveGuild();

const headingId = useId();

const { createForm, deleteForm, forms, refresh, reorderForms, status, updateForm } =
	useAppealForms(activeGuildId);

const isLoading = computed(() => status.value === "idle" || status.value === "pending");
const hasFailed = computed(() => status.value === "error");

const ERROR_KEYS: Record<AppealFormErrorCode, string> = {
	generic: "guild_settings.appeals.forms.errors.generic",
	invalid: "guild_settings.appeals.forms.errors.invalid",
	limit: "guild_settings.appeals.forms.errors.limit",
	nameInvalid: "guild_settings.appeals.forms.errors.nameInvalid",
	nameTaken: "guild_settings.appeals.forms.errors.nameTaken",
	unknown: "guild_settings.appeals.forms.errors.unknown",
};

const editorOpen = ref(false);
const editedForm = ref<AppealForm | null>(null);
const editorErrorCode = ref<AppealFormErrorCode | null>(null);
const formToDelete = ref<AppealForm | null>(null);
const saving = ref(false);
// One write at a time: a move answers with the whole list, which would put back
// the switch of a form saved meanwhile if the two answers arrived out of order.
const busyFormId = ref<string | null>(null);

/** The kinds of case a form takes, by name, in the order the settings list them. */
function caseTypeNames(form: AppealForm) {
	return AppealCaseTypeNames.filter((name) => form.types.includes(AppealCaseTypes[name]));
}

function openEditor(form: AppealForm | null) {
	editedForm.value = form;
	editorErrorCode.value = null;
	editorOpen.value = true;
}

function notifyFailure(code: AppealFormErrorCode) {
	toast.add({
		color: "error",
		description: ts(ERROR_KEYS[code]),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}

function notifySuccess(titleKey: string, name: string) {
	toast.add({
		color: "success",
		icon: "heroicons:check-circle",
		title: ts(titleKey, { name }),
	});
}

async function saveForm(body: AppealFormCreate) {
	saving.value = true;
	editorErrorCode.value = null;
	const target = editedForm.value;
	const result = target ? await updateForm(target.id, body) : await createForm(body);
	saving.value = false;

	if (!result.ok) {
		editorErrorCode.value = result.code;
		notifyFailure(result.code);
		return;
	}

	editorOpen.value = false;
	notifySuccess(
		target
			? "guild_settings.appeals.forms.toasts.saved"
			: "guild_settings.appeals.forms.toasts.created",
		result.value.name,
	);
}

async function toggleForm(form: AppealForm, enabled: boolean) {
	busyFormId.value = form.id;
	const result = await updateForm(form.id, { enabled });
	busyFormId.value = null;
	if (!result.ok) notifyFailure(result.code);
}

// The whole order is sent, not the two forms that swap: the server writes the
// positions it is given, so two moves made at once do not undo each other.
async function move(from: number, to: number) {
	const ids = forms.value.map((form) => form.id);
	const [moved] = ids.splice(from, 1);
	if (moved === undefined) return;
	ids.splice(to, 0, moved);

	busyFormId.value = moved;
	const result = await reorderForms(ids);
	busyFormId.value = null;
	if (!result.ok) notifyFailure(result.code);
}

async function confirmDelete() {
	const form = formToDelete.value;
	if (!form) return;

	saving.value = true;
	const result = await deleteForm(form.id);
	saving.value = false;
	formToDelete.value = null;

	if (result.ok) {
		notifySuccess("guild_settings.appeals.forms.toasts.deleted", form.name);
	} else {
		notifyFailure(result.code);
	}
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The design system's soft badge: a blurple tint, the count in monospace. */
.forms-count {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

.form-icon {
	@apply flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-lg text-primary;
}

.form-badge {
	@apply rounded-full bg-base-content/8 px-2.5 py-0.5 text-xs text-toned;
}

.form-badge--locked {
	background-color: color-mix(in oklab, var(--color-warning) 15%, transparent);
	color: var(--color-warning);
}

/* A form card's actions: compact, square-cornered and outlined. */
.form-action {
	--btn-bg: transparent;
	--btn-shadow: none;
	@apply h-7 rounded-[5px] bg-transparent! px-3 text-xs font-medium ring-0;
	border: 1px solid var(--field-border);
	color: var(--ui-text-highlighted);
}

.form-action:hover:not(:disabled) {
	background-color: color-mix(in oklab, var(--ui-text-highlighted) 6%, transparent) !important;
}

.form-action--danger {
	border-color: color-mix(in oklab, var(--color-error) 60%, transparent);
	color: var(--color-error);
}

.form-action--danger:hover:not(:disabled) {
	background-color: color-mix(in oklab, var(--color-error) 10%, transparent) !important;
}
</style>
