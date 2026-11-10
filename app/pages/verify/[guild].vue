<template>
	<div class="mx-auto flex w-full max-w-140 flex-col gap-5 px-4 py-10 sm:py-16">
		<header class="flex items-center gap-3.5">
			<img
				v-if="guild?.iconUrl"
				:src="guild.iconUrl"
				alt=""
				width="48"
				height="48"
				class="size-12 shrink-0 rounded-2xl"
			/>
			<span v-else class="verify-initials" aria-hidden="true">{{ initials }}</span>
			<div class="min-w-0">
				<h1 ref="headingRef" tabindex="-1" class="text-xl font-bold focus:outline-none">
					{{ ts("verify.title") }}
				</h1>
				<p class="truncate text-[0.8125rem] text-muted">
					{{ guild ? guild.name : ts("verify.a_server") }}
				</p>
			</div>
		</header>

		<ClientOnly>
			<!-- The heading takes the focus once the page knows where the member stands. -->
			<div :aria-busy="isLoading || undefined">
				<section v-if="isLoading" class="verify-card" :aria-label="ts('verify.loading')">
					<USkeleton class="h-5 w-2/3" />
					<USkeleton class="h-4 w-full" />
					<USkeleton class="h-9 w-40" />
				</section>

				<section
					v-else-if="!loggedIn"
					class="verify-card"
					:aria-labelledby="stateHeadingId"
				>
					<h2 :id="stateHeadingId" class="text-base font-bold">
						{{ ts("verify.guest.title") }}
					</h2>
					<p class="text-sm leading-relaxed text-toned">
						{{
							ts("verify.guest.body", {
								server: guild?.name ?? ts("verify.this_server"),
							})
						}}
					</p>
					<p class="verify-note">
						<UIcon
							name="ic:round-info"
							class="mt-0.5 size-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						<span>{{ ts("verify.reads") }}</span>
					</p>
					<div>
						<UButton
							color="primary"
							icon="ph:discord-logo-fill"
							:loading="signingIn"
							@click="signIn(false)"
						>
							{{ ts("verify.guest.sign_in") }}
						</UButton>
					</div>
				</section>

				<section
					v-else-if="!page"
					class="verify-card"
					role="alert"
					:aria-labelledby="stateHeadingId"
				>
					<h2 :id="stateHeadingId" class="text-base font-bold">
						{{
							unknownGuild
								? ts("verify.unknown_title")
								: ts("verify.load_failed_title")
						}}
					</h2>
					<p class="text-sm text-toned">
						{{
							unknownGuild ? ts("verify.unknown_body") : ts("verify.load_failed_body")
						}}
					</p>
					<div v-if="!unknownGuild">
						<UButton color="neutral" variant="outline" @click="refresh()">
							{{ ts("verify.retry") }}
						</UButton>
					</div>
				</section>

				<section
					v-else-if="pass.state === 'done'"
					class="verify-card verify-card--success"
					:aria-labelledby="stateHeadingId"
				>
					<UIcon
						name="heroicons:check-circle"
						class="size-9 text-success"
						aria-hidden="true"
					/>
					<h2 :id="stateHeadingId" ref="resultRef" tabindex="-1" class="verify-result">
						{{ ts("verify.done_title") }}
					</h2>
					<p class="text-sm text-toned">
						{{ ts("verify.done_body", { server: page.guild.name }) }}
					</p>
					<div>
						<UButton
							color="primary"
							:to="discordLink"
							target="_blank"
							rel="noopener"
							icon="ph:discord-logo-fill"
						>
							{{ ts("verify.open_discord") }}
						</UButton>
					</div>
				</section>

				<section
					v-else-if="page.state === 'waiting'"
					class="verify-card"
					:aria-labelledby="stateHeadingId"
				>
					<h2 :id="stateHeadingId" class="text-base font-bold">
						{{ ts("verify.waiting.title") }}
					</h2>
					<p class="text-sm leading-relaxed text-toned">
						{{ ts("verify.waiting.body", { server: page.guild.name }) }}
					</p>

					<VerifyTrustMeter
						v-if="page.trust"
						:level="page.trust.level"
						:minimum="page.minimumTrust"
					/>

					<div v-if="missing.length > 0" class="flex flex-col gap-1.5">
						<h3 class="text-sm font-semibold">
							{{
								ts("verify.waiting.to_reach", {
									level: ts(JOIN_GUARD_TRUST_KEYS[page.minimumTrust]),
								})
							}}
						</h3>
						<ul class="list-disc pl-5 text-sm text-toned">
							<li v-for="gap in missing" :key="gap">
								{{ ts(JOIN_GUARD_GAP_KEYS[gap]) }}
							</li>
						</ul>
					</div>

					<div v-if="page.needsConnections" class="verify-note">
						<UIcon
							name="ic:round-link"
							class="mt-0.5 size-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						<div class="flex flex-col items-start gap-2">
							<span>{{ ts("verify.waiting.connections") }}</span>
							<UButton
								color="neutral"
								variant="outline"
								size="sm"
								:loading="signingIn"
								@click="signIn(true)"
							>
								{{ ts("verify.waiting.link_accounts") }}
							</UButton>
						</div>
					</div>

					<VerifyTurnstile
						v-if="needsCaptcha && page.captchaSiteKey"
						ref="turnstile"
						:site-key="page.captchaSiteKey"
						@token="captchaToken = $event"
					/>

					<p
						v-if="passMessage"
						ref="resultRef"
						tabindex="-1"
						class="verify-error"
						role="alert"
					>
						{{ passMessage }}
					</p>

					<div class="flex flex-wrap items-center gap-3">
						<UButton
							color="primary"
							:loading="pass.state === 'sending'"
							:disabled="!canVerify"
							@click="submit"
						>
							{{ ts("verify.waiting.verify") }}
						</UButton>
						<span v-if="pass.state === 'sending'" class="text-[0.8125rem] text-muted">
							{{ ts("verify.waiting.sending") }}
						</span>
						<template v-else-if="belowMinimum">
							<span class="text-[0.8125rem] text-muted">
								{{ ts("verify.waiting.below_minimum") }}
							</span>
							<UButton
								color="neutral"
								variant="outline"
								size="sm"
								:loading="status === 'pending'"
								@click="refresh()"
							>
								{{ ts("verify.waiting.check_again") }}
							</UButton>
						</template>
						<span
							v-else-if="needsCaptcha && !captchaToken"
							class="text-[0.8125rem] text-muted"
						>
							{{ ts("verify.waiting.captcha_first") }}
						</span>
					</div>

					<p class="verify-note">
						<UIcon
							name="ic:round-info"
							class="mt-0.5 size-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						<span>{{ ts("verify.reads") }}</span>
					</p>
				</section>

				<section v-else class="verify-card" :aria-labelledby="stateHeadingId">
					<h2 :id="stateHeadingId" class="text-base font-bold">
						{{ ts(STATE_COPY[page.state].title) }}
					</h2>
					<p class="text-sm leading-relaxed text-toned">
						{{ ts(STATE_COPY[page.state].body, { server: page.guild.name }) }}
					</p>
					<div v-if="page.state === 'verified' || page.state === 'notStopped'">
						<UButton
							color="neutral"
							variant="outline"
							:to="discordLink"
							target="_blank"
							rel="noopener"
							icon="ph:discord-logo-fill"
						>
							{{ ts("verify.open_discord") }}
						</UButton>
					</div>
				</section>
			</div>

			<template #fallback>
				<section class="verify-card" :aria-label="ts('verify.loading')">
					<USkeleton class="h-5 w-2/3" />
					<USkeleton class="h-4 w-full" />
				</section>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
