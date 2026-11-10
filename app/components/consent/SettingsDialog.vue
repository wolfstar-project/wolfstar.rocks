<template>
	<UModal
		v-model:open="isSettingsOpen"
		:title="ts('consent.settings_title')"
		:description="ts('consent.settings_description')"
	>
		<template #body>
			<div class="flex flex-col gap-6">
				<section :aria-labelledby="necessaryId">
					<h3 :id="necessaryId" class="consent-group-title">
						{{ ts("consent.necessary_title") }}
					</h3>
					<ul class="consent-list">
						<li
							v-for="cookie in necessaryCookies"
							:key="cookie.id"
							class="consent-item"
						>
							<div class="min-w-0 grow">
								<p class="font-medium text-highlighted">
									{{ cookieText(cookie.id).name }}
								</p>
								<p class="text-sm text-muted">
									{{ cookieText(cookie.id).description }}
								</p>
							</div>
							<UBadge
								color="neutral"
								variant="subtle"
								:label="ts('consent.always_on')"
							/>
						</li>
					</ul>
				</section>

				<section :aria-labelledby="optionalId">
					<h3 :id="optionalId" class="consent-group-title">
						{{ ts("consent.optional_title") }}
					</h3>
					<ul class="consent-list">
						<li v-for="cookie in optionalCookies" :key="cookie.id" class="consent-item">
							<USwitch
								:model-value="draft.includes(cookie.id)"
								:label="cookieText(cookie.id).name"
								:description="cookieText(cookie.id).description"
								class="grow"
								@update:model-value="toggle(cookie.id, $event)"
							/>
						</li>
					</ul>
				</section>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full flex-wrap justify-end gap-2.5">
				<UButton color="neutral" variant="outline" @click="acceptAllAndClose">
					{{ ts("consent.accept_all") }}
				</UButton>
				<UButton color="primary" @click="save">
					{{ ts("consent.save") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const necessaryId = useId();
const optionalId = useId();
const { isSettingsOpen, necessaryCookies, optionalCookies, isEnabled, choose, acceptAll } =
	useCookieConsent();

/** The optional groups switched on in the dialog, saved only on "Save". */
const draft = ref<string[]>([]);

watch(
	isSettingsOpen,
	(open) => {
		if (open) draft.value = optionalCookies.filter((c) => isEnabled(c.id)).map((c) => c.id);
	},
	{ immediate: true },
);

function toggle(id: string, on: boolean) {
	draft.value = on
		? [...new Set([...draft.value, id])]
		: draft.value.filter((entry) => entry !== id);
}

function save() {
	choose(draft.value);
	isSettingsOpen.value = false;
}

function acceptAllAndClose() {
	acceptAll();
	isSettingsOpen.value = false;
}

function cookieText(id: string): { name: string; description: string } {
	switch (id) {
		case CONSENT_COOKIE_IDS.signIn:
			return {
				name: ts("consent.sign_in_name"),
				description: ts("consent.sign_in_description"),
			};
		case CONSENT_COOKIE_IDS.version:
			return {
				name: ts("consent.version_name"),
				description: ts("consent.version_description"),
			};
		case CONSENT_COOKIE_IDS.choice:
			return {
				name: ts("consent.choice_name"),
				description: ts("consent.choice_description"),
			};
		case CONSENT_COOKIE_IDS.sessionReplay:
			return {
				name: ts("consent.session_replay_name"),
				description: ts("consent.session_replay_description"),
			};
		default:
			return { name: id, description: "" };
	}
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.consent-group-title {
	@apply mb-2 text-xs font-bold tracking-wider text-muted uppercase;
}

.consent-list {
	@apply flex flex-col divide-y divide-default rounded-lg border border-default;
}

.consent-item {
	@apply flex items-start gap-3 px-3.5 py-3;
}
</style>
