<template>
	<UModal
		:open="open"
		:title="ts('guild_settings.setup.title', { name: serverName })"
		:description="ts('guild_settings.setup.description')"
		:content="{
			onInteractOutside: (event) => event.preventDefault(),
			onOpenAutoFocus: focusHeading,
		}"
		:ui="{
			content:
				'h-dvh max-h-dvh w-full max-w-none rounded-none bg-(--ink-600) theme-light:bg-base-100 sm:h-[min(45rem,96dvh)] sm:w-160 sm:max-w-[98vw] sm:rounded-[12px] lg:w-220',
		}"
		@update:open="onOpenChange"
	>
		<template #content>
			<div class="setup">
				<aside class="setup-rail">
					<div class="flex items-center gap-3">
						<UAvatar
							:src="guildIconSrc"
							:text="guildData?.acronym"
							alt=""
							:ui="{ root: 'size-10 shrink-0 rounded-[12px]' }"
						/>
						<div class="min-w-0">
							<p class="text-[0.9375rem] font-bold">
								{{ ts("guild_settings.setup.rail_title") }}
							</p>
							<p class="truncate text-xs text-muted">{{ serverName }}</p>
						</div>
					</div>
					<ol
						class="flex flex-col gap-1"
						:aria-label="ts('guild_settings.setup.steps_aria')"
					>
						<li v-for="item of steps" :key="item.id">
							<button
								type="button"
								class="setup-step"
								:class="{ 'setup-step--current': item.current }"
								:aria-current="item.current ? 'step' : undefined"
								:disabled="!item.reached"
								@click="goTo(item.number)"
							>
								<span
									class="setup-dot"
									:class="{
										'setup-dot--done': item.done,
										'setup-dot--current': item.current,
									}"
									aria-hidden="true"
								>
									<UIcon
										v-if="item.done"
										name="ic:round-check"
										class="size-3.5"
									/>
									<template v-else>{{ item.number }}</template>
								</span>
								<span class="text-sm font-semibold">{{ item.label }}</span>
							</button>
						</li>
					</ol>
					<p class="mt-auto text-xs leading-relaxed text-muted">
						{{ ts("guild_settings.setup.rail_note") }}
					</p>
				</aside>

				<div class="flex min-w-0 flex-1 flex-col">
					<header class="setup-header">
						<UAvatar
							class="lg:hidden"
							:src="guildIconSrc"
							:text="guildData?.acronym"
							alt=""
							:ui="{ root: 'size-7 shrink-0 rounded-[8px]' }"
						/>
						<p class="min-w-0 grow truncate text-sm font-bold lg:hidden">
							{{ ts("guild_settings.setup.rail_title") }} · {{ serverName }}
						</p>
						<p class="setup-eyebrow hidden lg:block">{{ stepOf }}</p>
						<span class="hidden grow lg:block"></span>
						<UButton
							color="neutral"
							variant="ghost"
							size="md"
							icon="ic:round-close"
							:aria-label="ts('guild_settings.setup.close_aria')"
							@click="skip"
						/>
					</header>
					<div class="setup-bars" aria-hidden="true">
						<span
							v-for="item of steps"
							:key="item.id"
							class="setup-bar"
							:class="{ 'setup-bar--on': item.number <= draft.step }"
						></span>
					</div>
					<p class="setup-eyebrow px-4 pt-3 sm:px-4 lg:hidden">{{ stepOf }}</p>

					<div ref="body" class="setup-body">
						<GuildSetupWizardModules v-if="step === 'modules'" v-model:draft="draft" />
						<GuildSetupWizardChannels
							v-else-if="step === 'channels'"
							v-model:draft="draft"
						/>
						<GuildSetupWizardRoles v-else-if="step === 'roles'" v-model:draft="draft" />
						<GuildSetupWizardLanguage
							v-else-if="step === 'language'"
							v-model:draft="draft"
						/>
						<GuildSetupWizardReview v-else v-model:draft="draft" @edit="goTo" />
					</div>

					<footer class="setup-footer">
						<UButton
							v-if="previous"
							color="neutral"
							variant="ghost"
							@click="goTo(draft.step - 1)"
						>
							{{ ts("guild_settings.setup.back", { step: previous }) }}
						</UButton>
						<span class="grow"></span>
						<UButton v-if="following" color="neutral" variant="ghost" @click="skip">
							{{ ts("guild_settings.setup.skip") }}
						</UButton>
						<UButton
							v-if="following"
							color="primary"
							class="w-full justify-center sm:w-auto"
							@click="goTo(draft.step + 1)"
						>
							{{ ts("guild_settings.setup.next", { step: following }) }}
						</UButton>
						<UButton
							v-else
							color="primary"
							class="w-full justify-center sm:w-auto"
							icon="ic:round-check"
							:loading="saving"
							@click="finish"
						>
							{{ ts("guild_settings.setup.finish") }}
						</UButton>
					</footer>
				</div>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import { resolveGuildIconSrc } from "~/utils/guild-dashboard";