// A sign-in leaves for Discord and comes back here; the transition would
// freeze the page mid-flight.
definePageMeta({ viewTransition: false });

const { ts } = useI18n();
const route = useRoute();

const guildId = computed(() => {
	const value = route.params.guild;
	return (Array.isArray(value) ? value[0] : value) ?? "";
});

const {
	error,
	guest,
	page,
	pass,
	ready,
	refresh,
	signedIn: loggedIn,
	status,
	verify,
} = useJoinGuardVerify(guildId);

const stateHeadingId = useId();
const headingRef = useTemplateRef<HTMLElement>("headingRef");
const resultRef = useTemplateRef<HTMLElement>("resultRef");
const turnstile = useTemplateRef<{ reset: () => void }>("turnstile");

const isLoading = computed(
	() =>
		!ready.value ||
		(loggedIn.value && !page.value && (status.value === "idle" || status.value === "pending")),
);

// A server WolfStar is not in has no page at all.
const unknownGuild = computed(() => readJoinGuardRouteStatus(error.value) === 404);

// Signed out too, the route names the server.
const guild = computed(() => guest.value?.guild ?? null);
const initials = computed(() =>
	(guild.value?.name ?? "?")
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join(""),
);
const discordLink = computed(() => `https://discord.com/channels/${guildId.value}`);

