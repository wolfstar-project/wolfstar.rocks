import type {
	OnboardingBlocker,
	OnboardingStage,
	OnboardingVerdict,
} from "#shared/utils/onboarding";

/**
 * The words of the Onboarding section, built from a stage, a blocker or a
 * verdict. Nothing here reads a store: the translations and the names of the
 * roles and channels are handed in, so every helper is tested with plain
 * values.
 */

/** The translation calls of `useI18n()` the helpers need, and the locale's way to join a list. */
export interface OnboardingText {
	ts: (key: string, params?: Record<string, string | number>) => string;
	tc: (key: string, params: number | Record<string, string | number>) => string;
	/** "a, b and c" in the reader's language. */
	list: (items: string[]) => string;
}

/** The names of the roles and channels a stage names, or `null` when they are gone. */
export interface OnboardingNames {
	role: (id: string) => string | null;
	channel: (id: string) => string | null;
}

/** The tones of the design's tags; the colours are the theme's tokens. */
export type OnboardingTone = "error" | "warning" | "neutral";

export interface OnboardingChip {
	text: string;
	tone: OnboardingTone;
}

const SecondsPerMinute = 60;
const SecondsPerHour = 3600;
const SecondsPerDay = 86_400;

/**
 * A duration in its largest whole unit: 600 seconds is "10 min", 7200 is
 * "2 h". One that fits no whole hour or day stays in minutes, rounded up.
 */
export function formatOnboardingDuration(seconds: number, text: OnboardingText): string {
	if (seconds % SecondsPerDay === 0) {
		return text.tc("guild_settings.onboarding.duration.days", seconds / SecondsPerDay);
	}
	if (seconds % SecondsPerHour === 0) {
		return text.tc("guild_settings.onboarding.duration.hours", seconds / SecondsPerHour);
	}
	return text.tc(
		"guild_settings.onboarding.duration.minutes",
		Math.ceil(seconds / SecondsPerMinute),
	);
}

function roleName(id: string, text: OnboardingText, names: OnboardingNames): string {
	return `@${names.role(id) ?? text.ts("guild_settings.onboarding.unknown_role")}`;
}

function channelName(id: string, text: OnboardingText, names: OnboardingNames): string {
	return `#${names.channel(id) ?? text.ts("guild_settings.onboarding.unknown_channel")}`;
}

type ChipStage = Pick<
	OnboardingStage,
	"trigger" | "challenge" | "roleId" | "failureAction" | "failureTimeout"
>;

function failureChip(stage: ChipStage, text: OnboardingText): OnboardingChip {
	switch (stage.failureAction) {
		case "Kick":
			return { text: text.ts("guild_settings.onboarding.chips.failure_kick"), tone: "error" };
		case "Timeout":
			return {
				text: text.ts("guild_settings.onboarding.chips.failure_timeout", {
					duration: formatOnboardingDuration(stage.failureTimeout ?? 0, text),
				}),
				tone: "warning",
			};
		case "None":
			return {
				text: text.ts("guild_settings.onboarding.chips.failure_none"),
				tone: "neutral",
			};
	}
}

// Literal keys, one per value, so the i18n report sees each.
const TRIGGER_KEYS = {
	Join: "guild_settings.onboarding.chips.trigger.Join",
	NativeOnboarding: "guild_settings.onboarding.chips.trigger.NativeOnboarding",
} as const satisfies Record<OnboardingStage["trigger"], string>;

const CHALLENGE_KEYS = {
	Button: "guild_settings.onboarding.chips.challenge.Button",
	Captcha: "guild_settings.onboarding.chips.challenge.Captcha",
	Emoji: "guild_settings.onboarding.chips.challenge.Emoji",
	Question: "guild_settings.onboarding.chips.challenge.Question",
} as const satisfies Record<OnboardingStage["challenge"], string>;

/** A stage in tags, in the order it happens: when, what, the role, and what a failure costs. */
export function onboardingStageChips(
	stage: ChipStage,
	text: OnboardingText,
	names: OnboardingNames,
): OnboardingChip[] {
	return [
		{ text: text.ts(TRIGGER_KEYS[stage.trigger]), tone: "neutral" },
		{ text: text.ts(CHALLENGE_KEYS[stage.challenge]), tone: "neutral" },
		...(stage.roleId === null
			? []
			: [
					{
						text: text.ts("guild_settings.onboarding.chips.role", {
							role: roleName(stage.roleId, text, names),
						}),
						tone: "neutral" as const,
					},
				]),
		failureChip(stage, text),
	];
}

const PERMISSION_KEYS: Record<string, string> = {
	EmbedLinks: "guild_settings.onboarding.permissions.EmbedLinks",
	KickMembers: "guild_settings.onboarding.permissions.KickMembers",
	ManageRoles: "guild_settings.onboarding.permissions.ManageRoles",
	ModerateMembers: "guild_settings.onboarding.permissions.ModerateMembers",
	SendMessages: "guild_settings.onboarding.permissions.SendMessages",
	ViewChannel: "guild_settings.onboarding.permissions.ViewChannel",
};

