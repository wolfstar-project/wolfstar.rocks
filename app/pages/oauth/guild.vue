<template>
	<div>
		<h1 class="sr-only">{{ t("auth.oauth.guild_sr_title") }}</h1>
		<h2 class="sr-only">{{ t("auth.oauth.guild_sr_status") }}</h2>
		<template v-if="!guildId">
			<OauthStatusPanel
				tone="error"
				:title="t('auth.oauth.guild_not_found_title')"
				icon="heroicons:exclamation-triangle"
			>
				<template #description>
					<i18n-t keypath="auth.oauth.guild_not_found_description" tag="span">
						<template #link>
							<NuxtLink to="/login" class="font-medium underline">{{
								t("auth.oauth.login_required_link")
							}}</NuxtLink>
						</template>
					</i18n-t>
				</template>
			</OauthStatusPanel>
		</template>
		<ClientOnly v-else>
			<template v-if="error">
				<OauthStatusPanel
					tone="error"
					:title="t('auth.oauth.guild_setup_failed_title')"
					icon="heroicons:x-circle"
				>
					<template #description>
						{{ error }}
					</template>
					<template #actions>
						<UButton to="/login" size="sm" variant="outline" class="w-full sm:w-auto">
							{{ t("auth.oauth.guild_return_login") }}
						</UButton>
					</template>
				</OauthStatusPanel>
			</template>
			<template v-else>
				<OauthStatusPanel
					tone="info"
					loading
					:title="t('auth.oauth.guild_redirecting_title')"
					icon="ph:discord-logo-fill"
				>
					<template #description>
						{{ t("auth.oauth.guild_redirecting_description") }}
					</template>
				</OauthStatusPanel>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";
import { normalizeGuildIdQuery } from "~/utils/normalize-guild-id-query";

definePageMeta({
	viewTransition: false,
});

const { ts: t } = useI18n();

const guildId = useRouteQuery("guild_id", undefined, { transform: normalizeGuildIdQuery });
const error = ref<string | null>(null);

if (import.meta.client && guildId.value && !error.value) {
	navigateToGuild().catch((err: unknown) => {
		log.error({
			tag: "oauth:guild",
			error: err instanceof Error ? err.message : String(err),
		});
	});
}

async function navigateToGuild() {
	if (!guildId.value) {
		throw createError({ status: 400, statusText: t("auth.oauth.guild_id_required") });
	}

	await promiseTimeout(1500);

	await navigateTo(`/guilds/${guildId.value}/manage?refresh=true`);
}

useRobotsRule(robotBlockingPageProps);
useSeoMeta({
	ogDescription: t("auth.oauth.guild_seo_og_description"),
	ogTitle: t("auth.oauth.guild_seo_og_title"),
	robots: { none: true },
	title: t("auth.oauth.guild_seo_title"),
});
</script>