const STATE_COPY: Record<
	Exclude<JoinGuardVerifyState, "waiting">,
	{ title: string; body: string }
> = {
	banned: { body: "verify.states.banned_body", title: "verify.states.banned_title" },
	kicked: { body: "verify.states.kicked_body", title: "verify.states.kicked_title" },
	left: { body: "verify.states.left_body", title: "verify.states.left_title" },
	notStopped: {
		body: "verify.states.not_stopped_body",
		title: "verify.states.not_stopped_title",
	},
	unavailable: {
		body: "verify.states.unavailable_body",
		title: "verify.states.unavailable_title",
	},
	verified: { body: "verify.states.verified_body", title: "verify.states.verified_title" },
};

const missing = computed(() => page.value?.trust?.missing ?? []);
const belowMinimum = computed(() => {
	const current = page.value;
	return !current?.trust || current.trust.level < current.minimumTrust;
});
const needsCaptcha = computed(
	() => page.value?.checks.captcha === true && page.value.captchaSiteKey !== null,
);
const captchaToken = ref<string | null>(null);

// A member below the minimum fixes it on Discord, in another tab: the trust is
// measured again when they come back, so Verify opens without a reload.
useEventListener(
	() => (import.meta.client ? window : undefined),
	"focus",
	() => {
		if (page.value?.state === "waiting" && belowMinimum.value && status.value !== "pending")
			void refresh();
	},
);

const canVerify = computed(
	() =>
		pass.value.state !== "sending" &&
		!belowMinimum.value &&
		(!needsCaptcha.value || captchaToken.value !== null),
);

const PASS_REFUSAL_KEYS: Record<JoinGuardPassRefusal, string> = {
	captcha: "verify.result.captcha",
	captchaUnavailable: "verify.result.captcha_unavailable",
	generic: "verify.result.refused",
	notWaiting: "verify.result.not_waiting",
	rateLimited: "verify.result.rate_limited",
	sharedBan: "verify.result.shared_ban",
	trust: "verify.result.trust",
	unavailable: "verify.result.unavailable",
};

const passMessage = computed(() => {
	const current = pass.value;
	switch (current.state) {
		case "failed":
			return ts("verify.result.failed", {
				reason: ts(joinGuardFailureKey(current.error.code)),
			});
		case "timeout":
			return ts("verify.result.timeout");
		case "unreachable":
			return ts("verify.result.unreachable");
		case "refused":
			return ts(PASS_REFUSAL_KEYS[current.code]);
		default:
			return null;
	}
});

async function submit() {
	if (!canVerify.value) return;
	const result = await verify(captchaToken.value);
	// A token is good once: a refusal or a failure needs a new one.
	if (result.state !== "done") turnstile.value?.reset();
	await nextTick();
	resultRef.value?.focus();
}

// The page lands with the focus on its heading once it knows where the member stands.
watch(isLoading, async (loading, wasLoading) => {
	if (wasLoading && !loading) {
		await nextTick();
		headingRef.value?.focus();
	}
});

// Signs in again with Discord and comes back here; asks for `connections`
// when the server counts the linked accounts.
const signInDiscord = useSignIn("social");
const signingIn = computed(() => signInDiscord.status.value === "pending");
async function signIn(connections: boolean) {
	await signInDiscord.execute(
		verifySignInOptions(guildId.value, {
			connections: connections || guest.value?.checks.connections === true,
		}),
	);
}

useSeoMeta({
	description: () => ts("verify.seo_description"),
	robots: "noindex, nofollow",
	title: () => (guild.value ? `${ts("verify.title")} · ${guild.value.name}` : ts("verify.title")),
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.verify-card {
	@apply flex flex-col gap-4 rounded-xl p-5 sm:p-6;
	background-color: var(--ui-bg-elevated, var(--color-base-200));
	border: 1px solid var(--home-border-subtle);
}

.verify-card--success {
	@apply items-start;
}

.verify-initials {
	@apply flex size-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-primary;
	background-color: color-mix(in oklab, var(--color-primary) 15%, transparent);
}

.verify-note {
	@apply flex items-start gap-2 text-[0.8125rem] leading-normal text-muted;
}

.verify-result {
	@apply text-lg font-bold focus:outline-none;
}

.verify-error {
	@apply rounded-lg px-3 py-2.5 text-[0.8125rem] leading-normal focus:outline-none;
	background-color: color-mix(in oklab, var(--color-error) 12%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-error) 40%, transparent);
}
</style>