/** A permission as Discord's settings name it; one this file does not know stays as it is. */
function permissionName(permission: string, text: OnboardingText): string {
	const key = PERMISSION_KEYS[permission];
	return key ? text.ts(key) : permission;
}

type NamedStage = Pick<OnboardingStage, "id" | "name">;

/** "Stage 2 “Server rules”" for each ID, in the order of the sequence; a stage that is gone is left out. */
function stageLabels(
	ids: readonly string[],
	stages: readonly NamedStage[],
	text: OnboardingText,
): string[] {
	return stages.flatMap((stage, index) =>
		ids.includes(stage.id)
			? [
					text.ts("guild_settings.onboarding.blockers.stage", {
						name: stage.name,
						number: index + 1,
					}),
				]
			: [],
	);
}

/** What is blocked, and what the administrator does about it. */
export interface OnboardingBlockerLine {
	title: string;
	fix: string;
}

function stagesLine(
	key: "captcha" | "community" | "native",
	ids: readonly string[],
	stages: readonly NamedStage[],
	text: OnboardingText,
): OnboardingBlockerLine {
	const labels = stageLabels(ids, stages, text);
	const params = { count: labels.length, stages: text.list(labels) };
	switch (key) {
		case "captcha":
			return {
				fix: text.ts("guild_settings.onboarding.blockers.captcha_fix"),
				title: text.tc("guild_settings.onboarding.blockers.captcha_title", params),
			};
		case "community":
			return {
				fix: text.ts("guild_settings.onboarding.blockers.community_fix"),
				title: text.tc("guild_settings.onboarding.blockers.community_title", params),
			};
		case "native":
			return {
				fix: text.ts("guild_settings.onboarding.blockers.native_fix"),
				title: text.tc("guild_settings.onboarding.blockers.native_title", params),
			};
	}
}

/** A blocker in two sentences: what it stops, then how to fix it. */
export function onboardingBlockerLine(
	blocker: OnboardingBlocker,
	context: {
		stages: readonly NamedStage[];
		logChannelId: string | null;
	},
	text: OnboardingText,
	names: OnboardingNames,
): OnboardingBlockerLine {
	const { stages } = context;
	switch (blocker.code) {
		case "noVerificationMessage":
			return {
				fix: text.ts("guild_settings.onboarding.blockers.message_fix"),
				title: text.ts("guild_settings.onboarding.blockers.message_title"),
			};
		case "communityOff":
			return stagesLine("community", blocker.stageIds, stages, text);
		case "nativeOnboardingOff":
			return stagesLine("native", blocker.stageIds, stages, text);
		case "captchaUnavailable":
			return stagesLine("captcha", blocker.stageIds, stages, text);
		case "missingPermission": {
			const labels = stageLabels(blocker.stageIds, stages, text);
			const permission = permissionName(blocker.permission, text);
			return {
				fix: text.ts("guild_settings.onboarding.blockers.permission_fix", { permission }),
				title: text.tc("guild_settings.onboarding.blockers.permission_title", {
					count: labels.length,
					permission,
					stages: text.list(labels),
				}),
			};
		}
		case "roleMissing":
			return {
				fix: text.ts("guild_settings.onboarding.blockers.role_missing_fix"),
				title: text.ts("guild_settings.onboarding.blockers.role_missing_title", {
					stage: text.list(stageLabels([blocker.stageId], stages, text)),
				}),
			};
		case "roleUnmanageable": {
			const role = roleName(blocker.roleId, text, names);
			return {
				fix: text.ts("guild_settings.onboarding.blockers.role_unmanageable_fix", { role }),
				title: text.ts("guild_settings.onboarding.blockers.role_unmanageable_title", {
					role,
					stage: text.list(stageLabels([blocker.stageId], stages, text)),
				}),
			};
		}
		case "logChannelMissing":
			return {
				fix: text.ts("guild_settings.onboarding.blockers.log_missing_fix"),
				title: text.ts("guild_settings.onboarding.blockers.log_missing_title"),
			};
		case "logPermissions":
			return {
				fix: text.ts("guild_settings.onboarding.blockers.log_permissions_fix"),
				title: text.ts("guild_settings.onboarding.blockers.log_permissions_title", {
					channel:
						context.logChannelId === null
							? text.ts("guild_settings.onboarding.unknown_channel")
							: channelName(context.logChannelId, text, names),
					permissions: text.list(
						blocker.missing.map((permission) => permissionName(permission, text)),
					),
				}),
			};
	}
}

/** The line under the section's name in its banner. */
export function onboardingVerdictHint(verdict: OnboardingVerdict, text: OnboardingText): string {
	switch (verdict.kind) {
		case "off":
			return text.ts("guild_settings.onboarding.verdict.off");
		case "empty":
			return text.ts("guild_settings.onboarding.verdict.empty");
		case "blocked":
			return text.tc("guild_settings.onboarding.verdict.blocked", verdict.stages);
		case "ready":
			return text.ts("guild_settings.onboarding.verdict.ready");
	}
}

/** The channel of the bot's verification message, as "#name". */
export function onboardingChannelName(
	id: string,
	text: OnboardingText,
	names: OnboardingNames,
): string {
	return channelName(id, text, names);
}
