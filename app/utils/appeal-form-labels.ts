import type { AppealCaseTypeName, AppealQuestionKind } from "#shared/utils/appeal-forms";
import type { AppealFormProblem } from "~/utils/appeal-form-draft";

// Static key maps rather than keys built from the value: the i18n report can
// only follow keys it can read in the source.

export const APPEAL_QUESTION_KIND_NAME_KEYS: Record<AppealQuestionKind, string> = {
	attachment: "guild_settings.appeals.kinds.attachment",
	choice: "guild_settings.appeals.kinds.choice",
	display: "guild_settings.appeals.kinds.display",
	text: "guild_settings.appeals.kinds.text",
};

export const APPEAL_QUESTION_KIND_HELP_KEYS: Record<AppealQuestionKind, string> = {
	attachment: "guild_settings.appeals.kinds.attachment_help",
	choice: "guild_settings.appeals.kinds.choice_help",
	display: "guild_settings.appeals.kinds.display_help",
	text: "guild_settings.appeals.kinds.text_help",
};

export const APPEAL_QUESTION_KIND_ICONS: Record<AppealQuestionKind, string> = {
	attachment: "ic:round-attach-file",
	choice: "ic:round-checklist",
	display: "ic:round-notes",
	text: "ic:round-short-text",
};

export const APPEAL_CASE_TYPE_KEYS: Record<AppealCaseTypeName, string> = {
	Ban: "guild_settings.appeals.case_types.ban",
	Mute: "guild_settings.appeals.case_types.mute",
	Timeout: "guild_settings.appeals.case_types.timeout",
};

/** The line the editor shows for each problem `validateAppealFormDraft` finds. */
export const APPEAL_FORM_PROBLEM_KEYS: Record<AppealFormProblem, string> = {
	badRange: "guild_settings.appeals.forms.errors.range",
	digitsOnly: "guild_settings.appeals.forms.errors.nameInvalid",
	invalidIcon: "guild_settings.appeals.forms.errors.icon",
	noQuestion: "guild_settings.appeals.forms.errors.noQuestion",
	overlap: "guild_settings.appeals.forms.errors.roles",
	required: "guild_settings.appeals.forms.errors.required",
	tooFewOptions: "guild_settings.appeals.forms.errors.options",
	tooLong: "guild_settings.appeals.forms.errors.tooLong",
	tooMany: "guild_settings.appeals.forms.errors.tooMany",
	tooManyOptions: "guild_settings.appeals.forms.errors.options",
	tooManyRoles: "guild_settings.appeals.forms.errors.tooManyRoles",
};
