<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="subtitle"
		:ui="{ content: 'sm:max-w-160' }"
	>
		<template #body>
			<div
				v-if="state === 'loading'"
				class="flex items-center justify-center gap-2 py-10 text-muted"
				role="status"
			>
				<UIcon
					name="heroicons:arrow-path"
					class="size-5 animate-spin motion-reduce:animate-none"
					aria-hidden="true"
				/>
				{{ ts("dashboard.my_appeals.dialog.loading") }}
			</div>

			<p v-else-if="state === 'failed'" class="ma-notice ma-notice--error" role="alert">
				{{ loadFailure }}
			</p>

			<p v-else-if="closedReason" class="ma-notice" role="status">{{ closedReason }}</p>

			<form
				v-else-if="selectedForm"
				:id="formId"
				class="flex flex-col gap-5"
				novalidate
				@submit.prevent="send"
			>
				<fieldset v-if="forms.length > 1">
					<legend class="ma-section">
						{{ ts("dashboard.my_appeals.dialog.form_label") }}
					</legend>
					<div class="mt-2 flex flex-col gap-2">
						<label
							v-for="form in forms"
							:key="form.id ?? 'builtin'"
							class="ma-form-option"
							:class="{ 'ma-form-option--locked': form.lock !== null }"
						>
							<input
								v-model="selectedKey"
								type="radio"
								:name="formId"
								:value="formKey(form)"
								:disabled="form.lock !== null"
							/>
							<span class="min-w-0">
								<span class="flex items-center gap-1.5 text-sm font-bold">
									<GuildAppealsFormIcon :icon="form.icon" />
									{{ form.name }}
								</span>
								<span class="mt-0.5 block text-xs text-muted">
									{{
										form.lock === null
											? (form.description ?? "")
											: lockLine(form)
									}}
								</span>
							</span>
						</label>
					</div>
				</fieldset>

				<!-- With a choice of forms the description is in each option already. -->
				<p v-if="selectedForm.description && forms.length < 2" class="ma-notice">
					{{ selectedForm.description }}
				</p>

				<DashboardMyAppealQuestion
					v-for="question in selectedForm.questions"
					:key="question.id"
					v-model="answers[question.id]"
					:question="question"
					:is-missing="showMissing && missing.includes(question.id)"
				/>

				<p v-if="errorMessage" class="ma-notice ma-notice--error" role="alert">
					{{ errorMessage }}
				</p>

				<p class="text-xs leading-normal text-muted">
					{{ ts("dashboard.my_appeals.dialog.foot") }}
				</p>
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
					{{ ts("dashboard.my_appeals.dialog.cancel") }}
				</UButton>
				<UButton
					v-if="selectedForm && !closedReason && state === 'ready'"
					type="submit"
					:form="formId"
					color="primary"
					:loading="isSending"
					:disabled="!canSend"
				>
					{{ ts("dashboard.my_appeals.dialog.send") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type {
	AppealPage,
	AppealPageForm,
	AppealPageLock,
	MyAppealEntry,
} from "#shared/utils/my-appeals";
import type { MyAppealErrorCode, useMyAppeals } from "~/composables/useMyAppeals";
import type { AppealDraftAnswers } from "~/utils/my-appeals";
import {
	buildSubmission,
	formatRelative,
	formNeedsFiles,
	formsForCase,
	missingAnswers,
} from "~/utils/my-appeals";

type MyAppeals = ReturnType<typeof useMyAppeals>;

const open = defineModel<boolean>("open", { required: true });

const { entry, loadPage, submit } = defineProps<{
	/** The case being appealed. */
	entry: MyAppealEntry | null;
	loadPage: MyAppeals["loadPage"];
	submit: MyAppeals["submit"];
}>();

const { ts } = useI18n();
const { timeLocale } = useAppLocale();
const toast = useToast();
const formId = useId();

const page = shallowRef<AppealPage | null>(null);
const state = ref<"loading" | "failed" | "ready">("loading");
const loadError = ref<MyAppealErrorCode | null>(null);
const selectedKey = ref("");
const answers = ref<AppealDraftAnswers>({});
const showMissing = ref(false);
const sendError = ref<MyAppealErrorCode | null>(null);
const isSending = ref(false);

const TYPE_KEYS: Record<MyAppealEntry["case"]["type"], string> = {
	Ban: "dashboard.my_appeals.types.ban",
	Mute: "dashboard.my_appeals.types.mute",
	Timeout: "dashboard.my_appeals.types.timeout",
};

const ERROR_KEYS: Record<MyAppealErrorCode, string> = {
	appealed: "dashboard.my_appeals.errors.appealed",
	blocked: "dashboard.my_appeals.errors.blocked",
	disabled: "dashboard.my_appeals.errors.disabled",
	generic: "dashboard.my_appeals.errors.generic",
	invalid: "dashboard.my_appeals.errors.invalid",
	locked: "dashboard.my_appeals.errors.locked",
	notAppealable: "dashboard.my_appeals.errors.notAppealable",
	notFound: "dashboard.my_appeals.errors.notFound",
	unavailable: "dashboard.my_appeals.errors.unavailable",
};

const LOCK_KEYS: Record<AppealPageLock, string> = {
	cooldown: "dashboard.my_appeals.dialog.locks.cooldown",
	disabled: "dashboard.my_appeals.dialog.locks.disabled",
	maxActive: "dashboard.my_appeals.dialog.locks.maxActive",
	missingRole: "dashboard.my_appeals.dialog.locks.missingRole",
	noEligibleCase: "dashboard.my_appeals.dialog.locks.noEligibleCase",
	restrictedRole: "dashboard.my_appeals.dialog.locks.restrictedRole",
};

const title = computed(() =>
	entry ? ts("dashboard.my_appeals.dialog.title", { server: entry.guild.name }) : "",
);

const subtitle = computed(() => {
	if (!entry) return "";
	return ts("dashboard.my_appeals.dialog.subtitle", {
		id: entry.case.id,
		type: ts(TYPE_KEYS[entry.case.type]),
		reason: entry.case.reason || ts("dashboard.my_appeals.reason_none"),
	});
});

const formKey = (form: AppealPageForm) => form.id ?? "builtin";

const forms = computed(() => (page.value && entry ? formsForCase(page.value, entry.case.id) : []));
const selectedForm = computed(
	() => forms.value.find((form) => formKey(form) === selectedKey.value) ?? null,
);
const missing = computed(() =>
	selectedForm.value ? missingAnswers(selectedForm.value, answers.value) : [],
);
const needsFiles = computed(() =>
	selectedForm.value ? formNeedsFiles(selectedForm.value) : false,
);
const canSend = computed(() => !needsFiles.value && !isSending.value);

const loadFailure = computed(() =>
	loadError.value === "unavailable"
		? ts("dashboard.my_appeals.errors.unavailable")
		: ts("dashboard.my_appeals.dialog.page_failed"),
);

/** Why the server takes no appeal for this case now, when it does not. */
const closedReason = computed(() => {
	const current = page.value;
	if (!current || state.value !== "ready") return "";
	const server = current.guild.name;
	if (!current.enabled) return ts("dashboard.my_appeals.dialog.off", { server });
	if (current.block) {
		return current.block.reason
			? ts("dashboard.my_appeals.dialog.blocked_reason", {
					server,
					reason: current.block.reason,
				})
			: ts("dashboard.my_appeals.dialog.blocked", { server });
	}
	return forms.value.some((form) => form.lock === null)
		? ""
		: ts("dashboard.my_appeals.dialog.no_form", { server });
});

const errorMessage = computed(() => {
	if (sendError.value) return ts(ERROR_KEYS[sendError.value]);
	return showMissing.value && missing.value.length > 0
		? ts("dashboard.my_appeals.dialog.required_error")
		: "";
});

function lockLine(form: AppealPageForm): string {
	let reason = form.lockReason;
	if (!reason && form.lock === "cooldown" && form.until !== null) {
		reason = ts("dashboard.my_appeals.dialog.locks.cooldown_until", {
			time: formatRelative(form.until, new Date(), timeLocale.value),
		});
	}
	reason ||= form.lock ? ts(LOCK_KEYS[form.lock]) : "";
	return ts("dashboard.my_appeals.dialog.locked", { reason });
}

async function load(current: MyAppealEntry) {
	page.value = null;
	state.value = "loading";
	const result = await loadPage(current.guild.id);
	// The dialog may have moved to another case while the page loaded.
	if (entry !== current) return;
	if (!result.ok) {
		loadError.value = result.code;
		state.value = "failed";
		return;
	}
	page.value = result.value;
	const first = formsForCase(result.value, current.case.id).find((form) => form.lock === null);
	selectedKey.value = first ? formKey(first) : "";
	state.value = "ready";
}

watch(
	() => [open.value, entry] as const,
	([isOpen, current]) => {
		if (!isOpen || !current) return;
		answers.value = {};
		showMissing.value = false;
		sendError.value = null;
		loadError.value = null;
		void load(current);
	},
	{ immediate: true },
);

// Another form asks other questions: what was missing on the last one no longer is.
watch(selectedKey, () => {
	showMissing.value = false;
	sendError.value = null;
});

async function send() {
	const form = selectedForm.value;
	if (!entry || !form || !canSend.value) return;
	sendError.value = null;
	if (missing.value.length > 0) {
		showMissing.value = true;
		return;
	}
	isSending.value = true;
	const result = await submit(
		entry.guild.id,
		form.id,
		entry.case.id,
		buildSubmission(form, answers.value),
	);
	isSending.value = false;
	if (!result.ok) {
		sendError.value = result.code;
		return;
	}
	toast.add({
		color: "success",
		description: ts("dashboard.my_appeals.dialog.sent_description"),
		title: ts("dashboard.my_appeals.dialog.sent", { server: entry.guild.name }),
	});
	open.value = false;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.ma-section {
	@apply text-xs font-bold tracking-[0.06em] text-muted uppercase;
}

.ma-notice {
	@apply rounded-[8px] px-3 py-2.5 text-[0.8125rem] leading-normal text-toned;
	background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.ma-notice--error {
	@apply text-highlighted;
	background-color: color-mix(in srgb, var(--color-error) 12%, transparent);
}

/* A form to appeal with, a radio card as in the mockup. */
.ma-form-option {
	@apply flex cursor-pointer items-start gap-3 rounded-[8px] px-3.5 py-3;
	background-color: var(--field-surface, var(--console-input));
	border: 1px solid var(--field-border, var(--console-border));
}

.ma-form-option:has(input:checked) {
	background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
	border-color: var(--color-primary);
}

.ma-form-option:has(input:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.ma-form-option--locked {
	@apply cursor-not-allowed opacity-60;
}

.ma-form-option input {
	@apply mt-0.5 size-4 shrink-0;
	accent-color: var(--color-primary);
}
</style>
