<template>
	<div class="consent-manager">
		<!-- nuxt-cookie-control writes the choice to its cookies from this component's
		     watchers; its own bar and modal are replaced by the notice and dialog below. -->
		<CookieControl class="hidden" aria-hidden="true" />

		<section v-if="!hasChosen" class="consent-notice" :aria-labelledby="titleId">
			<UIcon
				name="ic:round-cookie"
				class="mt-0.5 size-5 shrink-0 text-info"
				aria-hidden="true"
			/>
			<div class="flex min-w-0 grow flex-col gap-2">
				<h2 :id="titleId" class="font-semibold text-highlighted">
					{{ ts("consent.banner_title") }}
				</h2>
				<p>
					{{ ts("consent.banner_description") }}
					<NuxtLink to="/privacy" class="underline underline-offset-2 hover:opacity-80">
						{{ ts("consent.privacy_link") }}
					</NuxtLink>
				</p>
				<div class="flex flex-wrap gap-2 pt-1">
					<UButton
						color="primary"
						size="sm"
						:label="ts('consent.accept_all')"
						@click="acceptAll"
					/>
					<UButton
						color="neutral"
						variant="outline"
						size="sm"
						:label="ts('consent.accept_necessary')"
						@click="acceptNecessary"
					/>
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						:label="ts('consent.manage')"
						@click="isSettingsOpen = true"
					/>
				</div>
			</div>
		</section>

		<ConsentSettingsDialog />
	</div>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const titleId = useId();
const route = useRoute();
const { hasChosen, isSettingsOpen, isEnabled, acceptAll, acceptNecessary } = useCookieConsent();

// A choice made during the visit takes effect at once; the one stored before the
// page loaded is applied by sentry.client.config.ts.
watch(
	() => hasChosen.value && isEnabled(CONSENT_COOKIE_IDS.sessionReplay),
	(allowed) => {
		if (allowed) startSessionReplay(route.path);
		else stopSessionReplay();
	},
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.consent-manager {
	@apply contents;
}

/* The update notice's recipe (skew/Prompt.client.vue): 8px corners, a tint of the
   status colour on a solid surface and a border of it, since it floats over the page. */
.consent-notice {
	@apply pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[8px] px-3.5 py-3 text-sm leading-normal shadow-lg;
	background-color: color-mix(in oklab, var(--color-info) 10%, var(--color-base-100));
	border: 1px solid color-mix(in oklab, var(--color-info) 30%, transparent);
	color: var(--ui-text-toned);
}
</style>