import { SETUP_STEPS } from "~/utils/guild-setup";

/**
 * The first setup of a server, as a dialog: its modules, the channels and
 * roles WolfStar uses, and its language, one step at a time, ending in a review
 * that is saved at once. A server with no settings yet opens it on arrival;
 * leaving it keeps the choices and the overview offers to resume.
 */
const { ts } = useI18n();
const { guildData } = useGuildData();
const { activeGuildId } = useActiveGuild();
const { draft, finish, goTo, offer, open, pending, saving, skip } = useGuildSetup();

const body = useTemplateRef<HTMLElement>("body");

const serverName = computed(() => guildData.value?.name ?? "");
const guildIconSrc = computed(() => resolveGuildIconSrc(guildData.value, { size: 64 }));

const step = computed(() => SETUP_STEPS[draft.value.step - 1] ?? SETUP_STEPS[0]);
const stepOf = computed(() =>
	ts("guild_settings.setup.step_of", { step: draft.value.step, total: SETUP_STEPS.length }),
);

const STEP_LABEL_KEYS = {
	channels: "guild_settings.setup.step_names.channels",
	language: "guild_settings.setup.step_names.language",
	modules: "guild_settings.setup.step_names.modules",
	review: "guild_settings.setup.step_names.review",
	roles: "guild_settings.setup.step_names.roles",
} as const satisfies Record<(typeof SETUP_STEPS)[number], string>;

function stepLabel(id: (typeof SETUP_STEPS)[number]) {
	return ts(STEP_LABEL_KEYS[id]);
}

const steps = computed(() =>
	SETUP_STEPS.map((id, index) => {
		const number = index + 1;
		return {
			current: number === draft.value.step,
			done: number < draft.value.step,
			id,
			label: stepLabel(id),
			number,
			reached: number <= draft.value.reached,
		};
	}),
);

const previous = computed(() =>
	draft.value.step > 1 ? stepLabel(SETUP_STEPS[draft.value.step - 2] ?? SETUP_STEPS[0]) : null,
);
const following = computed(() =>
	draft.value.step < SETUP_STEPS.length
		? stepLabel(SETUP_STEPS[draft.value.step] ?? SETUP_STEPS[0])
		: null,
);

// The dialog opens on its heading, not on the first button the browser finds.
function focusHeading(event: Event) {
	event.preventDefault();
	void nextTick(() => body.value?.querySelector<HTMLElement>("h2")?.focus());
}

// Closing the dialog is leaving the setup for now, however it was asked for.
function onOpenChange(value: boolean) {
	if (!value) skip();
}

// A server with no settings yet opens the dialog once it is known to be one.
watch([pending, activeGuildId], () => offer(), { immediate: true });

// A new step starts at its heading, for a screen reader and the keyboard alike.
watch(
	() => draft.value.step,
	async () => {
		await nextTick();
		body.value?.querySelector<HTMLElement>("h2")?.focus();
		body.value?.scrollTo({ top: 0 });
	},
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.setup {
	@apply flex h-full min-h-0;
}

.setup-rail {
	@apply hidden w-62 shrink-0 flex-col gap-5.5 px-5.5 py-7 lg:flex;
	background-color: var(--ink-800);
}

.setup-step {
	@apply flex w-full cursor-pointer items-center gap-3 rounded-[8px] border-0 bg-transparent px-2.5 py-2.25 text-left;
	color: var(--ui-text-muted);
}

.setup-step:disabled {
	@apply cursor-default;
}

.setup-step--current {
	background-color: oklch(100% 0 0 / 0.08);
	color: var(--ui-text-highlighted);
}

.setup-step:not(:disabled) {
	color: var(--ui-text-highlighted);
}

.setup-step:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}

.setup-dot {
	@apply flex size-6.5 shrink-0 items-center justify-center rounded-full text-xs font-bold;
	border: 1px solid var(--field-border);
	color: var(--ui-text-muted);
}

