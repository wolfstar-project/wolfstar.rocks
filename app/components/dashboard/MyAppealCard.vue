<template>
	<article class="ma-card" :aria-labelledby="headingId">
		<div class="flex items-center gap-3">
			<img v-if="iconUrl" :src="iconUrl" alt="" class="ma-avatar" width="40" height="40" />
			<span
				v-else
				class="ma-avatar ma-avatar--initials"
				:style="{ backgroundColor: tint }"
				aria-hidden="true"
			>
				{{ initials }}
			</span>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h3 :id="headingId" class="text-[0.9375rem] font-bold">
						{{ entry.guild.name }}
					</h3>
					<GuildLogsPill :tone="CASE_TONES[entry.case.type]">
						{{ ts(CASE_TYPE_KEYS[entry.case.type]) }}
					</GuildLogsPill>
					<span class="font-mono text-xs text-muted">
						{{ ts("dashboard.my_appeals.case_number", { id: entry.case.id }) }}
					</span>
				</div>
				<p class="mt-0.5 text-xs text-muted">{{ caseLine }}</p>
			</div>
			<GuildLogsPill :tone="STATUS_TONES[entry.status]" class="shrink-0">
				{{ ts(STATUS_KEYS[entry.status]) }}
			</GuildLogsPill>
		</div>

		<blockquote class="ma-reason">
			{{ entry.case.reason || ts("dashboard.my_appeals.reason_none") }}
		</blockquote>

		<p v-if="statusLine" class="text-[0.8125rem] leading-normal text-muted">{{ statusLine }}</p>
		<p v-if="staffNote" class="text-[0.8125rem] leading-normal text-toned">
			<span class="font-bold text-highlighted">{{ ts("dashboard.my_appeals.staff") }}</span>
			{{ staffNote }}
		</p>

		<div v-if="entry.status === 'pending' && entry.appeal?.answers.length" class="ma-answers">
			<p class="ma-answers-label">{{ ts("dashboard.my_appeals.your_answers") }}</p>
			<div v-for="answer in entry.appeal.answers" :key="answer.questionId">
				<p class="text-xs font-bold text-muted">{{ answer.label }}</p>
				<p class="mt-0.5 text-[0.8125rem] leading-[1.45] wrap-anywhere">
					{{ answer.value }}
				</p>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-2.5">
			<UButton
				v-if="entry.status === 'open'"
				color="primary"
				size="sm"
				class="rounded-[5px]"
				:aria-label="
					ts('dashboard.my_appeals.appeal_aria', {
						id: entry.case.id,
						server: entry.guild.name,
					})
				"
				@click="emit('appeal', entry)"
			>
				{{ ts("dashboard.my_appeals.appeal") }}
			</UButton>
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				:to="`https://discord.com/channels/${entry.guild.id}`"
				:aria-label="
					ts('dashboard.my_appeals.open_server_aria', { server: entry.guild.name })
				"
				target="_blank"
				rel="noopener"
			>
				{{ ts("dashboard.my_appeals.open_server") }}
			</UButton>
		</div>
	</article>
</template>

<script setup lang="ts">
import type {
	MyAppealCaseType,
	MyAppealClosedReason,
	MyAppealEntry,
	MyAppealStatus,
} from "#shared/utils/my-appeals";
import type { LogsPillTone } from "~/components/guild/logs/Pill.vue";

const { entry, now } = defineProps<{
	entry: MyAppealEntry;
	/** The time the list reads its relative times from. */
	now: Date;
}>();

const emit = defineEmits<{
	/** The member asked to appeal this case. */
	appeal: [entry: MyAppealEntry];
}>();

const { ts } = useI18n();
const { timeLocale } = useAppLocale();
const headingId = useId();

const CASE_TONES: Record<MyAppealCaseType, LogsPillTone> = {
	Ban: "error",
	Mute: "warning",
	Timeout: "warning",
};

const STATUS_TONES: Record<MyAppealStatus, LogsPillTone> = {
	accepted: "success",
	closed: "neutral",
	denied: "error",
	open: "primary",
	pending: "warning",
};

// Static maps, not keys built from the value: the i18n report only follows
// the keys it can read in the source.
const CASE_TYPE_KEYS: Record<MyAppealCaseType, string> = {
	Ban: "dashboard.my_appeals.types.ban",
	Mute: "dashboard.my_appeals.types.mute",
	Timeout: "dashboard.my_appeals.types.timeout",
};

const CASE_WHEN_KEYS: Record<MyAppealCaseType, string> = {
	Ban: "dashboard.my_appeals.when.banned",
	Mute: "dashboard.my_appeals.when.muted",
	Timeout: "dashboard.my_appeals.when.timed_out",
};

const STATUS_KEYS: Record<MyAppealStatus, string> = {
	accepted: "dashboard.my_appeals.status.accepted",
	closed: "dashboard.my_appeals.status.closed",
	denied: "dashboard.my_appeals.status.denied",
	open: "dashboard.my_appeals.status.open",
	pending: "dashboard.my_appeals.status.pending",
};

const CLOSED_KEYS: Record<Exclude<MyAppealClosedReason, "type" | "cooldown">, string> = {
	blocked: "dashboard.my_appeals.closed.blocked",
	maxActive: "dashboard.my_appeals.closed.maxActive",
	noForm: "dashboard.my_appeals.closed.noForm",
	off: "dashboard.my_appeals.closed.off",
};

const CLOSED_TYPE_KEYS: Record<MyAppealCaseType, string> = {
	Ban: "dashboard.my_appeals.closed.type_ban",
	Mute: "dashboard.my_appeals.closed.type_mute",
	Timeout: "dashboard.my_appeals.closed.type_timeout",
};

// A server with no icon shows its initials on one of the design's spectrum colours, the same for it every time.
const TINTS = [
	"--spectrum-red",
	"--spectrum-orange",
	"--spectrum-green",
	"--spectrum-blue",
	"--spectrum-purple",
	"--boost-pink",
];

const iconUrl = computed(() =>
	guildIconURL({ ...entry.guild, acronym: guildInitials(entry.guild.name) }, { size: 80 }),
);
const initials = computed(() => guildInitials(entry.guild.name));
const tint = computed(() => `var(${TINTS[Number(BigInt(entry.guild.id) % BigInt(TINTS.length))]})`);

const relative = (date: string | Date) => formatRelative(date, now, timeLocale.value);

/** How long the case holds: for good, until a time, for a span, or no longer. */
const caseLength = computed(() => {
	const { state, duration } = entry.case;
	if (state === "lifted") return ts("dashboard.my_appeals.length.lifted");
	if (state === "ended") return ts("dashboard.my_appeals.length.ended");
	const end = caseEndsAt(entry.case);
	if (end === null) return ts("dashboard.my_appeals.length.permanent");
	return end > now
		? ts("dashboard.my_appeals.length.ends", { time: relative(end) })
		: formatSpan(duration ?? 0, timeLocale.value);
});

const caseLine = computed(
	() =>
		`${ts(CASE_WHEN_KEYS[entry.case.type], { time: relative(entry.case.createdAt) })} · ${caseLength.value}`,
);

function closedLine(): string {
	const closed = entry.closed;
	const server = entry.guild.name;
	if (!closed) return "";
	if (closed.reason === "type") return ts(CLOSED_TYPE_KEYS[entry.case.type], { server });
	if (closed.reason === "cooldown") {
		return entry.againAt
			? ts("dashboard.my_appeals.closed.cooldown", { again: relative(entry.againAt) })
			: ts("dashboard.my_appeals.closed.cooldown_now");
	}
	if (closed.reason === "blocked" && closed.detail) {
		return ts("dashboard.my_appeals.closed.blocked_reason", { server, reason: closed.detail });
	}
	return ts(CLOSED_KEYS[closed.reason], { server });
}

/** What the card says of where the case stands, under its reason. */
const statusLine = computed(() => {
	const { appeal, status } = entry;
	if (status === "pending" && appeal) {
		return ts("dashboard.my_appeals.pending_line", {
			form: appeal.formName ?? ts("dashboard.my_appeals.form_builtin"),
			server: entry.guild.name,
			time: relative(appeal.createdAt),
		});
	}
	if (status === "denied" && appeal?.decidedAt) {
		const time = relative(appeal.decidedAt);
		return entry.againAt && new Date(entry.againAt) > now
			? ts("dashboard.my_appeals.denied_again", { time, again: relative(entry.againAt) })
			: ts("dashboard.my_appeals.denied_now", { time });
	}
	if (status === "accepted" && appeal?.decidedAt) {
		return ts("dashboard.my_appeals.accepted", { time: relative(appeal.decidedAt) });
	}
	return status === "closed" ? closedLine() : "";
});

const staffNote = computed(() =>
	entry.status === "denied" || entry.status === "accepted" ? (entry.appeal?.reason ?? "") : "",
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The design's appeal card: the console's surface, a hairline and 12px corners. */
.ma-card {
	@apply flex flex-col gap-2.5 rounded-[12px] p-4;
	background-color: var(--console-surface, var(--ink-700));
	border: 1px solid var(--home-border-subtle);
}

.ma-avatar {
	@apply size-10 shrink-0 rounded-[13px] object-cover;
}

.ma-avatar--initials {
	@apply flex items-center justify-center text-sm font-extrabold text-white;
}

/* The reason of the case, quoted as Discord quotes. */
.ma-reason {
	@apply m-0 rounded-[2px] px-2.5 py-1.5 text-[0.8125rem] leading-[1.45] wrap-anywhere text-toned;
	background-color: var(--console-input, var(--ink-500));
	border-left: 3px solid var(--console-border, var(--ink-400));
}

.ma-answers {
	@apply flex flex-col gap-1.5 rounded-[8px] px-3 py-2.5;
	background-color: var(--console-rail, var(--ink-800));
	border: 1px solid var(--home-border-subtle);
}

.ma-answers-label {
	@apply text-xs font-bold tracking-[0.06em] text-muted uppercase;
}
</style>