.setup-dot--current {
	@apply text-primary-content;
	background-color: var(--color-primary);
	border-color: var(--color-primary);
}

.setup-dot--done {
	@apply text-success-content;
	background-color: var(--color-success);
	border-color: var(--color-success);
}

.setup-header {
	@apply flex shrink-0 items-center gap-2.5 px-4 pt-3.5 pb-2.5 lg:pt-4.5 lg:pr-5 lg:pb-0 lg:pl-8;
}

.setup-eyebrow {
	@apply text-[0.6875rem] font-bold tracking-[0.06em] text-muted uppercase;
}

.setup-bars {
	@apply flex shrink-0 gap-1 px-4 lg:hidden;
}

.setup-bar {
	@apply h-1 flex-1 rounded-full;
	background-color: oklch(100% 0 0 / 0.1);
}

.setup-bar--on {
	background-color: var(--color-primary);
}

.setup-body {
	@apply min-h-0 flex-1 overflow-auto px-4 pt-2 pb-5 sm:pb-6 lg:px-8;
}

.setup-footer {
	@apply flex shrink-0 flex-wrap items-center gap-2.5 px-4 py-3 sm:flex-nowrap lg:px-8 lg:py-3.5;
	background-color: var(--ink-800);
}

/* What the steps share. The steps are components of their own, so these reach
   into them from here. */
.setup-body :deep(.setup-title) {
	@apply m-0 text-[1.375rem] leading-tight font-bold outline-none;
}

.setup-body :deep(.setup-lead) {
	@apply mt-1.5 text-sm leading-relaxed;
	color: var(--ui-text-toned);
}

.setup-body :deep(.setup-field) {
	@apply mt-4.5;
}

.setup-body :deep(.setup-module) {
	@apply flex items-center gap-3.5 rounded-[10px] px-3.5 py-3;
	background-color: var(--ink-700);
	border: 1px solid var(--home-border-subtle);
}

.setup-body :deep(.setup-module--on) {
	border-color: var(--color-primary);
}

.setup-body :deep(.setup-module-tile) {
	@apply flex size-10 shrink-0 items-center justify-center rounded-[10px];
	background-color: oklch(100% 0 0 / 0.06);
	color: var(--ui-text-muted);
}

.setup-body :deep(.setup-module--on .setup-module-tile) {
	background-color: color-mix(in oklab, var(--color-primary) 16%, transparent);
	color: var(--color-primary);
}

.setup-body :deep(.setup-pill) {
	@apply inline-flex h-4.5 items-center rounded-full px-1.75 text-[0.625rem] font-bold tracking-[0.05em] uppercase;
	background-color: color-mix(in oklab, var(--color-primary) 16%, transparent);
	color: var(--color-primary);
}

.setup-body :deep(.setup-note),
.setup-body :deep(.setup-empty) {
	@apply mt-4.5 flex items-start gap-2.5 rounded-[10px] px-3.5 py-3 text-[0.8125rem] leading-normal;
	background-color: var(--ink-700);
	border: 1px solid var(--home-border-subtle);
	color: var(--ui-text-toned);
}

.setup-body :deep(.setup-empty) {
	background-color: transparent;
	border-style: dashed;
	color: var(--ui-text-muted);
}

.setup-body :deep(.setup-review-row) {
	@apply flex items-baseline gap-3 py-2.75;
	border-top: 1px solid var(--home-border-subtle);
}

.setup-body :deep(.setup-review-label) {
	@apply w-28 shrink-0 text-[0.8125rem] font-semibold sm:w-32;
	color: var(--ui-text-toned);
}

.setup-body :deep(.setup-review-edit) {
	@apply shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[0.8125rem] font-semibold;
	color: var(--color-primary);
}

.setup-body :deep(.setup-review-edit:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
	border-radius: 3px;
}

@variant theme-light {
	.setup-body :deep(.setup-module),
	.setup-body :deep(.setup-note) {
		background-color: var(--color-base-200);
	}

	.setup-body :deep(.setup-module-tile) {
		background-color: oklch(0% 0 0 / 0.06);
	}

	.setup-rail,
	.setup-footer {
		background-color: var(--color-base-200);
	}

	.setup-step--current {
		background-color: oklch(0% 0 0 / 0.07);
	}

	.setup-bar:not(.setup-bar--on) {
		background-color: oklch(0% 0 0 / 0.1);
	}
}
</style>
